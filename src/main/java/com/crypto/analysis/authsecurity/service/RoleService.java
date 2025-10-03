package com.crypto.analysis.authsecurity.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.Role;
import com.crypto.analysis.authsecurity.dto.CreateRoleDTO;
import com.crypto.analysis.authsecurity.enums.FailureEnum;
import com.crypto.analysis.authsecurity.enums.MessageEnum;
import com.crypto.analysis.authsecurity.exception.BadRequestException;
import com.crypto.analysis.authsecurity.repositories.RoleRepository;

@Service
public class RoleService {
 @Autowired
 RoleRepository roleRepository;
 
	public Boolean checkIfRoleNameExists(String roleName)
	{
		boolean roleExists = roleRepository.existsByName(roleName);
		if (roleExists)
			return true;
		else return false;
	}
 	public List<Role> getRoles()
	 {   List<Role> roles = roleRepository.findAll();
	     roles.replaceAll(role -> {
	    	 role.setName(role.getName().replace("ROLE_", ""));
	         return role;
	     });
		 return roles;
	 }

	public Role createRole(CreateRoleDTO createRoleDTO) {
		boolean roleExists =  checkIfRoleNameExists(createRoleDTO.getRoleName());
		if(roleExists)
			throw new BadRequestException(MessageEnum.ROLENAME_EXISTS.message, FailureEnum.SAVE_REQUESTED_ROLE_FAILED, MessageEnum.ROLENAME_EXISTS.service);

		Role role = Role.builder().name(createRoleDTO.getRoleName()).build();
		return roleRepository.save(role);
	}
}
