
let qrImageUrl = null;

const generateButton = document.getElementById("generateQr");
const downloadButton = document.getElementById("downloadQr");
const urlInput = document.getElementById("siteUrl");
const output = document.getElementById("qrOutput");

// Convert the existing LEE SVG logo into a PNG with a white background.
function loadLEELogo() {
    return new Promise((resolve, reject) => {
        const logo = new Image();

        logo.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = 300;
                canvas.height = 300;

                const ctx = canvas.getContext("2d");

                // White circular background
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(150, 150, 150, 0, Math.PI * 2);
                ctx.fill();

                // Fit the LEE logo inside the circle
                const maxSize = 220;
                const scale = Math.min(
                    maxSize / logo.width,
                    maxSize / logo.height
                );

                const width = logo.width * scale;
                const height = logo.height * scale;

                ctx.drawImage(
                    logo,
                    (300 - width) / 2,
                    (300 - height) / 2,
                    width,
                    height
                );

                resolve(canvas.toDataURL("image/png"));
            } catch (error) {
                reject(error);
            }
        };

        logo.onerror = () => {
            reject(new Error("LEE logo could not be loaded."));
        };

        logo.src = new URL(
            "assets/images/lee-mark.svg",
            window.location.href
        ).href;
    });
}

// Generate QR code
generateButton.addEventListener("click", async () => {
    const websiteUrl = urlInput.value.trim();

    if (!/^https?:\/\/.+/i.test(websiteUrl)) {
        output.textContent =
            "Enter a valid website URL, including https://";
        return;
    }

    generateButton.disabled = true;
    downloadButton.disabled = true;
    generateButton.textContent = "GENERATING QR CODE...";

    output.innerHTML = "<span>Creating your LEE branded QR code...</span>";

    try {
        // Load and prepare the LEE logo
        const logoData = await loadLEELogo();

        // Build QR code URL
        const params = new URLSearchParams({
            text: websiteUrl,
            size: "1000",
            format: "png",
            margin: "2",
            dark: "160b08",
            light: "ffffff",
            ecLevel: "H",
            centerImageUrl: logoData,
            centerImageSizeRatio: "0.22"
        });

        qrImageUrl = `https://quickchart.io/qr?${params.toString()}`;

        // Verify that the QR image loads
        const qrImage = new Image();

        qrImage.onload = () => {
            output.innerHTML = "";
            qrImage.id = "leeQrImage";
            qrImage.alt = "LEE branded QR code";
            qrImage.style.width = "100%";
            qrImage.style.maxWidth = "320px";
            qrImage.style.height = "auto";
            qrImage.style.display = "block";
            qrImage.style.margin = "0 auto";

            output.appendChild(qrImage);
            downloadButton.disabled = false;
        };

        qrImage.onerror = () => {
            qrImageUrl = null;
            output.textContent =
                "QR generation failed. Please try again.";
        };

        qrImage.src = qrImageUrl;

    } catch (error) {
        console.error("LEE QR Generation Error:", error);
        output.textContent =
            "Could not load the LEE logo. Check that assets/images/lee-mark.svg exists.";
    } finally {
        generateButton.disabled = false;
        generateButton.innerHTML =
            'GENERATE QR CODE <b>↗</b>';
    }
});

// Download QR code
downloadButton.addEventListener("click", async () => {
    if (!qrImageUrl) return;

    downloadButton.disabled = true;
    downloadButton.textContent = "PREPARING DOWNLOAD...";

    try {
        const response = await fetch(qrImageUrl);

        if (!response.ok) {
            throw new Error("QR download failed.");
        }

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "LEE-branded-QR-code.png";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error("QR Download Error:", error);
        window.open(qrImageUrl, "_blank");
    } finally {
        downloadButton.disabled = false;
        downloadButton.textContent = "DOWNLOAD QR CODE";
    }
});

// Allow Enter key to generate the QR code
urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        generateButton.click();
    }
});
