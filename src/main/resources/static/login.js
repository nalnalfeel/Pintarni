const API_URL = '/api/auth/login';

// Cek apakah user sudah login
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
            const data = await response.json();
            localStorage.setItem('hris_user', JSON.stringify({
                token: data.token,
                username: data.username,
                role: data.role,
                fullName: data.username
            }));
            window.location.href = '/index.html#/dashboard';
        } else {
            errorMsg.textContent = 'Username atau password salah!';
        }
    } catch (error) {
        console.error(error);
        errorMsg.textContent = 'Server sedang tidak dapat dijangkau.';
    }
});