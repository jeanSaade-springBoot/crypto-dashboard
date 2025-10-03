package com.crypto.analysis.authsecurity.exception;


import com.crypto.analysis.authsecurity.enums.FailureEnum;

import lombok.Data;
import lombok.EqualsAndHashCode;

@SuppressWarnings("serial")
@Data
@EqualsAndHashCode(callSuper = true)
public class BadRequestException extends RuntimeException {
    private FailureEnum event;
    private String source;

    public BadRequestException(FailureEnum event, String source) {
        this.event = event;
        this.source = source;
    }

    public BadRequestException(String message, FailureEnum event, String source) {
        super(message);
        this.event = event;
        this.source = source;
    }

    public BadRequestException(String message, Throwable cause, FailureEnum event, String source) {
        super(message, cause);
        this.event = event;
        this.source = source;
    }

    public BadRequestException(Throwable cause, FailureEnum event, String source) {
        super(cause);
        this.event = event;
        this.source = source;
    }

    public BadRequestException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace, FailureEnum event, String source) {
        super(message, cause, enableSuppression, writableStackTrace);
        this.event = event;
        this.source = source;
    }
}
