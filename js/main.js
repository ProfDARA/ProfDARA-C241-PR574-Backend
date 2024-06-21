document.addEventListener('DOMContentLoaded', (event) => {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }

    // Navigation
    setupNavigation();
});

function isLoggedIn() {

    return sessionStorage.getItem('loggedIn') === 'true';
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.target.getAttribute('href');
            window.location.href = targetPage;
        });
    });
}