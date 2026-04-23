package com.group5.backend.controller;

import com.group5.backend.model.User;
import com.group5.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    //    {
    //        "firstName": "Bob",
    //        "lastName": "Johnson",
    //        "email": "bob@example.com",
    //        "phone": "444-444-4444"
    //    }

    // =========================
    // DELETE BY ID
    // =========================
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // =========================
    // DELETE ALL
    // =========================
    @DeleteMapping("/ALL")
    public String deleteAllUsers() {
        return userService.deleteAllUsers();
    }

    // =========================
    // PUT BY ID
    // =========================
    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return userService.updateUser(id, user);
    }
    //    {
    //        "firstName": "Robert",
    //        "lastName": "Johnson",
    //        "email": "robert@example.com",
    //        "phone": "555-555-5555"
    //    }
}