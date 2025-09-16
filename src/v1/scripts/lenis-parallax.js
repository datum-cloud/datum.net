import Lenis from 'lenis';

class LenisSmoothScroll {
  constructor() {
    this.lenis = null;
    this.scrollElements = [];
    this.lastScrollY = 0;
    this.throttleDelay = 16; // ~60fps
    this.lastUpdate = 0;
    this.init();
  }

  init() {
    // Initialize Lenis for smooth scrolling
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Bind scroll event for effects
    this.lenis.on('scroll', this.onScroll.bind(this));

    // Bind RAF for smooth animation
    function raf(time) {
      this.lenis.raf(time);
      requestAnimationFrame(raf.bind(this));
    }

    requestAnimationFrame(raf.bind(this));

    // Initialize scroll effects
    this.initScrollEffects();

    // Handle window resize to recalculate element positions
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  initScrollEffects() {
    // Get all elements with scroll effects
    this.scrollElements = document.querySelectorAll('[data-scroll-effect]');

    // Get all elements with reveal animations
    this.revealElements = document.querySelectorAll('[data-reveal]');

    // Initialize reveal animations
    this.initRevealAnimations();

    // Set initial positions and viewport data
    this.scrollElements.forEach((element) => {
      const effect = element.dataset.scrollEffect;
      const speed = parseFloat(element.dataset.scrollSpeed) || 0.5;
      const direction = element.dataset.scrollDirection || 'up';

      element.dataset.scrollSpeed = speed;
      element.dataset.scrollDirection = direction;

      if (effect === 'parallax') {
        // Set initial transform based on direction
        if (direction === 'left' || direction === 'right') {
          element.style.transform = 'translateX(0px)';
        } else if (
          direction === 'up-right' ||
          direction === 'up-left' ||
          direction === 'down-right' ||
          direction === 'down-left'
        ) {
          element.style.transform = 'translate(0px, 0px)';
        } else {
          element.style.transform = 'translateY(0px)';
        }

        // Store element's position data for viewport detection
        const rect = element.getBoundingClientRect();
        element.dataset.elementTop = rect.top + window.scrollY;
        element.dataset.elementHeight = rect.height;
        element.dataset.viewportOffset = parseFloat(element.dataset.viewportOffset) || 0;

        // Track if element has started animating
        element.dataset.hasStarted = 'false';
        element.dataset.startScrollY = '0';

        // Check if element is already in viewport on page load
        if (this.isElementInViewport(element)) {
          element.dataset.hasStarted = 'true';
          element.dataset.startScrollY = window.scrollY.toString();
        }
      }
    });
  }

  initRevealAnimations() {
    // Initialize all reveal elements
    this.revealElements.forEach((element) => {
      const revealClass = element.dataset.reveal;
      const delay = parseInt(element.dataset.revealDelay) || 0;
      const threshold = parseFloat(element.dataset.revealThreshold) || 0.1;
      const immediate = element.dataset.revealImmediate === 'true';

      // Store reveal configuration
      element.dataset.revealClass = revealClass;
      element.dataset.revealDelay = delay;
      element.dataset.revealThreshold = threshold;
      element.dataset.hasRevealed = 'false';

      // If immediate reveal is enabled, trigger immediately
      if (immediate) {
        this.triggerReveal(element);
      } else {
        // Check if element is already in viewport on page load
        if (this.isElementInViewport(element, threshold)) {
          this.triggerReveal(element);
        }
      }
    });
  }

  triggerReveal(element) {
    const revealClass = element.dataset.revealClass;
    const delay = parseInt(element.dataset.revealDelay);

    if (element.dataset.hasRevealed === 'true') {
      return; // Already revealed
    }

    element.dataset.hasRevealed = 'true';

    setTimeout(() => {
      element.classList.add(revealClass);
    }, delay);
  }

  isElementInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Calculate threshold-based visibility
    const thresholdOffset = windowHeight * threshold;

    // Check if element is visible in viewport with threshold
    const isInViewport =
      rect.top <= windowHeight - thresholdOffset &&
      rect.bottom >= thresholdOffset &&
      rect.left <= windowWidth &&
      rect.right >= 0;

    // Additional check for element visibility (not hidden by CSS)
    const isVisible =
      element.offsetParent !== null &&
      element.style.display !== 'none' &&
      element.style.visibility !== 'hidden' &&
      element.style.opacity !== '0';

    return isInViewport && isVisible;
  }

  onScroll(e) {
    const scrollY = e.scroll;
    const now = Date.now();

    // Throttle updates to prevent jiggling
    if (now - this.lastUpdate < this.throttleDelay) {
      return;
    }
    this.lastUpdate = now;

    // Check reveal elements
    this.revealElements.forEach((element) => {
      if (element.dataset.hasRevealed === 'false') {
        const threshold = parseFloat(element.dataset.revealThreshold) || 0.1;
        if (this.isElementInViewport(element, threshold)) {
          this.triggerReveal(element);
        }
      }
    });

    // Update each element with scroll effects
    this.scrollElements.forEach((element) => {
      const effect = element.dataset.scrollEffect;

      if (effect === 'parallax') {
        const isInViewport = this.isElementInViewport(element);
        const hasStarted = element.dataset.hasStarted === 'true';

        // Check if element is entering viewport for the first time
        if (isInViewport && !hasStarted) {
          element.dataset.hasStarted = 'true';
          element.dataset.startScrollY = scrollY.toString();
        }

        // Only apply effect if element is in viewport and has started
        if (!isInViewport || !hasStarted) {
          return;
        }

        const speed = parseFloat(element.dataset.scrollSpeed);
        const direction = element.dataset.scrollDirection || 'up';
        const startScrollY = parseFloat(element.dataset.startScrollY);
        const relativeScroll = scrollY - startScrollY;
        const maxMovement = parseFloat(element.dataset.maxMovement) || Infinity;

        let yPos = 0;
        let xPos = 0;

        // Calculate position based on direction using relative scroll
        if (direction === 'down') {
          yPos = relativeScroll * speed; // Move down (positive)
        } else if (direction === 'up') {
          yPos = -(relativeScroll * speed); // Move up (negative)
        } else if (direction === 'left') {
          xPos = -(relativeScroll * speed); // Move left (negative X)
        } else if (direction === 'right') {
          xPos = relativeScroll * speed; // Move right (positive X)
        } else if (direction === 'up-right') {
          yPos = -(relativeScroll * speed); // Move up (negative Y)
          xPos = relativeScroll * speed; // Move right (positive X)
        } else if (direction === 'up-left') {
          yPos = -(relativeScroll * speed); // Move up (negative Y)
          xPos = -(relativeScroll * speed); // Move left (negative X)
        } else if (direction === 'down-right') {
          yPos = relativeScroll * speed; // Move down (positive Y)
          xPos = relativeScroll * speed; // Move right (positive X)
        } else if (direction === 'down-left') {
          yPos = relativeScroll * speed; // Move down (positive Y)
          xPos = -(relativeScroll * speed); // Move left (negative X)
        }

        // Debug logging for up direction
        // if (direction === 'up' && maxMovement !== Infinity) {
        //   console.log('Up direction debug:', {
        //     relativeScroll,
        //     yPos: yPos.toFixed(2),
        //     maxMovement,
        //     speed,
        //   });
        // }

        // Apply direction-aware boundaries and maximum movement limits
        if (direction === 'left' || direction === 'right') {
          if (direction === 'left') {
            // For left direction: can move left (negative) but not beyond initial position when scrolling right
            xPos = Math.min(0, xPos);
            // Apply max movement limit
            if (maxMovement !== Infinity) {
              xPos = Math.max(-maxMovement, xPos);
            }
          } else {
            // For right direction: can move right (positive) but not beyond initial position when scrolling left
            xPos = Math.max(0, xPos);
            // Apply max movement limit
            if (maxMovement !== Infinity) {
              xPos = Math.min(maxMovement, xPos);
            }
          }
          element.style.transform = `translateX(${Math.round(xPos)}px)`;
        } else if (
          direction === 'up-right' ||
          direction === 'up-left' ||
          direction === 'down-right' ||
          direction === 'down-left'
        ) {
          // Handle diagonal directions
          if (direction === 'up-right') {
            // For up-right: can move up and right, but not beyond initial position
            yPos = Math.min(0, yPos);
            xPos = Math.max(0, xPos);
            // Apply max movement limit to both axes
            if (maxMovement !== Infinity) {
              yPos = Math.max(-maxMovement, yPos);
              xPos = Math.min(maxMovement, xPos);
            }
          } else if (direction === 'up-left') {
            // For up-left: can move up and left, but not beyond initial position
            yPos = Math.min(0, yPos);
            xPos = Math.min(0, xPos);
            // Apply max movement limit to both axes
            if (maxMovement !== Infinity) {
              yPos = Math.max(-maxMovement, yPos);
              xPos = Math.max(-maxMovement, xPos);
            }
          } else if (direction === 'down-right') {
            // For down-right: can move down and right, but not beyond initial position
            yPos = Math.max(0, yPos);
            xPos = Math.max(0, xPos);
            // Apply max movement limit to both axes
            if (maxMovement !== Infinity) {
              yPos = Math.min(maxMovement, yPos);
              xPos = Math.min(maxMovement, xPos);
            }
          } else if (direction === 'down-left') {
            // For down-left: can move down and left, but not beyond initial position
            yPos = Math.max(0, yPos);
            xPos = Math.min(0, xPos);
            // Apply max movement limit to both axes
            if (maxMovement !== Infinity) {
              yPos = Math.min(maxMovement, yPos);
              xPos = Math.max(-maxMovement, xPos);
            }
          }
          element.style.transform = `translate(${Math.round(xPos)}px, ${Math.round(yPos)}px)`;
        } else {
          if (direction === 'down') {
            // For down direction: can move down (positive) but not beyond initial position when scrolling up
            yPos = Math.max(0, yPos);
            // Apply max movement limit
            if (maxMovement !== Infinity) {
              yPos = Math.min(maxMovement, yPos);
            }
          } else {
            // For up direction: can move up (negative) but not beyond initial position when scrolling down
            yPos = Math.min(0, yPos);
            // Apply max movement limit
            if (maxMovement !== Infinity) {
              yPos = Math.max(-maxMovement, yPos);
            }

            // Debug logging for final position
            if (direction === 'up' && maxMovement !== Infinity) {
              // console.log('Final yPos:', yPos.toFixed(2));
            }
          }
          element.style.transform = `translateY(${Math.round(yPos)}px)`;
        }
      }
    });
  }

  handleResize() {
    // Recalculate element positions after resize
    this.scrollElements.forEach((element) => {
      const effect = element.dataset.scrollEffect;

      if (effect === 'parallax') {
        const rect = element.getBoundingClientRect();
        element.dataset.elementTop = rect.top + window.scrollY;
        element.dataset.elementHeight = rect.height;
      }
    });
  }

  // Public method to destroy
  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }

    // Remove resize listener
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.smoothScrollInstance = new LenisSmoothScroll();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.smoothScrollInstance) {
    window.smoothScrollInstance.destroy();
  }
});
