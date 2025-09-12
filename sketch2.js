let capture;
let eyeX = 0, eyeY = 0;
let startTime;
let capturedFrames = [];
let frameTimestamps = [];
let maxFrames = 3;
let initialScreenshot = null;
let surveillanceMessages = [
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

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    
    // Create camera capture
    capture = createCapture(VIDEO);
    capture.size(640, 480);
    capture.hide();
    
    startTime = millis();
    console.log("Surveillance system initiated...");
}

function draw() {
    background(204, 0, 0); // Red background
    
    // Take initial screenshot after camera is ready
    if (!initialScreenshot && capture && capture.loadedmetadata) {
        takeInitialScreenshot();
    }
    
    drawMainPanel();
    drawCapturedFrames();
    drawSmallCameraView();
    drawTimeDisplay();
    drawSurveillanceText();
    drawInteractiveFace();
    
    updateTime();
}

function takeInitialScreenshot() {
    let frameImg = capture.get();
    frameImg.filter(GRAY);
    
    // Create perfect square crop from center
    let size = min(frameImg.width, frameImg.height);
    let startX = (frameImg.width - size) / 2;
    let startY = (frameImg.height - size) / 2;
    let squareImg = frameImg.get(startX, startY, size, size);
    squareImg.resize(180, 180);
    
    initialScreenshot = squareImg;
}

function drawMainPanel() {
    let padding = 40;
    
    // White background - NO STROKE
    fill(255);
    noStroke();
    rect(padding, padding, 200, 220);
    
    // Show square screenshot
    if (capturedFrames.length > 0) {
        image(capturedFrames[0], padding + 10, padding + 10, 180, 180);
    } else if (initialScreenshot) {
        image(initialScreenshot, padding + 10, padding + 10, 180, 180);
    }
    
    // Show date at bottom
    fill(0);
    textAlign(CENTER);
    textSize(12);
    textFont('Azeret Mono');
    
    let now = new Date();
    let day = now.getDate().toString().padStart(2, '0');
    let month = (now.getMonth() + 1).toString().padStart(2, '0');
    let year = now.getFullYear();
    text(`${day}. ${month}. ${year}`, padding + 100, padding + 210);
}

function drawCapturedFrames() {
    let padding = 40;
    
    for (let i = 0; i < capturedFrames.length && i < maxFrames; i++) {
        let yPos = padding + 280 + (i * 90);
        
        // White background - NO STROKE (same as main panel)
        fill(255);
        noStroke();
        rect(padding, yPos, 200, 80);
        
        // Draw square screenshot
        if (capturedFrames[i]) {
            image(capturedFrames[i], padding + 10, yPos + 10, 60, 60);
        }
        
        // Show timestamp (time only)
        fill(0);
        textAlign(CENTER);
        textSize(10);
        textFont('Azeret Mono');
        
        if (frameTimestamps[i]) {
            text(frameTimestamps[i], padding + 100, yPos + 70);
        }
    }
}

function drawSmallCameraView() {
    if (capture && capture.loadedmetadata) {
        let padding = 40;
        let leftPanelWidth = 280;
        
        let camX = leftPanelWidth + padding;
        let camY = padding;
        let camWidth = 450;
        let camHeight = 250;
        
        push();
        tint(255, 100, 100);
        image(capture, camX, camY, camWidth, camHeight);
        noTint();
        pop();
    }
}

function drawTimeDisplay() {
    let padding = 40;
    
    fill(0);
    textAlign(RIGHT);
    textSize(14);
    textFont('Azeret Mono');
    
    let elapsed = (millis() - startTime) / 1000;
    let hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    let minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    let seconds = Math.floor(elapsed % 60).toString().padStart(2, '0');
    
    text(`${hours}:${minutes}:${seconds}`, width - padding, padding + 20);
}

function drawSurveillanceText() {
    let padding = 40;
    let leftPanelWidth = 280;
    
    fill(0);
    textAlign(LEFT);
    textSize(32);
    textFont('Azeret Mono');
    text("SURVEILLANCE IN PROGRESS", leftPanelWidth + padding, padding + 320);
    
    textSize(14);
    let yPos = padding + 360;
    
    for (let i = 0; i < surveillanceMessages.length; i++) {
        if (i <= currentMessageIndex) {
            text(surveillanceMessages[i], leftPanelWidth + padding, yPos + i * 25);
        }
    }
    
    messageTimer++;
    if (messageTimer > 120 && currentMessageIndex < surveillanceMessages.length - 1) {
        currentMessageIndex++;
        messageTimer = 0;
    }
}

function drawInteractiveFace() {
    let padding = 40;
    
    let faceX = width - padding - 40;
    let faceY = height - padding - 40;
    let faceSize = 60;
    
    noFill();
    stroke(0);
    strokeWeight(3);
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
    rect(faceX - 10, faceY + 12, 20, 2);
}

function mousePressed() {
    if (capture && capture.loadedmetadata) {
        addCapturedFrame();
        console.log("Square screenshot captured!");
    }
}

function addCapturedFrame() {
    let frameImg = capture.get();
    frameImg.filter(GRAY);
    
    // Create perfect square crop from center
    let size = min(frameImg.width, frameImg.height);
    let startX = (frameImg.width - size) / 2;
    let startY = (frameImg.height - size) / 2;
    let squareImg = frameImg.get(startX, startY, size, size);
    squareImg.resize(180, 180); // Same size as main panel
    
    // Get current time for timestamp
    let now = new Date();
    let timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Add to beginning of arrays
    capturedFrames.unshift(squareImg);
    frameTimestamps.unshift(timeStr);
    
    // Keep only maxFrames
    if (capturedFrames.length > maxFrames) {
        capturedFrames = capturedFrames.slice(0, maxFrames);
        frameTimestamps = frameTimestamps.slice(0, maxFrames);
    }
}

function updateTime() {
    // Update time tracking
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        currentMessageIndex = 0;
        messageTimer = 0;
    }
}