document.addEventListener('DOMContentLoaded', () => {
    setupUserUI();
    setupRouter();

    // Handle Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('hris_user');
        window.location.href = '/index.html';
    });

    // Trigger route pertama kali
    handleLocation();
});

function setupUserUI() {
    const user = JSON.parse(localStorage.getItem('hris_user'));
    if (user) {
        document.getElementById('user-name').textContent = user.fullName || user.username;

        // --- VALIDASI ROLE: Sembunyikan menu Data Karyawan jika bukan ADMIN ---
        if (user.role !== 'ADMIN') {
            const empMenu = document.querySelector('a[data-page="employees"]');
            if (empMenu) {
                empMenu.parentElement.style.display = 'none';
            }
        }
    }
}

function setupRouter() {
    // Tangkap semua klik pada link nav-link
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link')) {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            window.location.hash = href;
        }
    });

    // Dengarkan perubahan hash (untuk tombol Back/Forward browser)
    window.addEventListener('hashchange', handleLocation);
}

// Peta routing
const routes = {
    '/dashboard': renderDashboard,
    '/employees': renderEmployees,
    '/leave': renderLeave,
    '/attendance': renderAttendance
};

function handleLocation() {
    const hash = window.location.hash || '#/dashboard';
    const path = hash.replace('#', '');

    // Highlight menu yang aktif
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === hash) {
            link.classList.add('active');
        }
    });

    // Render halaman
    const renderFunction = routes[path] || render404;
    renderFunction();
}

// --- KONTEN MODUL ---

function renderDashboard() {
    document.getElementById('page-title').textContent = 'Dashboard Utama';
    document.getElementById('app-content').innerHTML = `
        <div class="card">
            <h2>Selamat Datang di Sistem HRIS!</h2>
            <p>Silakan pilih menu di sebelah kiri untuk mengelola data karyawan, cuti, dan absensi.</p>
        </div>
        <div class="card">
            <h3>Statistik Singkat</h3>
            <p>Total Karyawan: <strong>0</strong> | Pengajuan Cuti Pending: <strong>0</strong></p>
        </div>
    `;
}

function renderEmployees() {
    document.getElementById('page-title').textContent = 'Data Karyawan';
    document.getElementById('app-content').innerHTML = `
        <div class="card">
            <h3>Manajemen Karyawan</h3>
            <p>Ini adalah halaman untuk CRUD Data Karyawan. (Modul ini akan kita bangun pada langkah berikutnya).</p>
            <button class="btn-primary">+ Tambah Karyawan Baru</button>
        </div>
    `;
}

function renderLeave() {
    document.getElementById('page-title').textContent = 'Manajemen Cuti';
    document.getElementById('app-content').innerHTML = `<div class="card"><h3>Modul Cuti</h3><p>Segera hadir...</p></div>`;
}

function renderAttendance() {
    document.getElementById('page-title').textContent = 'Absensi';
    document.getElementById('app-content').innerHTML = `<div class="card"><h3>Modul Absensi</h3><p>Segera hadir...</p></div>`;
}

function render404() {
    document.getElementById('page-title').textContent = '404 Not Found';
    document.getElementById('app-content').innerHTML = `<div class="card"><h3>Halaman tidak ditemukan.</h3></div>`;
}

// --- KONTEN MODUL ---

function renderEmployees() {
    document.getElementById('page-title').textContent = 'Data Karyawan';
    document.getElementById('app-content').innerHTML = `
        <div class="card">
            <h3>Manajemen Karyawan</h3>
            
            <form id="employee-form" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <input type="hidden" id="emp-id">
                <input type="text" id="emp-nip" placeholder="NIP" required style="padding: 8px;">
                <input type="text" id="emp-name" placeholder="Nama Lengkap" required style="padding: 8px;">
                <input type="text" id="emp-position" placeholder="Jabatan" required style="padding: 8px;">
                <input type="text" id="emp-dept" placeholder="Departemen" required style="padding: 8px;">
                <button type="submit" class="btn-primary" style="margin: 0;">Simpan</button>
                <button type="button" onclick="resetForm()" style="padding: 8px;">Batal</button>
            </form>

            <table width="100%" style="border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: #f4f7f6; border-bottom: 2px solid #ddd;">
                        <th style="padding: 10px;">NIP</th>
                        <th style="padding: 10px;">Nama</th>
                        <th style="padding: 10px;">Jabatan</th>
                        <th style="padding: 10px;">Departemen</th>
                        <th style="padding: 10px;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="employee-table-body">
                    <tr><td colspan="5" style="padding: 10px;">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    loadEmployees();

    document.getElementById('employee-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveEmployee();
    });
}

// --- FUNGSI CRUD KARYAWAN ---

async function loadEmployees() {
    const tbody = document.getElementById('employee-table-body');
    try {
        const response = await fetch('/api/employees');
        const data = await response.json();
        headers: getAuthHeaders()

        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 10px; text-align: center;">Belum ada data karyawan</td></tr>`;
            return;
        }

        if (handleUnauthorized(response)) return;

        data.forEach(emp => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #ddd";
            tr.innerHTML = `
                <td style="padding: 10px;">${emp.nip}</td>
                <td style="padding: 10px;">${emp.name}</td>
                <td style="padding: 10px;">${emp.position}</td>
                <td style="padding: 10px;">${emp.department}</td>
                <td style="padding: 10px;">
                    <button onclick="editEmployee(${emp.id}, '${emp.nip}', '${emp.name}', '${emp.position}', '${emp.department}')" style="background:#f1c40f; border:none; padding:5px 10px; cursor:pointer;">Edit</button>
                    <button onclick="deleteEmployee(${emp.id})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; cursor:pointer;">Hapus</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5">Gagal memuat data.</td></tr>`;
    }
}

async function saveEmployee() {
    const id = document.getElementById('emp-id').value;
    const employeeData = {
        nip: document.getElementById('emp-nip').value,
        name: document.getElementById('emp-name').value,
        position: document.getElementById('emp-position').value,
        department: document.getElementById('emp-dept').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/employees/${id}` : '/api/employees';

    try {
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(), // Mengirim token JWT yang valid
            body: JSON.stringify(employeeData)
        });

        if (handleUnauthorized(response)) return;

        if (response.ok) {
            resetForm();
            loadEmployees(); // Muat ulang tabel data karyawan
            alert("Data karyawan berhasil disimpan!");
        } else {
            const errorText = await response.text();
            alert("Gagal menyimpan data: " + errorText);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan koneksi ke server!");
    }
}

function editEmployee(id, nip, name, position, dept) {
    document.getElementById('emp-id').value = id;
    document.getElementById('emp-nip').value = nip;
    document.getElementById('emp-name').value = name;
    document.getElementById('emp-position').value = position;
    document.getElementById('emp-dept').value = dept;
}

async function deleteEmployee(id) {
    if(confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
        try {
            await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            loadEmployees();
        } catch (error) {
            alert("Gagal menghapus data!");
        }
    }
}

function resetForm() {
    document.getElementById('emp-id').value = '';
    document.getElementById('emp-nip').value = '';
    document.getElementById('emp-name').value = '';
    document.getElementById('emp-position').value = '';
    document.getElementById('emp-dept').value = '';
}

// --- KONTEN MODUL ABSENSI ---

function renderAttendance() {
    document.getElementById('page-title').textContent = 'Absensi Harian';
    document.getElementById('app-content').innerHTML = `
        <div class="card">
            <h3>Panel Absensi</h3>
            <p>Masukkan NIP Anda untuk melakukan absensi hari ini.</p>
            
            <form id="attendance-form" style="display: flex; gap: 10px; margin-bottom: 20px;">
                <input type="text" id="att-nip" placeholder="Masukkan NIP" required style="padding: 8px;">
                <button type="submit" class="btn-primary" style="margin: 0;">Check In</button>
            </form>

            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">

            <h3>Riwayat Absensi</h3>
            <table width="100%" style="border-collapse: collapse; text-align: left; margin-top: 10px;">
                <thead>
                    <tr style="background: #f4f7f6; border-bottom: 2px solid #ddd;">
                        <th style="padding: 10px;">Tanggal</th>
                        <th style="padding: 10px;">NIP</th>
                        <th style="padding: 10px;">Check In</th>
                        <th style="padding: 10px;">Check Out</th>
                        <th style="padding: 10px;">Status</th>
                        <th style="padding: 10px;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="attendance-table-body">
                    <tr><td colspan="6" style="padding: 10px;">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    loadAttendances();

    document.getElementById('attendance-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await doCheckIn();
    });
}

// --- FUNGSI CRUD ABSENSI ---

async function loadAttendances() {
    const tbody = document.getElementById('attendance-table-body');
    try {
        const response = await fetch('/api/attendance');
        const data = await response.json();

        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 10px; text-align: center;">Belum ada data absensi</td></tr>`;
            return;
        }

        data.forEach(att => {
            const checkOutTime = att.checkOut ? att.checkOut.substring(0,8) : '-';
            const checkInTime = att.checkIn ? att.checkIn.substring(0,8) : '-';

            // Tombol checkout hanya muncul jika belum checkout
            const actionBtn = !att.checkOut
                ? `<button onclick="doCheckOut(${att.id})" style="background:#e67e22; color:white; border:none; padding:5px 10px; cursor:pointer;">Check Out</button>`
                : `<span style="color: #27ae60; font-weight: bold;">Selesai</span>`;

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #ddd";
            tr.innerHTML = `
                <td style="padding: 10px;">${att.date}</td>
                <td style="padding: 10px;">${att.nip}</td>
                <td style="padding: 10px;">${checkInTime}</td>
                <td style="padding: 10px;">${checkOutTime}</td>
                <td style="padding: 10px;">${att.status}</td>
                <td style="padding: 10px;">${actionBtn}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6">Gagal memuat data absensi.</td></tr>`;
    }
}

async function doCheckIn() {
    const nip = document.getElementById('att-nip').value;

    try {
        const response = await fetch('/api/attendance/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nip: nip })
        });

        if (response.ok) {
            document.getElementById('att-nip').value = '';
            loadAttendances();
        } else {
            const errorMsg = await response.text();
            alert(errorMsg);
        }
    } catch (error) {
        alert("Gagal melakukan Check In!");
    }
}

async function doCheckOut(id) {
    if(confirm('Apakah Anda yakin ingin Check Out sekarang?')) {
        try {
            await fetch(`/api/attendance/check-out/${id}`, { method: 'PUT' });
            loadAttendances();
        } catch (error) {
            alert("Gagal melakukan Check Out!");
        }
    }
}

// --- KONTEN MODUL MANAJEMEN CUTI ---

function renderLeave() {
    const user = JSON.parse(localStorage.getItem('hris_user'));
    const isAdmin = user && user.role === 'ADMIN';
    const actionHeader = isAdmin ? '<th style="padding: 12px; border-bottom: 2px solid #ddd;">Aksi (HRD)</th>' : '';

    document.getElementById('page-title').textContent = 'Manajemen Cuti';
    document.getElementById('app-content').innerHTML = `
    <div class="card">
        <!-- ... form cuti tetap sama ... -->
        <table width="100%" style="border-collapse: collapse; text-align: left; margin-top: 15px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
            <thead>
                <tr style="background: #2c3e50; color: white;">
                    <th style="padding: 12px; border-bottom: 2px solid #ddd;">NIP</th>
                    <th style="padding: 12px; border-bottom: 2px solid #ddd;">Mulai</th>
                    <th style="padding: 12px; border-bottom: 2px solid #ddd;">Selesai</th>
                    <th style="padding: 12px; border-bottom: 2px solid #ddd;">Alasan</th>
                    <th style="padding: 12px; border-bottom: 2px solid #ddd;">Status</th>
                    ${actionHeader}
                </tr>
            </thead>
            <tbody id="leave-table-body">
                <tr><td colspan="6" style="padding: 15px; text-align: center;">Memuat data...</td></tr>
            </tbody>
        </table>
    </div>
`;

    loadLeaves();

    document.getElementById('leave-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitLeave();
    });
}

async function loadLeaves() {
    const tbody = document.getElementById('leave-table-body');
    const user = JSON.parse(localStorage.getItem('hris_user'));
    const isAdmin = user && user.role === 'ADMIN';

    try {
        const response = await fetch('/api/leaves');
        const data = await response.json();

        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 15px; text-align: center; color: #7f8c8d;">Belum ada data pengajuan cuti</td></tr>`;
            return;
        }

        data.forEach(leave => {
            // Pewarnaan status menggunakan badge UI
            let statusBadge = '';
            if (leave.status === 'APPROVED') {
                statusBadge = `<span style="background: #2ecc71; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">DISETUJUI</span>`;
            } else if (leave.status === 'REJECTED') {
                statusBadge = `<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">DITOLAK</span>`;
            } else {
                statusBadge = `<span style="background: #f1c40f; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">MENUNGGU</span>`;
            }

            let actionCell = '';
            if (isAdmin) {
                if (leave.status === 'PENDING') {
                    actionCell = `<td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <button onclick="updateLeaveStatus(${leave.id}, 'APPROVED')" style="background:#27ae60; color:white; border:none; padding:6px 12px; cursor:pointer; margin-right: 5px; border-radius: 4px; transition: 0.3s;">Setuju</button>
                        <button onclick="updateLeaveStatus(${leave.id}, 'REJECTED')" style="background:#c0392b; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius: 4px; transition: 0.3s;">Tolak</button>
                    </td>`;
                } else {
                    actionCell = `<td style="padding: 12px; border-bottom: 1px solid #eee; color: #95a5a6;">Selesai</td>`;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${leave.nip}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${leave.startDate}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${leave.endDate}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${leave.reason}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${statusBadge}</td>
                ${actionCell}
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 15px; text-align: center; color: red;">Gagal memuat data cuti.</td></tr>`;
    }
}

async function submitLeave() {
    const leaveData = {
        nip: document.getElementById('leave-nip').value,
        startDate: document.getElementById('leave-start').value,
        endDate: document.getElementById('leave-end').value,
        reason: document.getElementById('leave-reason').value
    };

    try {
        const response = await fetch('/api/leaves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leaveData)
        });

        if(response.ok) {
            // Reset form
            document.getElementById('leave-nip').value = '';
            document.getElementById('leave-start').value = '';
            document.getElementById('leave-end').value = '';
            document.getElementById('leave-reason').value = '';

            loadLeaves(); // Refresh tabel
        }
    } catch (error) {
        alert("Gagal mengajukan cuti!");
    }
}

async function updateLeaveStatus(id, status) {
    if(confirm(`Apakah Anda yakin ingin mengubah status cuti ini menjadi ${status}?`)) {
        try {
            await fetch(`/api/leaves/${id}/status?status=${status}`, {
                method: 'PUT'
            });
            loadLeaves(); // Refresh tabel setelah update
        } catch (error) {
            alert("Gagal merubah status cuti!");
        }
    }
}

function renderEmployees() {
    document.getElementById('page-title').textContent = 'Data Karyawan';
    document.getElementById('app-content').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Manajemen Karyawan</h3>
                <!-- Tombol Download Excel -->
                <button onclick="downloadExcel()" style="background-color: #217346; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    &#128196; Unduh Excel
                </button>
            </div>
            
            <form id="employee-form" style="display: flex; gap: 10px; margin-top: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <input type="hidden" id="emp-id">
                <input type="text" id="emp-nip" placeholder="NIP" required style="padding: 8px;">
                <input type="text" id="emp-name" placeholder="Nama Lengkap" required style="padding: 8px;">
                <input type="text" id="emp-position" placeholder="Jabatan" required style="padding: 8px;">
                <input type="text" id="emp-dept" placeholder="Departemen" required style="padding: 8px;">
                <button type="submit" class="btn-primary" style="margin: 0;">Simpan</button>
                <button type="button" onclick="resetForm()" style="padding: 8px;">Batal</button>
            </form>

            <table width="100%" style="border-collapse: collapse; text-align: left;">
                <!-- thead dan tbody sama seperti sebelumnya -->
                <thead>
                    <tr style="background: #2c3e50; color: white; border-bottom: 2px solid #ddd;">
                        <th style="padding: 10px;">NIP</th>
                        <th style="padding: 10px;">Nama</th>
                        <th style="padding: 10px;">Jabatan</th>
                        <th style="padding: 10px;">Departemen</th>
                        <th style="padding: 10px;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="employee-table-body">
                    <tr><td colspan="5" style="padding: 10px;">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    loadEmployees();

    document.getElementById('employee-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveEmployee();
    });
}

async function downloadExcel() {
    const user = JSON.parse(localStorage.getItem('hris_user'));

    try {
        const response = await fetch('/api/reports/employees/excel', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + user.token // Sisipkan token untuk unduhan
            }
        });

        if (handleUnauthorized(response)) return;

        if (response.ok) {
            const blob = await response.blob();
            // Buat URL sementara untuk file Blob
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'laporan_data_karyawan_secured.xlsx'; // Nama file
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } else {
            alert("Gagal mengunduh laporan Excel.");
        }
    } catch (error) {
        console.error("Error downloading file:", error);
    }
}

function getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem('hris_user'));
    return {
        'Content-Type': 'application/json',
        'Authorization': user && user.token ? 'Bearer ' + user.token : ''
    };
}

function handleUnauthorized(response) {
    if (response.status === 401) {
        alert("Sesi Anda telah habis atau tidak valid. Silakan login kembali.");
        localStorage.removeItem('hris_user');
        window.location.href = '/index.html';
        return true;
    }
    return false;
}