package com.group5.backend.controller;

import com.group5.backend.model.TimeSlot;
import com.group5.backend.repository.TimeSlotRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/timeslots")
public class TimeSlotController {

    private final TimeSlotRepository timeSlotRepository;

    // Constructor Injection
    public TimeSlotController(TimeSlotRepository timeSlotRepository) {
        this.timeSlotRepository = timeSlotRepository;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAll();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public TimeSlot getTimeSlotById(@PathVariable Long id) {
        Optional<TimeSlot> timeSlot = timeSlotRepository.findById(id);
        return timeSlot.orElse(null); // simple for now
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public TimeSlot createTimeSlot(@RequestBody TimeSlot timeSlot) {
        return timeSlotRepository.save(timeSlot);
    }

    // example input
    // {
    //     "branch": { "branchId": 1 },
    //     "startTime": "2026-03-02T11:00:00-06:00",
    //     "endTime": "2026-03-02T11:30:00-06:00",
    //     "isAvailable": true
    // }
}