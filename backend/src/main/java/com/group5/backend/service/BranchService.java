package com.group5.backend.service;

import com.group5.backend.model.Branch;
import com.group5.backend.repository.BranchRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BranchService {

    private final BranchRepository branchRepository;

    // links to the repository
    public BranchService(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    // gets all branches
    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    // gets a specific branch by id#
    public Branch getBranchById(Long id) {
        return branchRepository.findById(id)
                .orElse(null);
    }

    // gets only the branch types as a list
    public List<String> getBranchTypes(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        if (branch.getTypes() == null || branch.getTypes().isBlank()) {
            return List.of();
        }

        return Arrays.stream(branch.getTypes().split(","))
                .map(String::trim)
                .toList();
    }

    // gets all branches that contain a specific type
    public List<Branch> getBranchesByType(String type) {
        List<Branch> allBranches = branchRepository.findAll();

        return allBranches.stream()
                .filter(branch ->
                        branch.getTypes() != null &&
                                Arrays.stream(branch.getTypes().split(","))
                                        .map(String::trim)
                                        .anyMatch(branchType ->
                                                branchType.equalsIgnoreCase(type)))
                .collect(Collectors.toList());
    }

    // creates a new branch
    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    // deletes a specific branch by id#
    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    // deletes all branches
    public String deleteAllBranches() {
        try {
            branchRepository.deleteAll();
            return "All branches deleted successfully";
        } catch (Exception e) {
            return "An error has occurred during deletion";
        }
    }

    // gets a specific branch by id# and updates the info as listed
    public Branch updateBranch(Long id, Branch updatedBranch) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        // Update fields
        existing.setBranchName(updatedBranch.getBranchName());
        existing.setAddress(updatedBranch.getAddress());
        existing.setTypes(updatedBranch.getTypes());

        return branchRepository.save(existing);
    }
}