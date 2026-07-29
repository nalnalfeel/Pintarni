document.addEventListener('DOMContentLoaded', () => {
    setupUserUI();
    setupRouter();

    // Handle Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('hris_user');
        window.location.href = '/login.html';
    });

    // Trigger route pertama kali
    handleLocation();
});

function setupUserUI() {
    const user = JSON.parse(localStorage.getItem('hris_user'));
    if (user) {
        document.getElementById('user-name').textContent = user.fullName || user.username;
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