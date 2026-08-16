let medicines = JSON.parse(localStorage.getItem('medicines')) || [];

// ===================== SET TODAY'S DATE =====================
document.getElementById('medDate').value = new Date().toISOString().split('T')[0];

// ===================== ADD MEDICINE =====================
function addMedicine() {
    const name = document.getElementById('medName').value.trim();
    const time = document.getElementById('medTime').value;
    const meal = document.getElementById('medMeal').value;
    const date = document.getElementById('medDate').value;

    if (!name || !time || !date) {
        alert('⚠️ Please fill all required fields!');
        return;
    }

    medicines.push({
        id: Date.now(),
        name: name,
        time: time,
        meal: meal,
        date: date,
        status: 'pending'
    });

    localStorage.setItem('medicines', JSON.stringify(medicines));
    document.getElementById('medName').value = '';
    document.getElementById('medTime').value = '';
    renderAll();
    showNotification('✅ Medicine added successfully!', '#38a169');
}

// ===================== UPDATE STATUS =====================
function updateStatus(id, status) {
    const med = medicines.find(m => m.id === id);
    if (med) {
        med.status = status;
        localStorage.setItem('medicines', JSON.stringify(medicines));
        renderAll();
        if (status === 'taken') {
            playBeep();
            showNotification('✅ Marked as TAKEN!', '#38a169');
        } else {
            showNotification('❌ Marked as MISSED', '#e53e3e');
        }
    }
}

// ===================== DELETE MEDICINE =====================
function deleteMedicine(id) {
    if (confirm('🗑️ Delete this medicine?')) {
        medicines = medicines.filter(m => m.id !== id);
        localStorage.setItem('medicines', JSON.stringify(medicines));
        renderAll();
        showNotification('🗑️ Medicine deleted', '#ed8936');
    }
}

// ===================== RENDER ALL =====================
function renderAll() {
    renderToday();
    renderHistory();
    renderStats();
}

// ===================== RENDER TODAY =====================
function renderToday() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeds = medicines.filter(m => m.date === today);
    const container = document.getElementById('todayList');

    if (todayMeds.length === 0) {
        container.innerHTML = `
                    <div class="empty-msg">
                        <span class="big-icon">🎉</span>
                        No medicines scheduled for today
                    </div>
                `;
        return;
    }

    todayMeds.sort((a, b) => a.time.localeCompare(b.time));

    container.innerHTML = todayMeds.map(m => `
                <div class="med-item">
                    <div class="info">
                        <div class="name">💊 ${m.name}</div>
                        <div class="details">
                            <span>⏰ ${m.time}</span>
                            <span>🍽️ ${m.meal}</span>
                            <span class="status-badge status-${m.status}">${m.status.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="med-actions">
                        ${m.status === 'pending' ? `
                            <button class="btn-sm btn-taken" onclick="updateStatus(${m.id}, 'taken')">✅ Taken</button>
                            <button class="btn-sm btn-missed" onclick="updateStatus(${m.id}, 'missed')">❌ Missed</button>
                        ` : ''}
                        <button class="btn-sm btn-delete" onclick="deleteMedicine(${m.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
}

// ===================== RENDER HISTORY =====================
function renderHistory() {
    const historyMeds = medicines.filter(m => m.status !== 'pending');
    const container = document.getElementById('historyList');

    if (historyMeds.length === 0) {
        container.innerHTML = `
                    <div class="empty-msg">
                        <span class="big-icon">📋</span>
                        No medication history yet
                    </div>
                `;
        return;
    }

    historyMeds.sort((a, b) => b.id - a.id);

    container.innerHTML = historyMeds.map(m => `
                <div class="med-item">
                    <div class="info">
                        <div class="name">💊 ${m.name}</div>
                        <div class="details">
                            <span>⏰ ${m.time}</span>
                            <span>🍽️ ${m.meal}</span>
                            <span>📅 ${m.date}</span>
                            <span class="status-badge status-${m.status}">${m.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            `).join('');
}

// ===================== RENDER STATS =====================
function renderStats() {
    const total = medicines.length;
    const pending = medicines.filter(m => m.status === 'pending').length;
    const taken = medicines.filter(m => m.status === 'taken').length;
    const missed = medicines.filter(m => m.status === 'missed').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statTaken').textContent = taken;
    document.getElementById('statMissed').textContent = missed;
}

// ===================== PLAY BEEP =====================
function playBeep() {
    try {
        const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = 880;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);

        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.frequency.value = 1100;
            osc2.type = 'square';
            gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc2.start(audioCtx.currentTime);
            osc2.stop(audioCtx.currentTime + 0.3);
        }, 500);
    } catch (e) {
        console.log('Beep error:', e);
    }
}

// ===================== SHOW NOTIFICATION =====================
function showNotification(message, color = '#1a6d8a') {
    const existing = document.querySelector('.notification-popup');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'notification-popup';
    div.style.borderLeftColor = color;
    div.innerHTML = `
                <span class="close-btn" onclick="this.parentElement.remove()">×</span>
                <p style="font-size: 15px;">${message}</p>
            `;
    document.body.appendChild(div);

    setTimeout(() => {
        if (div.parentElement) div.remove();
    }, 4000);
}

// ===================== CHECK REMINDERS (ALARM) =====================
function checkReminders() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().split('T')[0];

    const pendingMeds = medicines.filter(m =>
        m.date === today &&
        m.status === 'pending' &&
        m.time === currentTime
    );

    if (pendingMeds.length > 0) {
        playBeep();

        const div = document.createElement('div');
        div.className = 'notification-popup';
        div.style.borderLeftColor = '#e53e3e';
        div.style.maxWidth = '400px';
        div.innerHTML = `
                    <span class="close-btn" onclick="this.parentElement.remove()">×</span>
                    <h3>🔔 MEDICINE REMINDER!</h3>
                    <p><strong>Time:</strong> ${currentTime}</p>
                    <p style="font-size: 16px; margin: 8px 0;">${pendingMeds.map(m => `💊 ${m.name}`).join('<br>')}</p>
                    <hr style="margin: 10px 0; border-color: #e2e8f0;">
                    <p style="font-size: 13px;">Please take your medicine now! 💊</p>
                `;
        document.body.appendChild(div);

        alert(`🔔 REMINDER!\n\nTime: ${currentTime}\n\n${pendingMeds.map(m => `💊 ${m.name} (${m.meal})`).join('\n')}\n\nPlease take your medicine now!`);
    }
}

// ===================== START CHECKING =====================
setInterval(checkReminders, 10000);
setTimeout(checkReminders, 1000);

// ===================== REQUEST NOTIFICATION PERMISSION =====================
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// ===================== LOAD ON PAGE LOAD =====================
renderAll();

// ===================== REFRESH ON TAB VISIBILITY =====================
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        renderAll();
        checkReminders();
    }
});

// ===================== KEYBOARD SHORTCUT: ENTER TO ADD =====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active.tagName === 'INPUT' || active.tagName === 'SELECT') {
            addMedicine();
        }
    }
});