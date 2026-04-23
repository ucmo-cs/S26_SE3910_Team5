package com.group5.backend.service;

import com.group5.backend.model.TimeSlot;
import com.group5.backend.repository.TimeSlotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;

    //
    public TimeSlotService(TimeSlotRepository timeSlotRepository) {
        this.timeSlotRepository = timeSlotRepository;
    }

    //
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAll();
    }

    //
    public TimeSlot getTimeSlotById(Long id) {
        return timeSlotRepository.findById(id).orElse(null);
    }

    //
    public TimeSlot createTimeSlot(TimeSlot timeSlot) {
        return timeSlotRepository.save(timeSlot);
    }

    //
    public void deleteTimeSlot(Long id) {
        timeSlotRepository.deleteById(id);
    }

    //
    public String deleteAllTimeSlots() {
        try {
            timeSlotRepository.deleteAll();
            return "All timeslots deleted successfully";
        } catch (Exception e) {
            return "An error has occurred during deletion";
        }
    }

    //
    public TimeSlot updateTimeSlot(Long id, TimeSlot updatedTimeSlot) {
        TimeSlot existing = timeSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TimeSlot not found"));

        existing.setBranch(updatedTimeSlot.getBranch());
        existing.setStartTime(updatedTimeSlot.getStartTime());
        existing.setEndTime(updatedTimeSlot.getEndTime());
        existing.setIsAvailable(updatedTimeSlot.getIsAvailable());

        return timeSlotRepository.save(existing);
    }
}