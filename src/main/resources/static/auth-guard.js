const userJson = localStorage.getItem('hris_user');

if (!userJson) {
    // Jika belum login, arahkan ke halaman login (BUKAN ke index.html)
    window.location.href = '/login.html';
}