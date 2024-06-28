document.getElementById('mediaInput').addEventListener('change', handleFileSelect);
document.getElementById('generateSitemap').addEventListener('click', generateSitemap);
document.getElementById('downloadSitemap').addEventListener('click', downloadSitemap);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        displayMediaDetails(file);
    }
}

function displayMediaDetails(file) {
    const mediaDetails = document.getElementById('mediaDetails');
    document.getElementById('mediaName').textContent = `Name: ${file.name}`;
    document.getElementById('mediaType').textContent = `Type: ${file.type}`;
    document.getElementById('mediaSize').textContent = `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    document.getElementById('mediaCreationDate').textContent = `Creation Date: ${file.lastModifiedDate}`;

    const mediaElement = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
    mediaElement.src = URL.createObjectURL(file);
    mediaElement.style.display = 'none';
    document.body.appendChild(mediaElement);

    mediaElement.onloadedmetadata = () => {
        document.getElementById('mediaDuration').textContent = `Duration: ${mediaElement.duration.toFixed(2)} seconds`;
        if (file.type.startsWith('video')) {
            document.getElementById('mediaFrameRate').textContent = `Frame Rate: ${mediaElement.videoHeight} fps`;
            document.getElementById('mediaQuality').textContent = `Resolution: ${mediaElement.videoWidth} x ${mediaElement.videoHeight}`;
        } else {
            document.getElementById('mediaFrameRate').textContent = `Frame Rate: N/A`;
            document.getElementById('mediaQuality').textContent = `Quality: N/A`;
        }
        mediaDetails.style.display = 'block';
        document.getElementById('generateSitemap').style.display = 'block';
        document.body.removeChild(mediaElement);
    };

    mediaElement.onerror = () => {
        alert('Failed to load media metadata. Please try a different file.');
        document.body.removeChild(mediaElement);
    };
}

function generateSitemap() {
    const fileName = document.getElementById('mediaName').textContent.split(': ')[1];
    const fileType = document.getElementById('mediaType').textContent.split(': ')[1];
    const fileSize = document.getElementById('mediaSize').textContent.split(': ')[1];
    const fileDuration = document.getElementById('mediaDuration').textContent.split(': ')[1];
    const fileFrameRate = document.getElementById('mediaFrameRate').textContent.split(': ')[1];
    const fileQuality = document.getElementById('mediaQuality').textContent.split(': ')[1];
    const fileCreationDate = document.getElementById('mediaCreationDate').textContent.split(': ')[1];

    const sitemap = `
<url>
    <loc>${fileName}</loc>
    <type>${fileType}</type>
    <size>${fileSize}</size>
    <duration>${fileDuration}</duration>
    <frameRate>${fileFrameRate}</frameRate>
    <quality>${fileQuality}</quality>
    <creationDate>${fileCreationDate}</creationDate>
</url>
`;

    document.getElementById('sitemapOutput').textContent = sitemap.trim();
    document.getElementById('downloadSitemap').style.display = 'block';
}

function downloadSitemap() {
    const sitemapContent = document.getElementById('sitemapOutput').textContent;
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
}
