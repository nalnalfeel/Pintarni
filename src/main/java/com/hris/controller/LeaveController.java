package com.hris.controller;

import com.hris.pintarni.Leave;
import com.hris.repository.LeaveRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveRepository leaveRepository;

    public LeaveController(LeaveRepository leaveRepository) {
        this.leaveRepository = leaveRepository;
    }

    // Mengambil semua data pengajuan cuti
    @GetMapping
    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    // Mengajukan cuti baru
    @PostMapping
    public Leave applyLeave(@RequestBody Leave leave) {
        leave.setStatus("PENDING");
        return leaveRepository.save(leave);
    }

    // Mengubah status cuti (Approve / Reject)
    @PutMapping("/{id}/status")
    public ResponseEntity<Leave> updateLeaveStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return leaveRepository.findById(id)
                .map(leave -> {
                    leave.setStatus(status.toUpperCase());
                    return ResponseEntity.ok(leaveRepository.save(leave));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}