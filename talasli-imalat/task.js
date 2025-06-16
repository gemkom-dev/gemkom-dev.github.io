import { machiningService } from './machiningService.js';
import { timeService } from '../timeService.js';

class TaskView {
  constructor() {
    this.taskId = this.getTaskIdFromUrl();
    this.timerDisplay = document.getElementById('timer-display');
    this.startStopButton = document.getElementById('start-stop');
    this.manualLogButton = document.getElementById('manual-log-button');
    this.markDoneButton = document.getElementById('mark-done-button');
    this.stopOnlyButton = document.getElementById('stop-only-button');
    this.backButton = document.getElementById('back-button');
    this.taskTitle = document.getElementById('task-title');
    this.currentUserLabel = document.getElementById('current-user-label');
    this.logoutButton = document.getElementById('logout-button');

    this.timer = null;
    this.startTime = null;
    this.elapsedTime = 0;
    this.isRunning = false;

    this.initializeEventListeners();
    this.loadTaskData();
    this.updateUserInfo();
  }

  getTaskIdFromUrl() {
    const path = window.location.pathname;
    const match = path.match(/\/task-(\d+)$/);
    return match ? match[1] : null;
  }

  async loadTaskData() {
    if (!this.taskId) {
      this.showError('Task ID not found');
      return;
    }

    try {
      const task = await machiningService.getTask(this.taskId);
      if (!task) {
        this.showError('Task not found');
        return;
      }

      this.taskTitle.textContent = task.title || `Task-${this.taskId}`;
      this.updateTimerDisplay(0);
    } catch (error) {
      console.error('Error loading task:', error);
      this.showError('Error loading task data');
    }
  }

  initializeEventListeners() {
    this.startStopButton.addEventListener('click', () => this.toggleTimer());
    this.manualLogButton.addEventListener('click', () => this.showManualLogDialog());
    this.markDoneButton.addEventListener('click', () => this.markTaskAsDone());
    this.stopOnlyButton.addEventListener('click', () => this.stopTimer());
    this.backButton.addEventListener('click', () => this.goBack());
    this.logoutButton.addEventListener('click', () => this.handleLogout());
  }

  toggleTimer() {
    if (this.isRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime;
      this.startStopButton.textContent = 'Durdur';
      this.startStopButton.classList.remove('green');
      this.startStopButton.classList.add('red');
      this.updateTimer();
    }
  }

  stopTimer() {
    if (this.isRunning) {
      this.isRunning = false;
      this.elapsedTime = Date.now() - this.startTime;
      this.startStopButton.textContent = 'Başlat';
      this.startStopButton.classList.remove('red');
      this.startStopButton.classList.add('green');
      clearInterval(this.timer);
    }
  }

  updateTimer() {
    this.timer = setInterval(() => {
      const currentTime = Date.now();
      this.elapsedTime = currentTime - this.startTime;
      this.updateTimerDisplay(this.elapsedTime);
    }, 1000);
  }

  updateTimerDisplay(milliseconds) {
    const formattedTime = timeService.formatTime(milliseconds);
    this.timerDisplay.textContent = formattedTime;
  }

  async showManualLogDialog() {
    const hours = prompt('Süre (saat):', '0');
    if (hours === null) return;

    const minutes = prompt('Süre (dakika):', '0');
    if (minutes === null) return;

    const totalMilliseconds = (parseInt(hours) * 3600 + parseInt(minutes) * 60) * 1000;
    
    try {
      await machiningService.logTime(this.taskId, totalMilliseconds);
      this.updateTimerDisplay(totalMilliseconds);
      alert('Süre başarıyla kaydedildi.');
    } catch (error) {
      console.error('Error logging time:', error);
      alert('Süre kaydedilirken bir hata oluştu.');
    }
  }

  async markTaskAsDone() {
    if (!confirm('Bu görevi tamamlandı olarak işaretlemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await machiningService.markTaskAsDone(this.taskId);
      alert('Görev tamamlandı olarak işaretlendi.');
      this.goBack();
    } catch (error) {
      console.error('Error marking task as done:', error);
      alert('Görev işaretlenirken bir hata oluştu.');
    }
  }

  goBack() {
    window.location.href = '/talasli-imalat/';
  }

  showError(message) {
    this.taskTitle.textContent = message;
    this.taskTitle.style.color = 'var(--accent-color)';
  }

  updateUserInfo() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.currentUserLabel.textContent = `Kullanıcı: ${currentUser}`;
    }
  }

  handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login/';
  }
}

// Initialize the task view
new TaskView(); 