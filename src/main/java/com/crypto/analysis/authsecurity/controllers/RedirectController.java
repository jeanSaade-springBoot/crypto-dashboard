package com.crypto.analysis.authsecurity.controllers;

import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class RedirectController {

	@RequestMapping(value="/")
	public ModelAndView defaultPage(ModelMap model) {
		return new ModelAndView("html/default");
	}
	
	@RequestMapping(value="/login")
	public ModelAndView loginPage(ModelMap model) {
		return new ModelAndView("html/auth/login");
	}
	
	@RequestMapping(value="/register")
	public ModelAndView registerPage(ModelMap model) {
		return new ModelAndView("html/signup");
	}
	
	@RequestMapping(value="/confirmation")
	public ModelAndView confirmation(ModelMap model) {
		return new ModelAndView("html/confirmation");
	}
	
	@RequestMapping(value="/invalidSession")
	public ModelAndView invalidSession(ModelMap model) {
		return new ModelAndView("html/auth/invalidSession");
	}
	@RequestMapping(value="/forgotpassword")
	public ModelAndView forgotPasswordPage(ModelMap model) {
		return new ModelAndView("html/forgotPassword");
	}
	@RequestMapping( value =  "termsandconditionsconfirmation")
    public ModelAndView termsAndConditionsConfirmation(ModelMap model)
    {
		return new ModelAndView("html/termsAndConditionsConfirmation");
    }
}
