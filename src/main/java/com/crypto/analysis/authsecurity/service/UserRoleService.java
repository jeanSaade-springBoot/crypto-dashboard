package com.crypto.analysis.authsecurity.service;

import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.Role;
import com.crypto.analysis.authsecurity.domain.User;
import com.crypto.analysis.authsecurity.dto.UserRoleDTO;
import com.crypto.analysis.authsecurity.repositories.RoleRepository;
import com.crypto.analysis.authsecurity.repositories.UserRepository;

@Service
public class UserRoleService {
	@Autowired
	UserRepository userRepository;
	@Autowired
	RoleRepository roleRepository;

	public User updateUserRole(UserRoleDTO userRoleDTO) {
		User user = userRepository.findById(userRoleDTO.getUserId()).get();
		Collection<Role> newRole = roleRepository.findByName(userRoleDTO.getRoleName());
		user.removeRoles(user.getRoles());
		user.setRoles(newRole);
		return userRepository.save(user);
	}

}
