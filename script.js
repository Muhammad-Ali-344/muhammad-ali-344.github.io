/* ==========================================================================
   MUHAMMAD ALI PORTFOLIO - AAA DARK GAME STUDIO & 3D GENERALIST SCRIPT
   21st.dev Spotlight Physics, 3D Tilt, WebAudio SFX, Modal Engine & Filters
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initBgCanvas();
    initWebAudio();
    initHeroTyping();
    initHeroPortraitParallax();
    initSpotlightAndTilt();
    initNavbarScroll();
    initPortfolioFilters();
    initProjectModals();
    initProfileModal();
    initContactForm();
    // New premium features
    initCustomCursor();
    initScrollProgress();
    initScrollReveal();
    initHeroScrollParallax();
    initMagneticButtons();
});

/* ==========================================================================
   1. AMBIENT CYBER PARTICLE CANVAS (Dark Void Mesh)
   ========================================================================== */
function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 24), 45);

    let mouse = { x: null, y: null, radius: 160 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    class CyberParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2 + 1;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = -(Math.random() * 0.35 + 0.1);
            this.alpha = Math.random() * 0.35 + 0.1;
            this.maxAlpha = this.alpha;
            this.pulse = Math.random() * 0.015 + 0.005;
            this.pulseDir = 1;
            // Electric Cyan or Cyber Amber
            this.color = Math.random() > 0.3 ? '0, 240, 255' : '255, 183, 3';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            this.alpha += this.pulse * this.pulseDir;
            if (this.alpha >= this.maxAlpha || this.alpha <= 0.05) {
                this.pulseDir *= -1;
            }

            if (this.y < -10) this.y = height + 10;
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;

            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < mouse.radius * mouse.radius) {
                    const dist = Math.sqrt(distSq);
                    const angle = Math.atan2(dy, dx);
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= Math.cos(angle) * force * 1.5;
                    this.y -= Math.sin(angle) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new CyberParticle());
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    function animate() {
        if (isVisible) {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Faint distance connectors
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   2. WEB AUDIO SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initWebAudio() {
    const soundToggle = document.getElementById('sound-toggle');
    if (!soundToggle) return;

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = soundToggle.querySelector('i');
        const span = soundToggle.querySelector('span');

        if (soundEnabled) {
            icon.className = 'fa-solid fa-volume-high';
            span.textContent = 'SFX ON';
            playTone(520, 'sine', 0.1);
        } else {
            icon.className = 'fa-solid fa-volume-xmark';
            span.textContent = 'SFX OFF';
        }
    });

    const interactiveBtns = document.querySelectorAll('.btn, .nav-link, .filter-btn, .side-rail-social-btn, .timeline-content, .discipline-card');
    interactiveBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (soundEnabled) playTone(420, 'sine', 0.03, 0.02);
        });
        btn.addEventListener('click', () => {
            if (soundEnabled) playTone(650, 'sine', 0.08, 0.06);
        });
    });
}

function playTone(freq, type = 'sine', duration = 0.1, vol = 0.08) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // AudioContext fallback
    }
}

/* ==========================================================================
   3. HERO ROLE TYPING CYCLER
   ========================================================================== */
function initHeroTyping() {
    const cycler = document.getElementById('role-cycler');
    if (!cycler) return;

    const roles = [
        "3D GENERALIST",
        "VR / XR ARCHITECT",
        "TECHNICAL ARTIST",
        "GAMEPLAY PROGRAMMER",
        "ZBRUSH SCULPTOR"
    ];

    let currentRoleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeLoop() {
        const currentText = roles[currentRoleIdx];

        if (!isDeleting) {
            cycler.textContent = currentText.substring(0, charIdx + 1);
            charIdx++;
            if (charIdx === currentText.length) {
                isDeleting = true;
                setTimeout(typeLoop, 2200); // Pause on complete word
                return;
            }
            typingSpeed = 90;
        } else {
            cycler.textContent = currentText.substring(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) {
                isDeleting = false;
                currentRoleIdx = (currentRoleIdx + 1) % roles.length;
                setTimeout(typeLoop, 400); // Pause before next word
                return;
            }
            typingSpeed = 45;
        }

        setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
}

/* ==========================================================================
   4. HERO PORTRAIT 3D PERSPECTIVE TILT & FLOATING CHIP PARALLAX
   ========================================================================== */
function initHeroPortraitParallax() {
    const stage = document.getElementById('hero-portrait-stage');
    const wrapper = document.getElementById('hero-portrait-wrapper');
    const chip1 = document.getElementById('chip-1');
    const chip2 = document.getElementById('chip-2');
    const chip3 = document.getElementById('chip-3');

    if (!stage || !wrapper) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        targetRotX = -deltaY * 12; // tilt max 12 deg
        targetRotY = deltaX * 12;

        // Inverse parallax for floating chips
        if (chip1) chip1.style.transform = `translate(${deltaX * -15}px, ${deltaY * -15}px)`;
        if (chip2) chip2.style.transform = `translate(${deltaX * -22}px, ${deltaY * -22}px)`;
        if (chip3) chip3.style.transform = `translate(${deltaX * -18}px, ${deltaY * -18}px)`;
    });

    stage.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
        if (chip1) chip1.style.transform = '';
        if (chip2) chip2.style.transform = '';
        if (chip3) chip3.style.transform = '';
    });

    function renderTilt() {
        currentRotX += (targetRotX - currentRotX) * 0.1;
        currentRotY += (targetRotY - currentRotY) * 0.1;

        wrapper.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
        requestAnimationFrame(renderTilt);
    }
    renderTilt();
}

/* ==========================================================================
   5. 21ST.DEV STYLE SPOTLIGHT & CARD TILT
   ========================================================================== */
function initSpotlightAndTilt() {
    const cards = document.querySelectorAll('.spotlight-card');

    cards.forEach(card => {
        let isHovered = false;
        let rafId = null;

        card.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 992 || card.classList.contains('flagship-card')) return;
            isHovered = true;
            // Quick responsive transition on entry
            card.style.transition = 'transform 0.1s ease-out, border-color 0.35s ease, box-shadow 0.35s ease';
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            if (window.innerWidth <= 992 || card.classList.contains('flagship-card')) return;

            // Remove transition during active mouse tracking for true 1:1 real-time 60fps tilt
            card.style.transition = 'none';

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                // Physical real-time 3D tilt: moves with mouse position
                const rotX = -((y - centerY) / centerY) * 12;
                const rotY = ((x - centerX) / centerX) * 12;
                card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03) translateY(-6px)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            if (window.innerWidth <= 992 || card.classList.contains('flagship-card')) return;
            isHovered = false;
            if (rafId) cancelAnimationFrame(rafId);

            // Smooth spring return back to flat
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0px)';

            setTimeout(() => {
                if (!isHovered) {
                    card.style.transform = '';
                    card.style.transition = '';
                }
            }, 520);
        });
    });
}

/* ==========================================================================
   6. NAVBAR SCROLL, ACTIVE SECTIONS & MOBILE DRAWER
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    let isTicking = false;

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            requestAnimationFrame(() => {
                let current = '';
                const scrollPos = window.scrollY + 160;

                sections.forEach(section => {
                    const top = section.offsetTop;
                    const height = section.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        current = section.getAttribute('id');
                    }
                });

                if (current === 'featured') current = 'featured';

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });

                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });

    // Mobile drawer toggle
    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinksContainer.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            });
        });

        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                navLinksContainer.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    }
}

/* ==========================================================================
   7. PORTFOLIO FILTER SYSTEM
   ========================================================================== */
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            gameCards.forEach(card => {
                const categories = (card.dataset.category || '').trim().split(/\s+/);
                const isMatch = (filter === 'all') || categories.includes(filter);

                if (isMatch) {
                    card.classList.remove('is-hidden');
                    card.style.display = 'flex';
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    });
                } else {
                    card.classList.add('is-hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ==========================================================================
   8. PROJECT CASE STUDY DATA STORE (All 16 Projects)
   ========================================================================== */
const projectData = {
    'forgotten-train': {
        title: 'The Forgotten Train: VR Escape',
        subtitle: 'Virtual Reality Multiplayer Puzzle Escape Game · 100% Solo Built from Scratch',
        engine: 'Unity 3D (URP), C#, XR Interaction Toolkit, Photon PUN2 & Photon Voice, Blender 3D, Substance Painter',
        role: 'Solo Developer & 3D Artist (100% Made from Scratch: 3D Models, Textures, Code & UI)',
        image: 'assets/forgotten_train.webp',
        fallbackImage: 'assets/forgotten_train.webp',
        desc: 'An atmospheric VR multiplayer escape room set inside an accelerating vintage Victorian carriage hurtling through misty mountains. Handcrafted 100% independently from scratch: every 3D environment asset, mechanical puzzle prop, and carriage structure was manually modeled in Blender and textured in Substance Painter, paired with custom C# gameplay code, diegetic VR UI, tactile hand physics, and synchronized multiplayer networking.',
        gallery: [
            'assets/forgotten_train.webp',
            'assets/forgotten_train/train_1.webp',
            'assets/forgotten_train/train_2.webp',
            'assets/forgotten_train/train_3.webp',
            'assets/forgotten_train/train_4.webp',
            'assets/forgotten_train/train_5.webp',
            'assets/forgotten_train/train_6.webp'
        ],
        videoDemo: 'placeholder',
        contributions: [
            '100% Solo Development: Handcrafted every single component from scratch without premade asset packs — 3D modeling, texturing, C# programming, VR physics, and spatial UI.',
            '3D Modeling from Scratch: Hand-modeled the vintage Victorian train carriage, interior seating, luggage racks, clockwork mechanisms, keys, lockboxes, and brass gauges in Blender 3D.',
            'Custom PBR Texturing: Hand-authored all PBR material maps (weathered wood grains, polished brass, rusted iron gears, fabric upholstery, frosted glass) in Substance Painter.',
            'VR Physical Interactions: Architected core VR tactile mechanics using Unity XR Interaction Toolkit (two-handed object grabs, socket docking, rotational valves, pull levers, and physical keyhole turning).',
            'Diegetic In-Game UI / UX: Designed immersive in-world VR interfaces, tactile wrist dials, physical notebook clues, and custom haptic feedback for Meta Quest touch controllers.',
            'Multiplayer State Replication: Programmed real-time multiplayer synchronization with Photon PUN2 (hand tracking positions, cooperative puzzle state machines, physical object ownership transfers, and Photon Voice 3D spatial audio).'
        ],
        challenge: 'Synchronizing multi-user physical hand interactions and continuous grab physics across Photon PUN2 without grab jitter, clipping through carriage walls, or state divergence when two players interact with interconnected puzzle mechanisms simultaneously.',
        solution: 'Implemented an authoritative ownership-transfer system using kinematic physics overrides. When a player grabs an interactive object, ownership smoothly transitions to the local client with local velocity prediction and lerped dampening, delivering responsive zero-latency tactile feel while continuously broadcasting authoritative state updates to remote players.',
        specs: [
            { label: 'Role & Scope', val: '100% Solo Creator (Code, 3D Models, Textures, UI & Mechanics)' },
            { label: 'Workflow', val: '100% Made from Scratch (No Premade Asset Packs)' },
            { label: 'Art & Texturing', val: 'Blender 3D, Substance Painter (PBR Materials)' },
            { label: 'Engine & Pipeline', val: 'Unity 3D (URP), C#' },
            { label: 'Target Platforms', val: 'Meta Quest 2/3 / PC VR (SteamVR)' },
            { label: 'Networking & Audio', val: 'Photon PUN2 & Photon Voice 3D Audio' },
            { label: 'Key Toolkits', val: 'XR Interaction Toolkit, Final IK, Physics Hands, Diegetic VR UI' }
        ]
    },
    'selah-charades': {
        title: 'Selah: Bible Charades',
        subtitle: '2D Mobile Party Game · Available on Google Play',
        engine: 'Unity 2D (C# / Mobile / URP)',
        role: 'Lead Unity Developer & Mechanics Programmer',
        image: 'assets/Selah.webp',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.selah.bible.headsup.quiz.games&hl=en-US',
        desc: 'A commercial mobile party guessing game published on Google Play. Designed for rapid forehead gameplay where players guess displayed Bible terms using tilt gestures, with integrated in-game video recording, custom animations, remote content updates, and monetization.',
        gallery: [
            'assets/Selah.webp'
        ],
        contributions: [
            'Architected core game loop using gyroscope and accelerometer tilt inputs with noise filtering for accurate head-up and head-down pass/correct detection.',
            'Integrated Android Native Camera Video API to record player reactions during live gameplay, enabling post-round playback and social sharing.',
            'Created responsive UI/UX system adapting dynamically across multiple mobile screen ratios with punchy tweens and game juice.',
            'Implemented remote config card deck system enabling cloud delivery of new category packs without requiring full app store updates.',
            'Integrated Google Play In-App Purchases (IAP) and Google AdMob mediation for sustainable monetization.'
        ],
        challenge: 'Preventing false-positive tilt detections caused by rapid natural head movements or slight device shakes while maintaining zero-latency response when tipping forward to pass or backward to confirm correct.',
        solution: 'Built an acceleration hysteresis state machine with angle-threshold smoothing and dead-zone filtering, ensuring rock-solid gesture recognition across diverse Android hardware configurations.',
        specs: [
            { label: 'Platform', val: 'Android / Google Play Store (Live)' },
            { label: 'Engine', val: 'Unity 2D (C#)' },
            { label: 'Sensors', val: 'Gyroscope & Accelerometer Hysteresis State Machine' },
            { label: 'Media', val: 'Android Native Video Recording API' },
            { label: 'Monetization', val: 'Google Play IAP & AdMob Mediation' }
        ]
    },
    'jewel-crush': {
        title: 'Jewel Crush Quest: Match 3',
        subtitle: '2D Mobile Match-3 Game · Live on Google Play',
        engine: 'Unity 2D (C# / Mobile UI)',
        role: 'Gameplay Programmer & UI/UX Polish',
        image: 'assets/Jewel_Crush.webp',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kurlybrackets.jewelswap',
        desc: 'A vibrant match-3 mobile puzzle game on Google Play. Enhanced with polished player feedback, interactive tutorial sequences, clean UI panels, and optimized board cascading logic.',
        gallery: ['assets/Jewel_Crush.webp'],
        contributions: [
            'Refactored jewel grid evaluation algorithm for optimal cascading match detection and multi-combo chain multipliers.',
            'Engineered interactive onboarding tutorial overlay that guides first-time players through special jewel combos and booster mechanics.',
            'Designed modern animated popups, level-select maps, score meters, and reward collection screens.',
            'Integrated particle bursts, screen shakes, and audio soundscapes to elevate tactile player satisfaction ("game juice").'
        ],
        challenge: 'Maintaining stable 60 FPS performance on low-end Android devices during massive chained jewel cascading explosions with heavy particle emitters.',
        solution: 'Implemented object pooling for all particle bursts and jewel sprites, alongside batched canvas draws that reduced draw calls from 140+ down to under 25.',
        specs: [
            { label: 'Platform', val: 'Android / Google Play Store' },
            { label: 'Genre', val: 'Match-3 Puzzle / Casual' },
            { label: 'Key Systems', val: 'Cascading Match Algorithm, Interactive Tutorials, Object Pooling' },
            { label: 'Optimization', val: 'Canvas Draw Batching, Particle Pooling, 60 FPS Target' }
        ]
    },
    'block-puzzle': {
        title: '2468 Block Puzzle: 2048 Merge',
        subtitle: '2D Puzzle Game · Firebase Realtime Backend · Google Play',
        engine: 'Unity 2D (C# / Firebase Realtime)',
        role: 'Full Gameplay & Backend Developer',
        image: 'assets/Block_Puzzle.webp',
        desc: 'A 2048-inspired number-merging block puzzle featuring online competitive leaderboards, dynamic grid merging, interactive tutorials, and rewarded video ads.',
        gallery: ['assets/Block_Puzzle.webp'],
        contributions: [
            'Programmed sliding number block merge mechanics with recursive cascade evaluation.',
            'Integrated Firebase Authentication and Firebase Realtime Database for persistent global leaderboard score tracking.',
            'Built responsive HUD layouts with auto-scaling grid slots matching any phone display aspect ratio.',
            'Constructed interactive first-run tutorial system that dynamically detects player swipe gestures to demonstrate merging.'
        ],
        challenge: 'Ensuring cheat-proof, low-latency score submissions to Firebase Realtime Database while maintaining offline capability during network dropouts.',
        solution: 'Engineered a signed local state cache that verifies board move integrity before submitting scores, queuing pending uploads until network connectivity resumes.',
        specs: [
            { label: 'Platform', val: 'Android / Google Play Store' },
            { label: 'Backend', val: 'Firebase Authentication & Realtime Database' },
            { label: 'Key Features', val: 'Global Leaderboards, Swipe Pathing, Responsive Grid Scaling' }
        ]
    },
    'mr-greedy': {
        title: 'Mr Greedy: Ragdoll Punch',
        subtitle: '3D Physics Action Game · Character Ragdoll & Combat Tuning',
        engine: 'Unity 3D (C# / Physics Engine)',
        role: 'Core Mechanics & Physics Programmer',
        image: 'assets/Greedy_Ragdoll .webp',
        desc: 'A hilarious 3D action game featuring active ragdoll physics, spring-joint punch mechanics, dynamic impact camera shakes, interactive tutorial sequences, and cosmetics shop.',
        gallery: ['assets/Greedy_Ragdoll .webp'],
        contributions: [
            'Developed active ragdoll physics system blending baked animations with physical joint forces upon impact.',
            'Implemented spring-driven punch trajectory system with velocity-based hit reactions.',
            'Designed cinematic impact freeze frames, procedural camera shakes, and cartoon hit effects.',
            'Created character customization menu system with persistent skin unlock saves.'
        ],
        challenge: 'Balancing active ragdoll stability to prevent character collapse during locomotion while allowing exaggerated comedic knockbacks upon taking hits.',
        solution: 'Implemented configurable joint drive motors with angular spring dampers that dynamically decrease joint strength proportionally to received damage impulses.',
        specs: [
            { label: 'Engine', val: 'Unity 3D (C#)' },
            { label: 'Physics', val: 'Active Ragdolls, Configurable Joints, Dynamic Impulse Vectors' },
            { label: 'Juice', val: 'Impact Hit-Stun, Cinemachine Shakes, Particle Bursts' }
        ]
    },
    'snake-escape': {
        title: 'Snake Escape: Tap Out Puzzle',
        subtitle: '2D Logic Puzzle Game · Grid Collision & Directional Pathing',
        engine: 'Unity 2D (C# / Grid Algorithms)',
        role: 'Logic & Grid Collision Programmer',
        image: 'assets/Snake_Game.webp',
        desc: 'A strategic logic puzzle where players guide intertwined snakes out of tight grids without colliding into neighboring snakes or obstacles.',
        gallery: ['assets/Snake_Game.webp'],
        contributions: [
            'Built 2D grid path-traversal algorithm that checks head clearance before committing movement sequences.',
            'Implemented segmented body lerping system that smoothly pulls trailing body nodes along recorded path curves.',
            'Constructed progressive level loader with procedural obstacle placement and star ratings.',
            'Designed intuitive touch input handlers supporting tap-to-move and swipe-to-preview paths.'
        ],
        challenge: 'Handling simultaneous multi-tap inputs without causing two colliding snakes to enter the same grid cell concurrently.',
        solution: 'Engineered a reservation-based tile-locking system where tapped snakes immediately claim future path tiles, rejecting conflicting taps on intersecting trajectories.',
        specs: [
            { label: 'Engine', val: 'Unity 2D (C#)' },
            { label: 'Algorithms', val: 'Grid Path Traversal, Segmented Node Interpolation, Tile Reservation' },
            { label: 'Design', val: '100+ Progressive Puzzle Levels, Star Rating System' }
        ]
    },
    'cave-env': {
        title: 'Mystic Grotto: Subterranean Ruins',
        subtitle: 'Unreal Engine 5 · Lumen Real-Time Global Illumination & Nanite',
        engine: 'Unreal Engine 5 (Lumen, Nanite, Volumetrics)',
        role: 'Environment Artist & UE5 Lighting Specialist',
        image: 'assets/cave_env/cave_1.webp',
        desc: 'A cinematic subterranean environment created in Unreal Engine 5. Explores atmospheric lighting in deep cave spaces featuring sky shaft god-rays, crystalline mineral clusters, glowing flora, and real-time Lumen global illumination.',
        gallery: ['assets/cave_env/cave_1.webp'],
        contributions: [
            'Constructed natural cave architecture using high-density Nanite rock assets.',
            'Configured Lumen real-time global illumination with multi-bounce indirect light bouncing from ceiling openings.',
            'Authored volumetric fog shafts with Rayleigh scattering to produce dramatic light beam silhouettes.',
            'Placed emissive crystal formations acting as secondary localized light sources with subsurface scattering.'
        ],
        challenge: 'Balancing deep shadow contrast in cavern recesses without losing visibility or introducing Lumen light noise in dark corners.',
        solution: 'Tuned Lumen Scene Detail and final gather quality alongside subtle sky ambient skylight fill to preserve high-contrast cinematic mood without noisy blotches.',
        specs: [
            { label: 'Engine', val: 'Unreal Engine 5' },
            { label: 'Lighting', val: 'Lumen Real-Time GI, Volumetric Dust Fog, Emissive Crystals' },
            { label: 'Geometry', val: 'Nanite Virtualized High-Density Rock Meshes' }
        ]
    },
    'sword-stone-env': {
        title: 'Excalibur Sanctuary: Medieval Legend',
        subtitle: 'Blender 3D · Modeled & Textured from Scratch · PBR Materials',
        engine: 'Blender 3D (Cycles Rendering) & Substance Painter',
        role: '3D Modeler & PBR Texture Artist',
        image: 'assets/sword_stone/sword_1.webp',
        desc: 'A hero prop and environment composition inspired by Arthurian legend. The legendary blade is embedded in ancient granite surrounded by moss-covered stone masonry, weathered runic etchings, and golden hour volumetric sunbeams.',
        gallery: ['assets/sword_stone/sword_1.webp'],
        contributions: [
            'Modeled hero longsword with filigree crossguard, wire-wrapped grip, and engraved runic blade from scratch in Blender.',
            'Authored weathered steel, aged brass, and granite stone PBR materials with moss edge-wear in Substance 3D Painter.',
            'Built ruined stone circle environment with procedural ivy scattering and weathered flagstones.',
            'Lit the scene using cinematic 3-point lighting combined with atmospheric sunbeam volumetrics.'
        ],
        challenge: 'Achieving realistic edge-wear and oxidized weathering on the sword steel without losing its legendary polished sharpness.',
        solution: 'Layered procedural curvature maps with hand-painted stencil masks in Substance Painter, isolating corrosion to crevices while retaining crisp metallic reflections along blade bevels.',
        specs: [
            { label: 'Software', val: 'Blender 3D, Substance 3D Painter' },
            { label: 'Render Engine', val: 'Blender Cycles (Physically Based Shading)' },
            { label: 'Techniques', val: 'Subdivision Surface, Curvature Masking, Volumetric Sunbeams' }
        ]
    },
    'ruins-env': {
        title: 'Overgrown Sanctuary: Forgotten Ruins',
        subtitle: 'Unreal Engine 5 · Nanite Meshes & Foliage Scattering',
        engine: 'Unreal Engine 5 (Nanite, Lumen, Foliage Systems)',
        role: 'World Builder & Foliage Shader Artist',
        image: 'assets/overgrown_ruins/ruins_1.webp',
        desc: 'An ancient Gothic monastery reclaimed by nature over centuries. Built in UE5 featuring crumbling archways, ivy-draped masonry, wind-swaying foliage shaders, and warm sunset lighting.',
        gallery: [
            'assets/overgrown_ruins/ruins_1.webp',
            'assets/overgrown_ruins/ruins_2.webp'
        ],
        contributions: [
            'Assembled modular architectural ruins using high-fidelity Nanite stone pillars and broken vaulted ceilings.',
            'Authored two-sided foliage wind-flutter shaders in UE5 Material Graph with World Position Offset.',
            'Sculpted terrain blending gravel, cracked soil, and moss using 4-layer landscape painting materials.',
            'Configured atmospheric sunset sky atmosphere with directional solar rays filtering through archways.'
        ],
        challenge: 'Preventing foliage wind animations from causing unnatural stretching or clipping against solid masonry structures.',
        solution: 'Used vertex color masking in the foliage shader to pin root vertices firmly to stone surfaces while allowing progressive branch and leaf sway toward tips.',
        specs: [
            { label: 'Engine', val: 'Unreal Engine 5' },
            { label: 'Tech', val: 'World Position Offset Wind, Nanite Geometry, 4-Layer Landscape' },
            { label: 'Atmosphere', val: 'Golden Sunset Lighting, Volumetric Haze' }
        ]
    },
    'dungeon-env': {
        title: 'Catacombs of the Fallen: Modular Dungeon',
        subtitle: 'Blender & Unreal Engine 5 · Modular Architectural Level Kit',
        engine: 'Blender 3D & Unreal Engine 5 (Lumen, Point Lights)',
        role: 'Modular Kit Modeler & Lighting Artist',
        image: 'assets/dungeon/dungeon_1.webp',
        desc: 'A modular subterranean dungeon kit designed for game-ready level design. Features snap-aligned stone blocks, arched entryways, wall-mounted torch sconces, iron chain props, and dramatic candle point-lighting.',
        gallery: [
            'assets/dungeon/dungeon_1.webp',
            'assets/dungeon/dungeon_2.webp'
        ],
        contributions: [
            'Modeled 25+ modular wall, floor, pillar, arch, and ceiling assets on exact metric grid pivots for seamless snapping.',
            'Baked high-to-low poly normal maps from sculpted zBrush brick details onto optimized low-poly game meshes.',
            'Created modular prop set including wrought-iron chains, wooden barrels, torch brackets, and ritual altar.',
            'Set up dynamic candlelight flickering system with animated point lights and shadow casting.'
        ],
        challenge: 'Eliminating visible seam lines and light leaks along modular wall junctions when lit by intense point lights.',
        solution: 'Built overlapping tongue-and-groove edge geometries on all modular wall ends and snapped vertex normals to eliminate light bleeding across seams.',
        specs: [
            { label: 'Kit Scope', val: '25+ Snap-Ready Modular Assets on 1m Grid' },
            { label: 'Pipeline', val: 'Blender High/Low Poly, Substance Baker, UE5 Lumen' },
            { label: 'Lighting', val: 'Dynamic Candle Point Lights, Volumetric Shadows' }
        ]
    },
    'lighthouse-env': {
        title: 'Coastal Sentinel: Ocean Lighthouse',
        subtitle: 'Unity High Definition Render Pipeline (HDRP) · Dynamic Lighting & Volumetrics',
        engine: 'Unity HDRP, Volumetric Fog & Physically-Based Water System',
        role: 'Environment Artist & Unity HDRP Lighting Specialist',
        image: 'assets/environment/env_1.webp',
        desc: 'A cinematic coastal maritime environment designed and lit in Unity HDRP. Showcases an isolated stone watchtower lighthouse atop rugged sea cliffs, facing vast open ocean waters with physically simulated wave motion, volumetric clouds, sun-position lighting transitions, atmospheric haze, and distant seafaring vessels.',
        gallery: [
            'assets/environment/env_1.webp',
            'assets/environment/env_2.webp',
            'assets/environment/env_3.webp'
        ],
        contributions: [
            'Architected complete maritime coastline scene using Unity High Definition Render Pipeline (HDRP).',
            'Configured physically-based ocean water shader with sub-surface scattering, foam crests, and sun glint reflections.',
            'Created multi-state time-of-day sky profiles comparing Golden Sunset and High Noon solar angles.',
            'Implemented volumetric fog, atmospheric Rayleigh scattering, and dynamic cloud shadow layers.',
            'Sculpted and textured weathered coastal rock cliffs and lighthouse tower with PBR materials.'
        ],
        challenge: 'Simulating physically accurate ocean surface displacement, crest foam, and sun glint reflections simultaneously with heavy volumetric fog in Unity HDRP.',
        solution: 'Authored a custom vertex-displacement water shader interacting with HDRP volumetric fog volumes, featuring Fresnel reflections and wave crest mask buffers.',
        specs: [
            { label: 'Engine & Pipeline', val: 'Unity HDRP' },
            { label: 'Key Features', val: 'Physically Based Sky, Water Shader, Volumetrics, Rock Formations' },
            { label: 'Lighting Profiles', val: 'Sunset / Golden Hour, Midday Sun, Horizon Atmospheric Fog' }
        ]
    },
    'nordic-cabin': {
        title: 'Modern Nordic Cabin: 3D Model',
        subtitle: 'Blender 3D · Modeled & Textured 100% From Scratch · Architectural Rendering',
        engine: 'Blender 3D (Hard-Surface Modeling, Procedural Shaders, Cycles)',
        role: 'Solo 3D Artist (100% Modeled & Textured from Scratch)',
        image: 'assets/cabin/cabin_1.webp',
        desc: 'A modern A-frame Nordic wilderness cabin modeled from the ground up in Blender. Highlights precision architectural hard-surface modeling, charred timber timber-grain texturing, panoramic floor-to-ceiling glass materials, and atmospheric dusk lighting.',
        gallery: ['assets/cabin/cabin_1.webp'],
        contributions: [
            'Hand-modeled architectural framework including angled roof trusses, cantilevered deck, and chimney flue in Blender.',
            'Authored custom procedural PBR wood shader with charred Shou Sugi Ban finish and variable roughness.',
            'Built interior living room set visible through panoramic glass with furniture, warm interior illumination, and fireplace.',
            'Composed cinematic dusk render with warm interior glow contrasting against cool forest twilight.'
        ],
        challenge: 'Achieving realistic glass reflection and interior transmission without excessive Cycles render noise or blown-out highlights.',
        solution: 'Utilized Blender Light Paths node to separate camera-ray transmission from shadow rays, allowing bright interior light to pass through glass without caustic noise.',
        specs: [
            { label: 'Modeling', val: '100% Hand-Crafted in Blender (No Asset Packs)' },
            { label: 'Texturing', val: 'Procedural Wood, Metal, Glass Shaders' },
            { label: 'Lighting', val: 'Exterior Dusk HDRI + Warm 2700K Interior Point Lights' }
        ]
    },
    'isometric-house': {
        title: 'Stylized Isometric House',
        subtitle: 'Blender 3D · 6 Orthographic Camera Views · Hand-Crafted Geometry',
        engine: 'Blender 3D (Stylized Modeling, Custom Shaders, Cycles)',
        role: 'Stylized 3D Modeler & Texture Artist',
        image: 'assets/isometric_house/isometric_1.webp',
        desc: 'A charming stylized cottage diorama modeled in Blender. Features exaggerated proportions, terracotta roof tiles, timber framing, potted plants, and 6 distinct camera inspection angles demonstrating consistent geometry from all sides.',
        gallery: [
            'assets/isometric_house/isometric_1.webp',
            'assets/isometric_house/isometric_2.webp',
            'assets/isometric_house/isometric_3.webp',
            'assets/isometric_house/isometric_4.webp',
            'assets/isometric_house/isometric_5.webp',
            'assets/isometric_house/isometric_6.webp'
        ],
        contributions: [
            'Modeled complete cottage architecture with beveled stylized edges, dormer windows, and stone chimney.',
            'Created individual shingles with slight random rotation offsets to convey playful handcrafted character.',
            'Rendered 6 orthographic and perspective angles showcasing clean topology from every direction.',
            'Set up soft ambient occlusion and cheerful directional key light casting crisp stylized shadows.'
        ],
        challenge: 'Maintaining clean bevel highlights on low-to-mid poly stylized assets without messy shading artifacts or pinching.',
        solution: 'Utilized weighted normals modifiers with bevel weight control, ensuring perfectly flat face shading with crisp stylized edge bevels.',
        specs: [
            { label: 'Style', val: 'Stylized / Isometric Diorama' },
            { label: 'Views', val: '6 Comprehensive Render Angles (Isometric & Perspective)' },
            { label: 'Techniques', val: 'Weighted Normals, Handcrafted Shingles, Ambient Occlusion' }
        ]
    },
    'dragon-car': {
        title: 'Draco GT: 3D Concept Car',
        subtitle: 'Blender 3D · Interactive Before/After Comparison · Organic & Hard-Surface Fusion',
        engine: 'Blender 3D (Subdivision Surface, Sculpting, PBR Materials)',
        role: 'Vehicle & Creature Hybrid Concept Designer',
        image: 'assets/dragon_car/dragon_car_1.webp',
        comparison: {
            before: 'assets/dragon_car/dragon_car_before.webp',
            after: 'assets/dragon_car/dragon_car_after.webp',
            beforeLabel: 'Sculpt / Wireframe',
            afterLabel: 'Final PBR Render'
        },
        desc: 'An aerodynamic concept sports car fusing aggressive modern supercar lines with mythological dragon anatomy. Features biomechanical dragon wings, gold metallic body paint, organic tail fins, and an interactive before/after comparison slider.',
        gallery: [
            'assets/dragon_car/dragon_car_1.webp',
            'assets/dragon_car/dragon_car_2.webp',
            'assets/dragon_car/dragon_car_3.webp'
        ],
        contributions: [
            'Designed concept vehicle marrying automotive aerodynamics with organic creature anatomy.',
            'Modeled precision car bodywork using subdivision surface modeling with continuous reflection curve lines.',
            'Sculpted organic wing structures, scale textures, and tail fins integrated into rear spoiler.',
            'Created high-gloss metallic car paint shader with multi-stage clearcoat and gold flake.'
        ],
        challenge: 'Seamlessly blending hard-surface automotive panels with organic sculpted dragon wing membranes without visible topological seams.',
        solution: 'Employed hybrid retopology workflows, guiding edge loops from the car chassis directly into the wing root bones with matching subdivision densities.',
        specs: [
            { label: 'Concept', val: 'Supercar x Mythological Dragon Biomechanical Hybrid' },
            { label: 'Interactive', val: 'Real-Time Before/After Texture & Sculpt Slider' },
            { label: 'Shaders', val: 'Multi-layer Metallic Flake Car Paint, Matte Wing Membranes' }
        ]
    },
    'dragon-sculpt': {
        title: 'Fire Dragon: 3D Creature Sculpt',
        subtitle: 'Pixologic ZBrush · High-Poly Digital Sculpting & Anatomy',
        engine: 'Pixologic ZBrush (Digital Sculpting, Anatomy, PolyPaint)',
        role: 'High-Poly Digital Sculptor & Creature Artist',
        image: 'assets/dragon/dragon_1.webp',
        comparison: {
            before: 'assets/dragon/dragon_before.webp',
            after: 'assets/dragon/dragon_after.webp',
            beforeLabel: 'High-Poly Sculpt',
            afterLabel: 'Final Render'
        },
        desc: 'A high-detail organic fantasy dragon sculpt created in Pixologic ZBrush. Demonstrates creature anatomy, layered skin folds, muscular wing structures, facial horns, and dramatic fiery renders.',
        gallery: [
            'assets/dragon/dragon_1.webp',
            'assets/dragon/Dragon_2.webp',
            'assets/dragon/Dragon_3.webp',
            'assets/dragon/Dragon_4.webp'
        ],
        contributions: [
            'Sculpted full anatomical creature structure from ZSphere armature up to multi-million polygon mesh.',
            'Detailed individual horn ridges, facial scales, eyelid folds, and throat pouches.',
            'PolyPainted organic skin color variation with warm undertones, countershading, and chest highlights.',
            'Rendered dramatic three-quarter portraits with rim-light highlighting silhouette horn contours.'
        ],
        challenge: 'Maintaining anatomical realism and believable muscle tension across complex posed creature wings.',
        solution: 'Studied bat wing osteology and bird musculoskeletal anatomy, sculpting visible extensor tendons and stretched membrane skin folds across wing phalanges.',
        specs: [
            { label: 'Software', val: 'Pixologic ZBrush (DynaMesh, ZRemesher, PolyPaint)' },
            { label: 'Detail Level', val: 'High-Frequency Scale Detailing & Micro-Folds' },
            { label: 'Interactive', val: 'Real-Time Before/After High-Poly Sculpt Slider' }
        ]
    },
    'neon-bike': {
        title: 'Cyberpunk Neon Bike: 3D Textures',
        subtitle: 'Substance 3D Painter · PBR Materials & Emissive Lighting · 10 Render Angles',
        engine: 'Substance 3D Painter & Marmoset Toolbag (PBR Texturing, Emissive)',
        role: 'PBR Texture Artist & Lighting Specialist',
        image: 'assets/bike/bike_1.webp',
        fallbackImage: 'assets/bike/bike_1.webp',
        desc: 'A texturing showcase featuring a futuristic cyberpunk motorcycle. Demonstrates multi-layer PBR material authoring: scratched carbon fiber, weathered metallic engine blocks, rubber tire wear, emissive neon chassis trims, and 10 studio render angles.',
        gallery: [
            'assets/bike/bike_1.webp',
            'assets/bike/bike_2.webp',
            'assets/bike/bike_3.webp',
            'assets/bike/bike_4.webp',
            'assets/bike/bike_5.webp',
            'assets/bike/bike_6.webp',
            'assets/bike/bike_7.webp',
            'assets/bike/bike_8.webp',
            'assets/bike/bike_9.webp',
            'assets/bike/bike_10.webp'
        ],
        contributions: [
            'Authored complex multi-material PBR sets in Substance 3D Painter across multiple UV texture tiles.',
            'Created realistic surface wear: edge chipping on painted fairings, dust buildup in engine crevices, and tire tread scuffs.',
            'Configured vibrant emissive neon strip materials with bloom and glow interaction.',
            'Produced 10 comprehensive render angles showcasing every chassis, rim, handlebar, and engine detail.'
        ],
        challenge: 'Balancing intense emissive neon glow against subtle surface scratches so the glow doesn\'t wash out surface material detail.',
        solution: 'Authored fine micro-dust and finger smudge roughness masks over the emissive light bars, producing realistic physical light dispersion across dusty glass casings.',
        specs: [
            { label: 'Software', val: 'Substance 3D Painter, Marmoset Toolbag' },
            { label: 'Render Scope', val: '10 High-Resolution Studio Angles' },
            { label: 'Workflow', val: 'PBR Metallic/Roughness & Emissive Shading' }
        ]
    }
};

/* ==========================================================================
   9. CASE STUDY MODAL ENGINE
   ========================================================================== */
function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');

    function openModal(gameKey) {
        const data = projectData[gameKey];
        if (!data) return;

        const roleBadgeHtml = data.role ? `
            <div style="margin: 0.6rem 0 0.8rem 0;">
                <span class="game-role-badge" style="font-size:0.85rem; padding: 0.4rem 0.8rem;"><i class="fa-solid fa-user-gear"></i> MY ROLE: ${data.role}</span>
            </div>
        ` : '';

        const contributionsHtml = data.contributions && data.contributions.length > 0 ? `
            <h4 style="font-family:var(--font-heading); font-size:1.25rem; margin-top:1.4rem; margin-bottom: 0.6rem; color:var(--text-main);">My Key Contributions</h4>
            <ul style="padding-left:1.4rem; margin-bottom:1.4rem; color:var(--text-secondary); line-height:1.8;">
                ${data.contributions.map(c => `<li style="margin-bottom:0.4rem;"><strong style="color:var(--text-main);">${c}</strong></li>`).join('')}
            </ul>
        ` : '';

        let challengeSolutionHtml = '';
        if (data.challenge && data.solution) {
            challengeSolutionHtml = `
                <div class="cs-callout-grid">
                    <div class="cs-challenge-box">
                        <div class="cs-challenge-title"><i class="fa-solid fa-triangle-exclamation"></i> TECHNICAL CHALLENGE</div>
                        <p style="font-size:0.92rem; color:var(--text-main); margin:0; line-height:1.6;">${data.challenge}</p>
                    </div>
                    <div class="cs-solution-box">
                        <div class="cs-solution-title"><i class="fa-solid fa-lightbulb"></i> ENGINEERED SOLUTION</div>
                        <p style="font-size:0.92rem; color:var(--text-main); margin:0; line-height:1.6;">${data.solution}</p>
                    </div>
                </div>
            `;
        }

        let videoHtml = '';
        if (data.videoDemo === 'placeholder') {
            videoHtml = `
                <div style="background: rgba(255,255,255,0.03); border: 2px dashed var(--border-glass); border-radius: var(--radius-sm); padding: 1.4rem; text-align: center; color: var(--text-secondary); margin: 1.2rem 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-circle-play" style="font-size: 2rem; color: var(--cyan-primary);"></i>
                    <strong style="color:var(--text-main); font-size:0.95rem;">10–20s Gameplay Demo Video / GIF</strong>
                    <span style="font-size: 0.82rem; color: var(--text-dim);">[Gameplay Media Container &middot; Live Demo Asset Container]</span>
                </div>
            `;
        }

        const playStoreBtn = data.playStoreUrl ? `
            <a href="${data.playStoreUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-amber"><i class="fa-brands fa-google-play"></i> View on Google Play</a>
        ` : '';

        // Visual Media & Comparison Builder
        let visualMediaHtml = '';
        let comparisonHtml = '';

        if (data.comparison) {
            comparisonHtml = `
                <div class="texture-compare-wrapper">
                    <div class="texture-compare-header">
                        <span class="compare-title"><i class="fa-solid fa-sliders"></i> Interactive Comparison</span>
                        <span>Drag slider left/right</span>
                    </div>
                    <div class="texture-compare-container" id="texture-comparator">
                        <img src="${data.comparison.after}" alt="${data.comparison.afterLabel}" class="compare-img compare-img-after" loading="lazy" decoding="async">
                        <span class="compare-badge compare-badge-right">${data.comparison.afterLabel}</span>

                        <div class="compare-overlay" id="compare-overlay" style="width: 50%;">
                            <img src="${data.comparison.before}" alt="${data.comparison.beforeLabel}" class="compare-img compare-img-before" loading="lazy" decoding="async">
                            <span class="compare-badge compare-badge-left">${data.comparison.beforeLabel}</span>
                        </div>

                        <div class="compare-handle" id="compare-handle" style="left: 50%;">
                            <div class="compare-handle-button">
                                <i class="fa-solid fa-arrows-left-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (data.gallery && data.gallery.length > 0) {
            visualMediaHtml = `
                <div class="modal-gallery-container">
                    <div class="modal-main-img-wrap">
                        <img id="modal-featured-img" src="${data.image}" alt="${data.title}" class="modal-img" loading="eager" decoding="async" onerror="this.onerror=null; this.src='${data.fallbackImage || data.image}';">
                    </div>
                    <div class="modal-gallery-strip">
                        ${data.gallery.map((imgSrc, idx) => `
                            <img src="${imgSrc}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-full="${imgSrc}" alt="Angle ${idx + 1}" loading="lazy" decoding="async" onerror="this.style.display='none';">
                        `).join('')}
                    </div>
                    <span style="font-size:0.8rem; color:var(--text-dim); display:block; margin-top:0.3rem;"><i class="fa-solid fa-hand-pointer"></i> Click thumbnail to inspect high-resolution angle</span>
                </div>
            `;
        } else {
            visualMediaHtml = `<img src="${data.image}" alt="${data.title}" class="modal-img" loading="eager" decoding="async">`;
        }

        modalBody.innerHTML = `
            <div>
                <span style="color:var(--cyan-primary); font-family:var(--font-arcade); font-size:0.75rem;">${data.engine}</span>
                <h2 style="font-size:2.2rem; color:var(--text-main); margin-top:0.3rem;">${data.title}</h2>
                <p style="color:var(--text-secondary); font-size:1.05rem;">${data.subtitle}</p>
                ${roleBadgeHtml}
            </div>
            
            ${visualMediaHtml}

            ${comparisonHtml}

            ${videoHtml}
            
            <h4 style="font-family:var(--font-heading); font-size:1.25rem; margin-top:1rem; color:var(--text-main);">Project Overview</h4>
            <p style="font-size:1rem; color:var(--text-secondary); line-height:1.7;">${data.desc}</p>
            
            ${contributionsHtml}

            ${challengeSolutionHtml}
            
            <h4 style="font-family:var(--font-heading); font-size:1.25rem; margin-top:1.2rem; color:var(--text-main);">Technical Breakdown</h4>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; background:rgba(12, 16, 24, 0.85); padding:1.2rem; border-radius:8px; border:1px solid var(--border-glass);">
                ${data.specs.map(s => `
                    <div>
                        <span style="color:var(--text-dim); font-size:0.82rem; display:block;">${s.label}</span>
                        <strong style="color:var(--cyan-primary); font-size:0.92rem;">${s.val}</strong>
                    </div>
                `).join('')}
            </div>
            
            <div style="display:flex; gap:1rem; margin-top:1.6rem; flex-wrap:wrap;">
                ${playStoreBtn}
                <a href="#contact" class="btn btn-primary btn-modal-close-trigger"><i class="fa-solid fa-envelope"></i> Inquire About Project</a>
                <button class="btn btn-outline btn-modal-close-trigger"><i class="fa-solid fa-xmark"></i> Close Case Study</button>
            </div>
        `;

        if (data.comparison) {
            initComparisonSlider();
        }

        modal.classList.add('active');
        playTone(620, 'sine', 0.1, 0.08);
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    // Delegated click handler for inspect buttons and modal interactions
    document.addEventListener('click', (e) => {
        const inspectBtn = e.target.closest('.btn-inspect');
        if (inspectBtn) {
            e.preventDefault();
            const gameKey = inspectBtn.dataset.game;
            openModal(gameKey);
            return;
        }

        const thumb = e.target.closest('.gallery-thumb');
        if (thumb) {
            const mainImg = document.getElementById('modal-featured-img');
            if (mainImg && thumb.dataset.full) {
                mainImg.src = thumb.dataset.full;
                document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                playTone(500, 'sine', 0.04, 0.04);
            }
            return;
        }

        if (e.target.closest('.btn-modal-close-trigger') || e.target === closeBtn || e.target.closest('#modal-close') || e.target === modal) {
            closeModal();
        }
    });

    // Universal Escape Key Listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   10. PROFILE PHOTO LIGHTBOX MODAL
   ========================================================================== */
function initProfileModal() {
    const trigger = document.getElementById('avatar-zoom-trigger');
    const profileModal = document.getElementById('profile-modal');
    const closeBtn = document.getElementById('profile-modal-close');
    if (!trigger || !profileModal) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        profileModal.classList.add('active');
        playTone(600, 'sine', 0.08, 0.08);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            profileModal.classList.remove('active');
        });
    }

    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal.classList.contains('active')) {
            profileModal.classList.remove('active');
        }
    });
}

/* ==========================================================================
   11. BEFORE/AFTER TEXTURE COMPARISON SLIDER
   ========================================================================== */
function initComparisonSlider() {
    const container = document.getElementById('texture-comparator');
    const overlay = document.getElementById('compare-overlay');
    const handle = document.getElementById('compare-handle');
    if (!container || !overlay || !handle) return;

    let isDragging = false;

    function syncImageWidth() {
        const beforeImg = overlay.querySelector('.compare-img-before');
        if (beforeImg) {
            beforeImg.style.width = `${container.clientWidth}px`;
        }
    }

    function updateSliderPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let offsetX = clientX - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width));

        const percentage = (offsetX / rect.width) * 100;
        overlay.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
        syncImageWidth();
    }

    function onPointerDown(e) {
        isDragging = true;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        updateSliderPosition(clientX);
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        updateSliderPosition(clientX);
    }

    function onPointerUp() {
        isDragging = false;
    }

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('touchstart', onPointerDown, { passive: true });

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Initial sync
    setTimeout(syncImageWidth, 50);
}

/* ==========================================================================
   12. CONTACT FORM HANDLER (Formspree AJAX)
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Transmitting...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Delivered!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                playTone(720, 'sine', 0.2, 0.12);
                form.reset();
            } else {
                throw new Error('Transmission failed');
            }
        } catch (error) {
            submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Sending Failed';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } finally {
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 4000);
        }
    });
}

/* ==========================================================================
   13. CUSTOM DUAL-LAYER CURSOR
   ========================================================================== */
function initCustomCursor() {
    // Only on devices with a true pointer (desktop)
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let rafId;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Dot snaps immediately
        dot.style.left = `${mouseX}px`;
        dot.style.top  = `${mouseY}px`;
    }, { passive: true });

    // Ring trails with spring lerp
    function animateRing() {
        ringX += (mouseX - ringX) * 0.13;
        ringY += (mouseY - ringY) * 0.13;
        ring.style.left = `${ringX}px`;
        ring.style.top  = `${ringY}px`;
        rafId = requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state on interactive elements
    const interactiveSelectors = 'a, button, .btn, .filter-btn, .side-rail-social-btn, .gallery-thumb, .game-card, .discipline-card, .floating-chip, .nav-link, .nav-avatar-btn';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            dot.classList.add('is-hovering');
            ring.classList.add('is-hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            dot.classList.remove('is-hovering');
            ring.classList.remove('is-hovering');
        }
    });

    document.addEventListener('mousedown', () => dot.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => dot.classList.remove('is-clicking'));

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
    });
}

/* ==========================================================================
   14. SCROLL PROGRESS BAR
   ========================================================================== */
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop    = window.scrollY || document.documentElement.scrollTop;
        const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${Math.min(scrollPercent, 100)}%`;
    }, { passive: true });
}

/* ==========================================================================
   15. INTERSECTION OBSERVER SCROLL REVEAL
   ========================================================================== */
function initScrollReveal() {
    // Mark all direct children of reveal-stagger grids as reveal elements
    document.querySelectorAll('.reveal-stagger > *').forEach(child => {
        if (!child.classList.contains('reveal')) {
            child.classList.add('reveal');
        }
    });

    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
}

/* ==========================================================================
   16. HERO SCROLL PARALLAX (Portrait depth + content lift)
   ========================================================================== */
function initHeroScrollParallax() {
    const heroSection = document.getElementById('hero');
    const portraitStage = document.getElementById('hero-portrait-stage');
    const heroContent   = document.querySelector('.hero-content');
    if (!heroSection || !portraitStage) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY   = window.scrollY;
                const heroH     = heroSection.offsetHeight;
                const progress  = Math.min(scrollY / heroH, 1); // 0 → 1 as hero scrolls away

                // Portrait sinks deeper as we scroll
                portraitStage.style.transform = `translateY(${progress * 60}px)`;
                portraitStage.style.opacity   = `${1 - progress * 0.6}`;

                // Content lifts and fades slightly
                if (heroContent) {
                    heroContent.style.transform = `translateY(${progress * -30}px)`;
                    heroContent.style.opacity   = `${1 - progress * 0.4}`;
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ==========================================================================
   17. MAGNETIC BUTTONS
   ========================================================================== */
function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-amber, .nav-hire-btn');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect    = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width  / 2;
            const centerY = rect.top  + rect.height / 2;
            const dx = (e.clientX - centerX) * 0.28;
            const dy = (e.clientY - centerY) * 0.28;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}