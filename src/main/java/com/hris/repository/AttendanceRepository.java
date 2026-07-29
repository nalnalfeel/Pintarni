package com.hris.repository;

import com.hris.pintarni.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // Custom query untuk mencari absensi berdasarkan NIP dan Tanggal (mencegah double check-in)
    List<Attendance> findByNipAndDate(String nip, LocalDate date);
}