
let qrCanvas = null;

const generateBtn = document.getElementById('generateQr');
const downloadBtn = document.getElementById('downloadQr');
const siteUrl = document.getElementById('siteUrl');
const qrOutput = document.getElementById('qrOutput');

// Load a backup QR library if the original CDN fails
async function ensureQRCodeLibrary() {
    if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
        return window.QRCode;
    }

    const backupSources = [
        'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js'
    ];

    for (const source of backupSources) {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = source;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
                return window.QRCode;
            }
        } catch (error) {
            console.warn('QR library source failed:', source, error);
        }
    }

    throw new Error('QR-code library could not be loaded.');
}

// Generate QR code
generateBtn.addEventListener('click', async () => {
    const url = siteUrl.value.trim();

    downloadBtn.disabled = true;
    qrCanvas = null;

    if (!/^https?:\/\/[^\s]+$/i.test(url)) {
        qrOutput.textContent = 'Enter a valid website URL, including https://';
        return;
    }

    qrOutput.textContent = 'Generating your QR code...';

    try {
        const QR = await ensureQRCodeLibrary();

        qrOutput.innerHTML = '';

        qrCanvas = document.createElement('canvas');

        await QR.toCanvas(qrCanvas, url, {
            width: 500,
            margin: 3,
            color: {
                dark: '#160b08',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        });

        qrOutput.appendChild(qrCanvas);
        downloadBtn.disabled = false;

    } catch (error) {
        console.error('QR Generation Error:', error);

        qrCanvas = null;
        qrOutput.textContent =
            'QR generation failed. Please check your internet connection and try again.';

    }
});

// Download QR code
downloadBtn.addEventListener('click', () => {
    if (!qrCanvas) return;

    try {
        const link = document.createElement('a');

        link.download = 'light-encounter-experience-qr.png';
        link.href = qrCanvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        link.remove();

    } catch (error) {
        console.error('QR Download Error:', error);
        alert('Unable to download QR code. Please try again.');
    }
});

// Allow Enter key to generate QR
siteUrl.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        generateBtn.click();
    }
});
