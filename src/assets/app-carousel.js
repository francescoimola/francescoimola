// ===================================
// Testimonial Carousel
// ===================================
// Handles navigation and interaction for the testimonial carousel

(function() {
  "use strict";

  const carousel = document.querySelector(".testimonial-carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".testimonial-carousel__track");
  const slides = Array.from(track.children);
  const trackContainer = carousel.querySelector('.testimonial-carousel__track-container');
  const nextButton = carousel.querySelector(".testimonial-carousel__button--right");
  const prevButton = carousel.querySelector(".testimonial-carousel__button--left");
  const dotsNav = carousel.querySelector(".testimonial-carousel__nav");
  // collect the actual indicator buttons (not the nav's child divs)
  const dots = Array.from(carousel.querySelectorAll(".testimonial-carousel__indicator"));

  // Set up slide positions
  const slideWidth = slides[0].getBoundingClientRect().width;
  const setSlidePosition = (slide, index) => {
    slide.style.left = slideWidth * index + "px";
  };
  slides.forEach(setSlidePosition);

  // Make all slides share the same height equal to the tallest slide so the
  // container doesn't shift when switching slides.
  // We'll batch measurements (reads) and writes via requestAnimationFrame to
  // avoid layout thrash on slower devices.
  let pendingMeasure = false;
  let lastMeasuredMax = 0;

  const doMeasure = () => {
    if (!trackContainer || !slides || slides.length === 0) return 0;
    const heights = slides.map((s) => Math.ceil(s.getBoundingClientRect().height || s.offsetHeight || 0));
    const max = Math.max(...heights, 0);
    lastMeasuredMax = max;
    return max;
  };

  const applyHeight = (max) => {
    if (!trackContainer) return;
    if (max > 0) {
      trackContainer.style.height = max + 'px';
      slides.forEach((s) => {
        s.style.minHeight = max + 'px';
      });
    }
  };

  const scheduleUniformHeight = () => {
    if (pendingMeasure) return;
    pendingMeasure = true;
    // measure in this event loop turn, then write in rAF
    const measured = doMeasure();
    requestAnimationFrame(() => {
      applyHeight(measured || lastMeasuredMax || 0);
      pendingMeasure = false;
    });
  };

  // initialize container & slides height
  scheduleUniformHeight();

  // Accessibility initialization
  let liveRegion = carousel.querySelector('.testimonial-carousel__live');
  const announceCurrent = () => {
    const currentIndex = slides.findIndex((s) => s.classList.contains('current-slide'));
    if (!liveRegion) return;
    const speaker = slides[currentIndex].querySelector('strong');
    const speakerName = speaker ? speaker.textContent.trim() : '';
    liveRegion.textContent = `Showing testimonial ${currentIndex + 1} of ${slides.length}. ${speakerName}`;
  };

  const initA11y = () => {
    slides.forEach((s, i) => {
      if (!s.id) s.id = `testimonial-slide-${i + 1}`;
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });

    dots.forEach((d, i) => {
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-selected', d.classList.contains('current-slide') ? 'true' : 'false');
      if (!d.hasAttribute('aria-controls')) d.setAttribute('aria-controls', slides[i].id);
      d.tabIndex = 0;
    });

    // initial announcement
    announceCurrent();
  };

  initA11y();

  // Move to slide function
  const moveToSlide = (track, currentSlide, targetSlide) => {
    track.style.transform = "translateX(-" + targetSlide.style.left + ")";
    currentSlide.classList.remove("current-slide");
    targetSlide.classList.add("current-slide");
    // container keeps uniform height
  };

  // central helper to go to an index (updates dots, arrows, accessibility)
  // moveFocus: whether to move focus to the dot (false for button clicks, true for keyboard/dot clicks)
  const goToIndex = (targetIndex, moveFocus = true) => {
    // Handle looping: wrap around if out of bounds
    if (targetIndex < 0) targetIndex = slides.length - 1;
    if (targetIndex >= slides.length) targetIndex = 0;

    const currentSlide = track.querySelector('.current-slide');
    const targetSlide = slides[targetIndex];
    const currentDot = dotsNav.querySelector('.current-slide');
    const targetDot = dots[targetIndex];
    if (!targetSlide || !targetDot) return;

    moveToSlide(track, currentSlide, targetSlide);
    updateDots(currentDot, targetDot);
    // update aria-selected on dots
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === targetIndex ? 'true' : 'false'));
    // arrows always visible for looping carousel
    prevButton.classList.remove("is-hidden");
    nextButton.classList.remove("is-hidden");
    // announce for screen readers
    announceCurrent();
    // move focus to the activated tab/indicator (only for keyboard nav and dot clicks)
    if (moveFocus) {
      try { targetDot.focus(); } catch (e) {}
    }
  };

  // Update indicator dots
  const updateDots = (currentDot, targetDot) => {
    currentDot.classList.remove("current-slide");
    targetDot.classList.add("current-slide");
  };

  // Next button click handler (don't move focus - keep it on button)
  nextButton.addEventListener("click", (e) => {
    const currentIndex = slides.findIndex((s) => s.classList.contains('current-slide'));
    goToIndex(currentIndex + 1, false);
  });

  // Previous button click handler (don't move focus - keep it on button)
  prevButton.addEventListener("click", (e) => {
    const currentIndex = slides.findIndex((s) => s.classList.contains('current-slide'));
    goToIndex(currentIndex - 1, false);
  });

  // Indicator dots click handler
  dotsNav.addEventListener("click", (e) => {
    const targetDot = e.target.closest("button");
    if (!targetDot) return;

    const currentSlide = track.querySelector(".current-slide");
    const currentDot = dotsNav.querySelector(".current-slide");
    const targetIndex = dots.findIndex((dot) => dot === targetDot);
    if (targetIndex === -1) return;
    const targetSlide = slides[targetIndex];

    if (!targetSlide) return;
    goToIndex(targetIndex);
  });

  // Keyboard support for carousel: left/right/home/end
  carousel.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    e.preventDefault();
    const currentIndex = slides.findIndex((s) => s.classList.contains('current-slide'));
    if (key === 'ArrowLeft') {
      goToIndex(currentIndex - 1); // loops to last slide
    } else if (key === 'ArrowRight') {
      goToIndex(currentIndex + 1); // loops to first slide
    } else if (key === 'Home') {
      goToIndex(0);
    } else if (key === 'End') {
      goToIndex(slides.length - 1);
    }
  });

  // Handle window resize to recalculate slide positions
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newSlideWidth = slides[0].getBoundingClientRect().width;
      slides.forEach((slide, index) => {
        slide.style.left = newSlideWidth * index + "px";
      });

      const currentSlide = track.querySelector(".current-slide");
      track.style.transform = "translateX(-" + currentSlide.style.left + ")";
      // update uniform height after resize (re-measure)
      scheduleUniformHeight();
    }, 250);
  });

  // Recompute heights when images inside slides load (they can change measured height)
  const imgs = carousel.querySelectorAll('img');
  imgs.forEach((img) => {
    if (img.complete) {
      // already loaded -> schedule a measurement
      scheduleUniformHeight();
      return;
    }
    img.addEventListener('load', () => {
      // small delay to allow layout to settle
      setTimeout(scheduleUniformHeight, 60);
    });
  });

  // Use ResizeObserver where available to watch for content changes inside slides
  if (typeof ResizeObserver !== 'undefined') {
    try {
      const ro = new ResizeObserver(() => {
        scheduleUniformHeight();
      });
      slides.forEach((s) => ro.observe(s));
    } catch (e) {
      // ignore if ResizeObserver fails
    }
  }

  // Also ensure we run after full window load (fonts/images) as a final safety
  window.addEventListener('load', () => {
    setTimeout(scheduleUniformHeight, 60);
  });

})();
