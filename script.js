// --- Page-based navigation system -------------------------------------------
let currentPage = 1;
let totalPages = 14;
let isAnimating = false;

function initPageDots() {
    const dotsContainer = document.getElementById('page-dots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('span');
        dot.className = 'page-dot';
        if (i === currentPage) dot.classList.add('active');
        dot.dataset.page = i;
        dot.addEventListener('click', () => goToPage(i));
        dotsContainer.appendChild(dot);
    }
}

function updatePageIndicator() {
    document.querySelectorAll('.page-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx + 1 === currentPage);
    });
}

function goToPage(pageNum, direction = null) {
    if (pageNum === currentPage || isAnimating || pageNum < 1 || pageNum > totalPages) return;
    
    isAnimating = true;
    const pages = document.querySelectorAll('.page');
    const oldPage = pages[currentPage - 1];
    const newPage = pages[pageNum - 1];
    
    // Determine animation direction
    const goingForward = direction === 'next' || (direction === null && pageNum > currentPage);
    
    // Apply exit animation to old page
    oldPage.classList.remove('active');
    oldPage.classList.add(goingForward ? 'exiting-left' : 'exiting-right');
    
    // Apply enter animation to new page
    newPage.style.transform = goingForward ? 'translateX(100%)' : 'translateX(-100%)';
    newPage.classList.add('active');
    
    // Trigger animation
    requestAnimationFrame(() => {
        newPage.style.transform = 'translateX(0)';
    });
    
    currentPage = pageNum;
    updatePageIndicator();
    updateNavButtons();
    
    // Clean up after animation
    setTimeout(() => {
        oldPage.classList.remove('exiting-left', 'exiting-right');
        isAnimating = false;
    }, 450);
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// Navigation buttons
document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) goToPage(currentPage - 1, 'prev');
});

document.getElementById('next-page')?.addEventListener('click', () => {
    if (currentPage < totalPages) goToPage(currentPage + 1, 'next');
});

// Brand link goes to page 1
document.querySelector('.brand')?.addEventListener('click', (e) => {
    e.preventDefault();
    goToPage(1);
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

// Keyboard navigation
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentPage < totalPages && !isAnimating) {
        goToPage(currentPage + 1, 'next');
    }
    if (e.key === 'ArrowLeft' && currentPage > 1 && !isAnimating) {
        goToPage(currentPage - 1, 'prev');
    }
    // ESC for fullscreen exit
    if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen && document.exitFullscreen();
        document.querySelectorAll('.fallback-fullscreen').forEach(el => el.classList.remove('fallback-fullscreen'));
        const eb = document.getElementById('pdf-exit-fullscreen'); 
        if (eb) { eb.setAttribute('aria-hidden', 'true'); eb.style.display = 'none'; }
    }
});

// Swipe navigation
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 60 || isAnimating) return;
    if (dx < 0 && currentPage < totalPages) goToPage(currentPage + 1, 'next');
    if (dx > 0 && currentPage > 1) goToPage(currentPage - 1, 'prev');
});

// Initialize on load
window.addEventListener('load', () => {
    initPageDots();
    goToPage(1);
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

console.log('Page navigation ready: Use arrows, swipe, dots, or buttons to navigate.');
