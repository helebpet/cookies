// this code was found and customized form google overview https://www.google.com/search?q=duotone+website+black+and+red+js+file&client=safari&sca_esv=fe6362944b97d7fe&rls=en&ei=wqPAaMCuHZSQm9cPh9KZCQ&ved=0ahUKEwjAl5mW18yPAxUUyOYEHQdpJgEQ4dUDCBI&uact=5&oq=duotone+website+black+and+red+js+file&gs_lp=Egxnd3Mtd2l6LXNlcnAiJWR1b3RvbmUgd2Vic2l0ZSBibGFjayBhbmQgcmVkIGpzIGZpbGUyBRAhGKABMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRigATIFECEYqwJIsj1Q9QJYgztwAXgBkAEAmAGBAaAB5Q2qAQQxMi42uAEDyAEA-AEBmAIToALfDsICChAAGLADGNYEGEfCAgUQIRifBcICCBAhGKABGMMEwgIKECEYoAEYwwQYCpgDAIgGAZAGCJIHBDkuMTCgB4pssgcEOC4xMLgH3A7CBwYwLjguMTHIB0I&sclient=gws-wiz-serp
const startButton = document.getElementById('start-button');
const video = document.getElementById('camera-feed');
const canvas = document.getElementById('duotone-canvas');
const context = canvas.getContext('2d');

// Color hex codes for shadows and highlights
const shadowColor = '#000000'; // Black
const highlightColor = '#ff0000'; // Red

// Function to convert hex to RGB
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Store RGB values
const rgbShadow = hexToRgb(shadowColor);
const rgbHighlight = hexToRgb(highlightColor);

startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            requestAnimationFrame(draw);
        };
    } catch (err) {
        console.error("Error accessing camera: ", err);
    }
});

function draw() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Convert to grayscale first to get a single luminance value
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        
        // Map luminance to duotone colors (black to red)
        pixels[i] = rgbShadow.r * (1 - luminance) + rgbHighlight.r * luminance;
        pixels[i + 1] = rgbShadow.g * (1 - luminance) + rgbHighlight.g * luminance;
        pixels[i + 2] = rgbShadow.b * (1 - luminance) + rgbHighlight.b * luminance;
    }
    
    context.putImageData(imageData, 0, 0);
    requestAnimationFrame(draw);
}