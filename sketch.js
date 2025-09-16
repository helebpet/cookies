// COOKIE MODAL ART PROJECT - P5.JS
// Original concept and design by Petra Helebrantová
// Created: September 13, 2025

// AI ASSISTANCE ACKNOWLEDGMENT:
// Claude AI (Anthropic) was used on 09/13/2025 to help with:
// - Code commenting and documentation
// - Proper source citation formatting
// - Code organization suggestions
// - Implementation assistance for interactive cookie modal behavior
// - Physics-based button escape mechanics
// - Scrollable text area functionality
// - Responsive layout calculations
// - Mouse interaction and drag scrolling features
// The core creative vision, artistic concept, and overall design 
// were developed independently by the student.

// P5.JS LIBRARY:
// This project uses the p5.js library (https://p5js.org/)
// Created by Lauren McCarthy and the Processing Foundation
// Licensed under LGPL 2.1

// ==================== GLOBAL VARIABLES ====================

// Scroll and interaction state variables
let scrollOffset = 0;              // Current vertical scroll position in text area (pixels)
let maxScroll = 0;                 // Maximum scrollable distance calculated from content height
let textContentHeight = 0;         // Total height of all wrapped text content in pixels
let freeButton = null;             // Escaped button object containing position and physics data
let showOriginalManage = true;     // Flag controlling visibility of original manage settings button
let isDragging = false;            // Boolean tracking mouse drag state for text scrolling
let lastMouseY = 0;                // Previous mouse Y coordinate for drag distance calculation

// ==================== P5.JS CORE FUNCTIONS ====================

function setup() {
    // Create full-screen canvas for immersive cookie modal experience
    let canvas = createCanvas(windowWidth, windowHeight);
    // Attach canvas to specific HTML container element
    canvas.parent('p5-container');  
    
    // Set default font to Azeret Mono for consistent typography throughout interface
    textFont('Azeret Mono');
    
    // Log initialization for debugging purposes
    console.log("Canvas initialized:", windowWidth + "x" + windowHeight);
}

function draw() {
    // Clear previous frame content to prevent visual artifacts
    clear();
    
    // Draw semi-transparent overlay covering entire screen (cookie modal backdrop)
    fill(0, 0, 0, 153);            // Black with 60% opacity (153/255 = 0.6)
    noStroke();                     // Remove border outline
    rect(0, 0, width, height);     // Fill entire canvas area
    
    // Calculate responsive banner dimensions based on screen size
    let bannerWidth = min(width * 0.8, 600);   // 80% of screen width, maximum 600px
    let bannerHeight = min(height * 0.6, 400); // 60% of screen height, maximum 400px
    let bannerX = (width - bannerWidth) / 2;   // Center horizontally on screen
    let bannerY = (height - bannerHeight) / 2; // Center vertically on screen
    
    // Draw main banner background with sharp rectangular corners
    fill(255);                      // White background for readability
    noStroke();                     // No border outline
    rect(bannerX, bannerY, bannerWidth, bannerHeight); // Main modal container
    
    // Calculate responsive text sizes based on banner dimensions
    let titleSize = min(width * 0.04, 32);     // Title font size: 4% of width, max 32px
    let bodySize = min(width * 0.02, 16);      // Body font size: 2% of width, max 16px
    let padding = bannerWidth * 0.08;          // Internal padding: 8% of banner width
    let textMaxWidth = bannerWidth - (padding * 2) - 20; // Available width for text (minus scrollbar)
    
    // Configure and draw title text
    fill(0);                        // Black text for high contrast
    noStroke();                     // No text outline
    textAlign(LEFT);                // Left-align text for readability
    textSize(titleSize);            // Apply calculated title size
    textStyle(BOLD);                // Bold font weight for emphasis
    
    // Smart title wrapping to ensure exactly 2 lines with no widows/orphans
    let titleText = "WE USE COOKIES TO IMPROVE YOUR EXPERIENCE!";
    let titleLines = wrapTitleSmartly(titleText, textMaxWidth + 20, titleSize);
    
    // Render each line of wrapped title text
    for (let i = 0; i < titleLines.length; i++) {
        text(titleLines[i], 
             bannerX + padding,                               // X position with padding
             bannerY + padding + titleSize + (i * titleSize * 1.2)); // Y position with line spacing
    }
    
    // Calculate dimensions for scrollable text area
    let titleHeight = titleLines.length * titleSize * 1.2;   // Total height of title section
    let textAreaY = bannerY + padding + titleSize + titleHeight + 10; // Start Y of scrollable area
    let buttonHeight = max(40, bannerHeight * 0.12);         // Button height: 12% of banner, min 40px
    let textAreaHeight = bannerY + bannerHeight - padding - buttonHeight - 20 - textAreaY; // Remaining height
    
    // Configure body text display
    textStyle(NORMAL);              // Remove bold formatting for body text
    textSize(bodySize);             // Set body text size
    
    // Long cookie policy text (intentionally verbose for artistic effect)
    let bodyText = "We and our trusted partners use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and deliver personalized content and advertisements. These essential tools help us understand how you interact with our website, remember your preferences, and provide you with relevant offers tailored to your interests. By continuing to use this site, you consent to our collection of data including your location, device information, browsing history, and interaction patterns, which may be shared with third-party vendors for analytics, marketing, and service improvement purposes. We are committed to protecting your privacy while delivering the best possible user experience through data-driven personalization.";
    
    // Process text for scrollable display
    let lines = wrapText(bodyText, textMaxWidth, bodySize);   // Break text into wrapped lines
    let lineHeight = bodySize * 1.4;                         // Line spacing: 140% of font size
    textContentHeight = lines.length * lineHeight;           // Calculate total content height
    maxScroll = max(0, textContentHeight - textAreaHeight);  // Calculate maximum scroll needed
    
    // Create clipping mask to contain scrolling text within designated area
    drawingContext.save();                                    // Save current drawing state
    drawingContext.beginPath();                              // Begin clipping path definition
    drawingContext.rect(bannerX + padding, textAreaY, textMaxWidth, textAreaHeight); // Define clip rectangle
    drawingContext.clip();                                   // Apply clipping mask
    
    // Render visible text lines with scroll offset applied
    for (let i = 0; i < lines.length; i++) {
        // Calculate line Y position with scroll offset applied
        let lineY = textAreaY + (i * lineHeight) - scrollOffset + bodySize;
        
        // Only draw lines visible within text area (performance optimization)
        if (lineY > textAreaY - lineHeight && lineY < textAreaY + textAreaHeight + lineHeight) {
            text(lines[i], bannerX + padding, lineY);       // Draw individual text line
        }
    }
    
    drawingContext.restore();                                // Restore drawing state (remove clipping)
    
    // Draw scrollbar when content exceeds visible area
    if (maxScroll > 0) {
        // Calculate scrollbar dimensions and position
        let scrollBarX = bannerX + bannerWidth - padding - 12; // Right side of text area
        let scrollBarY = textAreaY;                          // Align with text area top
        let scrollBarHeight = textAreaHeight;                // Match text area height
        
        // Draw scrollbar background track
        fill(200);                                           // Light gray color
        noStroke();                                          // No border
        rect(scrollBarX, scrollBarY, 8, scrollBarHeight);   // Vertical track rectangle
        
        // Calculate and draw scrollbar thumb (draggable indicator)
        let thumbHeight = max(20, (textAreaHeight / textContentHeight) * scrollBarHeight); // Proportional size
        let thumbY = scrollBarY + (scrollOffset / maxScroll) * (scrollBarHeight - thumbHeight); // Position based on scroll
        
        fill(100);                                           // Darker gray for thumb visibility
        rect(scrollBarX, thumbY, 8, thumbHeight);           // Thumb rectangle
    }
    
    // Calculate button layout (two centered buttons)
    let buttonWidth = bannerWidth * 0.3;                    // Each button: 30% of banner width
    let buttonSpacing = 20;                                  // Fixed 20px gap between buttons
    let totalButtonWidth = (buttonWidth * 2) + buttonSpacing; // Total width of button group
    let button1X = bannerX + (bannerWidth - totalButtonWidth) / 2; // Center the button group
    let button2X = button1X + buttonWidth + buttonSpacing;  // Position second button
    let buttonY = bannerY + bannerHeight - buttonHeight - padding; // Bottom of banner
    
    // Check mouse proximity to original manage settings button for escape behavior
    let distanceToOriginalManage = dist(mouseX, mouseY, button1X + buttonWidth/2, buttonY + buttonHeight/2);
    let escapeDistance = 100;                                // Distance threshold for escape trigger
    
    // Trigger button escape animation when mouse approaches
    if (distanceToOriginalManage < escapeDistance && showOriginalManage && !freeButton) {
        // Create escaped button object with initial physics properties
        freeButton = {
            x: button1X + buttonWidth/2,                    // Start at original button center X
            y: buttonY + buttonHeight/2,                     // Start at original button center Y
            width: buttonWidth,                              // Maintain original width
            height: buttonHeight,                            // Maintain original height
            vx: random(-15, 15),                            // Random horizontal velocity
            vy: random(-15, 15),                            // Random vertical velocity
            targetX: random(buttonWidth, width - buttonWidth), // Random target X (unused)
            targetY: random(buttonHeight, height - buttonHeight) // Random target Y (unused)
        };
        showOriginalManage = false;                          // Hide original static button
        console.log("Manage Settings button escaped!");     // Log escape event
    }
    
    // CONSISTENT BUTTON STYLING - Calculate uniform button text size
    let buttonTextSize = min(buttonWidth * 0.13, 16);       // Consistent text size for both buttons
    
    // Draw original Manage Settings button (when not escaped)
    if (showOriginalManage) {
        fill(220);                                           // Light gray background
        noStroke();                                          // No border
        rect(button1X, buttonY, buttonWidth, buttonHeight); // Button rectangle
        
        // Draw button text with consistent styling
        fill(0);                                             // Black text
        textAlign(CENTER);                                   // Center text in button
        textSize(buttonTextSize);                           // Use consistent text size
        textStyle(BOLD);                                     // Bold font weight
        text("Manage Settings", button1X + buttonWidth/2, buttonY + buttonHeight/2 + 6); // Centered text
    }
    
    // Draw Accept All button with matching styling
    fill(34, 139, 34);                                      // Forest green background
    noStroke();                                              // No border
    rect(button2X, buttonY, buttonWidth, buttonHeight);     // Button rectangle
    
    // Draw Accept All button text with consistent styling
    fill(255);                                               // White text for contrast
    textAlign(CENTER);                                       // Center text in button
    textSize(buttonTextSize);                               // Same text size as other button
    textStyle(BOLD);                                         // Bold font weight
    text("Accept All", button2X + buttonWidth/2, buttonY + buttonHeight/2 + 6); // Centered text
    
    // Update and render the escaped button if it exists
    if (freeButton) {
        updateFreeButton(freeButton);                        // Apply physics and mouse avoidance
        drawFreeButton(freeButton);                          // Render escaped button at current position
    }
}

// ==================== PHYSICS AND ANIMATION ====================

/**
 * Physics and behavior system for the escaped Manage Settings button
 * Implements mouse avoidance, screen boundary collision, and movement damping
 * @param {Object} btn - Button object containing position, velocity, and dimension data
 */
function updateFreeButton(btn) {
    let distanceToMouse = dist(mouseX, mouseY, btn.x, btn.y);
    let fleeDistance = 250; // Increased detection range
    
    if (distanceToMouse < fleeDistance && distanceToMouse > 0) {
        // Calculate normalized direction vector (more precise)
        let dirX = (btn.x - mouseX) / distanceToMouse;
        let dirY = (btn.y - mouseY) / distanceToMouse;
        
        // Non-linear force curve for more dramatic effect
        let normalizedDist = distanceToMouse / fleeDistance;
        let forceMultiplier = pow(1 - normalizedDist, 2.5); // Exponential falloff
        let force = forceMultiplier * 15; // Base force strength
        
        // Apply force in the flee direction
        btn.vx += dirX * force;
        btn.vy += dirY * force;
        
        // Add slight randomness for more natural movement
        btn.vx += random(-1, 1);
        btn.vy += random(-1, 1);
    }
    
    // Smooth position update with interpolation
    btn.x += btn.vx;
    btn.y += btn.vy;
    
    // FIXED: Allow button center to reach screen edges (no margin restriction)
    // The button can now use the full screen space
    if (btn.x <= btn.width/2) {
        btn.x = btn.width/2;
        btn.vx = abs(btn.vx) * 0.7; // Bounce with energy loss
    } else if (btn.x >= width - btn.width/2) {
        btn.x = width - btn.width/2;
        btn.vx = -abs(btn.vx) * 0.7;
    }
    
    if (btn.y <= btn.height/2) {
        btn.y = btn.height/2;
        btn.vy = abs(btn.vy) * 0.7;
    } else if (btn.y >= height - btn.height/2) {
        btn.y = height - btn.height/2;
        btn.vy = -abs(btn.vy) * 0.7;
    }
    
    // Progressive damping - faster when moving fast, slower when slow
    let currentSpeed = sqrt(btn.vx * btn.vx + btn.vy * btn.vy);
    let dampingFactor = map(currentSpeed, 0, 30, 0.99, 0.94);
    btn.vx *= dampingFactor;
    btn.vy *= dampingFactor;
    
    // Dynamic speed limiting
    let maxSpeed = 30;
    if (currentSpeed > maxSpeed) {
        let scale = maxSpeed / currentSpeed;
        btn.vx *= scale;
        btn.vy *= scale;
    }
    
    // Stop tiny movements to prevent jitter
    if (currentSpeed < 0.1) {
        btn.vx = 0;
        btn.vy = 0;
    }
}

/**
 * Render the escaped Manage Settings button at its current physics-driven position
 * @param {Object} btn - Button object containing current position and dimension data
 */
function drawFreeButton(btn) {
    // Draw button background rectangle centered at current position
    fill(220);                                               // Light gray background (matches original)
    noStroke();                                              // No border outline
    rect(btn.x - btn.width/2, btn.y - btn.height/2, btn.width, btn.height); // Centered rectangle
    
    // CONSISTENT ESCAPED BUTTON STYLING
    let buttonTextSize = min(btn.width * 0.13, 16);         // Use same calculation as static buttons
    
    // Draw button text with consistent sizing
    fill(0);                                                 // Black text color
    textAlign(CENTER);                                       // Center text alignment
    textSize(buttonTextSize);                               // Same text size as static buttons
    textStyle(BOLD);                                         // Bold font weight
    text("Manage Settings", btn.x, btn.y + 6);              // Draw text at button center with vertical offset
}

// ==================== TEXT PROCESSING UTILITIES ====================

/**
 * Smart title wrapping that ensures exactly 2 lines with no widows/orphans
 * Forces at least 2 words on the second line
 * @param {string} txt - Input title text to be wrapped
 * @param {number} maxWidth - Maximum pixel width for each line
 * @param {number} fontSize - Font size for accurate width calculation
 * @returns {Array} Array of exactly 2 wrapped title lines
 */
function wrapTitleSmartly(txt, maxWidth, fontSize) {
    let words = txt.split(' ');
    textSize(fontSize);
    
    // If we can fit everything on one line, force a split anyway for 2-line requirement
    if (textWidth(txt) <= maxWidth) {
        // Find a good split point - aim for roughly equal distribution
        let midPoint = Math.floor(words.length / 2);
        
        // Adjust to ensure at least 2 words on second line
        if (words.length - midPoint < 2) {
            midPoint = words.length - 2;
        }
        
        let line1 = words.slice(0, midPoint).join(' ');
        let line2 = words.slice(midPoint).join(' ');
        
        return [line1, line2];
    }
    
    // Find the best split point that fits within width constraints
    // and ensures at least 2 words on the second line
    let bestSplit = -1;
    
    for (let i = 1; i < words.length - 1; i++) { // Start at 1, end before last word to ensure 2+ words remain
        let line1 = words.slice(0, i).join(' ');
        let line2 = words.slice(i).join(' ');
        
        // Check if both lines fit and second line has at least 2 words
        if (textWidth(line1) <= maxWidth && 
            textWidth(line2) <= maxWidth && 
            words.slice(i).length >= 2) {
            bestSplit = i;
        }
    }
    
    // If no good split found, use fallback
    if (bestSplit === -1) {
        bestSplit = Math.max(1, words.length - 2); // Ensure at least 2 words on second line
    }
    
    let line1 = words.slice(0, bestSplit).join(' ');
    let line2 = words.slice(bestSplit).join(' ');
    
    return [line1, line2];
}

/**
 * Break text into lines that fit within specified pixel width
 * Uses greedy line-breaking algorithm with word boundaries
 * @param {string} txt - Input text to be wrapped
 * @param {number} maxWidth - Maximum pixel width for each line
 * @param {number} fontSize - Font size for accurate width calculation
 * @returns {Array} Array of wrapped text lines
 */
function wrapText(txt, maxWidth, fontSize) {
    let words = txt.split(' ');                             // Split input into individual words
    let lines = [];                                          // Array to store resulting wrapped lines
    let currentLine = '';                                    // Current line being constructed
    
    textSize(fontSize);                                      // Set font size for width calculations
    
    // Process each word and build lines
    for (let i = 0; i < words.length; i++) {
        let testLine = currentLine + words[i] + ' ';        // Test adding next word to current line
        let testWidth = textWidth(testLine);                // Calculate pixel width of test line
        
        // If adding word would exceed max width and current line has content
        if (testWidth > maxWidth && currentLine !== '') {
            lines.push(currentLine.trim());                 // Complete current line and add to array
            currentLine = words[i] + ' ';                   // Start new line with current word
        } else {
            currentLine = testLine;                          // Add word to current line
        }
    }
    
    // Add final line if it contains any content
    if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
    }
    
    return lines;                                            // Return array of wrapped lines
}

// ==================== USER INTERACTION HANDLERS ====================

/**
 * Handle mouse wheel events for scrolling text content
 * @param {Object} event - Mouse wheel event containing delta information
 */
function mouseWheel(event) {
    // Only process scroll events if content is scrollable
    if (maxScroll > 0) {
        scrollOffset += event.delta;                        // Apply scroll delta to offset
        scrollOffset = constrain(scrollOffset, 0, maxScroll); // Clamp to valid scroll range
        return false;                                        // Prevent default browser scrolling
    }
}

/**
 * Handle mouse drag events for text area scrolling
 * Called continuously while mouse button is held down and mouse moves
 */
function mouseDragged() {
    // Only process drag if actively dragging within scrollable content
    if (isDragging && maxScroll > 0) {
        let deltaY = mouseY - lastMouseY;                   // Calculate vertical mouse movement
        scrollOffset -= deltaY;                             // Apply inverse scroll (natural scroll direction)
        scrollOffset = constrain(scrollOffset, 0, maxScroll); // Clamp to valid scroll range
        lastMouseY = mouseY;                                 // Update previous mouse position for next frame
    }
}

/**
 * Handle mouse release events to end drag scrolling
 */
function mouseReleased() {
    isDragging = false;                                      // Disable drag scrolling state
}

/**
 * Handle mouse press events for starting drag scrolling and button clicks
 * Performs hit testing for different interactive areas
 */
function mousePressed() {
    // Recalculate layout dimensions for accurate hit testing
    let bannerWidth = min(width * 0.8, 600);
    let bannerHeight = min(height * 0.6, 400);
    let bannerX = (width - bannerWidth) / 2;
    let bannerY = (height - bannerHeight) / 2;
    let padding = bannerWidth * 0.08;
    let titleSize = min(width * 0.04, 32);
    let titleText = "WE USE COOKIES TO IMPROVE YOUR EXPERIENCE!";
    let titleLines = wrapTitleSmartly(titleText, bannerWidth - (padding * 2) + 20, titleSize);
    let titleHeight = titleLines.length * titleSize * 1.2;
    let textAreaY = bannerY + padding + titleSize + titleHeight + 10;
    let buttonHeight = max(40, bannerHeight * 0.12);
    let textAreaHeight = bannerY + bannerHeight - padding - buttonHeight - 20 - textAreaY;
    
    // Check if mouse click is within text area to initiate drag scrolling
    if (mouseX >= bannerX + padding && mouseX <= bannerX + bannerWidth - padding &&
        mouseY >= textAreaY && mouseY <= textAreaY + textAreaHeight) {
        isDragging = true;                                   // Enable drag scrolling mode
        lastMouseY = mouseY;                                 // Store initial mouse Y position
        return;                                              // Exit early to prevent button processing
    }
    
    // Calculate button positions for click detection
    let buttonWidth = bannerWidth * 0.3;
    let buttonSpacing = 20;
    let totalButtonWidth = (buttonWidth * 2) + buttonSpacing;
    let button1X = bannerX + (bannerWidth - totalButtonWidth) / 2;
    let button2X = button1X + buttonWidth + buttonSpacing;
    let buttonY = bannerY + bannerHeight - buttonHeight - padding;
    
    // Check if Accept All button was clicked
    if (mouseX >= button2X && mouseX <= button2X + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
        console.log("✅ Cookies accepted!");                // Log acceptance
        window.location.href = "camera.html";               // Navigate to camera page
        freeButton = null;                                   // Clean up escaped button
        showOriginalManage = true;                           // Reset manage button visibility
    }
    
    // Check if the escaped Manage Settings button was clicked (challenging due to movement)
    if (freeButton) {
        let distanceToFreeButton = dist(mouseX, mouseY, freeButton.x, freeButton.y);
        // Use radius-based hit detection for moving button
        if (distanceToFreeButton < freeButton.width/2) {
            console.log("🎉 You caught the escaped button!"); // Log successful click
            freeButton = null;                               // Remove escaped button
            showOriginalManage = true;                       // Restore original static button
        }
    }
}

/**
 * Handle browser window resize events
 * Resets canvas dimensions and button states for new layout
 */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);                 // Adjust canvas to new window dimensions
    freeButton = null;                                       // Reset escaped button (prevents layout issues)
    showOriginalManage = true;                              // Reset to initial button state
    console.log("Canvas resized to:", windowWidth + "x" + windowHeight); // Log resize event
}