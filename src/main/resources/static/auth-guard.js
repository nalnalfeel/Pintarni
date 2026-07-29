const userJson = localStorage.getItem('hris_user');

if (!userJson) {
    window.location.href = '/index.html';
}