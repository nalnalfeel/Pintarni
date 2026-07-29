// Karena frontend dan backend di server yang sama, kita pakai URL relatif
const API_URL = '/api/auth/login';

// Cek apakah user sudah login, jika ya langsung lempar ke dashboard
if (localStorage.getItem('hris_user')) {
    window.location.href = '/index.html#/dashboard';
}

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    errorMsg.textContent = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const user = await response.json();
            // Simpan data user ke Local Storage browser
            localStorage.setItem('hris_user', JSON.stringify(user));
            // Arahkan ke halaman dashboard
            window.location.href = '/dashboard.html';
        } else {
            const text = await response.text();
            errorMsg.textContent = text;
        }
    } catch (error) {
        console.error(error);
        errorMsg.textContent = 'Server sedang tidak dapat dijangkau.';
    }
});