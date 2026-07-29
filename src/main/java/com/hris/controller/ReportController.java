package com.hris.controller;

import com.hris.pintarni.Employee;
import com.hris.repository.EmployeeRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final EmployeeRepository employeeRepository;

    public ReportController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/employees/excel")
    public ResponseEntity<byte[]> exportEmployeesToExcel() throws IOException {
        List<Employee> employees = employeeRepository.findAll();

        // Membuat Workbook Excel baru
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Data Karyawan");

        // Membuat baris Header
        Row headerRow = sheet.createRow(0);
        String[] columns = {"ID", "NIP", "Nama Lengkap", "Jabatan", "Departemen"};

        // Styling Header (Opsional, agar terlihat rapi)
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // Mengisi Data Karyawan ke dalam baris Excel
        int rowNum = 1;
        for (Employee emp : employees) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(emp.getId());
            row.createCell(1).setCellValue(emp.getNip());
            row.createCell(2).setCellValue(emp.getName());
            row.createCell(3).setCellValue(emp.getPosition());
            row.createCell(4).setCellValue(emp.getDepartment());
        }

        // Auto-size kolom agar lebar sel mengikuti panjang teks
        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Menulis workbook ke dalam byte array stream
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        // Setup Header untuk memaksa browser mengunduh file
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=laporan_data_karyawan.xlsx");
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(outputStream.toByteArray());
    }
}