package com.hris.controller;

import com.hris.pintarni.Employee;
import com.hris.repository.EmployeeRepository;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.crypt.EncryptionMode;
import org.apache.poi.poifs.crypt.Encryptor;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.GeneralSecurityException;
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
    public ResponseEntity<byte[]> exportEmployeesToExcel() throws IOException, InvalidFormatException {
        List<Employee> employees = employeeRepository.findAll();

        // 1. Membuat Workbook Excel baru
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Data Karyawan");

        // 2. Membuat baris Header terlebih dahulu
        Row headerRow = sheet.createRow(0);
        String[] columns = {"ID", "NIP", "Nama Lengkap", "Jabatan", "Departemen"};

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // 3. Mengisi Data Karyawan ke dalam baris Excel
        int rowNum = 1;
        for (Employee emp : employees) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(emp.getId() != null ? emp.getId() : 0);
            row.createCell(1).setCellValue(emp.getNip() != null ? emp.getNip() : "");
            row.createCell(2).setCellValue(emp.getName() != null ? emp.getName() : "");
            row.createCell(3).setCellValue(emp.getPosition() != null ? emp.getPosition() : "");
            row.createCell(4).setCellValue(emp.getDepartment() != null ? emp.getDepartment() : "");
        }

        // Auto-size kolom agar lebar sel mengikuti panjang teks
        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // 4. Tulis workbook biasa ke temporary ByteArray OutputStream
        ByteArrayOutputStream tempBos = new ByteArrayOutputStream();
        workbook.write(tempBos);
        workbook.close(); // Workbook ditutup setelah seluruh data selesai ditulis ke temporary stream

        // 5. Proses Enkripsi dengan Password
        POIFSFileSystem fs = new POIFSFileSystem();
        EncryptionInfo info = new EncryptionInfo(EncryptionMode.agile);
        Encryptor encryptor = info.getEncryptor();
        encryptor.confirmPassword("RahasiaHRD123");

        try (OPCPackage opc = OPCPackage.open(new ByteArrayInputStream(tempBos.toByteArray()));
             OutputStream os = encryptor.getDataStream(fs)) {
            opc.save(os);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException(e);
        }

        // 6. Tulis file yang sudah dienkripsi ke stream akhir
        ByteArrayOutputStream finalOut = new ByteArrayOutputStream();
        fs.writeFilesystem(finalOut);
        fs.close();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=laporan_data_karyawan_secured.xlsx");
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(finalOut.toByteArray());
    }
}