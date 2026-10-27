// src/libs/tooltip.ts

import type { Alpine } from 'alpinejs';

type OpenedBy = 'hover' | 'keyboard' | 'touch' | null;

interface InfoTooltip {
  $refs: {
    trigger?: HTMLButtonElement;
    bubble?: HTMLElement;
    arrow?: HTMLElement;
  };
  $nextTick: (callback: () => void) => void;
  open: boolean;
  /** Pointer type of the gesture currently in progress. */
  gesture: string;
  openedBy: OpenedBy;
  onReflow: (() => void) | null;
  init(): void;
  destroy(): void;
  notePointer(event: PointerEvent): void;
  cancelGesture(): void;
  showHover(event: PointerEvent): void;
  hideHover(event: PointerEvent): void;
  onFocus(event: FocusEvent): void;
  onBlur(): void;
  onClick(): void;
  close(): void;
  clearPlace(): void;
  place(retry?: number): void;
}

/**
 * Registers the info-tooltip Alpine component.
 * @param Alpine - Alpine instance from the app entrypoint
 */
export const registerInfoTooltip = (Alpine: Alpine): void => {
  Alpine.data('infoTooltip', () => createInfoTooltip());
};

const createInfoTooltip = (): InfoTooltip => ({
  $refs: {},
  $nextTick: (callback) => callback(),
  open: false,
  gesture: '',
  openedBy: null,
  onReflow: null,

  init() {
    this.onReflow = () => {
      if (this.open && this.openedBy === 'touch') this.place();
    };
    window.addEventListener('resize', this.onReflow);
    window.addEventListener('scroll', this.onReflow, true);
    window.visualViewport?.addEventListener('resize', this.onReflow);
    window.visualViewport?.addEventListener('scroll', this.onReflow);
  },

  destroy() {
    if (!this.onReflow) return;
    window.removeEventListener('resize', this.onReflow);
    window.removeEventListener('scroll', this.onReflow, true);
    window.visualViewport?.removeEventListener('resize', this.onReflow);
    window.visualViewport?.removeEventListener('scroll', this.onReflow);
  },

  notePointer(event) {
    this.gesture = event.pointerType;
  },

  cancelGesture() {
    this.gesture = '';
  },

  showHover(event) {
    // A tap synthesizes pointerenter before click. Opening here makes iOS drop that click.
    if (event.pointerType !== 'mouse') return;
    this.gesture = 'mouse';
    this.openedBy = 'hover';
    this.clearPlace();
    this.open = true;
  },

  hideHover(event) {
    if (event.pointerType !== 'mouse' || this.openedBy !== 'hover') return;
    this.close();
  },

  onFocus(event) {
    if (this.gesture === 'touch' || this.openedBy === 'hover') return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement) || !target.matches(':focus-visible')) return;
    this.openedBy = 'keyboard';
    this.clearPlace();
    this.open = true;
  },

  onBlur() {
    if (this.openedBy === 'touch') return;
    this.close();
  },

  onClick() {
    const gesture = this.gesture;
    this.gesture = '';
    if (gesture === 'mouse') return;
    if (gesture === '' && this.openedBy === 'keyboard') return;
    this.open = !this.open;
    this.openedBy = this.open ? 'touch' : null;
    if (this.open) this.$nextTick(() => this.place());
    else this.clearPlace();
  },

  close() {
    this.open = false;
    this.openedBy = null;
    this.clearPlace();
  },

  clearPlace() {
    const bubble = this.$refs.bubble;
    const arrow = this.$refs.arrow;
    if (bubble) {
      bubble.style.position = '';
      bubble.style.left = '';
      bubble.style.top = '';
      bubble.style.right = '';
      bubble.style.bottom = '';
      bubble.style.width = '';
      bubble.style.zIndex = '';
    }
    if (arrow) {
      arrow.style.left = '';
      arrow.style.right = '';
      arrow.style.top = '';
      arrow.style.bottom = '';
    }
  },

  place(retry = 2) {
    const trigger = this.$refs.trigger;
    const bubble = this.$refs.bubble;
    const arrow = this.$refs.arrow;
    if (!trigger || !bubble || !this.open) return;

    const rect = trigger.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
      this.close();
      return;
    }

    bubble.style.width = '';
    const natural = bubble.getBoundingClientRect().width;
    if (natural < 1) {
      if (retry > 0) {
        requestAnimationFrame(() => {
          if (this.open) this.place(retry - 1);
        });
      }
      return;
    }

    const margin = 16;
    const gap = 8;
    const width = Math.min(natural, window.innerWidth - margin * 2);
    bubble.style.position = 'fixed';
    bubble.style.right = 'auto';
    bubble.style.bottom = 'auto';
    bubble.style.width = `${width}px`;
    bubble.style.zIndex = '40';

    let left = rect.left - 16;
    left = Math.min(left, window.innerWidth - margin - width);
    left = Math.max(margin, left);

    const bubbleHeight = bubble.offsetHeight;
    const aboveTop = rect.top - gap - bubbleHeight;
    const above = aboveTop >= margin;
    let top = above ? aboveTop : rect.bottom + gap;
    if (top + bubbleHeight > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - margin - bubbleHeight);
    }

    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;

    if (!arrow) return;
    const arrowSize = 15;
    const triggerCenter = rect.left + rect.width / 2;
    let arrowLeft = triggerCenter - left - arrowSize / 2;
    arrowLeft = Math.max(8, Math.min(arrowLeft, width - arrowSize - 8));
    arrow.style.left = `${Math.round(arrowLeft)}px`;
    arrow.style.right = 'auto';
    arrow.style.top = above ? 'auto' : '-0.46875rem';
    arrow.style.bottom = above ? '-0.46875rem' : 'auto';
  },
});
