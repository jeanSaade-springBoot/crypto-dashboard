package com.crypto.analysis.authsecurity.security.jwt;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.crypto.analysis.authsecurity.enums.FailureEnum;
import com.crypto.analysis.authsecurity.exception.BadRequestException;
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
  private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);
  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
      throws IOException, ServletException {
    logger.error("Unauthorized error: {}", authException.getMessage());
    //response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
   if (authException.getMessage().equalsIgnoreCase("Bad credentials"))
	   throw new BadRequestException(authException.getMessage(), FailureEnum.UNAUTHORIZED_ERROR, "AuthEntryPointJwt");
   else
    response.sendRedirect("/login");
  
    
  }
}