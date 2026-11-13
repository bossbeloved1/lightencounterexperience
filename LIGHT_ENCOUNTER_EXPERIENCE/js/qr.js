
let qrImageUrl = null;

const generateBtn = document.getElementById('generateQr');
const downloadBtn = document.getElementById('downloadQr');
const siteUrl = document.getElementById('siteUrl');
const qrOutput = document.getElementById('qrOutput');

// Generate QR code
generateBtn.addEventListener('click', async () => {

    const url = siteUrl.value.trim();

    qrImageUrl = null;
    downloadBtn.disabled = true;

    if (!/^https?:\/\/[^\s]+$/i.test(url)) {
        qrOutput.textContent =
            'Please enter a valid website URL starting with https://';
        return;
    }

    try {

        generateBtn.disabled = true;
        generateBtn.textContent = 'GENERATING QR CODE...';

        qrOutput.textContent = 'Creating your QR code...';

        const apiUrl = new URL(
            'https://api.qrserver.com/v1/create-qr-code/'
        );

        apiUrl.searchParams.set('size', '800x800');
        apiUrl.searchParams.set('format', 'png');
        apiUrl.searchParams.set('margin', '10');
        apiUrl.searchParams.set('color', '22-11-8');
        apiUrl.searchParams.set('bgcolor', '255-255-255');
        apiUrl.searchParams.set('ecc', 'H');
        apiUrl.searchParams.set('data', url);

        const imageUrl = apiUrl.toString();

        const image = new Image();

        image.alt = 'Light Encounter Experience QR Code';
        image.style.width = '100%';
        image.style.maxWidth = '320px';
        image.style.height = 'auto';
        image.style.display = 'block';
        image.style.margin = '20px auto';
        image.style.background = '#ffffff';
        image.style.padding = '12px';
        image.style.borderRadius = '8px';

        image.onload = () => {

            qrImageUrl = imageUrl;

            qrOutput.innerHTML = '';
            qrOutput.appendChild(image);

            downloadBtn.disabled = false;

            generateBtn.disabled = false;
            generateBtn.innerHTML =
                'GENERATE QR CODE <b>↗</b>';

        };

        image.onerror = () => {
            throw new Error('The QR image could not be loaded.');
        };

        image.src = imageUrl;

    } catch (error) {

        console.error('QR Generation Error:', error);

        qrOutput.textContent =
            'Unable to generate QR code. Please try again.';

        generateBtn.disabled = false;
        generateBtn.innerHTML =
            'GENERATE QR CODE <b>↗</b>';

    }

});

// Download QR code
downloadBtn.addEventListener('click', async () => {

    if (!qrImageUrl) return;

    try {

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'PREPARING DOWNLOAD...';

        const response = await fetch(qrImageUrl);

        if (!response.ok) {
            throw new Error('QR image download failed.');
        }

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = blobUrl;
        link.download = 'light-encounter-experience-qr.png';

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

    } catch (error) {

        console.error('QR Download Error:', error);

        // Fallback: open the generated image directly
        window.open(qrImageUrl, '_blank');

    } finally {

        downloadBtn.disabled = false;
        downloadBtn.textContent = 'DOWNLOAD QR CODE';

    }

});

// Press Enter to generate
siteUrl.addEventListener('keydown', event => {

    if (event.key === 'Enter') {
        generateBtn.click();
    }

});
