document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. INTERACTIVE MOUSE GLOW BACKGROUND
       ========================================================================== */
    const cursorGlow = document.getElementById('cursorGlow');
    
    document.addEventListener('mousemove', (e) => {
        // Show the cursor glow when mouse starts moving
        if (cursorGlow.style.opacity === '0' || !cursorGlow.style.opacity) {
            cursorGlow.style.opacity = '1';
        }
        
        // Follow cursor smoothly
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    // Hide cursor glow when mouse leaves the viewport
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    /* ==========================================================================
       2. DYNAMIC CARD REFLECTION (MOUSE REFLECTION IN CARD)
       ========================================================================== */
    const bentoCards = document.querySelectorAll('.bento-card');
    
    bentoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate inside the card
            const y = e.clientY - rect.top;  // y coordinate inside the card
            
            // Set CSS variables for local lighting
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
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
