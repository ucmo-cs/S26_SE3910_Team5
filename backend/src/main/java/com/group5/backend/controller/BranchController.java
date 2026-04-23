package com.group5.backend.controller;

import com.group5.backend.model.Branch;
import com.group5.backend.service.BranchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<Branch> getAllBranches() {
        return branchService.getAllBranches();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public Branch getBranchById(@PathVariable Long id) {
        return branchService.getBranchById(id);
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public Branch createBranch(@RequestBody Branch branch) {
        return branchService.createBranch(branch);
    }
    // example input
    // {
    //     "branchName": "South Branch",
    //     "address": "789 South Rd"
    // }

    // =========================
    // DELETE BY ID
    // =========================
    @DeleteMapping("/{id}")
    public void deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
    }

    // =========================
    // DELETE ALL
    // =========================
    @DeleteMapping("/ALL")
    public String deleteAllBranches() {
        return branchService.deleteAllBranches();
    }

    // =========================
    // PUT BY ID
    // =========================
    @PutMapping("/{id}")
    public Branch updateBranch(
            @PathVariable Long id,
            @RequestBody Branch branch) {

        return branchService.updateBranch(id, branch);
    }
    //    {
    //        "branchName": "Updated Branch",
    //        "address": "123 New Address"
    //    }
}