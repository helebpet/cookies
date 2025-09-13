// Declare global variables
let capture; // Variable to hold camera video capture
let eyeX = 0, eyeY = 0; // Variables for tracking eye movement in the interactive face
let startTime; // Variable to store the start time of the sketch
let surveillanceMessages = [ // Array of fake "surveillance" messages to display
    "[DETECTED] mouse moved to the left",
    "[LOG] user is getting annoyed", 
    "[ALERT] location shared with our boss",
    "[STATUS] user blinked 20 times",
    "[ALERT] embarrassing photo sent to your mum!",
    "[MESSAGE] you are the product",
    "[MESSAGE] click anywhere on the screen to get out of here"
];
let currentMessageIndex = 0;
let messageTimer = 0;
let blinkTimer = 0;
let isBlinking = false;

// Screenshot functionality
let screenshots = [];
const MAX_SCREENSHOTS = 3;

// Duotone control
let duotoneEnabled = true;
let shadowColorHex = '#000000';   // černá
let highlightColorHex = '#ff0000'; // červená

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    
    capture = createCapture(VIDEO);
    capture.size(640, 480);
    capture.hide();
    
    startTime = millis();
    console.log("Surveillance system initiated...");
}

function draw() {
    background(204, 0, 0);
    
    drawSeparatorLine();
    drawScreenshots();
    drawLargeCameraView();
    drawSurveillanceText();
    drawTimeDisplay();
    drawInteractiveFace();
    updateTime();
}

function getSeparatorX() {
    let padding = 40;
    let frameWidth = 160;
    let screenshotsRightEdge = padding + frameWidth; // right edge of stacked screenshots
    
    let cameraLeftEdge = screenshotsRightEdge + 80; // add some gap before camera starts
    let cameraAreaLeft = cameraLeftEdge; 
    
    // separator in the middle between screenshots and camera
    return (screenshotsRightEdge + cameraAreaLeft) / 2;
}

function drawSeparatorLine() {
    let separatorX = getSeparatorX();
    let padding = 40;
    
    stroke(0);
    strokeWeight(1);
    line(separatorX, padding, separatorX, height - padding);
    noStroke();
}

function drawScreenshots() {
    let padding = 40;
    let frameWidth = 160;
    let frameHeight = 200; // 4:5 ratio
    let frameSpacing = 20;
    
    for (let i = 0; i < screenshots.length; i++) {
        let frameX = padding;
        let frameY = padding + i * (frameHeight + frameSpacing);
        
        fill(255);
        noStroke();
        rect(frameX, frameY, frameWidth, frameHeight);
        
        let imagePadding = 20;
        let imageSize = frameWidth - (imagePadding * 2);
        let imageX = frameX + imagePadding;
        let imageY = frameY + imagePadding;
        
        if (screenshots[i].image) {
            let monoImg = screenshots[i].image.get();
            monoImg.filter(GRAY);
            image(monoImg, imageX, imageY, imageSize, imageSize);
        }
        
        fill(0);
        textAlign(CENTER);
        textSize(12);
        textFont('Azeret Mono');
        let timestampY = imageY + imageSize + (frameHeight - (imageSize + imagePadding * 2)) / 2 + 5;
        text(screenshots[i].timestamp, frameX + frameWidth/2, timestampY);
    }
}

function captureScreenshot() {
    if (capture && capture.loadedmetadata) {
        let cameraImg = capture.get();
        
        let size = min(cameraImg.width, cameraImg.height);
        let cropX = (cameraImg.width - size) / 2;
        let cropY = (cameraImg.height - size) / 2;
        let croppedImg = cameraImg.get(cropX, cropY, size, size);
        
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        let hoursStr = hours.toString().padStart(2, '0');
        let timestamp = `${hoursStr}:${minutes}:${seconds} ${ampm}`;
        
        let screenshot = { image: croppedImg, timestamp: timestamp };
        screenshots.unshift(screenshot);
        
        if (screenshots.length > MAX_SCREENSHOTS) {
            screenshots = screenshots.slice(0, MAX_SCREENSHOTS);
        }
        
        console.log("Screenshot captured at " + timestamp);
    }
}

function drawLargeCameraView() {
    if (capture && capture.loadedmetadata) {
        let padding = 40;
        let separatorX = getSeparatorX();
        
        let targetX = separatorX + padding;
        let targetY = padding;
        let targetWidth = width - targetX - padding;
        let targetHeight = height * 0.6;
        
        let cameraAspect = 640 / 480;
        let targetAspect = targetWidth / targetHeight;
        
        let sourceX, sourceY, sourceWidth, sourceHeight;
        if (cameraAspect > targetAspect) {
            sourceHeight = 480;
            sourceWidth = sourceHeight * targetAspect;
            sourceX = Math.floor((640 - sourceWidth) / 2);
            sourceY = 0;
        } else {
            sourceWidth = 640;
            sourceHeight = Math.floor(sourceWidth / targetAspect);
            sourceX = 0;
            sourceY = Math.floor((480 - sourceHeight) / 2);
        }
        
        // copy the webcam frame (p5.Image)
        let croppedImg = capture.get(sourceX, sourceY, sourceWidth, sourceHeight);
        
        // apply duotone filter if enabled
        if (duotoneEnabled) {
            applyDuotone(croppedImg, shadowColorHex, highlightColorHex);
        }
        
        // draw filtered webcam
        image(croppedImg, targetX, targetY, targetWidth, targetHeight);
    }
}

function drawSurveillanceText() {
    let padding = 40;
    let separatorX = getSeparatorX();
    let cameraHeight = height * 0.6;
    
    fill(0);
    textAlign(LEFT);
    textSize(32);
    textFont('Azeret Mono');
    text("SURVEILLANCE IN PROGRESS", separatorX + padding, padding + cameraHeight + 50);
    
    textSize(14);
    let yPos = padding + cameraHeight + 90;
    for (let i = 0; i < surveillanceMessages.length; i++) {
        if (i <= currentMessageIndex) {
            text(surveillanceMessages[i], separatorX + padding, yPos + i * 25);
        }
    }
    
    messageTimer++;
    if (messageTimer > 120 && currentMessageIndex < surveillanceMessages.length - 1) {
        currentMessageIndex++;
        messageTimer = 0;
    }
}

function drawTimeDisplay() {
    let padding = 40;
    let cameraHeight = height * 0.6;
    
    fill(0);
    textAlign(RIGHT);
    textSize(14);
    textFont('Azeret Mono');
    
    let elapsed = (millis() - startTime) / 1000;
    let hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    let minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    let seconds = Math.floor(elapsed % 60).toString().padStart(2, '0');
    
    text(`${hours}:${minutes}:${seconds}`, width - padding, padding + cameraHeight + 50);
}

function drawInteractiveFace() {
    let padding = 40;
    let faceX = width - padding - 40;
    let faceY = height - padding - 40;
    let faceSize = 60;
    
    noFill();
    stroke(0);
    strokeWeight(1);
    circle(faceX, faceY, faceSize);
    
    let mouseAngle = atan2(mouseY - faceY, mouseX - faceX);
    let eyeDistance = 6;
    eyeX = cos(mouseAngle) * eyeDistance;
    eyeY = sin(mouseAngle) * eyeDistance;
    
    fill(0);
    noStroke();
    
    blinkTimer++;
    if (blinkTimer > 180) {
        isBlinking = true;
        if (blinkTimer > 190) {
            isBlinking = false;
            blinkTimer = 0;
        }
    }
    
    if (!isBlinking) {
        circle(faceX - 12 + eyeX * 0.3, faceY - 8 + eyeY * 0.3, 6);
        circle(faceX + 12 + eyeX * 0.3, faceY - 8 + eyeY * 0.3, 6);
    } else {
        ellipse(faceX - 12, faceY - 8, 12, 2);
        ellipse(faceX + 12, faceY - 8, 12, 2);
    }
    
    fill(0);
    noStroke();
    rect(faceX - 10, faceY + 12, 20, 1);
}

function mousePressed() {
    console.log("Screen clicked!");
    captureScreenshot();
}

function updateTime() {}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        currentMessageIndex = 0;
        messageTimer = 0;
    }
    if (key === 'c' || key === 'C') {
        captureScreenshot();
    }
    // toggle duotone with 'd'
    if (key === 'd' || key === 'D') {
        duotoneEnabled = !duotoneEnabled;
        console.log("Duotone enabled:", duotoneEnabled);
    }
}

// -------------------
// Duotone helper
// -------------------
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * applyDuotone(img, shadowHex, highlightHex)
 * - img must be a p5.Image (e.g. returned by capture.get())
 * - modifies image pixels in-place and calls updatePixels()
 */
function applyDuotone(img, shadowHex, highlightHex) {
    if (!img || !img.loadPixels) return;
    const shadow = hexToRgb(shadowHex);
    const highlight = hexToRgb(highlightHex);
    
    img.loadPixels();
    const pixels = img.pixels;
    // If pixels array is empty, abort
    if (!pixels || pixels.length === 0) {
        // sometimes need a tiny delay; fallback: return
        return;
    }
    
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // calculate luminance (0..1)
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        // map luminance between shadow and highlight
        pixels[i]     = Math.round(shadow.r * (1 - luminance) + highlight.r * luminance);
        pixels[i + 1] = Math.round(shadow.g * (1 - luminance) + highlight.g * luminance);
        pixels[i + 2] = Math.round(shadow.b * (1 - luminance) + highlight.b * luminance);
        // alpha stays the same (pixels[i+3])
    }
    img.updatePixels();
}
