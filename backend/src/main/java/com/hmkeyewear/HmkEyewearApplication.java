package com.hmkeyewear;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HmkEyewearApplication {

    public static void main(String[] args) {
        SpringApplication.run(HmkEyewearApplication.class, args);
    }

}
