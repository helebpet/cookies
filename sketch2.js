let capture;
        
        function setup() {
            createCanvas(windowWidth, windowHeight);
            
            // Create camera capture
            capture = createCapture(VIDEO);
            capture.size(windowWidth, windowHeight);
            capture.hide(); // Hide the default video element
        }

        function draw() {
            background(255);
            
            if (capture.loadedmetadata) {
                // Calculate scaling to cover the entire canvas while maintaining aspect ratio
                let videoAspect = capture.width / capture.height;
                let canvasAspect = width / height;
                
                let drawWidth, drawHeight;
                let offsetX = 0, offsetY = 0;
                
                if (videoAspect > canvasAspect) {
                    // Video is wider than canvas
                    drawHeight = height;
                    drawWidth = height * videoAspect;
                    offsetX = (width - drawWidth) / 2;
                } else {
                    // Video is taller than canvas
                    drawWidth = width;
                    drawHeight = width / videoAspect;
                    offsetY = (height - drawHeight) / 2;
                }
                
                // Draw the camera feed covering the full screen
                image(capture, offsetX, offsetY, drawWidth, drawHeight);
                
                // Apply your duotone.js filter
                if (typeof applyDuotone === 'function') {
                    applyDuotone();
                } else if (typeof duotone === 'function') {
                    duotone();
                } else if (typeof DuoTone === 'function') {
                    DuoTone();
                } else {
                    console.warn('Duotone function not found. Make sure duotone.js is loaded properly.');
                }
            }
        }

        function windowResized() {
            resizeCanvas(windowWidth, windowHeight);
            if (capture) {
                capture.size(windowWidth, windowHeight);
            }
        }