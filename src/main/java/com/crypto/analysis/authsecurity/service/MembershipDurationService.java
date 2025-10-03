package com.crypto.analysis.authsecurity.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.MembershipDuration;
import com.crypto.analysis.authsecurity.repositories.MembershipDurationRepository;

@Service
public class MembershipDurationService {
	
   @Autowired
   MembershipDurationRepository membershipDurationRepository;
   
   public Optional<MembershipDuration> getMembershipDurationById(Long Id) {
	return membershipDurationRepository.findById(Id);
   }
   
   public List<MembershipDuration> findAll() {
		return membershipDurationRepository.findAll();
	   }
   
}
