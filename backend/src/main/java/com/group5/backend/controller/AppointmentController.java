package com.group5.backend.controller;

import com.group5.backend.model.Appointment;
import com.group5.backend.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id);
    }

    // =========================
    // POST (CREATE)
    // =========================
    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentService.createAppointment(appointment);
    }

    // example input
    //    {
    //        "user": { "userId": 1 },
    //        "timeSlot": { "timeSlotId": 2 },
    //        "type": "Loan Consultation",
    //        "status": "booked"
    //    }


    // =========================
    // DELETE BY ID
    // =========================
    @DeleteMapping("/{id}")
    public void deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
    }

    // =========================
    // PUT BY ID
    // =========================
    @PutMapping("/{id}")
    public Appointment updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointment) {

        return appointmentService.updateAppointment(id, appointment);
    }
    //    {
    //        "user": { "userId": 1 },
    //        "timeSlot": { "timeSlotId": 2 },
    //        "type": "Loan Consultation",
    //        "status": "completed"
    //    }
}