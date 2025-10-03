package com.crypto.analysis.authsecurity.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.UserMembership;
import com.crypto.analysis.authsecurity.enums.FailureEnum;
import com.crypto.analysis.authsecurity.enums.MessageEnum;
import com.crypto.analysis.authsecurity.exception.BadRequestException;
import com.crypto.analysis.authsecurity.repositories.UserMembershipRepository;

@Service
public class UserMembershipService {
 
	@Autowired
	UserMembershipRepository userMembershipRepository;
	
	@Autowired
	MembershipDurationService membershipDurationService;
	
	public Boolean checkUserMembershipDurationIfActive(Long userId)
	{  UserMembership userMembership = findMembershipByUserId(userId,true);
	  if (userMembership==null)
	  {
		  throw new BadRequestException(MessageEnum.MEMBERSHIP_NOT_SET.message, FailureEnum.MEMBERSHIP_NOT_SET_FAILED, MessageEnum.MEMBERSHIP_NOT_SET.service);
	   }
	   int duration = userMembershipRepository.getDuration(userMembership.getUserId());
	   if(duration<0)
	   {   updateMembership(false, userMembership.getId());
	   	   throw new BadRequestException(MessageEnum.MEMBERSHIP_EXPIRED.message, FailureEnum.MEMBERSHIP_VALIDATION_FAILED, MessageEnum.MEMBERSHIP_EXPIRED.service);
 		}
	   else
		   return true;
	 }
	public void updateMembership(boolean isValid, Long id) {
		Optional<UserMembership> opt = userMembershipRepository.findById(id);
		if(opt.isPresent())
		{
			UserMembership entity = opt.get();
			entity.setActive(isValid);
			userMembershipRepository.save(entity);
		}
	}
	public UserMembership findMembershipByUserId(Long userId, Boolean isActive) {
		
		return userMembershipRepository.findByUserIdAndIsActive(userId,isActive);
	}
	public UserMembership saveUserMembership(UserMembership userMembership) {
		return userMembershipRepository.save(userMembership);
	}
	
}
