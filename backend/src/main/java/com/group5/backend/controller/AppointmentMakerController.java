package com.group5.backend.controller;

import com.group5.backend.model.Appointment;
import com.group5.backend.service.AppointmentMakerService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/appointment-maker")
public class AppointmentMakerController {

    private final AppointmentMakerService appointmentMakerService;

    // links to the service
    public AppointmentMakerController(AppointmentMakerService appointmentMakerService) {
        this.appointmentMakerService = appointmentMakerService;
    }

    // =========================
    // START MAKING APPOINTMENT
    // =========================
    @PostMapping("/DRAFT")
    public String startDraft(@RequestBody Appointment appointment) {
        return appointmentMakerService.startDraft(
                appointment.getUser(),
                appointment.getTimeSlot()
        );
    }

    // =========================
    // ADD TYPE TO APPOINTMENT
    // =========================
    @PostMapping("/DRAFTADD")
    public String addType(@RequestBody String type) {
        return appointmentMakerService.addType(type);
    }

    // =========================
    // FINALIZE THE APPOINTMENT
    // =========================
    @PostMapping("/FINALIZE")
    public Appointment finalizeDraft() {
        return appointmentMakerService.finalizeDraft();
    }

    // =========================
    // CANCEL THE APPOINTMENT
    // =========================
    @DeleteMapping("/CANCEL")
    public String cancelDraft() {
        return appointmentMakerService.cancelDraft();
    }
}