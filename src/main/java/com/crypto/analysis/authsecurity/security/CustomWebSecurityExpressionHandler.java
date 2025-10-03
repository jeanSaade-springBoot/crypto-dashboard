package com.crypto.analysis.authsecurity.security;

import org.springframework.security.access.expression.SecurityExpressionRoot;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.FilterInvocation;
import org.springframework.security.web.access.expression.DefaultWebSecurityExpressionHandler;
import org.springframework.security.web.access.expression.WebSecurityExpressionRoot;
import org.springframework.stereotype.Component;

@Component(value="customExpressionHandler")
public class CustomWebSecurityExpressionHandler extends DefaultWebSecurityExpressionHandler {

	  @Override
	    protected SecurityExpressionRoot createSecurityExpressionRoot(
	            Authentication authentication, FilterInvocation fi) {

	        WebSecurityExpressionRoot expressionRoot = new CustomWebSecurityExpressionRoot(authentication, fi);

	        return expressionRoot;
	}
}
