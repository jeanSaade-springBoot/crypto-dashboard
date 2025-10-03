package com.crypto.analysis.authsecurity.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.crypto.analysis.authsecurity.domain.UserMembership;

public interface UserMembershipRepository  extends JpaRepository<UserMembership, Long> {

	UserMembership findByUserIdAndIsActive(Long userId, Boolean isActive);
	
	@Query(value = "select  DATEDIFF((select TIMESTAMPADD(MONTH, m.value, created_on) \r\n"
			+ "						from membership_duration m \r\n"
			+ "                        where m.id = md_id) ,sysdate()) duration -- \r\n"
			+ "from user_membership \r\n"
			+ "where user_id = :userId and is_active = true",
       nativeQuery = true)
      public int getDuration(@Param("userId") Long userId);
}
