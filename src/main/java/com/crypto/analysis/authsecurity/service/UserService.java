package com.crypto.analysis.authsecurity.service;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.mail.MessagingException;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.Role;
import com.crypto.analysis.authsecurity.domain.User;
import com.crypto.analysis.authsecurity.domain.UserMembership;
import com.crypto.analysis.authsecurity.domain.UsersMembershipView;
import com.crypto.analysis.authsecurity.dto.CustomuserdetailsDTO;
import com.crypto.analysis.authsecurity.dto.LoginRequestDTO;
import com.crypto.analysis.authsecurity.dto.UserDTO;
import com.crypto.analysis.authsecurity.dto.UserInfoResponseDTO;
import com.crypto.analysis.authsecurity.dto.UserRequestedDTO;
import com.crypto.analysis.authsecurity.dto.UserStatusMembershipDTO;
import com.crypto.analysis.authsecurity.enums.FailureEnum;
import com.crypto.analysis.authsecurity.enums.MessageEnum;
import com.crypto.analysis.authsecurity.exception.BadRequestException;
import com.crypto.analysis.authsecurity.repositories.RoleRepository;
import com.crypto.analysis.authsecurity.repositories.UserRepository;
import com.crypto.analysis.authsecurity.security.jwt.JwtUtils;
import com.crypto.analysis.mail.service.EmailService;

@Service
public class UserService {
	
@Autowired
UserRepository userRepository;

@Autowired
private RoleRepository roleRepository;

@Autowired
private PasswordEncoder passwordEncoder;

@Autowired
private AuthenticationManager authenticationManager;

@Autowired
private UserMembershipService userMembershipService;

@Autowired
private UsersMembershipViewService usersMembershipViewService;

@Autowired
private JwtUtils jwtUtils;

@Autowired
private EmailService emailService;

public User getUserInfoByUsername(String userName)
{      
    return userRepository.findUserByUsername(userName);
}
public UserInfoResponseDTO getUserInfoResponseDTOByUsername(LoginRequestDTO loginRequest)
{   UserInfoResponseDTO userInfoResponseDTO = null;  
	Authentication authentication = authenticationManager.authenticate(
		new UsernamePasswordAuthenticationToken(loginRequest.getUserName(), loginRequest.getPassword()));

	 User user = getUserInfoByUsername(authentication.getName());
	 if (user.getStatus().equalsIgnoreCase("DISABLED"))
		 throw new BadRequestException(MessageEnum.DISABLED_USER.message, FailureEnum.DISABLED_USER_ACCOUNT, MessageEnum.DISABLED_USER.service);
	 else if (user.getStatus().equalsIgnoreCase("DECLINED"))
		 throw new BadRequestException(MessageEnum.DECLINED_USER.message, FailureEnum.DECLINED_USER_ACCOUNT, MessageEnum.DECLINED_USER.service);
	 
	 userMembershipService.checkUserMembershipDurationIfActive(user.getId());
	 
  	  SecurityContextHolder.getContext().setAuthentication(authentication);
  	  String jwt =  jwtUtils.generateJwtToken(user.getUsername());
  	  userInfoResponseDTO = UserInfoResponseDTO.builder()
  											 .id(user.getId())
  											 .firstName(user.getFirstName())
  											 .username(user.getUsername())
  											 .lastName(user.getSurName())
  											 .isFirstLogin(user.getIsFirstLogin())
  											 .tacAccepted(user.getTacAccepted())
  											 .jwt(jwt)
  											  .build();
     
  	return userInfoResponseDTO;
}
public User saveChangedPassword(@Valid UserDTO userDTO) {
	User user = getUserInfoByUsername(userDTO.getUserName());
	user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
	user.setIsFirstLogin(false);
	return userRepository.save(user);
}
public User saveTermsAndConditionsAccepted(@Valid UserDTO userDTO) {
	User user = getUserInfoByUsername(userDTO.getUserName());
	user.setTacAccepted(true);
	user.setIsFirstLogin(false);
	
	Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	CustomuserdetailsDTO customuserdetailsDTO =(CustomuserdetailsDTO)principal;
	customuserdetailsDTO.setTacAccepted(true);
	UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
			customuserdetailsDTO, null, customuserdetailsDTO.getAuthorities());
	SecurityContextHolder.getContext().setAuthentication(auth);
    
	return userRepository.save(user);
}

public boolean checkifUsernameExistsInUserRequested(String username) {
	boolean exists = userRepository.existsByUsername(username);
		return exists;
}

public User registerNewUserAccount(@Valid UserRequestedDTO userRequestedDTO) {
	User userRequested = null;
	boolean hasUsername = checkifUsernameExistsInUserRequested(userRequestedDTO.getUserName());
	if (hasUsername)
	{
		throw new BadRequestException(MessageEnum.USERNAME_EXISTS.message, FailureEnum.SAVE_REQUESTED_USER_FAILED, MessageEnum.USERNAME_EXISTS.service);
	}	
	else {	
		 userRequested = User.builder()
						   .title(userRequestedDTO.getTitle())
						   .firstName(userRequestedDTO.getFirstName())
						   .surName(userRequestedDTO.getSurName())
						   .phone(userRequestedDTO.getPhone())
						   .mobile(userRequestedDTO.getMobile())
						   .address1(userRequestedDTO.getAddress1())
						   .address2(userRequestedDTO.getAddress2())
						   .postCode(userRequestedDTO.getPostCode())
						   .Country(userRequestedDTO.getCountry())
						   .company(userRequestedDTO.getCompany())
						   .email(userRequestedDTO.getEmail())
						   .username(userRequestedDTO.getUserName())
						   .password(passwordEncoder.encode(userRequestedDTO.getPassword()))
						   .passwordHint(userRequestedDTO.getPasswordHint())
						   .status(userRequestedDTO.getStatus())
						   .isFirstLogin(true)
						   .tacAccepted(false)
						   .createdOn(new Timestamp((new Date()).getTime()))
						   .build();
		 userRequested.setRoles( roleRepository.findByName("ROLE_BASIC_USER"));
		 userRepository.save(userRequested);
		
			/*
			 * try { emailService.sendMessageUsingThymeleafTemplate("test@gmail.com",
			 * "New Libvol Registration Request",
			 * userRequestedDTO.getUserName(),"/mail-templates/register-mail.html"); } catch
			 * (MessagingException e) { e.printStackTrace(); };
			 */
			 
			
	}
	
	return userRequested;
}
	public UsersMembershipView updateUserStatusAndMember(UserStatusMembershipDTO userStatusMembershipDTO) {
		  if(!userStatusMembershipDTO.getStatus().equalsIgnoreCase("DECLINED"))
		  {   UserMembership userMembership = userMembershipService.findMembershipByUserId(userStatusMembershipDTO.getUserId(), true);
			  if (userMembership!=null)
			  {userMembership.setMdId(userStatusMembershipDTO.getMembershipDurationId());
			  }
			  else 
			  {
				  userMembership = UserMembership.builder()
						  		                 .mdId(userStatusMembershipDTO.getMembershipDurationId())
						  		                 .userId(userStatusMembershipDTO.getUserId())
						  		                 .isActive(true)
						  		                 .createdOn(new Timestamp((new Date()).getTime()))
						  		                 .build();
			  }
			  userMembershipService.saveUserMembership(userMembership);
		  }
		User user = userRepository.findById(userStatusMembershipDTO.getUserId()).get();
		user.setStatus(userStatusMembershipDTO.getStatus());
		user.setUpdatedOn(new Timestamp((new Date()).getTime()));
		userRepository.save(user);
		
		return usersMembershipViewService.findById(userStatusMembershipDTO.getUserId());
	}
	
}