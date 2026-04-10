document.querySelectorAll('.menu').forEach(menu => {
    const dropdown = menu.querySelector('.dropdown');

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

document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById("portfolioCarousel");
    const track = document.getElementById("carouselTrack");
    const prevButton = document.getElementById("prevSlide");
    const nextButton = document.getElementById("nextSlide");
    const caption = document.getElementById("carouselCaption");
    const dots = Array.from(document.querySelectorAll("#carouselDots .carousel-dot"));

    if (!carousel || !track) return;

    const originalSlides = Array.from(track.querySelectorAll(".carousel-slide"));
    const totalSlides = originalSlides.length;

    if (!totalSlides) return;

    if (totalSlides === 1) {
        if (caption) caption.textContent = originalSlides[0].dataset.title || "";
        if (prevButton) prevButton.style.display = "none";
        if (nextButton) nextButton.style.display = "none";
        dots.forEach(dot => dot.style.display = "none");
        return;
    }

    const firstClone = originalSlides[0].cloneNode(true);
    const secondClone = originalSlides[1]?.cloneNode(true);
    const lastClone = originalSlides[totalSlides - 1].cloneNode(true);
    const secondLastClone = originalSlides[totalSlides - 2]?.cloneNode(true);

    [firstClone, secondClone, lastClone, secondLastClone]
        .filter(Boolean)
        .forEach(slide => slide.classList.add("clone"));

    track.appendChild(firstClone);
    if (secondClone) track.appendChild(secondClone);

    track.insertBefore(lastClone, track.firstChild);
    if (secondLastClone) track.insertBefore(secondLastClone, track.firstChild);

    const allSlides = Array.from(track.querySelectorAll(".carousel-slide"));

    let currentSlide = 2; 
    let autoSlide = null;
    const intervalTime = 4000;

    let isDragging = false;
    let isTransitioning = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationId = null;

    function getSlideWidth() {
        return carousel.clientWidth;
    }

    function getRealIndex() {
        return (currentSlide - 2 + totalSlides) % totalSlides;
    }

    function updateDots() {
        const realIndex = getRealIndex();
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === realIndex);
        });
    }

    function updateCaption() {
        if (!caption) return;
        const realIndex = getRealIndex();
        caption.textContent = originalSlides[realIndex].dataset.title || "";
    }

    function setPosition(animated = true) {
        if (animated) {
            track.classList.remove("dragging");

            track.offsetHeight;

        } else {
            track.classList.add("dragging");
        }

        currentTranslate = -currentSlide * getSlideWidth();
        prevTranslate = currentTranslate;
        track.style.transform = `translateX(${currentTranslate}px)`;

        updateDots();
        updateCaption();
    }

    function goToSlide(index) {
        if (isDragging) return;

        isTransitioning = true;
        currentSlide = index;
        setPosition(true);
    }

    function nextSlide() {
        if (isDragging || isTransitioning) return;
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        if (isDragging || isTransitioning) return;
        goToSlide(currentSlide - 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlide = setInterval(() => {
            nextSlide();
        }, intervalTime);
    }

    function stopAutoSlide() {
        if (autoSlide) {
            clearInterval(autoSlide);
            autoSlide = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    function getPositionX(e) {
        if (e.type.includes("mouse")) return e.pageX;
        if (e.touches && e.touches.length) return e.touches[0].clientX;
        return 0;
    }

    function dragStart(e) {
        if (isTransitioning) return;
        if (e.type === "mousedown" && e.button !== 0) return;

        isDragging = true;
        startX = getPositionX(e);
        track.classList.add("dragging");
        stopAutoSlide();
        animationId = requestAnimationFrame(animation);
    }

    function dragMove(e) {
        if (!isDragging) return;

        const currentPosition = getPositionX(e);
        const delta = currentPosition - startX;

        const maxDrag = (getSlideWidth()/100) * 90;

        const clampedDelta = Math.max(-maxDrag, Math.min(maxDrag, delta));

        currentTranslate = prevTranslate + clampedDelta;

        track.style.transform = `translateX(${currentTranslate}px)`;

    }

    function dragEnd() {
        if (!isDragging) return;

        isDragging = false;
        cancelAnimationFrame(animationId);

        const movedBy = currentTranslate - prevTranslate;
        const threshold = getSlideWidth() * 0.15;

        isTransitioning = false;

        if (movedBy < -threshold) {
            goToSlide(currentSlide + 1);
        } else if (movedBy > threshold) {
            goToSlide(currentSlide - 1);
        } else {
            setPosition(false);
            startAutoSlide();
        }
    }

    track.addEventListener("transitionend", () => {
        isTransitioning = false;
        startAutoSlide();

        if (currentSlide >= allSlides.length - 2) {
            currentSlide = 2;
            setPosition(false);
        }

        if (currentSlide <= 1) {
            currentSlide = totalSlides + 1;
            setPosition(false);
        }
    });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            if (isDragging || isTransitioning) return;
            goToSlide(i + 2);
            resetAutoSlide();
        });
    });

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            prevSlide();
            resetAutoSlide();
        });
    }

    carousel.addEventListener("mousedown", dragStart);
    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", dragEnd);
    window.addEventListener("mouseleave", dragEnd);

    carousel.addEventListener("touchstart", dragStart, { passive: true });
    carousel.addEventListener("touchmove", dragMove, { passive: true });
    carousel.addEventListener("touchend", dragEnd);
    carousel.addEventListener("touchcancel", dragEnd);

    track.querySelectorAll("img").forEach((img) => {
        img.setAttribute("draggable", "false");
        img.addEventListener("dragstart", (e) => e.preventDefault());
    });

    window.addEventListener("resize", () => {
        setPosition(false);
    });

    setPosition(false);
    startAutoSlide();
});

/* ==================== SOFTWARE SLIDER ==================== */
const slider = document.getElementById("softwareSlider");
const track = document.getElementById("softwareTrack");

if (slider && track) {
    track.innerHTML += track.innerHTML;

    let position = 0;
    let autoSpeed = 0.45;
    let currentVelocity = 0; 
    let isDragging = false;
    let startX = 0;
    let startPosition = 0;
    let lastX = 0;
    let lastTime = 0;

    const friction = 0.9; 
    const minVelocity = 0.02; 

    function getTrackHalfWidth() {
        return track.scrollWidth / 2;
    }

    function normalizePosition() {
        const halfWidth = getTrackHalfWidth();

        if (position > 0) {
            position -= halfWidth;
        }

        if (Math.abs(position) >= halfWidth) {
            position += halfWidth;
        }
    }

    function animateSlider() {
        if (!isDragging) {
            if (Math.abs(currentVelocity) > minVelocity) {
                position += currentVelocity;
                currentVelocity *= friction;
            } else {
                currentVelocity = 0;
                position -= autoSpeed;
            }

            normalizePosition();
            track.style.transform = `translateX(${position}px)`;
        }

        requestAnimationFrame(animateSlider);
    }

    animateSlider();

    function startDrag(clientX) {
        isDragging = true;
        startX = clientX;
        startPosition = position;
        lastX = clientX;
        lastTime = performance.now();
        currentVelocity = 0;
    }

    function moveDrag(clientX) {
        if (!isDragging) return;

        const now = performance.now();
        const delta = clientX - startX;

        position = startPosition + delta;
        normalizePosition();

        const deltaX = clientX - lastX;
        const deltaTime = now - lastTime;

        if (deltaTime > 0) {
            currentVelocity = deltaX / deltaTime * 16; 
        }

        lastX = clientX;
        lastTime = now;

        track.style.transform = `translateX(${position}px)`;
    }

    function endDrag() {
        isDragging = false;
    }

    slider.addEventListener("mousedown", (e) => {
        startDrag(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
        moveDrag(e.clientX);
    });

    window.addEventListener("mouseup", endDrag);

    slider.addEventListener("touchstart", (e) => {
        startDrag(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener("touchmove", (e) => {
        moveDrag(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener("touchend", endDrag);

    slider.addEventListener("mouseenter", () => {
        autoSpeed = 0.18;
    });

    slider.addEventListener("mouseleave", () => {
        autoSpeed = 0.45;
    });

    track.querySelectorAll("img").forEach((img) => {
        img.setAttribute("draggable", "false");
    });

    track.addEventListener("dragstart", (e) => {
        e.preventDefault();
    });
}