let capture;
let eyeX = 0, eyeY = 0;
let startTime;
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

// Screenshot functionality
let screenshots = []; // Array to store screenshot data
const MAX_SCREENSHOTS = 3;

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
    
    drawSeparatorLine();
    drawScreenshots();
    drawLargeCameraView();
    drawSurveillanceText();
    drawTimeDisplay();
    drawInteractiveFace();
    
    updateTime();
}

function drawSeparatorLine() {
    // Draw vertical line closer to the content - moved from 30% to 15%
    let separatorX = width * 0.15; // Line at 15% from left (was 30%)
    let padding = 40;
    
    stroke(0);
    strokeWeight(2);
    // Line starts at padding from top and ends at padding from bottom
    line(separatorX, padding, separatorX, height - padding);
    noStroke();
}

function drawScreenshots() {
    let padding = 40;
    let frameWidth = 160;
    let frameHeight = 200; // 4:5 aspect ratio (160:200)
    let frameSpacing = 20;
    
    for (let i = 0; i < screenshots.length; i++) {
        let frameX = padding;
        let frameY = padding + i * (frameHeight + frameSpacing);
        
        // Draw white frame
        fill(255);
        stroke(0);
        strokeWeight(2);
        rect(frameX, frameY, frameWidth, frameHeight);
        
        // Calculate image area inside frame (square, centered)
        let imagePadding = 20;
        let imageSize = frameWidth - (imagePadding * 2); // Square image
        let imageX = frameX + imagePadding;
        let imageY = frameY + imagePadding;
        
        // Draw the monochrome screenshot
        if (screenshots[i].image) {
            // Create monochrome version
            let monoImg = screenshots[i].image.get();
            monoImg.filter(GRAY);
            
            noStroke();
            image(monoImg, imageX, imageY, imageSize, imageSize);
        }
        
        // Draw timestamp in the middle of negative space below image
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
        // Get current camera frame
        let cameraImg = capture.get();
        
        // Crop to square from center
        let size = min(cameraImg.width, cameraImg.height);
        let cropX = (cameraImg.width - size) / 2;
        let cropY = (cameraImg.height - size) / 2;
        let croppedImg = cameraImg.get(cropX, cropY, size, size);
        
        // Create timestamp
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        let timestamp = `${hours}:${minutes}:${seconds}`;
        
        // Create screenshot object
        let screenshot = {
            image: croppedImg,
            timestamp: timestamp
        };
        
        // Add to beginning of array
        screenshots.unshift(screenshot);
        
        // Keep only the latest 3 screenshots
        if (screenshots.length > MAX_SCREENSHOTS) {
            screenshots = screenshots.slice(0, MAX_SCREENSHOTS);
        }
        
        console.log("Screenshot captured at " + timestamp);
    }
}

function drawLargeCameraView() {
    if (capture && capture.loadedmetadata) {
        let separatorX = width * 0.15; // Content starts after 15% (was 30%)
        let padding = 40;
        
        // Camera positioned in RIGHT area after separator line
        let targetX = separatorX + padding;
        let targetY = padding;
        let targetWidth = width - separatorX - (padding * 2);
        let targetHeight = height * 0.6;
        
        // Camera's natural aspect ratio
        let cameraAspect = 640 / 480;
        let targetAspect = targetWidth / targetHeight;
        
        // Calculate source crop dimensions to fill target without distortion
        let sourceX, sourceY, sourceWidth, sourceHeight;
        
        if (cameraAspect > targetAspect) {
            // Camera is wider - crop sides
            sourceHeight = 480;
            sourceWidth = sourceHeight * targetAspect;
            sourceX = (640 - sourceWidth) / 2;
            sourceY = 0;
        } else {
            // Camera is taller - crop top/bottom
            sourceWidth = 640;
            sourceHeight = sourceWidth / targetAspect;
            sourceX = 0;
            sourceY = (480 - sourceHeight) / 2;
        }
        
        push();
        
        // Get cropped portion of camera and display it
        let croppedImg = capture.get(sourceX, sourceY, sourceWidth, sourceHeight);
        image(croppedImg, targetX, targetY, targetWidth, targetHeight);
        
        pop();
    }
}

function drawSurveillanceText() {
    let separatorX = width * 0.15; // Updated to match new separator position
    let padding = 40;
    let cameraHeight = height * 0.6;
    
    // "SURVEILLANCE IN PROGRESS" title - positioned in RIGHT content area
    fill(0);
    textAlign(LEFT);
    textSize(32);
    textFont('Azeret Mono');
    text("SURVEILLANCE IN PROGRESS", separatorX + padding, padding + cameraHeight + 50);
    
    // Messages below the title
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
    
    // Time display - right aligned at far right edge
    fill(0);
    textAlign(RIGHT);
    textSize(14);
    textFont('Azeret Mono');
    
    let elapsed = (millis() - startTime) / 1000;
    let hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    let minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    let seconds = Math.floor(elapsed % 60).toString().padStart(2, '0');
    
    // Aligned with surveillance title
    text(`${hours}:${minutes}:${seconds}`, width - padding, padding + cameraHeight + 50);
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
    console.log("Screen clicked!");
    captureScreenshot(); // Capture screenshot on click
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
    
    // Add 'c' key for manual screenshot capture (optional)
    if (key === 'c' || key === 'C') {
        captureScreenshot();
    }
}