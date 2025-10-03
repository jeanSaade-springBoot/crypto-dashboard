package com.crypto.analysis.controller;

import org.springframework.security.core.Authentication;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class AppRedirectController {
	
	@RequestMapping(value = "/dashboard")
	public ModelAndView dashbsoardView(ModelMap model) {
		return new ModelAndView("html/dashboard/index");
	}
	@RequestMapping( value =  "/bitcoin")
    public ModelAndView cryBitcoinGraphPage(@RequestParam("isShared") String isShared , ModelMap model, Authentication authentication)
    {
        model.addAttribute("isShared", isShared);
	    model.addAttribute("privilege", "TRENDLINE_CRYPTOS_SCREEN");
	    
	    return new ModelAndView("html/dashboard/technical-analysis-btc");
    }
}
