// --- timerWidget.js ---
import { formatTime } from '../machining/machiningService.js';
import { syncServerTime, getSyncedNow } from '../timeService.js';
import { backendBase } from '../base.js';
import { authedFetch } from '../authService.js';
import { state as adminState } from '../admin/admin.js';

/* <button class="timer-widget-stop" onclick="window.timerWidget.stopTimer(${timer.id})">
    Durdur
</button> */ //STOP BUTTON FOR FUTURE USE


export class TimerWidget {
    constructor() {
        this.isVisible = true; // Start visible
        this.activeTimers = [];
        this.updateInterval = null;
        this.lastSyncTime = 0;
        this.init();
    }

    async init() {
        // Ensure time is synchronized when widget initializes
        await this.loadActiveTimers();
        if (this.activeTimers.length === 0) {
            return;
        }    
        await this.ensureTimeSync();
        this.createWidget();
        this.renderTimers();
        this.startUpdateInterval();
        this.startAdminStopPolling();
    }

    async ensureTimeSync() {
        // Sync time if it hasn't been synced recently (within last 5 minutes)
        const now = Date.now();
        if (now - this.lastSyncTime > 5 * 60 * 1000) {
            try {
                await syncServerTime();
                this.lastSyncTime = now;
            } catch (error) {
                console.warn('Failed to sync time for timer widget:', error);
            }
        }
    }

    createWidget() {
        // Create the main widget container
        const widget = document.createElement('div');
        widget.id = 'timer-widget';
        widget.className = 'timer-widget';
        widget.innerHTML = `
            <div class="timer-widget-header">
                <span class="timer-widget-title">⏱️ Aktif Zamanlayıcılar</span>
                <button class="timer-widget-toggle" id="timer-widget-toggle">−</button>
            </div>
            <div class="timer-widget-content" id="timer-widget-content">
                <div class="timer-widget-loading">Yükleniyor...</div>
            </div>
            <div class="timer-widget-footer">
                <button class="timer-widget-new" id="timer-widget-new">+ Yeni Zamanlayıcı</button>
            </div>
        `;

        document.body.appendChild(widget);

        // Add event listeners
        document.getElementById('timer-widget-toggle').addEventListener('click', () => {
            this.toggleWidget();
        });

        document.getElementById('timer-widget-new').addEventListener('click', () => {
            window.location.href = '/machining';
        });

        // Make widget draggable
        this.makeDraggable(widget);
        
        // Add click outside to minimize functionality
        this.setupClickOutsideToMinimize(widget);
    }

    makeDraggable(widget) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const header = widget.querySelector('.timer-widget-header');

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('timer-widget-toggle')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;

                widget.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    setupClickOutsideToMinimize(widget) {
        document.addEventListener('click', (e) => {
            // Only minimize if widget is currently visible and click is outside the widget
            if (this.isVisible && !widget.contains(e.target)) {
                this.toggleWidget();
            }
        });
    }

    async loadActiveTimers() {
        try {
            const response = await authedFetch(`${backendBase}/machining/timers?is_active=true`);
            if (response.ok) {
                this.activeTimers = await response.json();
                return true;
            }
        } catch (error) {
            console.error('Error loading active timers:', error);
            return false;
        }
    }

    renderTimers() {
        const content = document.getElementById('timer-widget-content');
        
        if (this.activeTimers.length === 0) {
            content.innerHTML = `
                <div class="timer-widget-empty">
                    <div class="timer-widget-empty-icon">⏰</div>
                    <div class="timer-widget-empty-text">Aktif zamanlayıcı yok</div>
                </div>
            `;
        }

        content.innerHTML = this.activeTimers.map(timer => `
            <div class="timer-widget-item" data-timer-id="${timer.id}">
                <div class="timer-widget-item-header">
                    <span class="timer-widget-issue">${timer.issue_key}</span>
                    <span class="timer-widget-machine">${timer.machine || 'Bilinmeyen'}</span>
                </div>
                <div class="timer-widget-time" id="timer-display-${timer.id}">
                    ${this.formatDuration(timer.start_time)}
                </div>
                <div class="timer-widget-actions">
                    <button class="timer-widget-view" onclick="window.location.href='/machining/tasks/?key=${timer.issue_key}'">
                        Görüntüle
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatDuration(startTime) {
        try {
            const currentTime = getSyncedNow();
            const elapsed = Math.round((currentTime - startTime) / 1000);
            
            // Prevent negative time display
            if (elapsed < 0) {
                console.warn('Negative elapsed time detected, using 0:', elapsed);
                return formatTime(0);
            }
            
            return formatTime(elapsed);
        } catch (error) {
            console.error('Error formatting duration:', error);
            return '00:00:00';
        }
    }

    startUpdateInterval() {
        this.updateInterval = setInterval(async () => {
            try {
                // Periodically ensure time sync (every 30 seconds)
                const now = Date.now();
                if (now - this.lastSyncTime > 30 * 1000) {
                    await this.ensureTimeSync();
                }
                
                this.activeTimers.forEach(timer => {
                    const displayElement = document.getElementById(`timer-display-${timer.id}`);
                    if (displayElement) {
                        displayElement.textContent = this.formatDuration(timer.start_time);
                    }
                });
            } catch (error) {
                console.error('Error in timer update interval:', error);
            }
        }, 1000);
    }

    async stopTimer(timerId) {
        try {
            // Ensure time sync before stopping timer
            await this.ensureTimeSync();
            
            const response = await authedFetch(`${backendBase}/machining/timers/stop/`, {
                method: 'POST',
                body: JSON.stringify({
                    timer_id: timerId,
                    finish_time: getSyncedNow(),
                    synced_to_jira: false
                })
            });

            if (response.ok) {
                // Remove timer from local list
                this.activeTimers = this.activeTimers.filter(t => t.id !== timerId);
                this.renderTimers();
            }
        } catch (error) {
            console.error('Error stopping timer:', error);
            alert('Zamanlayıcı durdurulurken hata oluştu.');
        }
    }

    toggleWidget() {
        const content = document.getElementById('timer-widget-content');
        const footer = document.querySelector('.timer-widget-footer');
        const toggle = document.getElementById('timer-widget-toggle');
        
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            content.style.display = 'block';
            footer.style.display = 'block';
            toggle.textContent = '−';
        } else {
            content.style.display = 'none';
            footer.style.display = 'none';
            toggle.textContent = '+';
        }
    }

    minimizeWidget() {
        const content = document.getElementById('timer-widget-content');
        const footer = document.querySelector('.timer-widget-footer');
        const toggle = document.getElementById('timer-widget-toggle');
        
        this.isVisible = false;
        
        content.style.display = 'none';
        footer.style.display = 'none';
        toggle.textContent = '+';
    }

    destroy() {
        clearInterval(this.updateInterval);
        const widget = document.getElementById('timer-widget');
        if (widget) {
            document.body.removeChild(widget);
        }
        // Remove the global instance if it exists
        if (window.timerWidget === this) {
            window.timerWidget = null;
        }
    }

    startAdminStopPolling() {
        setInterval(async () => {
            try {
                const response = await authedFetch(`${backendBase}/machining/timers?is_active=true`);
                if (response.ok) {
                    const latestTimers = await response.json();
                    // Check for any timer in this.activeTimers that is missing or finished in latestTimers
                    for (const timer of this.activeTimers) {
                        const latest = latestTimers.find(t => t.id === timer.id);
                        if (!latest || latest.finish_time) {
                            let name = 'yönetici';
                            if (latest && (latest.stopped_by_first_name || latest.stopped_by_last_name)) {
                                name = `${latest.stopped_by_first_name || ''} ${latest.stopped_by_last_name || ''}`.trim();
                            }
                            if (window.confirm(`Zamanlayıcı ${name} tarafından durduruldu. Sayfa yenilensin mi?`)) {
                                window.location.reload();
                                break;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error polling user timers:', error);
            }
        }, 5000);
    }
}
 