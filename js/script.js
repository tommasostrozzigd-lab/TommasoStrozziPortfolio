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

document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll("#portfolioCarousel .carousel-slide");
    const dots = document.querySelectorAll("#carouselDots .carousel-dot");
    const caption = document.getElementById("carouselCaption");
    const prevButton = document.getElementById("prevSlide");
    const nextButton = document.getElementById("nextSlide");

    let currentSlide = 0;
    const intervalTime = 4000;
    let autoSlide;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });

        caption.textContent = slides[index].dataset.title || "";
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    function startAutoSlide() {
        autoSlide = setInterval(nextSlide, intervalTime);
    }

    function resetAutoSlide() {
        clearInterval(autoSlide);
        startAutoSlide();
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", function () {
            const index = parseInt(this.dataset.slide, 10);
            showSlide(index);
            resetAutoSlide();
        });
    });

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            nextSlide();
            resetAutoSlide();
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", function () {
            prevSlide();
            resetAutoSlide();
        });
    }

    showSlide(currentSlide);
    startAutoSlide();
});

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");
    const limit = 100; // quando "arrivi al limite sopra"

    function handleScroll() {
        if (window.scrollY <= limit) {
            header.classList.add("transparent");   // sopra → trasparente
        } else {
            header.classList.remove("transparent"); // sotto → normale
        }
    }

    handleScroll(); // stato iniziale
    window.addEventListener("scroll", handleScroll);
});