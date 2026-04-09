package com.group5.backend.service;

import com.group5.backend.model.Appointment;
import com.group5.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    // links to the repository
    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // gets all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // gets a specific appointment by id#
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElse(null);
    }

    // creates a new appointment
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // deletes a specific appointment by id#
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    // gets a specific appointment by id# and updates the info as listed
    public Appointment updateAppointment(Long id, Appointment updatedAppointment) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Update fields
        existing.setUser(updatedAppointment.getUser());
        existing.setTimeSlot(updatedAppointment.getTimeSlot());
        existing.setType(updatedAppointment.getType());
        existing.setStatus(updatedAppointment.getStatus());

        return appointmentRepository.save(existing);
    }
}