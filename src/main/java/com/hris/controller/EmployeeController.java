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

    // Read All
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Create
    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeRepository.save(employee);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employee.setNip(employeeDetails.getNip());
                    employee.setName(employeeDetails.getName());
                    employee.setPosition(employeeDetails.getPosition());
                    employee.setDepartment(employeeDetails.getDepartment());
                    return ResponseEntity.ok(employeeRepository.save(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Contoh modifikasi ringan di EmployeeController.java
    @PostMapping
    public ResponseEntity<?> createEmployee(
            @RequestHeader(value = "X-User-Role", defaultValue = "EMPLOYEE") String userRole,
            @RequestBody Employee employee) {

        if (!"ADMIN".equals(userRole)) {
            return ResponseEntity.status(403).body("Akses ditolak: Hanya ADMIN yang dapat menambah karyawan.");
        }
        return ResponseEntity.ok(employeeRepository.save(employee));
    }

    // Delete
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