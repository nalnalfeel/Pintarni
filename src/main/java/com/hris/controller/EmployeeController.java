package com.hris.controller;

import com.hris.pintarni.Employee;
import com.hris.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // 1. Ambil Semua Data Karyawan (Read)
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // 2. Simpan Data Karyawan Baru (Create)
    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        // Cek apakah NIP sudah terdaftar sebelumnya
        try {
            Employee savedEmployee = employeeRepository.save(employee);
            return ResponseEntity.ok(savedEmployee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal menyimpan data. Pastikan NIP bersifat unik.");
        }
    }

    // 3. Update Data Karyawan (Update)
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employee.setNip(employeeDetails.getNip());
                    employee.setName(employeeDetails.getName());
                    employee.setPosition(employeeDetails.getPosition());
                    employee.setDepartment(employeeDetails.getDepartment());
                    Employee updatedEmployee = employeeRepository.save(employee);
                    return ResponseEntity.ok(updatedEmployee);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Hapus Data Karyawan (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employeeRepository.delete(employee);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}