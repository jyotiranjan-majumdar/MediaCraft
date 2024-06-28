let mediaRecorder;
let audioChunks = [];
let timerInterval;
let startTime;
let audioStream;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const playBtn = document.getElementById('playBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const timerElement = document.getElementById('timer');
const audioPlayback = document.getElementById('audioPlayback');

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
playBtn.addEventListener('click', playRecording);
downloadBtn.addEventListener('click', downloadRecording);
resetBtn.addEventListener('click', resetEverything);

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioStream = stream;
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
            };

            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline';
            timerElement.style.display = 'block';
            startTimer();
        });
}

function stopRecording() {
    mediaRecorder.stop();
    stopTimer();
    audioStream.getTracks().forEach(track => track.stop()); // Stop the microphone

    stopBtn.style.display = 'none';
    playBtn.style.display = 'inline';
    downloadBtn.style.display = 'inline';
    resetBtn.style.display = 'inline';
}

function playRecording() {
    audioPlayback.play();
}

function downloadRecording() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'recording.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function resetEverything() {
    audioChunks = [];
    timerElement.textContent = '00:00:00';
    timerElement.style.display = 'none';

    startBtn.style.display = 'inline';
    stopBtn.style.display = 'none';
    playBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    audioPlayback.style.display = 'none';
    audioPlayback.src = '';
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        timerElement.textContent = formatTime(elapsedTime);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
