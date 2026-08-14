package com.hris.controller;

import com.hris.pintarni.Employee;
import com.hris.pintarni.User;
import com.hris.repository.EmployeeRepository;
import com.hris.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public EmployeeController(EmployeeRepository employeeRepository, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

            User newUser = new User();
            newUser.setUsername(savedEmployee.getNip());
            newUser.setPassword(passwordEncoder.encode("karyawan123"));
            newUser.setFullName(savedEmployee.getName());
            newUser.setRole("EMPLOYEE");
            userRepository.save(newUser);

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
                    Optional<User> userOpt = userRepository.findByUsername(employee.getNip());
                    if (userOpt.isPresent()){
                        User user = userOpt.get();
                        user.setFullName(employeeDetails.getName());

                        user.setUsername(employeeDetails.getNip());
                        userRepository.save(user);
                    }

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
                    userRepository.findByUsername(employee.getNip())
                            .ifPresent(userRepository::delete);

                    employeeRepository.delete(employee);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}