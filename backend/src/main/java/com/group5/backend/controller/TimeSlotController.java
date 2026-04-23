package com.group5.backend.controller;

import com.group5.backend.model.TimeSlot;
import com.group5.backend.service.TimeSlotService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/timeslots")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotService.getAllTimeSlots();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public TimeSlot getTimeSlotById(@PathVariable Long id) {
        return timeSlotService.getTimeSlotById(id);
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public TimeSlot createTimeSlot(@RequestBody TimeSlot timeSlot) {
        return timeSlotService.createTimeSlot(timeSlot);
    }
    //    {
    //        "branch": { "branchId": 1 },
    //        "startTime": "2026-05-02T11:00:00-06:00",
    //        "endTime": "2026-05-02T11:30:00-06:00",
    //        "isAvailable": true
    //    }

    // =========================
    // DELETE BY ID
    // =========================
    @DeleteMapping("/{id}")
    public void deleteTimeSlot(@PathVariable Long id) {
        timeSlotService.deleteTimeSlot(id);
    }

    // =========================
    // DELETE ALL
    // =========================
    @DeleteMapping("/ALL")
    public String deleteAllTimeSlots() {
        return timeSlotService.deleteAllTimeSlots();
    }

    // =========================
    // PUT BY ID
    // =========================
    @PutMapping("/{id}")
    public TimeSlot updateTimeSlot(
            @PathVariable Long id,
            @RequestBody TimeSlot timeSlot) {

        return timeSlotService.updateTimeSlot(id, timeSlot);
    }
    //    {
    //        "branch": { "branchId": 1 },
    //        "startTime": "2026-03-02T12:00:00-06:00",
    //        "endTime": "2026-03-02T12:30:00-06:00",
    //        "isAvailable": false
    //    }
}