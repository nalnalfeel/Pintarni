package com.hris.pintarni;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendances")
@Data
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nip; // Menyimpan NIP karyawan yang melakukan absensi

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime checkIn;

    private LocalTime checkOut;

    private String status; // Contoh: HADIR, SAKIT, IZIN
}