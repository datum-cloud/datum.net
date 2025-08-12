/**
 * Desktop Navigation JavaScript
 * Handles dropdown hover effects and keyboard navigation for desktop
 */

class DesktopNavigation {
  constructor() {
    this.dropdownItems = document.querySelectorAll('.group');
    this.init();
  }

  init() {
    this.initDropdownHover();
    this.initKeyboardNavigation();
  }

  initDropdownHover() {
    this.dropdownItems.forEach((item) => {
      const dropdown = item.querySelector('.dropdown-menu');
      if (!dropdown) return;

      let hoverTimeout;

      // Mouse enter
      item.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        dropdown.classList.remove('opacity-0', 'invisible');
        dropdown.classList.add('opacity-100', 'visible');
      });

      // Mouse leave
      item.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          dropdown.classList.remove('opacity-100', 'visible');
          dropdown.classList.add('opacity-0', 'invisible');
        }, 150);
      });

      // Prevent closing when hovering over dropdown
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
      });

      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          dropdown.classList.remove('opacity-100', 'visible');
          dropdown.classList.add('opacity-0', 'invisible');
        }, 150);
      });
    });
  }

  initKeyboardNavigation() {
    this.dropdownItems.forEach((item) => {
      const trigger = item.querySelector('a');
      const dropdown = item.querySelector('.dropdown-menu');
      if (!trigger || !dropdown) return;

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDropdown(dropdown);
        } else if (e.key === 'Escape') {
          this.closeDropdown(dropdown);
          trigger.focus();
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!item.contains(e.target)) {
          this.closeDropdown(dropdown);
        }
      });
    });
  }

  toggleDropdown(dropdown) {
    const isVisible = dropdown.classList.contains('visible');

    if (isVisible) {
      this.closeDropdown(dropdown);
    } else {
      this.openDropdown(dropdown);
    }
  }

  openDropdown(dropdown) {
    // Close all other dropdowns first
    this.closeAllDropdowns();

    dropdown.classList.remove('opacity-0', 'invisible');
    dropdown.classList.add('opacity-100', 'visible');

    // Focus first link in dropdown
    const firstLink = dropdown.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }

  closeDropdown(dropdown) {
    dropdown.classList.remove('opacity-100', 'visible');
    dropdown.classList.add('opacity-0', 'invisible');
  }

  closeAllDropdowns() {
    const allDropdowns = document.querySelectorAll('.dropdown-menu');
    allDropdowns.forEach((dropdown) => {
      this.closeDropdown(dropdown);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on desktop
  if (window.innerWidth >= 1024) {
    new DesktopNavigation();
  }
});

// Handle page navigation (for SPA-like behavior)
document.addEventListener('astro:page-load', () => {
  if (window.innerWidth >= 1024) {
    new DesktopNavigation();
  }
});

// Reinitialize on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    new DesktopNavigation();
  }
});
