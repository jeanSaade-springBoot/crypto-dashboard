package com.crypto.analysis.authsecurity.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crypto.analysis.authsecurity.domain.MembershipDuration;


public interface MembershipDurationRepository  extends JpaRepository<MembershipDuration, Long> {

}
