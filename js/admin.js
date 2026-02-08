function isStudentDependentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const studentDependentPages = [
        'Academic Records.html',
        'Student Profile Info Update.html',
        'Student Status Tracking.html',
        'Student Profile ID.html',
        'Student List.html'
    ];
    return studentDependentPages.includes(currentPage);
}

function requiresRegistration() {
    return window.StudentDB && window.StudentDB.requiresRegistration();
}

function redirectToRegistration() {
    if (window.location.pathname.split('/').pop() !== 'Student Profile Reg.html') {
        window.location.href = 'Student Profile Reg.html';
    }
}

function checkPageAccess() {
    // Wait for StudentDB to be available
    if (typeof window.StudentDB === 'undefined') {
        setTimeout(checkPageAccess, 100);
        return;
    }

    if (isStudentDependentPage() && requiresRegistration()) {
        redirectToRegistration();
        return false;
    }
    return true;
}

function createRegistrationPopup() {
    if (document.getElementById('registration-popup')) return;

    const popupHTML = `
        <div id="registration-popup" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            padding: 30px;
            z-index: 10000;
            min-width: 350px;
            text-align: center;
            border: 2px solid #ef4444;
            display: none;
        ">
            <div style="
                width: 60px;
                height: 60px;
                background: #fef2f2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                border: 2px solid #fecaca;
            ">
                <i class="fa-solid fa-user-plus" style="font-size: 24px; color: #ef4444;"></i>
            </div>
            <h3 style="
                margin: 0 0 10px;
                color: #1f2937;
                font-size: 1.2rem;
                font-weight: 600;
            ">Registration Required</h3>
            <p style="
                margin: 0 0 20px;
                color: #6b7280;
                line-height: 1.5;
            ">Please register a student first before accessing this feature.</p>
            <div style="
                background: #f3f4f6;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 0.8rem;
                color: #6b7280;
                margin-bottom: 20px;
            ">
                <span id="popup-countdown">Closing in: 3.00s</span>
            </div>
        </div>
        <div id="registration-popup-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: none;
        " onclick="hideRegistrationPopup()"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translate(-50%, -50%) translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translate(-50%, -50%) translateX(5px); }
        }
        .shake-animation {
            animation: shake 0.6s ease-in-out;
        }
    `;
    document.head.appendChild(shakeStyle);
}

function showRegistrationPopup() {
    createRegistrationPopup();

    const popup = document.getElementById('registration-popup');
    const overlay = document.getElementById('registration-popup-overlay');
    const countdown = document.getElementById('popup-countdown');

    if (!popup || !overlay || !countdown) return;

    popup.style.display = 'block';
    overlay.style.display = 'block';
    popup.classList.add('shake-animation');

    // Remove shake animation after it completes
    setTimeout(() => {
        popup.classList.remove('shake-animation');
    }, 600);

    // Start countdown
    let timeLeft = 3.0;
    const countdownInterval = setInterval(() => {
        timeLeft -= 0.01;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            hideRegistrationPopup();
        } else {
            countdown.textContent = `Closing in: ${timeLeft.toFixed(2)}s`;
        }
    }, 10);

    popup.countdownInterval = countdownInterval;
}

function hideRegistrationPopup() {
    const popup = document.getElementById('registration-popup');
    const overlay = document.getElementById('registration-popup-overlay');

    if (popup && overlay) {
        popup.style.display = 'none';
        overlay.style.display = 'none';

        if (popup.countdownInterval) {
            clearInterval(popup.countdownInterval);
            popup.countdownInterval = null;
        }
    }
}

function goToRegistration() {
    hideRegistrationPopup();
    window.location.href = 'Student Profile Reg.html';
}

function updateNavigationState() {
    if (typeof window.StudentDB === 'undefined') return;

    const hasStudents = !window.StudentDB.isEmpty();
    const menuItems = document.querySelectorAll('.menu-item[href]');

    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        const studentDependentPages = [
            'Academic Records.html',
            'Student Profile Info Update.html',
            'Student Status Tracking.html',
            'Student Profile ID.html',
            'Student List.html'
        ];

        if (href && studentDependentPages.includes(href)) {
            if (hasStudents) {
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
                item.removeAttribute('title');
                item.style.cursor = 'pointer';
                // Remove click handler if it exists
                item.onclick = null;
            } else {
                item.style.opacity = '0.5';
                item.style.pointerEvents = 'auto';
                item.setAttribute('title', 'Register a student first to access this feature');
                item.style.cursor = 'pointer';
                // Add click handler to show popup
                item.onclick = function (e) {
                    e.preventDefault();
                    showRegistrationPopup();
                    return false;
                };
            }
        }
    });

    const adminLinks = document.querySelectorAll('.admin-only[href]');
    adminLinks.forEach(item => {
        const href = item.getAttribute('href');
        if (href === 'Student List.html') {
            if (hasStudents) {
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
                item.removeAttribute('title');
                item.style.cursor = 'pointer';
                item.onclick = null;
            } else {
                item.style.opacity = '0.5';
                item.style.pointerEvents = 'auto'; // Allow clicks to show popup
                item.setAttribute('title', 'Register a student first to access this feature');
                item.style.cursor = 'pointer';
                item.onclick = function (e) {
                    e.preventDefault();
                    showRegistrationPopup();
                    return false;
                };
            }
        }
    });
}

function handleUserAdmin() {
    if (checkAdminStatus()) {
        handleGoBack();
        return;
    }
    const code = prompt("Please enter the Admin Access Code:");

    if (code === null) return;

    if (code === "admin" || code === "admin") {
        sessionStorage.setItem('isAdmin', 'true');
        alert("Access Granted! Welcome, Admin.");
        updateAdminUI(true);
    } else {
        alert("Access Denied: Incorrect Code.");
    }
}

function handleGoBack() {
    sessionStorage.removeItem('isAdmin');
    updateAdminUI(false);
}

function checkAdminStatus() {
    return sessionStorage.getItem('isAdmin') === 'true';
}

function updateAdminUI(isAdmin) {
    const adminLinks = document.querySelectorAll('.admin-only');
    adminLinks.forEach(link => {
        link.style.display = isAdmin ? 'flex' : 'none';
    });

    const adminToggleBtn = document.getElementById('sidebar-admin-toggle');
    if (adminToggleBtn) {
        if (isAdmin) {
            adminToggleBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Go Back';
            adminToggleBtn.onclick = handleGoBack;
            adminToggleBtn.title = 'Exit admin and return to student view';
        } else {
            adminToggleBtn.innerHTML = '<i class="fa-solid fa-users"></i> User Admin';
            adminToggleBtn.onclick = handleUserAdmin;
            adminToggleBtn.title = '';
        }
    }

    const dropdownAdminItems = document.querySelectorAll('.dropdown-item[data-admin-toggle]');
    dropdownAdminItems.forEach(el => {
        if (isAdmin) {
            el.textContent = 'Go Back';
            el.onclick = handleGoBack;
        } else {
            el.textContent = el.dataset.label || 'Support (Admin)';
            el.onclick = handleUserAdmin;
        }
    });

    const adminIndicator = document.getElementById('admin-panel-indicator');
    if (adminIndicator) {
        adminIndicator.style.display = isAdmin ? 'inline' : 'none';
    }
}

function injectSidebarStyles() {
    if (document.getElementById('admin-sidebar-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-sidebar-styles';
    style.textContent = `
        .brand-with-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .brand-text { flex: 1; min-width: 0; }
        .sidebar-toggle, .sidebar-open-btn { background: rgba(255,255,255,0.1); border: none; color: #9ca3af; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .sidebar-toggle:hover, .sidebar-open-btn:hover { background: rgba(255,255,255,0.2); color: white; }
        .sidebar-open-btn { position: fixed; left: 12px; top: 12px; z-index: 1001; display: none; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .sidebar-open-btn.show { display: flex; }
        @media (max-width: 768px) {
            .sidebar-open-btn.sidebar-open { display: none !important; }
        }
        .sidebar { transition: width 0.25s ease, min-width 0.25s ease, transform 0.25s ease; }
        .sidebar.sidebar--collapsed { width: 0 !important; min-width: 0 !important; padding: 0 !important; overflow: hidden !important; }
        .sidebar.sidebar--collapsed .brand-with-actions, .sidebar.sidebar--collapsed .menu-item, .sidebar.sidebar--collapsed .menu-category { opacity: 0; pointer-events: none; }
        @media (max-width: 768px) {
            .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 1000; box-shadow: 4px 0 20px rgba(0,0,0,0.15); }
            .sidebar.sidebar--collapsed { transform: translateX(-100%); width: 260px !important; min-width: 260px !important; }
            .sidebar.sidebar--collapsed .brand-with-actions, .sidebar.sidebar--collapsed .menu-item, .sidebar.sidebar--collapsed .menu-category { opacity: 1; pointer-events: auto; }
            .sidebar-open-btn { display: flex; }
            .sidebar-open-btn.show { display: flex; }
            .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; }
            .sidebar-overlay.show { display: block; }
        }
    `;
    document.head.appendChild(style);
}

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    injectSidebarStyles();

    const brand = sidebar.querySelector('.brand');
    if (brand && !sidebar.querySelector('.brand-icon')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'brand-with-actions';
        const textSpan = document.createElement('div');
        textSpan.className = 'brand-text';
        textSpan.innerHTML = brand.innerHTML;
        const icon = document.createElement('span');
        icon.className = 'brand-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.cssText = 'font-size: 1.25rem; margin-right: 6px; color: var(--card-gold, #fbbf24);';
        icon.innerHTML = '<i class="fa-solid fa-graduation-cap"></i>';
        textSpan.insertBefore(icon, textSpan.firstChild);
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sidebar-toggle';
        toggle.setAttribute('aria-label', 'Close menu');
        toggle.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        toggle.onclick = () => {
            sidebar.classList.add('sidebar--collapsed');
            const openBtn = document.getElementById('sidebar-open-btn');
            const overlay = document.getElementById('sidebar-overlay');
            if (openBtn) {
                openBtn.classList.add('show');
                openBtn.classList.remove('sidebar-open');
            }
            if (overlay) overlay.classList.add('show');
        };
        wrapper.appendChild(textSpan);
        wrapper.appendChild(toggle);
        brand.innerHTML = '';
        brand.appendChild(wrapper);
    }

    let openBtn = document.getElementById('sidebar-open-btn');
    if (!openBtn) {
        openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.id = 'sidebar-open-btn';
        openBtn.className = 'sidebar-open-btn';
        openBtn.setAttribute('aria-label', 'Open menu');
        openBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        openBtn.onclick = () => {
            sidebar.classList.remove('sidebar--collapsed');
            openBtn.classList.remove('show');
            openBtn.classList.add('sidebar-open');
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) overlay.classList.remove('show');
        };
        document.body.appendChild(openBtn);
    }

    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay';
        overlay.onclick = () => {
            sidebar.classList.add('sidebar--collapsed');
            openBtn.classList.remove('show');
            openBtn.classList.remove('sidebar-open');
            overlay.classList.remove('show');
        };
        document.body.appendChild(overlay);
    }

    if (window.matchMedia('(max-width: 768px)').matches) {
        sidebar.classList.add('sidebar--collapsed');
        openBtn.classList.add('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = checkAdminStatus();
    updateAdminUI(isAdmin);
    initSidebar();

    checkPageAccess();
    updateNavigationState();

    const menuBtn = document.getElementById('userAvatarBtn');
    const dropdown = document.getElementById('profileDropdown');

    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }
});

// Security: Disable F12 and Developer Tools shortcuts
document.addEventListener('keydown', (e) => {
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
    ) {
        e.preventDefault();
        console.warn("Developer Tools are disabled on this system.");
    }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());
