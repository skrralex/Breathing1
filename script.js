const circle = document.querySelector('.circle');
const guideText = document.getElementById('guideText');
const counter = document.getElementById('cycleCounter');
const toggleButton = document.getElementById('toggleButton');

const inhaleTime = 4000;
const holdTime = 2000;
const exhaleTime = 4000;

let cycleCount = 0;
let breathing = false;
let timeoutChain = [];
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) {
    console.error('WakeLock error:', err);
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

function startBreathing() {
  requestWakeLock();
  breathing = true;
  toggleButton.textContent = 'Stop';
  cycleCount = 0;
  counter.textContent = `Cycle: 0`;
  guideText.textContent = 'Inhale';
  doBreathingCycle();
}

function stopBreathing() {
  breathing = false;
  toggleButton.textContent = 'Start';
  guideText.textContent = 'Ready?';
  circle.style.width = '30vmin';
  circle.style.height = '30vmin';
  timeoutChain.forEach(clearTimeout);
  timeoutChain = [];
  releaseWakeLock();

  // Exit fullscreen if active
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11
    elem.msRequestFullscreen();
  }
}

function doBreathingCycle() {
  if (!breathing) return;

  guideText.textContent = 'Inhale';
  circle.style.width = '60vmin';
  circle.style.height = '60vmin';
  vibrate(200); // Long vibration at start of inhale

  timeoutChain.push(setTimeout(() => {
    guideText.textContent = 'Hold';

    // Short pulses every 1s during hold (e.g., 2 seconds = 2 pulses)
    const holdPulses = Math.floor(holdTime / 1000) +1;
    for (let i = 0; i < holdPulses; i++) {
      timeoutChain.push(setTimeout(() => {
        vibrate(50);
      }, i * 1000));
    }

    timeoutChain.push(setTimeout(() => {
      guideText.textContent = 'Exhale';
      circle.style.width = '30vmin';
      circle.style.height = '30vmin';
      // No vibration during exhale

      timeoutChain.push(setTimeout(() => {
        cycleCount++;
        counter.textContent = `Cycle: ${cycleCount}`;
        doBreathingCycle(); // Loop again
      }, exhaleTime));

    }, holdTime));

  }, inhaleTime));
}

toggleButton.addEventListener('click', () => {
  if (breathing) {
    stopBreathing();
  } else {
    enterFullscreen();  // Fullscreen
    startBreathing();
  }
});