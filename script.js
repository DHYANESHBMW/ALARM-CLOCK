// DOM Elements
const clockDisplay = document.getElementById('clock-display');

// Alarm Elements
const alarmHourInput = document.getElementById('alarm-hour');
const alarmMinuteInput = document.getElementById('alarm-minute');
const alarmSecondInput = document.getElementById('alarm-second');
const alarmAmpmSelect = document.getElementById('alarm-ampm');
const setAlarmBtn = document.getElementById('set-alarm-btn');
const alarmList = document.getElementById('alarm-list');
const alarmSound = document.getElementById('alarm-sound'); // Audio element

// Stopwatch Elements
const stopwatchDisplay = document.getElementById('stopwatch-display');
const startStopwatchBtn = document.getElementById('start-stopwatch-btn');
const stopStopwatchBtn = document.getElementById('stop-stopwatch-btn');
const resetStopwatchBtn = document.getElementById('reset-stopwatch-btn');

// Timer Elements
const timerSecondsInput = document.getElementById('timer-seconds-input');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');

// Alarm Modal Elements
const alarmModal = document.getElementById('alarm-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalOkButton = document.getElementById('modal-ok-button');
const closeButton = document.querySelector('.close-button');

// Global states
let alarms = [];
let stopwatchSeconds = 0;
let stopwatchRunning = false;
let timerSeconds = 0;
let timerRunning = false;
let stopwatchInterval; // To store setInterval ID for stopwatch
let timerInterval;     // To store setInterval ID for timer

// --- Clock Functionality ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    clockDisplay.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call to display time immediately

// The fullscreen button logic has been removed from script.js 
// as it's now a direct link in alarm.html.

// --- Alarm Functionality ---
function setAlarm() {
    let hour = parseInt(alarmHourInput.value);
    let minute = parseInt(alarmMinuteInput.value);
    let second = parseInt(alarmSecondInput.value);
    const ampm = alarmAmpmSelect.value;

    // Input validation
    if (isNaN(hour) || isNaN(minute) || isNaN(second) || hour < 1 || hour > 12 || minute < 0 || minute > 59 || second < 0 || second > 59) {
        showNotification("Input Error", "Please enter valid alarm time (HH:MM:SS).");
        return;
    }

    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    const formattedSecond = String(second).padStart(2, '0');
    const alarmTime = `${formattedHour}:${formattedMinute}:${formattedSecond} ${ampm}`;

    if (!alarms.includes(alarmTime)) {
        alarms.push(alarmTime);
        renderAlarms(); // Update the displayed list
        // Removed the "Alarm Set!" notification here as previously discussed.
    } else {
        showNotification("Alarm Exists", "This alarm is already set!");
    }

    // Clear input fields
    alarmHourInput.value = '';
    alarmMinuteInput.value = '';
    alarmSecondInput.value = '';
    alarmAmpmSelect.value = 'AM';
}

function renderAlarms() {
    alarmList.innerHTML = ''; // Clear current list
    alarms.forEach(alarm => {
        const listItem = document.createElement('li');
        listItem.textContent = alarm;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-alarm');
        deleteButton.addEventListener('click', () => deleteAlarm(alarm));
        listItem.appendChild(deleteButton);
        alarmList.appendChild(listItem);
    });
}

function deleteAlarm(alarmToDelete) {
    alarms = alarms.filter(alarm => alarm !== alarmToDelete);
    renderAlarms();
}

function checkAlarms() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    const currentTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

    if (alarms.includes(currentTime)) {
        alarmSound.play();
        showNotification("Alarm!", `⏰ Alarm for ${currentTime}!`);
        // Remove the triggered alarm
        alarms = alarms.filter(alarm => alarm !== currentTime);
        renderAlarms(); // Update the list display
    }
}

// Check alarms every second
setInterval(checkAlarms, 1000);
setAlarmBtn.addEventListener('click', setAlarm);


// --- Stopwatch Functionality ---
function updateStopwatchDisplay() {
    const minutes = Math.floor(stopwatchSeconds / 60);
    const seconds = stopwatchSeconds % 60;
    stopwatchDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startStopwatch() {
    if (!stopwatchRunning) {
        stopwatchRunning = true;
        stopwatchInterval = setInterval(() => {
            stopwatchSeconds++;
            updateStopwatchDisplay();
        }, 1000);
    }
}

function stopStopwatch() {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval); // Stop the interval
}

function resetStopwatch() {
    stopStopwatch(); // Ensure it's stopped first
    stopwatchSeconds = 0;
    updateStopwatchDisplay();
}

startStopwatchBtn.addEventListener('click', startStopwatch);
stopStopwatchBtn.addEventListener('click', stopStopwatch);
resetStopwatchBtn.addEventListener('click', resetStopwatch);

// --- Timer Functionality ---
function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function countdown() {
    if (timerRunning && timerSeconds >= 0) {
        updateTimerDisplay();
        timerSeconds--;
        if (timerSeconds < 0) {
            stopTimer(); // Stop the timer when it reaches 0
            alarmSound.play();
            showNotification("Timer Done!", "⏳ Time's up!");
        }
    } else if (timerSeconds < 0) {
        stopTimer(); // Ensure it's stopped
    }
}

function startTimer() {
    const inputSeconds = parseInt(timerSecondsInput.value);
    if (isNaN(inputSeconds) || inputSeconds <= 0) {
        showNotification("Input Error", "Please enter a valid positive number for seconds.");
        return;
    }
    if (!timerRunning) {
        timerSeconds = inputSeconds;
        timerRunning = true;
        updateTimerDisplay(); // Display initial time
        timerInterval = setInterval(countdown, 1000); // Start countdown
    }
}

function stopTimer() {
    timerRunning = false;
    clearInterval(timerInterval); // Stop the interval
}

function resetTimer() {
    stopTimer(); // Ensure it's stopped first
    timerSeconds = 0;
    timerSecondsInput.value = ''; // Clear input field
    updateTimerDisplay();
}

startTimerBtn.addEventListener('click', startTimer);
stopTimerBtn.addEventListener('click', stopTimer);
resetTimerBtn.addEventListener('click', resetTimer);


// --- Custom Notification Functions ---
function showNotification(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    alarmModal.style.display = 'flex'; 
}

function hideNotification() {
    alarmModal.style.display = 'none'; 
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

// Add event listeners for the close and OK buttons on the modal
closeButton.addEventListener('click', hideNotification);
modalOkButton.addEventListener('click', hideNotification);

// Optional: Hide notification if user clicks outside the modal content
window.addEventListener('click', (event) => {
    if (event.target == alarmModal) {
        hideNotification();
    }
});