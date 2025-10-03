package com.crypto.analysis.authsecurity.domain;


import java.sql.Timestamp;

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
@Table(name = "users_membership_view")
public class UsersMembershipView {
	@Id
    private Long id;
	private Long mdId;
	private Timestamp createdOn;
	private Timestamp lastLogin;
	private String firstName;
	private String surName;
	private String title;
	private String mdDescription;
	private String status;
	private String postCode;
	private String phone;
	private String mobile;
	private String email;
	private String company;
	private String country;
	private String address1;
	private String address2;
	private Boolean isFirstLogin;
}
