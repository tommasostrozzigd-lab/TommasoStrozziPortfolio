document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       TAB STATE GLOBAL FIX
    ========================= */
    let pageHidden = false;

    document.addEventListener("visibilitychange", () => {
        pageHidden = document.hidden;
    });


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

    /* ===================== CLONES ===================== */

    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    const total = slides.length;

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[total - 1].cloneNode(true);

    firstClone.classList.add("clone");
    lastClone.classList.add("clone");

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const allSlides = Array.from(track.querySelectorAll(".carousel-slide"));

    /* ===================== STATE ===================== */

    let index = 1;

    let isDragging = false;
    let isAnimating = false;

    let startX = 0;
    let currentX = 0;
    let prevTranslate = 0;

    const DRAG_THRESHOLD = 5;

    /* ===================== HELPERS ===================== */

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

        prevTranslate = -index * getWidth();
        currentX = prevTranslate;

        track.style.transform = `translateX(${currentX}px)`;

        dots.forEach((d, i) => d.classList.toggle("active", i === realIndex()));

        if (caption) {
            caption.textContent = slides[realIndex()].dataset.title || "";
        }
    }

    function lockAnimation() {
        isAnimating = true;
        setTimeout(() => (isAnimating = false), 450);
    }

    /* ===================== NAV ===================== */

    function nextSlide() {
        if (isAnimating) return;
        index++;
        lockAnimation();
        setPosition(true);
        resetIdleTimer();
    }

    function prevSlide() {
        if (isAnimating) return;
        index--;
        lockAnimation();
        setPosition(true);
        resetIdleTimer();
    }

    /* ===================== LOOP FIX ===================== */

    track.addEventListener("transitionend", () => {
        if (allSlides[index].classList.contains("clone")) {
            track.style.transition = "none";

            if (index === 0) index = total;
            if (index === total + 1) index = 1;

            setPosition(false);
        }
    });

    /* ===================== DRAG ===================== */

    function getX(e) {
        return e.clientX;
    }

    function onDown(e) {
        if (isAnimating) return;

        isDragging = true;
        startX = getX(e);

        track.style.transition = "none";
    }

    function onMove(e) {
        if (!isDragging) return;

        const dx = getX(e) - startX;

        currentX = prevTranslate + dx;

        const max = getWidth() * 0.9;

        currentX = Math.max(
            prevTranslate - max,
            Math.min(prevTranslate + max, currentX)
        );

        track.style.transform = `translateX(${currentX}px)`;
    }

    function onUp() {
        if (!isDragging) return;

        isDragging = false;

        const moved = currentX - prevTranslate;
        const threshold = getWidth() * 0.2;

        if (Math.abs(moved) < DRAG_THRESHOLD) {
            openModal(realIndex());
        } else if (moved < -threshold) {
            nextSlide();
        } else if (moved > threshold) {
            prevSlide();
        } else {
            setPosition(true);
        }

        resetIdleTimer();
    }

    /* ===================== EVENTS ===================== */

    carousel.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    /* ===================== CONTROLS ===================== */

    nextButton?.addEventListener("click", nextSlide);
    prevButton?.addEventListener("click", prevSlide);

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i + 1;
            setPosition(true);
        });
    });

    window.addEventListener("resize", () => setPosition(false));

    setPosition(false);

    /* ===================== AUTOPLAY (RIPRISTINATO) ===================== */

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

    resetIdleTimer();

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", resetIdleTimer);
    carousel.addEventListener("touchstart", stopAutoPlay);
    carousel.addEventListener("touchend", resetIdleTimer);

    /* ===================== MODAL ===================== */

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

    function prevImageModal() {
        modalIndex = (modalIndex - 1 + total) % total;
        modalImg.src = slides[modalIndex].querySelector("img").src;
    }

    closeModal?.addEventListener("click", closeModalFn);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModalFn();
    });

    modalNext?.addEventListener("click", nextImage);
    modalPrev?.addEventListener("click", prevImageModal);

    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active")) return;

        if (e.key === "Escape") closeModalFn();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImageModal();
    });


    /* =========================
       SOFTWARE SLIDER FIX
    ========================= */

    const slider = document.getElementById("softwareSlider");
    const softTrack = document.getElementById("softwareTrack");

    if (slider && softTrack) {

        // Duplica contenuto per effetto infinito
        softTrack.innerHTML += softTrack.innerHTML;

        let position = 0;
        let velocity = 0;
        let autoSpeed = 0.75;
        let friction = 0.92;
        let minVelocity = 0.02;

        let isDragging = false;
        let startX = 0;
        let startPosition = 0;

        let lastX = 0;
        let lastTime = 0;

        function halfWidth() {
            return softTrack.scrollWidth / 2;
        }

        function normalize() {
            const w = halfWidth();
            if (position > 0) position -= w;
            if (position < -w) position += w;
        }

        function animate() {
            if (pageHidden) {
                requestAnimationFrame(animate);
                return;
            }

            if (!isDragging) {

                // Inerzia
                if (Math.abs(velocity) > minVelocity) {
                    position += velocity;
                    velocity *= friction;

                    if (Math.abs(velocity) < 0.01) velocity = 0;
                }
                // Autoscroll sempre attivo (senza cooldown)
                else {
                    position -= autoSpeed;
                }

                normalize();
                softTrack.style.transform = `translateX(${position}px)`;
            }

            requestAnimationFrame(animate);
        }

        animate();

        function start(x) {
            isDragging = true;
            startX = x;
            startPosition = position;

            lastX = x;
            lastTime = performance.now();

            velocity = 0;
        }

        function move(x) {
            if (!isDragging) return;

            const now = performance.now();
            const delta = x - startX;

            position = startPosition + delta;

            const dt = now - lastTime;
            if (dt > 0) velocity = (x - lastX) / dt * 16;

            lastX = x;
            lastTime = now;

            normalize();
            softTrack.style.transform = `translateX(${position}px)`;
        }

        function end() {
            isDragging = false;
        }

        // Mouse events
        slider.addEventListener("mousedown", e => start(e.clientX));
        window.addEventListener("mousemove", e => move(e.clientX));
        window.addEventListener("mouseup", end);

        // Touch events
        slider.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchend", end);
    }
    /* =========================
       CARDS SLIDER FIX
    ========================= */

    const cardsSlider = document.getElementById("cardsSlider");
    const cardsTrack = document.getElementById("cardsTrack");

    if (cardsSlider && cardsTrack) {

        // loop infinito base
        cardsTrack.innerHTML += cardsTrack.innerHTML;

        let position = 0;
        let velocity = 0;

        const autoSpeed = 0.4;
        const friction = 0.92;
        const minVelocity = 0.02;

        let startX = null;
        let startPos = 0;

        let isDragging = false;
        let dragStarted = false;

        let trackWidth = 0;

        function updateWidth() {
            trackWidth = cardsTrack.scrollWidth / 2;
        }

        function normalize() {
            const w = trackWidth;
            if (!w) return;

            if (position < -w) position += w;
            if (position > 0) position -= w;
        }

        function getX(e) {
            return e.clientX;
        }

        /* ================= POINTER EVENTS ================= */

        function onPointerDown(e) {
            startX = getX(e);
            startPos = position;

            isDragging = false;
            dragStarted = false;
            velocity = 0;

            onPointerMove.lastX = null;
            onPointerMove.lastTime = null;
        }

        function onPointerMove(e) {
            if (startX === null) return;

            const x = getX(e);
            const dx = x - startX;

            // 👉 ancora NON è drag (importantissimo per click)
            if (!dragStarted) {
                if (Math.abs(dx) < 6) return; // soglia mouse/touch
                dragStarted = true;
                isDragging = true;

                cardsTrack.setPointerCapture(e.pointerId);
                cardsTrack.classList.add("dragging");
            }

            position = startPos + dx;

            const now = performance.now();
            const dt = now - (onPointerMove.lastTime || now);

            if (dt > 0) {
                velocity = (x - (onPointerMove.lastX || x)) / dt * 16;
            }

            onPointerMove.lastX = x;
            onPointerMove.lastTime = now;

            normalize();

            // 🔥 FIX CRITICO (template string corretto)
            cardsTrack.style.transform = `translateX(${position}px)`;
        }

        function onPointerUp(e) {
            try {
                cardsTrack.releasePointerCapture(e.pointerId);
            } catch (err) { }

            cardsTrack.classList.remove("dragging");

            const wasDrag = dragStarted;

            startX = null;
            isDragging = false;
            dragStarted = false;

            // 👉 se NON era drag → lascia click naturale
            if (!wasDrag) return;
        }

        function onPointerCancel() {
            startX = null;
            isDragging = false;
            dragStarted = false;
            cardsTrack.classList.remove("dragging");
        }

        /* ================= ANIMATION LOOP ================= */

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

        /* ================= INIT ================= */

        updateWidth();
        animate();

        window.addEventListener("resize", updateWidth);
        window.addEventListener("load", updateWidth);

        const ro = new ResizeObserver(updateWidth);
        ro.observe(cardsTrack);

        /* blocco drag immagini */
        cardsTrack.querySelectorAll("img").forEach(img => {
            img.setAttribute("draggable", "false");
        });

        /* pointer events */
        cardsTrack.addEventListener("pointerdown", onPointerDown);
        cardsTrack.addEventListener("pointermove", onPointerMove);
        cardsTrack.addEventListener("pointerup", onPointerUp);
        cardsTrack.addEventListener("pointercancel", onPointerCancel);

        /* safety */
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) onPointerCancel();
        });

        window.addEventListener("blur", onPointerCancel);
    }
});