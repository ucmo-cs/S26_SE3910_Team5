package com.group5.backend.service;

import com.group5.backend.model.Appointment;
import com.group5.backend.model.TimeSlot;
import com.group5.backend.model.User;
import com.group5.backend.repository.AppointmentRepository;
import com.group5.backend.repository.TimeSlotRepository;
import com.group5.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentMakerService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;

    private User tempUser;
    private TimeSlot tempTimeSlot;
    private List<String> tempTypes = new ArrayList<>();

    public AppointmentMakerService(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            TimeSlotRepository timeSlotRepository) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    // =========================
    // START DRAFT
    // =========================

    public String startDraft(User user, TimeSlot timeSlot) {
        tempUser = userRepository.save(user);
        tempTimeSlot = timeSlotRepository.save(timeSlot);
        tempTypes.clear();

        return "Draft appointment started";
    }

    // =========================
    // ADD TYPE
    // =========================

    public String addType(String type) {
        tempTypes.add(type);
        return "Type added";
    }

    // =========================
    // FINALIZE APPOINTMENT
    // =========================

    public Appointment finalizeDraft() {
        String finalType = String.join(", ", tempTypes);

        Appointment appointment = new Appointment();
        appointment.setUser(tempUser);
        appointment.setTimeSlot(tempTimeSlot);
        appointment.setType(finalType);
        appointment.setStatus(Appointment.AppointmentStatus.booked);

        Appointment saved = appointmentRepository.save(appointment);

        tempUser = null;
        tempTimeSlot = null;
        tempTypes.clear();

        return saved;
    }

    // =========================
    // CANCEL DRAFT
    // =========================

    public String cancelDraft() {

        if (tempTimeSlot != null) {
            timeSlotRepository.deleteById(tempTimeSlot.getTimeSlotId());
        }

        if (tempUser != null) {
            userRepository.deleteById(tempUser.getUserId());
        }

        tempUser = null;
        tempTimeSlot = null;
        tempTypes.clear();

        return "Draft canceled";
    }
}