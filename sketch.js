// Global variables for scroll and interaction state
let scrollOffset = 0;              // Current scroll position in text area
let maxScroll = 0;                 // Maximum scrollable distance
let textContentHeight = 0;         // Total height of all text content
let freeButton = null;             // Escaped button object when active
let showOriginalManage = true;     // Flag to show/hide original manage button
let isDragging = false;            // Mouse drag state for scrolling
let lastMouseY = 0;                // Previous mouse Y position for drag calculation

function setup() {
    // Create full-screen canvas
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');  // Attach canvas to HTML container
    
    // Set default font to Azeret Mono (loaded via Google Fonts)
    textFont('Azeret Mono');
    
    console.log("Canvas initialized:", windowWidth + "x" + windowHeight);
}

function draw() {
    // Clear previous frame content
    clear();
    
    // Draw semi-transparent black overlay covering entire screen
    fill(0, 0, 0, 153);            // Black with 60% opacity (153/255)
    noStroke();                     // Remove border
    rect(0, 0, width, height);     // Fill entire canvas
    
    // Calculate responsive banner dimensions
    let bannerWidth = min(width * 0.8, 600);   // 80% of screen width, max 600px
    let bannerHeight = min(height * 0.6, 400); // 60% of screen height, max 400px
    let bannerX = (width - bannerWidth) / 2;   // Center horizontally
    let bannerY = (height - bannerHeight) / 2; // Center vertically
    
    // Draw main banner background (white, no rounded corners)
    fill(255);                      // White background
    noStroke();                     // No border
    rect(bannerX, bannerY, bannerWidth, bannerHeight); // Sharp rectangular corners
    
    // Calculate responsive text sizes and layout spacing
    let titleSize = min(width * 0.04, 32);     // Title font size (4% of width, max 32px)
    let bodySize = min(width * 0.02, 16);      // Body font size (2% of width, max 16px)
    let padding = bannerWidth * 0.08;          // Internal padding (8% of banner width)
    let textMaxWidth = bannerWidth - (padding * 2) - 20; // Text width minus padding and scrollbar space
    
    // Draw title text with wrapping
    fill(0);                        // Black text color
    noStroke();                     // No text outline
    textAlign(LEFT);                // Left-align text
    textSize(titleSize);            // Set calculated title size
    textStyle(BOLD);                // Bold font weight
    
    let titleText = "WE USE COOKIES TO IMPROVE YOUR EXPERIENCE!";
    let titleLines = wrapText(titleText, textMaxWidth + 20, titleSize); // Wrap title text to fit
    
    // Render each line of the title
    for (let i = 0; i < titleLines.length; i++) {
        text(titleLines[i], 
             bannerX + padding,                               // X position with padding
             bannerY + padding + titleSize + (i * titleSize * 1.2)); // Y position with line spacing
    }
    
    // Calculate text area dimensions for scrollable content
    let titleHeight = titleLines.length * titleSize * 1.2;   // Total height of title section
    let textAreaY = bannerY + padding + titleSize + titleHeight + 10; // Start of body text area
    let buttonHeight = max(40, bannerHeight * 0.12);         // Button height (12% of banner, min 40px)
    let textAreaHeight = bannerY + bannerHeight - padding - buttonHeight - 20 - textAreaY; // Available height for text
    
    // Setup scrollable body text
    textStyle(NORMAL);              // Remove bold formatting
    textSize(bodySize);             // Set body text size
    
    let bodyText = "We and our trusted partners use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and deliver personalized content and advertisements. These essential tools help us understand how you interact with our website, remember your preferences, and provide you with relevant offers tailored to your interests. By continuing to use this site, you consent to our collection of data including your location, device information, browsing history, and interaction patterns, which may be shared with third-party vendors for analytics, marketing, and service improvement purposes. We are committed to protecting your privacy while delivering the best possible user experience through data-driven personalization.";
    
    // Wrap body text and calculate scrolling parameters
    let lines = wrapText(bodyText, textMaxWidth, bodySize);   // Break text into lines
    let lineHeight = bodySize * 1.4;                         // Line spacing (140% of font size)
    textContentHeight = lines.length * lineHeight;           // Total height of all text lines
    maxScroll = max(0, textContentHeight - textAreaHeight);  // Maximum scroll distance needed
    
    // Create clipping mask to contain scrolling text within designated area
    drawingContext.save();                                    // Save current drawing state
    drawingContext.beginPath();                              // Start clipping path
    drawingContext.rect(bannerX + padding, textAreaY, textMaxWidth, textAreaHeight); // Define clipping rectangle
    drawingContext.clip();                                   // Apply clipping mask
    
    // Render visible text lines with scroll offset
    for (let i = 0; i < lines.length; i++) {
        let lineY = textAreaY + (i * lineHeight) - scrollOffset + bodySize; // Calculate line position with scroll
        
        // Only draw lines that are visible within the text area (performance optimization)
        if (lineY > textAreaY - lineHeight && lineY < textAreaY + textAreaHeight + lineHeight) {
            text(lines[i], bannerX + padding, lineY);       // Draw individual text line
        }
    }
    
    drawingContext.restore();                                // Restore drawing state (remove clipping)
    
    // Draw scroll indicator when content exceeds visible area
    if (maxScroll > 0) {
        // Scrollbar background track
        let scrollBarX = bannerX + bannerWidth - padding - 12; // Position on right side
        let scrollBarY = textAreaY;                          // Align with text area
        let scrollBarHeight = textAreaHeight;                // Match text area height
        
        fill(200);                                           // Light gray background
        noStroke();                                          // No border
        rect(scrollBarX, scrollBarY, 8, scrollBarHeight);   // Draw scrollbar track (no rounded corners)
        
        // Scrollbar thumb (draggable indicator)
        let thumbHeight = max(20, (textAreaHeight / textContentHeight) * scrollBarHeight); // Proportional thumb size
        let thumbY = scrollBarY + (scrollOffset / maxScroll) * (scrollBarHeight - thumbHeight); // Current thumb position
        
        fill(100);                                           // Darker gray for thumb
        rect(scrollBarX, thumbY, 8, thumbHeight);           // Draw thumb (no rounded corners)
    }
    
    // Calculate button layout (centered pair)
    let buttonWidth = bannerWidth * 0.3;                    // Each button is 30% of banner width
    let buttonSpacing = 20;                                  // Fixed 20px gap between buttons
    let totalButtonWidth = (buttonWidth * 2) + buttonSpacing; // Total width of button group
    let button1X = bannerX + (bannerWidth - totalButtonWidth) / 2; // Center the button group
    let button2X = button1X + buttonWidth + buttonSpacing;  // Position of second button
    let buttonY = bannerY + bannerHeight - buttonHeight - padding; // Bottom of banner minus padding
    
    // Check if mouse is approaching original manage settings button
    let distanceToOriginalManage = dist(mouseX, mouseY, button1X + buttonWidth/2, buttonY + buttonHeight/2);
    let escapeDistance = 100;                                // Trigger distance for escape behavior
    
    // Trigger button escape when mouse gets too close
    if (distanceToOriginalManage < escapeDistance && showOriginalManage && !freeButton) {
        // Create escaped button object with physics properties
        freeButton = {
            x: button1X + buttonWidth/2,                    // Start at original button center
            y: buttonY + buttonHeight/2,
            width: buttonWidth,                              // Maintain original dimensions
            height: buttonHeight,
            vx: random(-15, 15),                            // Random horizontal velocity
            vy: random(-15, 15),                            // Random vertical velocity
            targetX: random(buttonWidth, width - buttonWidth), // Future random target (unused)
            targetY: random(buttonHeight, height - buttonHeight)
        };
        showOriginalManage = false;                          // Hide original button
        console.log("Manage Settings button escaped!");
    }
    
    // Draw original Manage Settings button (when not escaped)
    if (showOriginalManage) {
        fill(220);                                           // Light gray background
        noStroke();                                          // No border
        rect(button1X, buttonY, buttonWidth, buttonHeight); // Square button (no rounded corners)
        
        // Button text
        fill(0);                                             // Black text
        textAlign(CENTER);                                   // Center text in button
        textSize(min(buttonWidth * 0.13, 16));              // Responsive text size
        textStyle(BOLD);                                     // Bold font weight
        text("Manage Settings", button1X + buttonWidth/2, buttonY + buttonHeight/2 + 6); // Center text with slight vertical offset
    }
    
    // Draw Accept All button (always remains in place)
    fill(34, 139, 34);                                      // Forest green background
    noStroke();                                              // No border
    rect(button2X, buttonY, buttonWidth, buttonHeight);     // Square button (no rounded corners)
    
    // Accept button text
    fill(255);                                               // White text for contrast
    textAlign(CENTER);                                       // Center text in button
    textSize(min(buttonWidth * 0.15, 18));                 // Responsive text size (slightly larger)
    textStyle(BOLD);                                         // Bold font weight
    text("Accept All", button2X + buttonWidth/2, buttonY + buttonHeight/2 + 6); // Center text with offset
    
    // Update and draw the escaped button if it exists
    if (freeButton) {
        updateFreeButton(freeButton);                        // Apply physics and mouse avoidance
        drawFreeButton(freeButton);                          // Render escaped button
    }
}

// Physics and behavior for the escaped button
function updateFreeButton(btn) {
    let distanceToMouse = dist(mouseX, mouseY, btn.x, btn.y); // Calculate distance from mouse to button
    let fleeDistance = 150;                                  // Distance at which button starts fleeing
    
    // Apply flee behavior when mouse is too close
    if (distanceToMouse < fleeDistance) {
        let angle = atan2(btn.y - mouseY, btn.x - mouseX);   // Calculate angle away from mouse
        let force = map(distanceToMouse, 0, fleeDistance, 8, 1); // Stronger force when closer
        
        // Apply directional force away from mouse
        btn.vx += cos(angle) * force;                        // Horizontal component
        btn.vy += sin(angle) * force;                        // Vertical component
        
        // Add random chaos for unpredictable movement
        btn.vx += random(-3, 3);                            // Random horizontal jitter
        btn.vy += random(-3, 3);                            // Random vertical jitter
    }
    
    // Apply velocity to position
    btn.x += btn.vx;                                         // Update horizontal position
    btn.y += btn.vy;                                         // Update vertical position
    
    // Bounce off screen edges with energy loss
    if (btn.x - btn.width/2 <= 0 || btn.x + btn.width/2 >= width) {
        btn.vx *= -0.7;                                      // Reverse and reduce horizontal velocity
        btn.x = constrain(btn.x, btn.width/2, width - btn.width/2); // Keep button on screen
    }
    
    if (btn.y - btn.height/2 <= 0 || btn.y + btn.height/2 >= height) {
        btn.vy *= -0.7;                                      // Reverse and reduce vertical velocity
        btn.y = constrain(btn.y, btn.height/2, height - btn.height/2); // Keep button on screen
    }
    
    // Apply friction to gradually slow down movement
    btn.vx *= 0.96;                                          // Horizontal friction
    btn.vy *= 0.96;                                          // Vertical friction
    
    // Limit maximum speed to prevent excessive velocity
    let maxSpeed = 20;                                       // Maximum allowed speed
    let currentSpeed = sqrt(btn.vx * btn.vx + btn.vy * btn.vy); // Calculate current speed
    if (currentSpeed > maxSpeed) {
        btn.vx = (btn.vx / currentSpeed) * maxSpeed;         // Scale down horizontal velocity
        btn.vy = (btn.vy / currentSpeed) * maxSpeed;         // Scale down vertical velocity
    }
}

// Render the escaped button at its current position
function drawFreeButton(btn) {
    // Button background
    fill(220);                                               // Light gray background
    noStroke();                                              // No border
    rect(btn.x - btn.width/2, btn.y - btn.height/2, btn.width, btn.height); // Square button (no rounded corners)
    
    // Button text
    fill(0);                                                 // Black text
    textAlign(CENTER);                                       // Center text in button
    textSize(min(btn.width * 0.13, 16));                   // Responsive text size
    textStyle(BOLD);                                         // Bold font weight
    text("Manage Settings", btn.x, btn.y + 6);              // Center text with vertical offset
}

// Break text into lines that fit within specified width
function wrapText(txt, maxWidth, fontSize) {
    let words = txt.split(' ');                             // Split text into individual words
    let lines = [];                                          // Array to store wrapped lines
    let currentLine = '';                                    // Current line being built
    
    textSize(fontSize);                                      // Set font size for width calculations
    
    // Process each word
    for (let i = 0; i < words.length; i++) {
        let testLine = currentLine + words[i] + ' ';        // Test line with next word added
        let testWidth = textWidth(testLine);                // Calculate pixel width of test line
        
        // If line would be too wide and we have words already, start new line
        if (testWidth > maxWidth && currentLine !== '') {
            lines.push(currentLine.trim());                 // Add current line to array
            currentLine = words[i] + ' ';                   // Start new line with current word
        } else {
            currentLine = testLine;                          // Add word to current line
        }
    }
    
    // Add final line if it contains text
    if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
    }
    
    return lines;                                            // Return array of wrapped lines
}

// Handle mouse wheel scrolling in text area
function mouseWheel(event) {
    // Only scroll if content is scrollable
    if (maxScroll > 0) {
        scrollOffset += event.delta;                        // Apply scroll delta
        scrollOffset = constrain(scrollOffset, 0, maxScroll); // Clamp to valid range
        return false;                                        // Prevent default browser scrolling
    }
}

// Handle drag scrolling in text area
function mouseDragged() {
    // Only process drag if actively dragging in scrollable content
    if (isDragging && maxScroll > 0) {
        let deltaY = mouseY - lastMouseY;                   // Calculate mouse movement
        scrollOffset -= deltaY;                             // Apply inverse scroll (natural direction)
        scrollOffset = constrain(scrollOffset, 0, maxScroll); // Clamp to valid range
        lastMouseY = mouseY;                                 // Update previous mouse position
    }
}

// End drag scrolling on mouse release
function mouseReleased() {
    isDragging = false;                                      // Reset drag state
}

// Handle mouse clicks and start drag scrolling
function mousePressed() {
    // Recalculate layout dimensions for hit testing
    let bannerWidth = min(width * 0.8, 600);
    let bannerHeight = min(height * 0.6, 400);
    let bannerX = (width - bannerWidth) / 2;
    let bannerY = (height - bannerHeight) / 2;
    let padding = bannerWidth * 0.08;
    let titleSize = min(width * 0.04, 32);
    let titleText = "WE USE COOKIES TO IMPROVE YOUR EXPERIENCE!";
    let titleLines = wrapText(titleText, bannerWidth - padding * 2, titleSize);
    let titleHeight = titleLines.length * titleSize * 1.2;
    let textAreaY = bannerY + padding + titleSize + titleHeight + 10;
    let buttonHeight = max(40, bannerHeight * 0.12);
    let textAreaHeight = bannerY + bannerHeight - padding - buttonHeight - 20 - textAreaY;
    
    // Check if click is in text area to start drag scrolling
    if (mouseX >= bannerX + padding && mouseX <= bannerX + bannerWidth - padding &&
        mouseY >= textAreaY && mouseY <= textAreaY + textAreaHeight) {
        isDragging = true;                                   // Enable drag scrolling
        lastMouseY = mouseY;                                 // Store initial mouse position
        return;                                              // Exit early to avoid button processing
    }
    
    // Calculate button positions for click detection
    let buttonWidth = bannerWidth * 0.3;
    let buttonSpacing = 20;
    let totalButtonWidth = (buttonWidth * 2) + buttonSpacing;
    let button1X = bannerX + (bannerWidth - totalButtonWidth) / 2;
    let button2X = button1X + buttonWidth + buttonSpacing;
    let buttonY = bannerY + bannerHeight - buttonHeight - padding;
    
    // Check Accept All button click
if (mouseX >= button2X && mouseX <= button2X + buttonWidth &&
    mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
    console.log("✅ Cookies accepted!");
    window.location.href = "camera.html";  // Redirect to camera.html
    freeButton = null;                                   // Remove escaped button
    showOriginalManage = true;                           // Restore original button
}
    
    // Check if escaped button was clicked (challenging due to movement)
    if (freeButton) {
        let distanceToFreeButton = dist(mouseX, mouseY, freeButton.x, freeButton.y);
        if (distanceToFreeButton < freeButton.width/2) {    // Hit detection based on button center
            console.log("🎉 You caught the escaped button!");
            freeButton = null;                               // Remove escaped button
            showOriginalManage = true;                       // Restore original button
        }
    }
}

// Handle window resize events
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);                 // Adjust canvas to new window size
    freeButton = null;                                       // Reset escaped button
    showOriginalManage = true;                              // Reset to initial state
    console.log("Canvas resized to:", windowWidth + "x" + windowHeight);
}