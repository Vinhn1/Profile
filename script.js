document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. INTERACTIVE MOUSE GLOW BACKGROUND (OPTIMIZED WITH GPU & LERP)
       ========================================================================== */
    const cursorGlow = document.getElementById('cursorGlow');
    
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    let isGlowAnimating = false;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Show the cursor glow when mouse starts moving
        if (cursorGlow.style.opacity === '0' || !cursorGlow.style.opacity) {
            cursorGlow.style.opacity = '1';
        }
        
        // Start the animation loop if it's not already running
        if (!isGlowAnimating) {
            isGlowAnimating = true;
            requestAnimationFrame(updateGlowPosition);
        }
    });

    function updateGlowPosition() {
        // Linear Interpolation (lerp) for high-end smooth trailing effect (0.08 is the speed)
        const speed = 0.08;
        glowX += (mouseX - glowX) * speed;
        glowY += (mouseY - glowY) * speed;
        
        // Translate3d forces GPU hardware acceleration and completely avoids layout thrashing
        cursorGlow.style.transform = `translate3d(calc(${glowX}px - 50%), calc(${glowY}px - 50%), 0)`;
        
        // Continue animation if we haven't converged yet
        if (Math.abs(mouseX - glowX) > 0.1 || Math.abs(mouseY - glowY) > 0.1) {
            requestAnimationFrame(updateGlowPosition);
        } else {
            isGlowAnimating = false;
        }
    }

    // Hide cursor glow when mouse leaves the viewport
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    /* ==========================================================================
       2. DYNAMIC CARD REFLECTION (OPTIMIZED BY CACHING BOUNDING RECT)
       ========================================================================== */
    const bentoCards = document.querySelectorAll('.bento-card');
    
    bentoCards.forEach(card => {
        let cachedRect = null;
        
        // Cache the bounding rectangle when mouse enters the card
        card.addEventListener('mouseenter', () => {
            cachedRect = card.getBoundingClientRect();
        });
        
        card.addEventListener('mousemove', (e) => {
            // Fallback in case mouseenter event was skipped
            if (!cachedRect) {
                cachedRect = card.getBoundingClientRect();
            }
            
            // Calculate coordinates using cached rect to avoid constant layout reflows (forced layouts)
            const x = e.clientX - cachedRect.left;
            const y = e.clientY - cachedRect.top;
            
            // Set CSS variables for local lighting
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
        
        // Reset cache on mouse leave or window scroll/resize to ensure alignment remains accurate
        card.addEventListener('mouseleave', () => {
            cachedRect = null;
        });
    });

    /* ==========================================================================
       3. BENTO CARDS SCROLL REVEAL (INTERSECTION OBSERVER)
       ========================================================================== */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add class with a slight staggered delay based on entry order
                setTimeout(() => {
                    entry.target.classList.add('reveal');
                }, index * 80);
                
                // If it's the GPA card, trigger GPA animations
                if (entry.target.classList.contains('gpa-card')) {
                    animateGPA();
                }
                
                // Stop observing after reveal
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    bentoCards.forEach(card => {
        cardObserver.observe(card);
    });

    /* ==========================================================================
       4. GPA ANIMATIONS (CIRCLE PROGRESS & COUNT UP)
       ========================================================================== */
    let gpaAnimated = false;

    function animateGPA() {
        if (gpaAnimated) return;
        gpaAnimated = true;

        const gpaProgress = document.getElementById('gpaProgress');
        const gpaNum = document.getElementById('gpaNum');
        
        const targetGPA = 3.54;
        const maxGPA = 4.00;
        const circumference = 314; // Circumference of circle with r=50 (2 * pi * 50)
        
        // 4a. Animate Circle
        const offset = circumference - (circumference * (targetGPA / maxGPA));
        gpaProgress.style.strokeDashoffset = offset;
        
        // 4b. Animate Number Text (Count up from 0.00 to 3.54)
        let currentGPA = 0;
        const duration = 1800; // milliseconds
        const frameRate = 60; // frames per second
        const totalFrames = (duration / 1000) * frameRate;
        const increment = targetGPA / totalFrames;
        let currentFrame = 0;

        function updateCounter() {
            if (currentFrame < totalFrames) {
                currentGPA += increment;
                gpaNum.innerText = currentGPA.toFixed(2);
                currentFrame++;
                requestAnimationFrame(updateCounter);
            } else {
                gpaNum.innerText = targetGPA.toFixed(2);
            }
        }
        
        // Start counting with a slight delay for visual sync
        setTimeout(updateCounter, 200);
    }

    /* ==========================================================================
       5. COPY EMAIL TO CLIPBOARD
       ========================================================================== */
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const emailVal = document.getElementById('emailVal').innerText;

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(emailVal).then(() => {
                // Success feedback
                const icon = copyEmailBtn.querySelector('i');
                icon.className = 'bx bx-check';
                copyEmailBtn.style.color = '#10b981'; // Green
                copyEmailBtn.setAttribute('title', 'Đã sao chép!');
                
                // Revert after 2 seconds
                setTimeout(() => {
                    icon.className = 'bx bx-copy';
                    copyEmailBtn.style.color = '';
                    copyEmailBtn.setAttribute('title', 'Sao chép Email');
                }, 2000);
            }).catch(err => {
                console.error('Không thể sao chép email: ', err);
            });
        });
    }

    /* ==========================================================================
       6. LINKEDIN LINK PLACEHOLDER ENHACEMENT
       ========================================================================== */
    const linkedinBtn = document.getElementById('linkedinBtn');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', (e) => {
            // Since the user wants to add this to LinkedIn, let's make it alert beautifully or link to a standard profile
            if (linkedinBtn.getAttribute('href') === '#') {
                e.preventDefault();
                alert('Trang profile sẵn sàng kết nối! Hãy thay thế đường dẫn này bằng link LinkedIn cá nhân của bạn trong index.html nhé!');
            }
        });
    }
});
