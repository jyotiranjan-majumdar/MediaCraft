document.getElementById('audioInput').addEventListener('change', handleFileSelect, false);
document.getElementById('convertBtn').addEventListener('click', convertToWAV, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && (file.type === 'audio/mp3' || file.type === 'audio/mpeg')) {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = URL.createObjectURL(file);
        audioPlayer.load();
        audioPlayer.play();
    } else {
        alert('Please select an MP3 file.');
    }
}

function convertToWAV() {
    const audioPlayer = document.getElementById('audioPlayer');
    if (!audioPlayer.src) {
        alert('Please select an MP3 file first.');
        return;
    }

    fetch(audioPlayer.src)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            return new Promise((resolve, reject) => {
                const audioContext = new AudioContext();
                audioContext.decodeAudioData(buffer, resolve, reject);
            });
        })
        .then(audioBuffer => {
            const wavBuffer = audioBufferToWav(audioBuffer);
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = url;
            downloadLink.download = 'converted.wav';
            downloadLink.style.display = 'block';
            downloadLink.textContent = 'Download WAV';
        })
        .catch(error => {
            console.error('Error converting MP3 to WAV:', error);
        });
}

function audioBufferToWav(buffer) {
    let numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferIdx = 0,
        wavBuffer = new ArrayBuffer(length),
        view = new DataView(wavBuffer),
        channels = [],
        i,
        sample,
        offset = 0,
        pos = 0;

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][bufferIdx])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        bufferIdx++;
    }

    return wavBuffer;

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}
