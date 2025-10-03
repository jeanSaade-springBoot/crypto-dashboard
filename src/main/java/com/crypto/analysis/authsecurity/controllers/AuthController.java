package com.crypto.analysis.authsecurity.controllers;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crypto.analysis.authsecurity.domain.User;
import com.crypto.analysis.authsecurity.dto.LoginRequestDTO;
import com.crypto.analysis.authsecurity.dto.UserDTO;
import com.crypto.analysis.authsecurity.dto.UserInfoResponseDTO;
import com.crypto.analysis.authsecurity.dto.UserRequestedDTO;
import com.crypto.analysis.authsecurity.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {


    @Autowired
	private final UserService userService;
  
	public AuthController(UserService userService)
	{
		this.userService   = userService;
	}
	
    @PostMapping("/signin")
	public ResponseEntity<UserInfoResponseDTO> authenticateUserJwt(@Valid @RequestBody LoginRequestDTO loginRequest) {
    	return ResponseEntity.ok()
          		 .body(userService.getUserInfoResponseDTOByUsername(loginRequest));
     }
    @PostMapping("/changepassword")
	public ResponseEntity<User> changeUserPassword(@RequestBody @Valid UserDTO userDTO) {
    	return ResponseEntity.ok()
       		 .body(userService.saveChangedPassword(userDTO));
    }
    
    @PostMapping("/register")
  	public ResponseEntity<User> registerNewUser(@RequestBody @Valid UserRequestedDTO userRequestedDTO) {
      	return ResponseEntity.ok()
         		 .body(userService.registerNewUserAccount(userRequestedDTO));
      }
    @PostMapping("/termsandconditionsaccepted")
   	public ResponseEntity<User> termsAndConditionsAccepted(@RequestBody @Valid UserDTO userDTO) {
       	return ResponseEntity.ok()
          		 .body(userService.saveTermsAndConditionsAccepted(userDTO));
       }
       
    
}