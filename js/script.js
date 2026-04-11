document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       MENU DROPDOWN SAFE
    ========================= */
    document.querySelectorAll('.menu').forEach(menu => {
        const dropdown = menu.querySelector('.dropdown');
        if (!dropdown) return;

        menu.addEventListener('mouseenter', () => {
            dropdown.style.display = 'block';
            dropdown.style.left = '0';
            dropdown.style.right = 'auto';

            const rect = dropdown.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const margin = 5;

            if (rect.right > windowWidth - margin) {
                dropdown.style.left = 'auto';
                dropdown.style.right = margin + 'px';
            }
        });

        menu.addEventListener('mouseleave', () => {
            dropdown.style.display = 'none';
            dropdown.style.left = '';
            dropdown.style.right = '';
        });
    });


    /* =========================
       CAROUSEL
    ========================= */

    const carousel = document.getElementById("portfolioCarousel");
    const track = document.getElementById("carouselTrack");
    const prevButton = document.getElementById("prevSlide");
    const nextButton = document.getElementById("nextSlide");
    const caption = document.getElementById("carouselCaption");
    const dots = Array.from(document.querySelectorAll("#carouselDots .carousel-dot"));

    const modal = document.getElementById("carouselModal");
    const modalImg = document.getElementById("modalImage");
    const closeModal = document.getElementById("closeModal");
    const modalPrev = document.getElementById("modalPrev");
    const modalNext = document.getElementById("modalNext");

    if (!carousel || !track) return;

    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    const total = slides.length;
    if (!total) return;

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[total - 1].cloneNode(true);

    firstClone.classList.add("clone");
    lastClone.classList.add("clone");

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const allSlides = Array.from(track.querySelectorAll(".carousel-slide"));

    let index = 1;
    let isDragging = false;
    let isAnimating = false;

    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function getWidth() {
        return carousel.clientWidth;
    }

    function realIndex() {
        let i = index - 1;
        if (i < 0) i = total - 1;
        if (i >= total) i = 0;
        return i;
    }

    function setPosition(animated = true) {
        track.style.transition = animated ? "transform 0.45s ease" : "none";

        currentTranslate = -index * getWidth();
        prevTranslate = currentTranslate;

        track.style.transform = `translateX(${currentTranslate}px)`;

        dots.forEach((d, i) => d.classList.toggle("active", i === realIndex()));

        if (caption) {
            caption.textContent = slides[realIndex()].dataset.title || "";
        }
    }

    function lockDrag() {
        isAnimating = true;
        setTimeout(() => isAnimating = false, 450);
    }

    function nextSlide() {
        if (isDragging || isAnimating) return;

        resetIdleTimer(); // al posto di restartAutoPlay

        index++;
        lockDrag();
        setPosition(true);
    }

    function prevSlide() {
        if (isDragging || isAnimating) return;

        resetIdleTimer(); // al posto di restartAutoPlay

        index--;
        lockDrag();
        setPosition(true);
    }

    track.addEventListener("transitionend", () => {
        if (allSlides[index].classList.contains("clone")) {
            track.style.transition = "none";

            if (index === 0) index = total;
            if (index === total + 1) index = 1;

            setPosition(false);
        }
    });

    function getX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function startDrag(e) {
        if (isAnimating) return;

        isDragging = true;
        resetIdleTimer(); // 👈
        startX = getX(e);

        startX = getX(e);
        track.style.transition = "none";

        setIframesPointerEvents(false);
    }

    function moveDrag(e) {
        if (!isDragging) return;

        const delta = getX(e) - startX;
        const width = getWidth();
        const maxDrag = width * 0.9;

        const raw = prevTranslate + delta;

        currentTranslate = Math.max(
            prevTranslate - maxDrag,
            Math.min(prevTranslate + maxDrag, raw)
        );

        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function endDrag() {
        if (!isDragging) return;

        isDragging = false;

        const moved = currentTranslate - prevTranslate;
        const threshold = getWidth() * 0.2;

        if (moved < -threshold) nextSlide();
        else if (moved > threshold) prevSlide();
        else setPosition(true);

        setIframesPointerEvents(true);

        resetIdleTimer(); // 👈
    }

    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    carousel.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", moveDrag);

    carousel.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("touchmove", moveDrag, { passive: true });

    const iframes = document.querySelectorAll("iframe");

    function setIframesPointerEvents(state) {
        iframes.forEach(frame => {
            frame.style.pointerEvents = state ? "auto" : "none";
        });
    }

    slides.forEach((slide, i) => {
        const img = slide.querySelector("img");
        if (!img) return;

        img.setAttribute("draggable", "false");
        img.style.userSelect = "none";

        img.addEventListener("dragstart", e => e.preventDefault());

        img.addEventListener("click", () => {
            if (!isDragging && !isAnimating) openModal(i);
        });
    });

    nextButton?.addEventListener("click", nextSlide);
    prevButton?.addEventListener("click", prevSlide);

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            if (isDragging) return;

            resetIdleTimer(); // al posto di restartAutoPlay

            index = i + 1;
            setPosition(true);
        });
    });

    window.addEventListener("resize", () => setPosition(false));

    setPosition(false);

    /* =========================
       SMART AUTOPLAY (PRO)
    ========================= */

    let autoPlayInterval = null;
    let idleTimer = null;

    const AUTO_DELAY = 3000;
    const IDLE_DELAY = 1500;

    function startAutoPlay() {
        if (autoPlayInterval) return;

        autoPlayInterval = setInterval(() => {
            if (!isDragging && !isAnimating) {
                nextSlide();
            }
        }, AUTO_DELAY);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);

        stopAutoPlay();

        idleTimer = setTimeout(() => {
            startAutoPlay();
        }, IDLE_DELAY);
    }

    /* avvio iniziale */
    resetIdleTimer();

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", resetIdleTimer);

    carousel.addEventListener("touchstart", stopAutoPlay);
    carousel.addEventListener("touchend", resetIdleTimer);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            resetIdleTimer();
        }
    });

    /* =========================
       MODAL FIX (CLICK OUTSIDE CLOSE)
    ========================= */

    let modalIndex = 0;

    function openModal(i) {
        modalIndex = i;
        modal.classList.add("active");
        modalImg.src = slides[i].querySelector("img").src;
    }

    function closeModalFn() {
        modal.classList.remove("active");
    }

    function nextImage() {
        modalIndex = (modalIndex + 1) % total;
        modalImg.src = slides[modalIndex].querySelector("img").src;
    }

    function prevImage() {
        modalIndex = (modalIndex - 1 + total) % total;
        modalImg.src = slides[modalIndex].querySelector("img").src;
    }

    closeModal?.addEventListener("click", closeModalFn);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModalFn();
    });

    modalImg?.addEventListener("click", e => e.stopPropagation());

    modalNext?.addEventListener("click", nextImage);
    modalPrev?.addEventListener("click", prevImage);

    document.addEventListener("keydown", e => {
        if (!modal.classList.contains("active")) return;

        if (e.key === "Escape") closeModalFn();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
    });


    /* =========================
       SOFTWARE SLIDER (MOMENTUM FIXED)
    ========================= */

    const slider = document.getElementById("softwareSlider");
    const softTrack = document.getElementById("softwareTrack");

    if (slider && softTrack) {

        // clone per loop infinito
        softTrack.innerHTML += softTrack.innerHTML;

        let position = 0;

        // fisica movimento
        let velocity = 0;
        let autoSpeed = 0.75;
        let friction = 0.92;
        let minVelocity = 0.02;

        // drag state
        let isDragging = false;
        let startX = 0;
        let startPosition = 0;

        // timing sicurezza
        let lastX = 0;
        let lastTime = 0;

        let lastInteraction = 0;
        const INTERACTION_COOLDOWN = 800;

        function halfWidth() {
            return softTrack.scrollWidth / 2;
        }

        function normalize() {
            const w = halfWidth();

            if (position > 0) position -= w;
            if (position < -w) position += w;
        }

        // =========================
        // ANIMATION LOOP
        // =========================
        function animate() {
            if (!isDragging) {

                const now = performance.now();
                const recentlyUsed = now - lastInteraction < INTERACTION_COOLDOWN;

                // INERTIA (priorità assoluta)
                if (Math.abs(velocity) > minVelocity) {

                    position += velocity;
                    velocity *= friction;

                    if (Math.abs(velocity) < 0.01) {
                        velocity = 0;
                    }

                }
                // AUTO SCROLL SOLO SE FERMO E NON RECENTE INTERAZIONE
                else if (!recentlyUsed) {
                    position -= autoSpeed;
                }

                normalize();
                softTrack.style.transform = `translateX(${position}px)`;
            }

            requestAnimationFrame(animate);
        }

        animate();

        // =========================
        // DRAG START
        // =========================
        function start(x) {
            isDragging = true;

            startX = x;
            startPosition = position;

            lastX = x;
            lastTime = performance.now();

            velocity = 0; // reset inertia controllato

            lastInteraction = performance.now();
        }

        // =========================
        // DRAG MOVE
        // =========================
        function move(x) {
            if (!isDragging) return;

            const now = performance.now();
            const delta = x - startX;

            position = startPosition + delta;

            // calcolo velocità per inertia
            const dt = now - lastTime;

            if (dt > 0) {
                velocity = (x - lastX) / dt * 16;
            }

            lastX = x;
            lastTime = now;

            normalize();

            softTrack.style.transform = `translateX(${position}px)`;

            lastX = x;
            lastTime = now;
        }

        // =========================
        // DRAG END
        // =========================
        function end() {
            if (!isDragging) return;

            isDragging = false;

            lastInteraction = performance.now();
        }

        // =========================
        // EVENTS
        // =========================
        slider.addEventListener("mousedown", e => start(e.clientX));
        window.addEventListener("mousemove", e => move(e.clientX));
        window.addEventListener("mouseup", end);

        slider.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchend", end);
    }

    const cardsSlider = document.getElementById("cardsSlider");
    const cardsTrack = document.getElementById("cardsTrack");

    if (cardsSlider && cardsTrack) {

        // clone per loop infinito
        cardsTrack.innerHTML += cardsTrack.innerHTML;

        let position = 0;
        let velocity = 0;
        let autoSpeed = 0.4;

        let isDragging = false;
        let hasDragged = false;

        let startX = 0;
        let startPos = 0;

        let lastX = 0;
        let lastTime = 0;

        let dragThreshold = 5;

        let trackWidth = 0;

        const friction = 0.92;
        const minVelocity = 0.02;

        function updateWidth() {
            const oldWidth = trackWidth;

            trackWidth = cardsTrack.scrollWidth / 2;

            // evita drift quando cambia layout
            if (oldWidth) {
                position = ((position % trackWidth) + trackWidth) % trackWidth;
                position = -position;
            }
        }

        function normalize() {
            const w = trackWidth;

            if (!w) return;

            if (position < -w) position += w;
            if (position > 0) position -= w;
        }

        function animate() {
            if (!isDragging) {

                if (Math.abs(velocity) > minVelocity) {
                    position += velocity;
                    velocity *= friction;
                } else {
                    position -= autoSpeed;
                }

                normalize();

                cardsTrack.style.transform = `translateX(${position}px)`;
            }

            requestAnimationFrame(animate);
        }

        updateWidth();
        animate();

        window.addEventListener("resize", updateWidth);
        window.addEventListener("load", updateWidth);

        // osserva cambi layout reali (FONDAMENTALE)
        const ro = new ResizeObserver(() => {
            updateWidth();
        });
        ro.observe(cardsTrack);

        // aggiorna quando immagini caricano
        cardsTrack.querySelectorAll("img").forEach(img => {
            if (!img.complete) {
                img.addEventListener("load", updateWidth);
            }
        });

        // ---------------- DRAG ----------------

        function start(x) {
            isDragging = true;
            hasDragged = false;

            startX = x;
            startPos = position;

            lastX = x;
            lastTime = performance.now();

            velocity = 0;

            cardsTrack.classList.add("dragging");
        }

        function move(x) {
            if (!isDragging) return;

            const delta = x - startX;

            if (Math.abs(delta) > dragThreshold) {
                hasDragged = true;
            }

            position = startPos + delta;

            const now = performance.now();

            if (now - lastTime > 0) {
                velocity = (x - lastX) / (now - lastTime) * 16;
            }

            lastX = x;
            lastTime = now;

            normalize();

            cardsTrack.style.transform = `translateX(${position}px)`;
        }

        function end() {
            if (!isDragging) return;

            isDragging = false;

            setTimeout(() => {
                cardsTrack.classList.remove("dragging");
            }, 50);
        }

        function cancelDrag() {
            if (!isDragging) return;
            isDragging = false;

            setTimeout(() => {
                cardsTrack.classList.remove("dragging");
            }, 50);
        }

        // EVENTS SAFE
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) cancelDrag();
        });

        window.addEventListener("blur", cancelDrag);
        window.addEventListener("touchcancel", cancelDrag);
        window.addEventListener("pointercancel", cancelDrag);
        window.addEventListener("mouseleave", cancelDrag);

        // mouse + touch
        cardsSlider.addEventListener("mousedown", e => start(e.clientX));
        window.addEventListener("mousemove", e => move(e.clientX));
        window.addEventListener("mouseup", end);

        cardsSlider.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchend", end);

        cardsTrack.addEventListener("dragstart", (e) => {
            e.preventDefault();
        });

        // BLOCCO CLICK SOLO SE C'È DRAG VERO
        cardsTrack.addEventListener("click", (e) => {
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        });
    }
});