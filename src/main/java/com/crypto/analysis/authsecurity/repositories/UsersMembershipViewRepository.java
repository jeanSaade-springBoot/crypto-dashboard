package com.crypto.analysis.authsecurity.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crypto.analysis.authsecurity.domain.UsersMembershipView;


public interface UsersMembershipViewRepository  extends JpaRepository<UsersMembershipView, Long> {

	List<UsersMembershipView> findAllByStatus(String status);
}
