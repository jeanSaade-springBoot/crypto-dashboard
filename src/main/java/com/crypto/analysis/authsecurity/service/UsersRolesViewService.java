package com.crypto.analysis.authsecurity.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.UsersRolesView;
import com.crypto.analysis.authsecurity.repositories.UsersRolesViewRepository;

@Service
public class UsersRolesViewService {
  @Autowired
  UsersRolesViewRepository usersRolesViewRepository;
	
  public List<UsersRolesView> getUsersRoles()
  {
	  return usersRolesViewRepository.findAll();
	  
  }

}
