// Navigation smooth scroll
const links = document.querySelectorAll('.navbar a');
links.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Highlight active section in navbar
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('main section');
    let scrollPos = window.scrollY + 100;
    sections.forEach(section => {
        const id = section.getAttribute('id');
        const navLink = document.querySelector(`.navbar a[href="#${id}"]`);
        if (navLink) {
            if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
});

// Animation: Slide-up sections when in viewport
function revealSections() {
    const sections = document.querySelectorAll('main section');
    const triggerBottom = window.innerHeight * 0.85;
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < triggerBottom) {
            section.classList.add('visible');
        } else {
            section.classList.remove('visible');
        }
    });
}
window.addEventListener('scroll', revealSections);
window.addEventListener('load', revealSections);

// Animation: Header background changes on scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 80) {
        header.style.background = 'linear-gradient(90deg, #a1c4fd 0%, #fbc2eb 100%)';
    } else {
        header.style.background = 'linear-gradient(90deg, #fbc2eb 0%, #a1c4fd 100%)';
    }
});
