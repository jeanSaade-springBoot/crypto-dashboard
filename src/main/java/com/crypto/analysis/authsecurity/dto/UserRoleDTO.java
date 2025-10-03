package com.crypto.analysis.authsecurity.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class UserRoleDTO {
	 private Long userId;
	 private String roleName;
}
