package com.group5.backend.controller;

import com.group5.backend.model.User;
import com.group5.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    // Constructor Injection
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null); // simple for now
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // example input
    // {
    //     "firstName": "Bob",
    //     "lastName": "Johnson",
    //     "email": "bob@example.com",
    //     "phone": "444-444-4444"
    // }
}