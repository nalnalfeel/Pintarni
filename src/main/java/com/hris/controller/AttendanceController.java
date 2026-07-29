package com.hris.controller;

import com.hris.pintarni.Attendance;
import com.hris.repository.AttendanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    // Mengambil semua data absensi
    @GetMapping
    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    // Endpoint untuk Check-In
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody Attendance request) {
        // Cek apakah sudah check-in hari ini
        List<Attendance> existing = attendanceRepository.findByNipAndDate(request.getNip(), LocalDate.now());
        if (!existing.isEmpty()) {
            return ResponseEntity.badRequest().body("Karyawan dengan NIP " + request.getNip() + " sudah melakukan check-in hari ini.");
        }

        request.setDate(LocalDate.now());
        request.setCheckIn(LocalTime.now());
        request.setStatus("HADIR");

        return ResponseEntity.ok(attendanceRepository.save(request));
    }

    // Endpoint untuk Check-Out
    @PutMapping("/check-out/{id}")
    public ResponseEntity<Attendance> checkOut(@PathVariable Long id) {
        return attendanceRepository.findById(id)
                .map(attendance -> {
                    attendance.setCheckOut(LocalTime.now());
                    return ResponseEntity.ok(attendanceRepository.save(attendance));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}