const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const cameraSelect = document.getElementById('cameraSelect');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const takePictureButton = document.getElementById('takePictureButton');
const cameraName = document.getElementById('cameraName');
const resolution = document.getElementById('resolution');
const frameRate = document.getElementById('frameRate');

let stream;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        cameraSelect.innerHTML = videoDevices.map((device, index) => `<option value="${device.deviceId}">${device.label || `Camera ${index + 1}`}</option>`).join('');
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

async function requestCameraAccess() {
    try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach(track => track.stop());
        await getCameras();
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

async function startCamera() {
    const selectedDeviceId = cameraSelect.value;
    const constraints = {
        video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
        }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        cameraName.textContent = track.label;
        resolution.textContent = `${settings.width}x${settings.height}`;
        frameRate.textContent = settings.frameRate;

        startButton.disabled = true;
        stopButton.disabled = false;
        takePictureButton.disabled = false;
    } catch (error) {
        console.error('Error starting camera.', error);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    startButton.disabled = false;
    stopButton.disabled = true;
    takePictureButton.disabled = true;
}

function takePicture() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'picture.png';
    link.click();
}

startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);
takePictureButton.addEventListener('click', takePicture);

// Request camera access when the page loads
requestCameraAccess();
