package com.crypto.analysis.authsecurity.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.dto.PrivilegesRoleDTO;
import com.crypto.analysis.authsecurity.repositories.PrivilegeRepository;

@Service
public class PrivilegeService {
@Autowired
PrivilegeRepository privilegeRepository;

	 public List<PrivilegesRoleDTO> findPrivilegeByRoleId(Long roleId)
	 {
		 return privilegeRepository.findPrivilegeByRoleId(roleId);
	 }
}
