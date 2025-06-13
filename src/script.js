const timerDisplay = document.getElementById('timer');
const milestoneSound = document.getElementById('milestoneSound');

let totalSeconds = 90 * 60; // 90 minutes
let milestoneSeconds = [80, 70, 60, 50, 45, 40, 35, 30, 20, 10].map(x => x * 60);
let currentSeconds = totalSeconds;
let timerInterval = null;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(currentSeconds);
}

function setTimerCookie(seconds) {
    document.cookie = `alice_timer=${seconds}; path=/; max-age=604800`;
}

function getTimerCookie() {
    const match = document.cookie.match(/(?:^|; )alice_timer=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

function setSoundEnabledCookie(enabled) {
    document.cookie = `alice_sound=${enabled ? '1' : '0'}; path=/; max-age=604800`;
}

function getSoundEnabledCookie() {
    const match = document.cookie.match(/(?:^|; )alice_sound=([01])/);
    return match ? match[1] === '1' : true; // Default to true if no cookie
}

function setBackgroundBlur(blur) {
    const bg = document.querySelector('.background');
    if (blur) {
        bg.classList.add('blurred');
    } else {
        bg.classList.remove('blurred');
    }
}

// On load, check for cookie
const savedSeconds = getTimerCookie();
if (savedSeconds !== null && savedSeconds <= totalSeconds && savedSeconds >= 0) {
    currentSeconds = savedSeconds;
    startTimer();
}
updateTimerDisplay();

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (currentSeconds > 0) {
            currentSeconds--;
            updateTimerDisplay();
            setTimerCookie(currentSeconds);
            if (milestoneSeconds.includes(currentSeconds) && getSoundEnabledCookie()) {
                milestoneSound.play();
            }
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            setTimerCookie(0);
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    currentSeconds = totalSeconds;
    setTimerCookie(currentSeconds);
    updateTimerDisplay();
}

timerDisplay.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        setBackgroundBlur(true);
    } else {
        startTimer();
        setBackgroundBlur(false);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            setBackgroundBlur(true);
        } else {
            startTimer();
            setBackgroundBlur(false);
        }
        return;
    }
    if (e.code === 'Escape') {
        const modal = document.getElementById('timerModal');
        if (modal && modal.style.display === 'flex') {
            hideTimerModal();
        } else {
            showTimerModal();
        }
        return;
    }
});

// On load, set blur state based on timer
setBackgroundBlur(!timerInterval);

updateTimerDisplay();

function showTimerModal() {
    document.getElementById('timerModal').style.display = 'flex';
    setBackgroundBlur(true);
    document.body.classList.add('modal-open');
    document.getElementById('timerInput').focus();
}

function hideTimerModal() {
    const modal = document.getElementById('timerModal');
    if (modal) modal.style.display = 'none';
    setBackgroundBlur(!!timerInterval ? false : true);
    document.body.classList.remove('modal-open');
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('timerModal');
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('timerForm');
    const input = document.getElementById('timerInput');
    const resetBtn = document.getElementById('resetTimerBtn');
    const soundCheckbox = document.getElementById('soundEnabled');

    // Initialize sound checkbox from cookie
    soundCheckbox.checked = getSoundEnabledCookie();

    // Save sound preference when changed
    soundCheckbox.addEventListener('change', () => {
        setSoundEnabledCookie(soundCheckbox.checked);
    });

    overlay.onclick = hideTimerModal;
    closeBtn.onclick = hideTimerModal;
    form.onsubmit = function(e) {
        e.preventDefault();
        let mins = parseInt(input.value, 10);
        if (!isNaN(mins) && mins >= 0 && mins <= 999) {
            currentSeconds = mins * 60;
            setTimerCookie(currentSeconds);
            updateTimerDisplay();
            hideTimerModal();
        }
    };
    resetBtn.onclick = function() {
        currentSeconds = totalSeconds;
        setTimerCookie(currentSeconds);
        updateTimerDisplay();
        hideTimerModal();
    };
});
