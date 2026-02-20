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

        // Update Scroll Progress Bar & 3D Parallax
        if (scrollHeight > 0) {
            const progress = (currentScrollY / scrollHeight) * 100;
            if (scrollProgress) scrollProgress.style.width = `${progress}%`;
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

            const form = document.getElementById('booking-form');
            const successMsg = document.querySelector('.success-message');
            const modalHeader = document.querySelector('.modal-content h2');
            const modalDesc = document.querySelector('.modal-content p');
            const submitButton = form.querySelector('button[type="submit"]');

            // Basic Validation
            const formData = new FormData(form);
            if (!formData.get('event_type') || !formData.get('location')) {
                alert('Please fill in the required fields (Event Type & Location).');
                return;
            }

            // Disable button to prevent double submit
            submitButton.innerHTML = 'Sending...';
            submitButton.disabled = true;

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        // Success Logic
                        if (form) form.style.display = 'none';
                        if (modalHeader) modalHeader.style.display = 'none';
                        if (modalDesc) modalDesc.style.display = 'none';

                        if (successMsg) {
                            successMsg.style.display = 'block';
                            // Reset form for next time after a delay
                            setTimeout(() => {
                                closeModal();
                                // Scroll to Hero / Top
                                window.scrollTo({ top: 0, behavior: 'smooth' });

                                // Reset UI after closing
                                setTimeout(() => {
                                    form.style.display = 'block';
                                    modalHeader.style.display = 'block';
                                    modalDesc.style.display = 'block';
                                    successMsg.style.display = 'none';
                                    form.reset();
                                    submitButton.innerHTML = 'Send Inquiry';
                                    submitButton.disabled = false;
                                }, 500);
                            }, 3000);
                        } else {
                            closeModal();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    } else {
                        console.log(response);
                        alert('Something went wrong. Please try again later.');
                        submitButton.innerHTML = 'Send Inquiry';
                        submitButton.disabled = false;
                    }
                })
                .catch(error => {
                    console.log(error);
                    alert('Something went wrong. Please try again later.');
                    submitButton.innerHTML = 'Send Inquiry';
                    submitButton.disabled = false;
                });
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

    // --- Luxury Smooth Scroll Engine ---
    const smoothScrollTo = (targetY, duration) => {
        const startY = window.pageYOffset;
        const difference = targetY - startY;
        const startTime = performance.now();

        const easing = (t) => {
            // Cubic ease-in-out for a physical, premium feel
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const step = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            window.scrollTo(0, startY + difference * easing(progress));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Get target position with a bit of offset for the fixed navbar if needed
                // Currently navbar hides on scroll, but let's assume a 20px buffer for aesthetics
                const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset - 20;

                // 1.5 seconds for a "Luxury Slow" glide
                smoothScrollTo(targetY, 1500);

                // Close mobile menu if open (assuming a class like 'active' on nav-links)
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
});
