package com.crypto.analysis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableAsync
public class CryptoDashboardApplication {

	public static void main(String[] args) {
		SpringApplication.run(CryptoDashboardApplication.class, args);
	}
	 
	@Bean
	public RestTemplate restTemplate() {
	    return new RestTemplate();
	}
}
