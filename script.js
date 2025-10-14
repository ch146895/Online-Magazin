// --- Navigation smooth scroll ------------------------------------------------
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
const brandLink = document.querySelector('.brand');
const sections = Array.from(document.querySelectorAll('main section'));

function setActiveNav(id) {
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
}

function showSection(id, push = true) {
    sections.forEach(s => s.classList.toggle('active', s.id === id));
    setActiveNav(id);
    if (brandLink) brandLink.classList.toggle('active', id === 'home');
    if (push) history.replaceState(null, '', `#${id}`);
}

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href') || '#home';
        const id = href.replace('#', '');
        e.preventDefault();
        showSection(id);
    });
});
if (brandLink) brandLink.addEventListener('click', (e) => { e.preventDefault(); showSection('home'); });

// --- Reveal / animations ---------------------------------------------------
function revealSections() {
    const sections = document.querySelectorAll('main section');
    const triggerBottom = window.innerHeight * 0.85;
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < triggerBottom) section.classList.add('visible');
        else section.classList.remove('visible');
    });
}
window.addEventListener('scroll', revealSections);

// On load, show the section from hash or default to 'magazin'
window.addEventListener('load', () => {
    const hash = (location.hash || '#magazin').replace('#', '');
    const valid = sections.find(s => s.id === hash) ? hash : 'magazin';
    showSection(valid, false);
    revealSections();
});

// --- Header parallax / subtle change --------------------------------------
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (!header) return;
    const sc = Math.min(window.scrollY / 300, 1);
    header.style.opacity = `${1 - sc * 0.18}`;
});

// --- Simple local-friendly PDF embed handling ------------------------------
const pdfUpload = document.getElementById('pdf-upload');
const pdfEmbed = document.getElementById('pdf-embed');
if (pdfUpload && pdfEmbed) {
    pdfUpload.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        pdfEmbed.src = url;
        // Try to open fullscreen on the embed wrapper
        const wrap = document.querySelector('.magazin-embed-wrap') || pdfEmbed.parentElement;
        // Small timeout to allow embed to update
        setTimeout(async () => {
            // Prefer browser Fullscreen API
            try {
                if (wrap.requestFullscreen) await wrap.requestFullscreen();
                else if (wrap.webkitRequestFullscreen) await wrap.webkitRequestFullscreen();
                // show exit button for non-supported or as extra
                const exitBtn = document.getElementById('pdf-exit-fullscreen');
                if (exitBtn) { exitBtn.setAttribute('aria-hidden', 'false'); exitBtn.style.display = 'inline-block'; }
            } catch (err) {
                // fallback: add a full-screen class to the wrap
                wrap.classList.add('fallback-fullscreen');
                const exitBtn = document.getElementById('pdf-exit-fullscreen');
                if (exitBtn) { exitBtn.setAttribute('aria-hidden', 'false'); exitBtn.style.display = 'inline-block'; }
            }
        }, 120);
    });
}

// Exit fullscreen handlers
const exitBtn = document.getElementById('pdf-exit-fullscreen');
if (exitBtn) {
    exitBtn.style.display = 'none';
    exitBtn.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        } catch (err) {
            // noop
        }
        // remove fallback class
        document.querySelectorAll('.fallback-fullscreen').forEach(el => el.classList.remove('fallback-fullscreen'));
        exitBtn.setAttribute('aria-hidden', 'true');
        exitBtn.style.display = 'none';
    });
}

// Close fullscreen on ESC (safety)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen && document.exitFullscreen();
        document.querySelectorAll('.fallback-fullscreen').forEach(el => el.classList.remove('fallback-fullscreen'));
        const eb = document.getElementById('pdf-exit-fullscreen'); if (eb) { eb.setAttribute('aria-hidden', 'true'); eb.style.display = 'none'; }
    }
});

// --- Keyboard left/right for prev/next sections ----------------------------
window.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const visibleIndex = sections.findIndex(s => s.style.display !== 'none');
    if (visibleIndex === -1) return;
    if (e.key === 'ArrowRight' && visibleIndex < sections.length - 1) showSection(sections[visibleIndex + 1].id);
    if (e.key === 'ArrowLeft' && visibleIndex > 0) showSection(sections[visibleIndex - 1].id);
});

// --- Swipe to change sections (touch devices) -----------------------------
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 60) return;
    const visibleIndex = sections.findIndex(s => s.style.display !== 'none');
    if (dx < 0 && visibleIndex < sections.length - 1) showSection(sections[visibleIndex + 1].id);
    if (dx > 0 && visibleIndex > 0) showSection(sections[visibleIndex - 1].id);
});

// --- Audio uploads ---------------------------------------------------------
function bindAudioUpload(inputId, playerId) {
    const input = document.getElementById(inputId);
    const player = document.getElementById(playerId);
    if (!input || !player) return;
    input.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        player.src = url;
        player.load();
    });
}
bindAudioUpload('song1-upload', 'player1');
bindAudioUpload('song2-upload', 'player2');

// Keep console-friendly messages
console.log('Script geladen: Navigation, PDF-Viewer und Audio-Uploads aktiv.');
