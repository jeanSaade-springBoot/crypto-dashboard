package com.crypto.analysis.authsecurity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class UserStatusMembershipDTO {
	 private Long userId;
	 private String status;
	 private Long membershipDurationId;
}
