package com.group5.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    // if this doesn't work then panic
    @GetMapping("/test")
    public String test() {
        return "Backend is working!";
    }
}