package com.crypto.analysis.authsecurity.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class UserRequestedDTO {
	private String userName;
    private String password;
    private String passwordHint;
    private String title;
	private String firstName;
    private String surName;
    private String phone;
    private String mobile;
    private String company;
    private String address1;
    private String address2;
    private String postCode;
    private String country;
    private String email;
    private String status;
	private Long userId;
    private Timestamp createdOn;
    private Timestamp updatedOn;
    private Timestamp lastLogin;

}
