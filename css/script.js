document.addEventListener('DOMContentLoaded', () => {
    // Mouse Glow Logic
    const mouseGlow = document.getElementById('mouse-glow');
    window.addEventListener('mousemove', (e) => {
        if (mouseGlow) {
            mouseGlow.style.left = `${e.clientX}px`;
            mouseGlow.style.top = `${e.clientY}px`;
        }
    });

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Mobile Slider Fix: Force visible immediately
            if (window.innerWidth <= 768 && (
                entry.target.classList.contains('glass-card') ||
                entry.target.classList.contains('gallery-item')
            )) {
                entry.target.classList.add('visible');
                entry.target.style.transitionDelay = "0s";
                return;
            }

            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || "0s";
                entry.target.style.transitionDelay = delay;
                entry.target.classList.add('visible');
            } else {
                // Keep visible once revealed to prevent flickering
                // entry.target.classList.remove('visible'); 
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-text, .glass-card, .gallery-item');
    elements.forEach((el, index) => {
        if (el.classList.contains('glass-card') && !el.dataset.delay) {
            el.dataset.delay = `${(0.2 * (index % 3))}s`;
        }
        observer.observe(el);
    });

    // Stat Count-Up Logic
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.dataset.target);
                const duration = 2000; // 2 seconds
                let start = 0;
                const increment = target / (duration / 16); // 16ms per frame

                const updateCount = () => {
                    start += increment;
                    if (start < target) {
                        stat.textContent = Math.ceil(start);
                        requestAnimationFrame(updateCount);
                    } else {
                        stat.textContent = target;
                    }
                };
                updateCount();
                statsObserver.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));

    // Optimized Navbar & Scroll Progress Logic
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;

    const updateScrollEffects = () => {
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // Update Scroll Progress Bar
        if (scrollProgress && scrollHeight > 0) {
            const progress = (currentScrollY / scrollHeight) * 100;
            scrollProgress.style.width = `${progress}%`;
        }

        // Navbar Logic
        if (currentScrollY <= 10) {
            navbar.classList.add('at-top');
            navbar.classList.remove('hidden');
        } else {
            navbar.classList.remove('at-top');

            // Scroll Direction Detection
            const diff = currentScrollY - lastScrollY;
            if (Math.abs(diff) > 10) {
                if (diff > 0 && currentScrollY > 150) {
                    navbar.classList.add('hidden');
                } else if (diff < 0) {
                    navbar.classList.remove('hidden');
                }
            }
        }

        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateScrollEffects();
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    updateScrollEffects();

    // Modal Logic
    const modal = document.querySelector('.modal');
    const openModalBtn = document.querySelector('.cta-button');
    const closeModalBtn = document.querySelector('.close-button');
    const bookingForm = document.getElementById('booking-form');

    const openModal = () => {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const eventType = document.getElementById('event-type').value;
            const eventDate = document.getElementById('event-date').value;
            const interests = Array.from(document.querySelectorAll('input[name="interest"]:checked')).map(cb => cb.value);
            const crowdSize = document.getElementById('crowd-size').value;

            const message = `*New Inquiry for AV Production*%0A%0A` +
                `*Event Type:* ${eventType}%0A` +
                `*Event Date:* ${eventDate}%0A` +
                `*Interested In:* ${interests.join(', ')}%0A` +
                `*Crowd Size:* ${crowdSize}`;

            window.open(`https://wa.me/962796223983?text=${message}`, '_blank');

            // EmailJS check
            if (window.emailjs) {
                window.emailjs.send("service_default", "template_default", {
                    event_type: eventType,
                    event_date: eventDate,
                    interests: interests.join(', '),
                    crowd_size: crowdSize
                });
            }

            closeModal();
        });
    }
    // Force-hide Spline UI (Watermark & Pointer) via Shadow DOM bypass
    const spline = document.querySelector('spline-viewer');
    if (spline) {
        const hideSplineUI = () => {
            const shadowRoot = spline.shadowRoot;
            if (shadowRoot) {
                const style = document.createElement('style');
                style.textContent = `
                    #logo, #hint, #loading, #interaction-hint, #preloader,
                    .spline-watermark, .spline-hint-container, .spline-loading,
                    [id*="hint"], [class*="hint"], [id*="logo"], [id*="watermark"],
                    div[style*="pointer-events: none"] { 
                        display: none !important; 
                        opacity: 0 !important; 
                        visibility: hidden !important; 
                        pointer-events: none !important; 
                        width: 0 !important;
                        height: 0 !important;
                    }
                `;
                shadowRoot.appendChild(style);
            }
        };

        hideSplineUI();
        spline.addEventListener('load', hideSplineUI);

        // Repeated check for late-loading elements (Optimized)
        let attempts = 0;
        const interval = setInterval(() => {
            hideSplineUI();
            if (++attempts > 5) clearInterval(interval);
        }, 2000);
    }

    // Hide Scroll Hints on Interaction
    const sliderContainers = document.querySelectorAll('.services-grid, .gallery-grid');
    sliderContainers.forEach(container => {
        container.addEventListener('scroll', () => {
            const hint = container.parentElement.querySelector('.scroll-hint-overlay');
            if (hint && container.scrollLeft > 20) {
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 500);
            }
        }, { once: true });
    });
});
