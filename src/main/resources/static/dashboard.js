// Ambil data user dari local storage
const userJson = localStorage.getItem('hris_user');
if (userJson) {
    const user = JSON.parse(userJson);
    document.getElementById('user-name').textContent = user.fullName;
    document.getElementById('user-role').textContent = user.role;
}

// Logic Logout
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('hris_user'); // Hapus session
    window.location.href = '/index.html'; // Kembali ke login
});