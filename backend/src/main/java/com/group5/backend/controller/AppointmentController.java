package com.group5.backend.controller;

import com.group5.backend.model.Appointment;
import com.group5.backend.repository.AppointmentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;

    // Constructor Injection
    public AppointmentController(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        return appointment.orElse(null); // simple for now
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // example input
    //    {
    //        "user": { "userId": 1 },
    //        "timeSlot": { "timeSlotId": 2 },
    //        "type": "Loan Consultation",
    //        "status": "booked"
    //    }
}