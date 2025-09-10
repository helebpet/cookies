let scrollOffset = 0;
        let maxScroll = 0;
        let textContentHeight = 0;
        let freeButton = null; // The escaped button object
        let showOriginalManage = true; // Whether to show the original manage settings button
        let albertSansFont;
        let azeretMonoFont;
        let isDragging = false;
        let lastMouseY = 0;

        function preload() {
            // Note: P5.js doesn't directly support web fonts, but we can style with CSS
            // The fonts will be applied via textFont() using CSS font family names
        }

        function setup() {
            console.log("P5.js setup starting...");
            
            // Create canvas with full window dimensions
            let canvas = createCanvas(windowWidth, windowHeight);
            
            // Attach canvas to the main container
            canvas.parent('p5-container');
            
            console.log("Canvas created:", windowWidth + "x" + windowHeight);
        }

        function draw() {
            // Clear any previous content first
            clear();
            
            // Black overlay with 60% opacity
            fill(0, 0, 0, 153); // 153 = 60% of 255 (60% opacity)
            noStroke();
            rect(0, 0, width, height);
            
            // Cookie banner - responsive sizing
            let bannerWidth = min(width * 0.8, 600); // Max width 600px or 80% of screen
            let bannerHeight = min(height * 0.6, 400); // Max height 400px or 60% of screen
            let bannerX = (width - bannerWidth) / 2;
            let bannerY = (height - bannerHeight) / 2;
            
            // Banner background - white
            fill(255);
            noStroke(); // Remove stroke from banner
            rect(bannerX, bannerY, bannerWidth, bannerHeight, 10); // Rounded corners
            
            // Calculate responsive text sizes and spacing
            let titleSize = min(width * 0.04, 32); // Responsive title size
            let bodySize = min(width * 0.02, 16); // Responsive body size
            let padding = bannerWidth * 0.08; // 8% padding
            let textMaxWidth = bannerWidth - (padding * 2) - 20; // Account for scroll bar space
            
            // Title text - Albert Sans font, wrap if needed to fit
            fill(0);
            noStroke(); // Remove stroke from text
            textAlign(LEFT);
            textSize(titleSize);
            textStyle(BOLD);
            
            let titleText = "WE USE COOKIES TO IMPROVE YOUR EXPERIENCE!";
            let titleLines = wrapText(titleText, textMaxWidth + 20, titleSize); // Add back scroll bar space for title
            
            for (let i = 0; i < titleLines.length; i++) {
                text(titleLines[i], 
                     bannerX + padding, 
                     bannerY + padding + titleSize + (i * titleSize * 1.2));
            }
            
            // Calculate text area dimensions
            let titleHeight = titleLines.length * titleSize * 1.2; // Dynamic title height
            let textAreaY = bannerY + padding + titleSize + titleHeight + 10; // 10px gap after title
            let buttonHeight = max(40, bannerHeight * 0.12);
            let textAreaHeight = bannerY + bannerHeight - padding - buttonHeight - 20 - textAreaY; // 20px gap above buttons
            
            // Body text with scrolling - Azeret Mono font
            textStyle(NORMAL);
            textSize(bodySize);
            let bodyText = "We and our trusted partners use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and deliver personalized content and advertisements. These essential tools help us understand how you interact with our website, remember your preferences, and provide you with relevant offers tailored to your interests. By continuing to use this site, you consent to our collection of data including your location, device information, browsing history, and interaction patterns, which may be shared with third-party vendors for analytics, marketing, and service improvement purposes. We are committed to protecting your privacy while delivering the best possible user experience through data-driven personalization.";
            
            // Wrap text manually for better control
            let lines = wrapText(bodyText, textMaxWidth, bodySize);
            let lineHeight = bodySize * 1.4;
            textContentHeight = lines.length * lineHeight;
            
            // Calculate max scroll based on content height vs available area
            maxScroll = max(0, textContentHeight - textAreaHeight);
            
            // Create clipping mask for text area
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.rect(bannerX + padding, textAreaY, textMaxWidth, textAreaHeight);
            drawingContext.clip();
            
            // Draw text with scroll offset
            for (let i = 0; i < lines.length; i++) {
                let lineY = textAreaY + (i * lineHeight) - scrollOffset + bodySize;
                if (lineY > textAreaY - lineHeight && lineY < textAreaY + textAreaHeight + lineHeight) {
                    text(lines[i], bannerX + padding, lineY);
                }
            }
            
            // Restore drawing context
            drawingContext.restore();
            
            // Draw scroll indicator if content is scrollable
            if (maxScroll > 0) {
                // Scroll bar background
                let scrollBarX = bannerX + bannerWidth - padding - 12;
                let scrollBarY = textAreaY;
                let scrollBarHeight = textAreaHeight;
                
                fill(200);
                noStroke();
                rect(scrollBarX, scrollBarY, 8, scrollBarHeight, 4);
                
                // Scroll bar thumb
                let thumbHeight = max(20, (textAreaHeight / textContentHeight) * scrollBarHeight);
                let thumbY = scrollBarY + (scrollOffset / maxScroll) * (scrollBarHeight - thumbHeight);
                
                fill(100);
                rect(scrollBarX, thumbY, 8, thumbHeight, 4);
            }
            
            // Buttons - closer together, with correct order
            let buttonWidth = bannerWidth * 0.3; // 30% of banner width for smaller buttons
            let buttonY = bannerY + bannerHeight - buttonHeight - padding;
            let buttonSpacing = 20; // Fixed spacing between buttons
            let totalButtonWidth = (buttonWidth * 2) + buttonSpacing;
            let button1X = bannerX + (bannerWidth - totalButtonWidth) / 2; // Center the button group
            let button2X = button1X + buttonWidth + buttonSpacing;
            
            // Check if mouse is close to original manage settings button position
            let distanceToOriginalManage = dist(mouseX, mouseY, button1X + buttonWidth/2, buttonY + buttonHeight/2);
            let escapeDistance = 100;
            
            // If mouse gets too close and button hasn't escaped yet, make it escape!
            if (distanceToOriginalManage < escapeDistance && showOriginalManage && !freeButton) {
                // Create the escaped button
                freeButton = {
                    x: button1X + buttonWidth/2,
                    y: buttonY + buttonHeight/2,
                    width: buttonWidth,
                    height: buttonHeight,
                    vx: random(-15, 15), // Random initial velocity
                    vy: random(-15, 15),
                    targetX: random(buttonWidth, width - buttonWidth),
                    targetY: random(buttonHeight, height - buttonHeight)
                };
                showOriginalManage = false; // Hide the original
                console.log("Manage Settings button escaped the banner! 🏃‍♂️");
            }
            
            // Manage Settings button (gray) - escapes when mouse gets close
            if (showOriginalManage) {
                fill(220);
                noStroke();
                rect(button1X, buttonY, buttonWidth, buttonHeight, 5);
                
                fill(0);
                noStroke();
                textAlign(CENTER);
                textSize(min(buttonWidth * 0.13, 16)); // Slightly smaller text for longer text
                textStyle(BOLD);
                text("Manage Settings", button1X + buttonWidth/2, buttonY + buttonHeight/2 + 6);
            }
            
            // Accept All button (green) - always stays in place
            fill(34, 139, 34); // Forest green
            noStroke();
            rect(button2X, buttonY, buttonWidth, buttonHeight, 5);
            
            // Accept button text - Albert Sans font
            fill(255);
            noStroke();
            textAlign(CENTER);
            textSize(min(buttonWidth * 0.15, 18));
            textStyle(BOLD);
            text("Accept All", button2X + buttonWidth/2, buttonY + buttonHeight/2 + 6);
            
            // Handle the escaped free-roaming button
            if (freeButton) {
                updateFreeButton(freeButton);
                drawFreeButton(freeButton);
            }
        }

        // Update the physics and behavior of the escaped button
        function updateFreeButton(btn) {
            // Calculate distance to mouse
            let distanceToMouse = dist(mouseX, mouseY, btn.x, btn.y);
            let fleeDistance = 150; // Distance at which button starts fleeing
            
            if (distanceToMouse < fleeDistance) {
                // Calculate flee direction (away from mouse)
                let angle = atan2(btn.y - mouseY, btn.x - mouseX);
                let force = map(distanceToMouse, 0, fleeDistance, 8, 1);
                
                // Apply flee force
                btn.vx += cos(angle) * force;
                btn.vy += sin(angle) * force;
                
                // Add some randomness for chaos
                btn.vx += random(-3, 3);
                btn.vy += random(-3, 3);
            }
            
            // Apply velocity
            btn.x += btn.vx;
            btn.y += btn.vy;
            
            // Bounce off screen edges
            if (btn.x - btn.width/2 <= 0 || btn.x + btn.width/2 >= width) {
                btn.vx *= -0.7; // Bounce with some energy loss
                btn.x = constrain(btn.x, btn.width/2, width - btn.width/2);
            }
            
            if (btn.y - btn.height/2 <= 0 || btn.y + btn.height/2 >= height) {
                btn.vy *= -0.7; // Bounce with some energy loss
                btn.y = constrain(btn.y, btn.height/2, height - btn.height/2);
            }
            
            // Apply friction
            btn.vx *= 0.96;
            btn.vy *= 0.96;
            
            // Limit maximum speed
            let maxSpeed = 20;
            let speed = sqrt(btn.vx * btn.vx + btn.vy * btn.vy);
            if (speed > maxSpeed) {
                btn.vx = (btn.vx / speed) * maxSpeed;
                btn.vy = (btn.vy / speed) * maxSpeed;
            }
        }

        // Draw the escaped button anywhere on screen
        function drawFreeButton(btn) {
            // Button background
            fill(220);
            noStroke();
            rect(btn.x - btn.width/2, btn.y - btn.height/2, btn.width, btn.height, 5);
            
            // Button text - Albert Sans font
            fill(0);
            noStroke();
            textAlign(CENTER);
            textSize(min(btn.width * 0.13, 16)); // Slightly smaller for longer text
            textStyle(BOLD);
            text("Manage Settings", btn.x, btn.y + 6);
        }

        // Text wrapping function - breaks text into lines that fit within maxWidth
        function wrapText(txt, maxWidth, fontSize) {
            let words = txt.split(' ');
            let lines = [];
            let currentLine = '';
            
            textSize(fontSize); // Set text size for width calculations
            
            for (let i = 0; i < words.length; i++) {
                let testLine = currentLine + words[i] + ' ';
                let testWidth = textWidth(testLine);
                
                if (testWidth > maxWidth && currentLine !== '') {
                    lines.push(currentLine.trim());
                    currentLine = words[i] + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine.trim() !== '') {
                lines.push(currentLine.trim());
            }
            
            return lines;
        }

        // Handle mouse wheel scrolling
        function mouseWheel(event) {
            console.log("Mouse wheel event:", event.delta, "Max scroll:", maxScroll);
            
            if (maxScroll > 0) {
                scrollOffset += event.delta;
                scrollOffset = constrain(scrollOffset, 0, maxScroll);
                console.log("New scroll offset:", scrollOffset);
                return false;
            }
        }

        // Handle drag scrolling
        function mouseDragged() {
            if (isDragging && maxScroll > 0) {
                let deltaY = mouseY - lastMouseY;
                scrollOffset -= deltaY;
                scrollOffset = constrain(scrollOffset, 0, maxScroll);
                lastMouseY = mouseY;
                console.log("Drag scrolling:", scrollOffset);
            }
        }

        function mouseReleased() {
            isDragging = false;
        }

        // Handle button clicks
        function mousePressed() {
            // Check if clicking in text area for drag scrolling
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
            
            if (mouseX >= bannerX + padding && mouseX <= bannerX + bannerWidth - padding &&
                mouseY >= textAreaY && mouseY <= textAreaY + textAreaHeight) {
                isDragging = true;
                lastMouseY = mouseY;
                console.log("Started drag scrolling in text area");
                return; // Don't process button clicks if in text area
            }
            
            // Button click logic
            let buttonWidth = bannerWidth * 0.3;
            let buttonSpacing = 20;
            let totalButtonWidth = (buttonWidth * 2) + buttonSpacing;
            let button1X = bannerX + (bannerWidth - totalButtonWidth) / 2;
            let button2X = button1X + buttonWidth + buttonSpacing;
            let buttonY = bannerY + bannerHeight - buttonHeight - padding;
            
            // Check Accept button click (now button2X)
            if (mouseX >= button2X && mouseX <= button2X + buttonWidth &&
                mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
                console.log("✅ Cookies accepted!");
                freeButton = null;
                showOriginalManage = true;
            }
            
            // Check escaped button click
            if (freeButton) {
                let distanceToFreeButton = dist(mouseX, mouseY, freeButton.x, freeButton.y);
                if (distanceToFreeButton < freeButton.width/2) {
                    console.log("🎉 IMPOSSIBLE! You caught the escaped Manage Settings button!");
                    freeButton = null;
                    showOriginalManage = true;
                }
            }
        }

        // Make the canvas resize when the window is resized
        function windowResized() {
            resizeCanvas(windowWidth, windowHeight);
            // Reset everything on resize
            freeButton = null;
            showOriginalManage = true;
            console.log("Canvas resized to:", windowWidth + "x" + windowHeight);
        }

        // Arrow keys for scrolling
        function keyPressed() {
            if (keyCode === UP_ARROW && maxScroll > 0) {
                scrollOffset = max(0, scrollOffset - 30);
                console.log("Scrolled up:", scrollOffset);
            } else if (keyCode === DOWN_ARROW && maxScroll > 0) {
                scrollOffset = min(maxScroll, scrollOffset + 30);
                console.log("Scrolled down:", scrollOffset);
            }
            
            // Reset button with R key
            if (key === 'r' || key === 'R') {
                freeButton = null;
                showOriginalManage = true;
                console.log("Reset button to banner");
            }
        }