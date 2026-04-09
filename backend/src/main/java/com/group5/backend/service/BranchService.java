package com.group5.backend.service;

import com.group5.backend.model.Branch;
import com.group5.backend.repository.BranchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BranchService {

    private final BranchRepository branchRepository;

    public BranchService(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    public Branch getBranchById(Long id) {
        return branchRepository.findById(id).orElse(null);
    }

    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    public Branch updateBranch(Long id, Branch updatedBranch) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        existing.setBranchName(updatedBranch.getBranchName());
        existing.setAddress(updatedBranch.getAddress());

        return branchRepository.save(existing);
    }
}