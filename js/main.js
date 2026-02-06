document.addEventListener("DOMContentLoaded", () => {

    // --- SAFETY & PERFORMANCE ---
    let isVisualizerActive = false;
    let hasHeroStarted = false;

    // --- SAFETY NET: FORCE LOAD IF ANIMATION STUCKS ---
    // If for ANY reason (GPU freeze, bug, cache) the splash doesn't finish in 3.5s,
    // we smash the emergency glass and load the site anyway.
    setTimeout(() => {
        if (!hasHeroStarted) {
            console.warn("Splash Timeout: Forcing Hero Start");

            // 1. Force Kill Splash
            const splash = document.getElementById("splash-screen");
            if (splash) splash.style.display = "none";
            document.body.style.overflow = "";

            // 2. Kill Glitch
            const glitchText = document.querySelector(".splash-text-glitch");
            if (glitchText) {
                glitchText.style.display = "none";
                glitchText.style.animation = "none";
            }
            if (typeof gsap !== 'undefined') gsap.killTweensOf(".splash-text-glitch");

            // 3. Start Site
            initHeroAnimations();
        }
    }, 3500); // 3.5 seconds max tolerance


    // --- Smooth Scroll (Lenis + GSAP Integration) ---
    // Using the robust GSAP ticker integration to prevent jitter
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            smoothTouch: false,
        });

        // Synchronize Lenis with GSAP ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }

        // Use GSAP's ticker for the RAF loop
        if (typeof gsap !== 'undefined') {
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            // Fallback
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    // --- Smooth Anchor Scrolling ---
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    if (lenis) {
                        try {
                            lenis.scrollTo(targetElement, { offset: 0, immediate: false });
                        } catch (err) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    } else {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        }
    });

    // --- GSAP Animations ---
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // --- Splash Screen: Concept 3 (Digital Hologram - Performance Fixed) ---
        // Prevent scrolling during splash
        document.body.style.overflow = "hidden";

        // Pre-prepare Hero Elements
        gsap.set(".hero-box h1, .hero-box p, .hero-buttons, .btn-pill", {
            autoAlpha: 0,
            y: 30
        });

        const splashTl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = ""; // Unlock scroll
                // Remove from DOM safely
                setTimeout(() => {
                    const splash = document.getElementById("splash-screen");
                    if (splash) splash.style.display = "none";
                }, 500);
            }
        });

        // 1. Initial State (Black)
        splashTl.set(".splash-text-glitch", { opacity: 0 });
        splashTl.set(".holo-beam", { scaleX: 0, opacity: 1 });

        // 2. Beam Initializes
        splashTl.to(".holo-beam", {
            scaleX: 1,
            duration: 0.4,
            ease: "expo.out"
        })

            // 3. Text Glitches IN
            .to(".splash-text-glitch", {
                opacity: 1,
                duration: 0.1,
                repeat: 5,
                yoyo: true,
                ease: "steps(1)"
            })
            .set(".splash-text-glitch", { opacity: 1 })

            // 4. Beam Scans Vertically
            .to(".holo-beam", {
                height: "100vh",
                opacity: 0,
                duration: 0.8,
                ease: "power2.in"
            }, "<")

            // 5. Digital Stabilize
            .fromTo(".splash-text-glitch",
                { letterSpacing: "20px", scale: 1.1 },
                { letterSpacing: "5px", scale: 1, duration: 1, ease: "bounce.out" }
            )

            // --- PERFORMANCE FIX: TIMELINE CLEANUP ---
            .set(".splash-text-glitch", { display: "none" })

            // 6. FIRE HERO ANIMATIONS (SEQUENTIAL)
            .call(initHeroAnimations)

            // 7. FAST FADE OUT
            .to("#splash-screen", {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            });


        function initHeroAnimations() {
            if (hasHeroStarted) return; // Prevent double firing
            hasHeroStarted = true;

            // --- SAFETY: HARD KILL GLITCH LOOP ---
            gsap.killTweensOf(".splash-text-glitch");
            const glitchText = document.querySelector(".splash-text-glitch");
            if (glitchText) {
                glitchText.style.display = "none";
                glitchText.style.animation = "none";
            }

            // --- 1. Start Visualizer Loop ---
            isVisualizerActive = true;
            drawVisualizer();

            // --- 2. Background Orbs Animation (Float) ---
            setTimeout(() => {
                gsap.to(".orb-1", {
                    y: "random(-50, 50)",
                    x: "random(-50, 50)",
                    duration: "random(10, 20)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });

                gsap.to(".orb-2", {
                    y: "random(-30, 30)",
                    x: "random(-30, 30)",
                    duration: "random(15, 25)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }, 500);

            // --- 3. Hero Content Reveal ---
            const heroTl = gsap.timeline({ delay: 0.1 });

            heroTl
                .to(".hero-box h1", {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                })
                .to(".hero-box p", {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                }, "-=0.5")
                .to(".hero-buttons", {
                    autoAlpha: 1,
                    duration: 0.1
                }, "-=0.5")
                .to(".btn-pill", {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.5)"
                }, "-=0.3");

            // Reveal Audio Visualizer
            gsap.to("#audio-visualizer", {
                opacity: 0.6,
                duration: 1.0,
                delay: 0.2,
                ease: "power2.out"
            });

            // 4. Mouse Parallax (Global - Orbs Only)
            document.addEventListener("mousemove", (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;

                gsap.to(".orb-1", { x: x, y: y, duration: 2, ease: "power2.out" });
                gsap.to(".orb-2", { x: -x, y: -y, duration: 2, ease: "power2.out" });
                gsap.to(".orb-3", { x: x * 0.5, y: y * 0.5, duration: 2, ease: "power2.out" });
            });


            // --- Smart Navbar ---
            const nav = document.querySelector('.nav-wrapper');
            let lastScrollTop = 0;

            ScrollTrigger.create({
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                onUpdate: (self) => {
                    const scrollTop = self.scroll();
                    const direction = self.direction;
                    if (scrollTop > 100) {
                        if (direction === 1) {
                            gsap.to(nav, { yPercent: -150, duration: 0.5, ease: "power2.out", overwrite: true });
                        } else {
                            gsap.to(nav, { yPercent: 0, duration: 0.5, ease: "power2.out", overwrite: true });
                        }
                    } else {
                        gsap.to(nav, { yPercent: 0, duration: 0.5, ease: "power2.out", overwrite: true });
                    }
                }
            });
        } // End initHeroAnimations

        // Scroll Reveals...
        gsap.utils.toArray('.glass-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    end: "bottom 10%",
                    toggleActions: "play none none reverse",
                },
                y: 50,
                scale: 0.9,
                rotationX: 0,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
            });
        });

        // Gallery ...
        gsap.from(".gallery-item", {
            scrollTrigger: {
                trigger: ".gallery-grid",
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none reverse",
            },
            y: 50,
            scale: 0.95,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
        });

        // Contact Section ...
        const contactTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#contact",
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        contactTl.from("#contact h2", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.5)"
        })
            .from(".contact-container", {
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.4");


        // --- Premium Features Implementation ---

        // 1. Audio Visualizer (Optimized Loop)
        const canvas = document.getElementById('audio-visualizer');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let width, height;

            function resizeCanvas() {
                const newWidth = window.innerWidth;
                const newHeight = 150;
                if (canvas.width !== newWidth || canvas.height !== newHeight) {
                    width = canvas.width = newWidth;
                    height = canvas.height = newHeight;
                }
            }
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            const bars = 60;
            let currentHeights = new Array(bars).fill(0);
            let targetHeights = new Array(bars).fill(0);

            function drawVisualizer() {
                if (!isVisualizerActive) return;

                ctx.clearRect(0, 0, width, height);
                const barWidth = width / bars;

                ctx.fillStyle = 'rgba(79, 172, 254, 0.6)';

                for (let i = 0; i < bars; i++) {
                    currentHeights[i] += (targetHeights[i] - currentHeights[i]) * 0.08;

                    if (Math.random() < 0.03) {
                        targetHeights[i] = Math.random() * 100 + 20;
                    }

                    targetHeights[i] -= 1;
                    if (targetHeights[i] < 0) targetHeights[i] = 0;

                    const x = i * barWidth;
                    const h = currentHeights[i];
                    ctx.fillRect(x, height - h, barWidth - 4, h);
                }
                requestAnimationFrame(drawVisualizer);
            }
        }

        // 2. Spotlight & Magnets (DESKTOP ONLY - Wider than 768px)
        if (window.innerWidth > 768) {
            const cursor = document.querySelector('.cursor-spotlight');
            const magnets = document.querySelectorAll('.btn-pill');

            document.addEventListener('mousemove', (e) => {
                if (cursor) {
                    gsap.to(cursor, {
                        x: e.clientX,
                        y: e.clientY,
                        duration: 0.1,
                        autoAlpha: 1,
                        overwrite: "auto"
                    });
                }

                magnets.forEach(btn => {
                    const rect = btn.getBoundingClientRect();
                    const distance = Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2));

                    if (distance < 100) {
                        gsap.to(btn, {
                            x: (e.clientX - (rect.left + rect.width / 2)) / 3,
                            y: (e.clientY - (rect.top + rect.height / 2)) / 3,
                            duration: 0.3
                        });
                    } else {
                        gsap.to(btn, { x: 0, y: 0, duration: 0.3 });
                    }
                });
            });

            // 4. Parallax (3D Tilt - DESKTOP ONLY)
            const galleryItems = document.querySelectorAll('.gallery-item');
            galleryItems.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;

                    gsap.to(card, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        transformPerspective: 1000,
                        duration: 0.5
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5 });
                });
            });
        }
    } // End GSAP Check
}); // End DOMContentLoaded
