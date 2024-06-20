document.addEventListener('DOMContentLoaded', (event) => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login();
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            register();
        });
    }
});

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('https://c241pr574backend-xd67kjleiq-et.a.run.app/auth/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Invalid login');
        }
    })
    .then(data => {
        sessionStorage.setItem('loggedIn', 'true');
        window.location.href = 'main.html';
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Invalid email / password');
    });
}

function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    fetch('https://c241pr574backend-xd67kjleiq-et.a.run.app/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Registrasi gagal');
        }
    })
    .then(data => {
        alert('Registrasi berhasil, silahkan login.');
        window.location.href = 'login.html';
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('gagal untuk registrasi');
    });
}