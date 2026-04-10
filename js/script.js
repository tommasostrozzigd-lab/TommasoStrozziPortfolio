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
        index++;
        lockDrag();
        setPosition(true);
    }

    function prevSlide() {
        if (isDragging || isAnimating) return;
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
            index = i + 1;
            setPosition(true);
        });
    });

    window.addEventListener("resize", () => setPosition(false));

    setPosition(false);

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
        softTrack.innerHTML += softTrack.innerHTML;

        let position = 0;
        let autoSpeed = 0.45;
        let currentVelocity = 0;
        let isSoftDragging = false;

        let startX = 0;
        let startPosition = 0;

        let lastX = 0;
        let lastTime = 0;

        const friction = 0.92;
        const minVelocity = 0.01;

        function halfWidth() {
            return softTrack.scrollWidth / 2;
        }

        function normalize() {
            const hw = halfWidth();
            if (position > 0) position -= hw;
            if (Math.abs(position) >= hw) position += hw;
        }

        function animate() {
            if (!isSoftDragging) {
                if (Math.abs(currentVelocity) > minVelocity) {
                    position += currentVelocity;
                    currentVelocity *= friction;
                } else {
                    position -= autoSpeed;
                }

                normalize();
                softTrack.style.transform = `translateX(${position}px)`;
            }

            requestAnimationFrame(animate);
        }

        animate();

        function start(x) {
            isSoftDragging = true;
            startX = x;
            startPosition = position;

            lastX = x;
            lastTime = Date.now();
            currentVelocity = 0;
        }

        function move(x) {
            if (!isSoftDragging) return;

            const now = Date.now();
            const dx = x - lastX;
            const dt = now - lastTime || 1;

            currentVelocity = (dx / dt) * 16;

            const delta = x - startX;
            position = startPosition + delta;

            normalize();
            softTrack.style.transform = `translateX(${position}px)`;

            lastX = x;
            lastTime = now;
        }

        function end() {
            isSoftDragging = false;
        }

        slider.addEventListener("mousedown", e => start(e.clientX));
        window.addEventListener("mousemove", e => move(e.clientX));
        window.addEventListener("mouseup", end);

        slider.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
        window.addEventListener("touchend", end);
    }

});