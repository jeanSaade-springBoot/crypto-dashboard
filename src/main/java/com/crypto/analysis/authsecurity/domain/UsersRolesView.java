package com.crypto.analysis.authsecurity.domain;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
@Entity
@Table(name = "users_roles_view")
public class UsersRolesView {
	@Id
    private Long id;
	private Long roleId;
	private String firstName;
	private String surName;
	private String title;
	private String status;
	private String email;
	private String role;
}
