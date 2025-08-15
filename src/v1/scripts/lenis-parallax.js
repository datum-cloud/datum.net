import Lenis from 'lenis';

class LenisSmoothScroll {
  constructor() {
    this.lenis = null;
    this.scrollElements = [];
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
  }

  initScrollEffects() {
    // Get all elements with scroll effects
    this.scrollElements = document.querySelectorAll('[data-scroll-effect]');

    // Set initial positions and viewport data
    this.scrollElements.forEach((element) => {
      const effect = element.dataset.scrollEffect;
      const speed = parseFloat(element.dataset.scrollSpeed) || 0.5;
      const direction = element.dataset.scrollDirection || 'up';

      element.dataset.scrollSpeed = speed;
      element.dataset.scrollDirection = direction;

      if (effect === 'parallax') {
        element.style.transform = 'translateY(0px)';

        // Store element's position data for viewport detection
        const rect = element.getBoundingClientRect();
        element.dataset.elementTop = rect.top + window.scrollY;
        element.dataset.elementHeight = rect.height;
        element.dataset.viewportOffset = parseFloat(element.dataset.viewportOffset) || 0;

        // Track if element has started animating
        element.dataset.hasStarted = 'false';
        element.dataset.startScrollY = '0';
      }
    });
  }

  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const viewportOffset = parseFloat(element.dataset.viewportOffset) || 0;

    return rect.top <= windowHeight + viewportOffset && rect.bottom >= -viewportOffset;
  }

  onScroll(e) {
    const scrollY = e.scroll;

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
        }

        // Apply maximum movement limits
        if (maxMovement !== Infinity) {
          if (direction === 'left' || direction === 'right') {
            xPos = Math.max(-maxMovement, Math.min(maxMovement, xPos));
          } else {
            yPos = Math.max(-maxMovement, Math.min(maxMovement, yPos));
          }
        }

        // Apply direction-aware boundaries to prevent moving beyond initial position
        if (direction === 'left' || direction === 'right') {
          if (direction === 'left') {
            // For left direction: can move left (negative) but not beyond initial position when scrolling right
            xPos = Math.min(0, xPos);
          } else {
            // For right direction: can move right (positive) but not beyond initial position when scrolling left
            xPos = Math.max(0, xPos);
          }
          element.style.transform = `translateX(${xPos}px)`;
        } else {
          if (direction === 'down') {
            // For down direction: can move down (positive) but not beyond initial position when scrolling up
            yPos = Math.max(0, yPos);
          } else {
            // For up direction: can move up (negative) but not beyond initial position when scrolling down
            yPos = Math.min(0, yPos);
          }
          element.style.transform = `translateY(${yPos}px)`;
        }
      }
    });
  }

  // Public method to destroy
  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
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
