// src/v1/scripts/glossary-tooltip.js
/**
 * Glossary Tooltip Handler
 * Shows floating popup on hover for glossary terms
 */

(function () {
  let tooltip = null;
  let currentTerm = null;
  let hideTimeout = null;

  /**
   * Create tooltip element
   */
  function createTooltip() {
    const el = document.createElement('div');
    el.className = 'glossary-tooltip';
    el.innerHTML = `
      <div class="glossary-tooltip-title"></div>
      <div class="glossary-tooltip-description"></div>
    `;

    document.body.appendChild(el);

    // Keep tooltip visible when hovering over it
    el.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout);
    });

    el.addEventListener('mouseleave', () => {
      hideTooltip();
    });

    return el;
  }

  /**
   * Position tooltip near the element
   */
  function positionTooltip(termElement, tooltipElement) {
    const rect = termElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left;

    // Adjust if tooltip goes off right edge
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 16;
    }

    // Adjust if tooltip goes off bottom edge
    if (rect.bottom + tooltipRect.height + 8 > window.innerHeight) {
      top = rect.top - tooltipRect.height - 8;
    }

    // Ensure not off left edge
    if (left < 8) {
      left = 8;
    }

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
  }

  /**
   * Show tooltip for glossary term
   */
  function showTooltip(termElement) {
    clearTimeout(hideTimeout);

    const title = termElement.getAttribute('data-glossary-title');
    const description = termElement.getAttribute('data-glossary-description');

    if (!title || !description) return;

    if (!tooltip) {
      tooltip = createTooltip();
    }

    const titleEl = tooltip.querySelector('.glossary-tooltip-title');
    const descEl = tooltip.querySelector('.glossary-tooltip-description');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = description;

    tooltip.style.display = 'block';

    // Position after display to get correct dimensions
    requestAnimationFrame(() => {
      positionTooltip(termElement, tooltip);
      tooltip.style.opacity = '1';
    });

    currentTerm = termElement;
  }

  /**
   * Hide tooltip with delay
   */
  function hideTooltip() {
    hideTimeout = setTimeout(() => {
      if (tooltip) {
        tooltip.style.opacity = '0';
        setTimeout(() => {
          if (tooltip) {
            tooltip.style.display = 'none';
          }
        }, 200);
      }
      currentTerm = null;
    }, 100);
  }

  /**
   * Initialize glossary tooltips
   */
  function init() {
    // Use event delegation for better performance
    document.addEventListener(
      'mouseenter',
      (e) => {
        const target = e.target;
        if (target.classList && target.classList.contains('glossary-term')) {
          showTooltip(target);
        }
      },
      true
    );

    document.addEventListener(
      'mouseleave',
      (e) => {
        const target = e.target;
        if (target.classList && target.classList.contains('glossary-term')) {
          hideTooltip();
        }
      },
      true
    );

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (currentTerm && tooltip) {
          positionTooltip(currentTerm, tooltip);
        }
      }, 100);
    });

    // Handle scroll
    let scrollTimer;
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          if (currentTerm && tooltip) {
            positionTooltip(currentTerm, tooltip);
          }
        }, 10);
      },
      { passive: true }
    );
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
