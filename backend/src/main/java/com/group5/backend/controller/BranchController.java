package com.group5.backend.controller;

import com.group5.backend.model.Branch;
import com.group5.backend.repository.BranchRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/branches")
public class BranchController {

    private final BranchRepository branchRepository;

    // Constructor Injection
    public BranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public Branch getBranchById(@PathVariable Long id) {
        Optional<Branch> branch = branchRepository.findById(id);
        return branch.orElse(null); // simple for now
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public Branch createBranch(@RequestBody Branch branch) {
        return branchRepository.save(branch);
    }

    // example input
    // {
    //     "branchName": "South Branch",
    //     "address": "789 South Rd"
    // }
}