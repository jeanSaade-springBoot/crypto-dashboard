package com.crypto.analysis.authsecurity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum FailureEnum {
	SAVE_REQUESTED_USER_FAILED(1),
	MEMBERSHIP_VALIDATION_FAILED(2),
	UNAUTHORIZED_ERROR(3),
	MEMBERSHIP_NOT_SET_FAILED(4),
	DISABLED_USER_ACCOUNT(5),
	DECLINED_USER_ACCOUNT(6),
	SAVE_REQUESTED_ROLE_FAILED(7),
	EXCEL_DATA_ROW_OVER_250(8),
	EXCEL_DATA_INSERT_FAILED(8);
    private final int code;

}
