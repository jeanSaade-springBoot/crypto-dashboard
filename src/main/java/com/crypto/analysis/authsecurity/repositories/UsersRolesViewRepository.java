package com.crypto.analysis.authsecurity.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crypto.analysis.authsecurity.domain.UsersRolesView;

public interface UsersRolesViewRepository  extends JpaRepository<UsersRolesView, Long> {

}
