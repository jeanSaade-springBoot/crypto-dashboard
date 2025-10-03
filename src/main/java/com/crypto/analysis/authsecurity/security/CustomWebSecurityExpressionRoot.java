package com.crypto.analysis.authsecurity.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.FilterInvocation;
import org.springframework.security.web.access.expression.WebSecurityExpressionRoot;

public class CustomWebSecurityExpressionRoot extends WebSecurityExpressionRoot {

	 public CustomWebSecurityExpressionRoot(Authentication a, FilterInvocation fi) {
	        super(a, fi);
	    }

	    public boolean hasPrivilege(String privilege) {
	    	
	        boolean calculatedValue = false;
			if (privilege.equalsIgnoreCase("apple"))
				calculatedValue=true;
	        return calculatedValue;

	    }
}
