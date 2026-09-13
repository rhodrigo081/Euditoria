package com.euditoria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EuditoriaApplication {
    public static void main(String[] args) {
        SpringApplication.run(EuditoriaApplication.class, args);
    }
}
