package com.crypto.analysis.mail.service;

import java.util.HashMap;
import java.util.Map;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import com.crypto.analysis.authsecurity.domain.User;
import com.crypto.analysis.authsecurity.service.UserService;

@Service
public class EmailService {
	 private static final String NOREPLY_ADDRESS = "noreplay@x.com";
	 
	 @Autowired
	 private JavaMailSender emailSender;
	 
	 @Autowired
	 private SpringTemplateEngine thymeleafTemplateEngine;
	 
	 @Autowired
	 private UserService userService;
	 
	 public void sendSimpleMessage(String to, String subject, String text) {
	        try {
	            SimpleMailMessage message = new SimpleMailMessage();
	            message.setFrom(NOREPLY_ADDRESS);
	            message.setTo(to);
	            message.setSubject(subject);
	            message.setText(text);

	            emailSender.send(message);
	        } catch (MailException exception) {
	            exception.printStackTrace();
	        }
	    }
	 
	   public void sendMessageUsingThymeleafTemplate(
	        String to, String subject, String userName, String templateName)
	            throws MessagingException {
		   
		    User user = userService.getUserInfoByUsername(userName);
		    
		    Map<String, Object> templateModel = new HashMap<String, Object>();
		    templateModel.put("Title", user.getTitle());
		    templateModel.put("FirstName", user.getFirstName());
		    templateModel.put("SurName", user.getSurName());
		    templateModel.put("email", user.getEmail());
		    templateModel.put("Company", user.getCompany());
		    templateModel.put("recipientName", "Charbel");
		    templateModel.put("senderName", "Libvol");
	        Context thymeleafContext = new Context();
	        thymeleafContext.setVariables(templateModel);
	        
	        String htmlBody = thymeleafTemplateEngine.process(templateName, thymeleafContext);

	        sendHtmlMessage(to, subject, htmlBody);
	    }

	
	  private void sendHtmlMessage(String to, String subject, String htmlBody) throws MessagingException {

	        MimeMessage message = emailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
	        helper.setFrom(NOREPLY_ADDRESS);
	        helper.setTo(to);
	        helper.setSubject(subject);
	        helper.setText(htmlBody, true);
	       // helper.addInline("attachment.png", resourceFile);
	        emailSender.send(message);
	    }
}
