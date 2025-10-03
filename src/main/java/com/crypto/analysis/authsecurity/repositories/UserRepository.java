package com.crypto.analysis.authsecurity.repositories;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crypto.analysis.authsecurity.domain.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByUsername(String username);
	User findUserByUsername(String username);
	boolean existsByUsername(String username);
}
