// src/components/content/tabs.ts

class Tabs extends HTMLElement {
  static #syncedTabs = new Map<string, Tabs[]>();

  tabs!: HTMLAnchorElement[];
  panels!: HTMLElement[];
  #syncKey: string | undefined;
  #storageKeyPrefix = 'tabs-synced__';

  constructor() {
    super();
    const tablist = this.querySelector<HTMLUListElement>('[role="tablist"]')!;
    this.tabs = [...tablist.querySelectorAll<HTMLAnchorElement>('[role="tab"]')];
    // Use [role="tabpanel"] (any depth) - Fragment/slot may wrap panels in some contexts
    this.panels = [...this.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    if (import.meta.env.DEV) {
      console.debug('[Tabs] init', { tabs: this.tabs.length, panels: this.panels.length });
    }
    this.#syncKey = this.dataset.syncKey;

    if (this.#syncKey) {
      const syncedTabs = Tabs.#syncedTabs.get(this.#syncKey) ?? [];
      syncedTabs.push(this);
      Tabs.#syncedTabs.set(this.#syncKey, syncedTabs);
    }

    this.tabs.forEach((tab, i) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTab = tablist.querySelector('[aria-selected="true"]');
        if (e.currentTarget !== currentTab) {
          this.switchTab(e.currentTarget as HTMLAnchorElement, i);
        }
      });

      tab.addEventListener('keydown', (e) => {
        const index = this.tabs.indexOf(e.currentTarget as HTMLAnchorElement);
        const nextIndex =
          e.key === 'ArrowLeft'
            ? index - 1
            : e.key === 'ArrowRight'
              ? index + 1
              : e.key === 'Home'
                ? 0
                : e.key === 'End'
                  ? this.tabs.length - 1
                  : null;
        if (nextIndex === null) return;
        if (this.tabs[nextIndex]) {
          e.preventDefault();
          this.switchTab(this.tabs[nextIndex], nextIndex);
        }
      });
    });
  }

  switchTab(newTab: HTMLAnchorElement | null | undefined, index: number, shouldSync = true) {
    if (!newTab) return;
    const previousTabsOffset = shouldSync ? this.getBoundingClientRect().top : 0;

    this.tabs.forEach((tab) => {
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });
    this.panels.forEach((oldPanel) => {
      oldPanel.hidden = true;
    });

    // Resolve panel by index or by tab href (more robust when DOM order differs)
    const panelId = newTab.getAttribute('href')?.slice(1);
    const newPanel =
      this.panels[index] ??
      (panelId ? this.querySelector<HTMLElement>(`#${CSS.escape(panelId)}`) : null);
    if (newPanel) newPanel.hidden = false;
    newTab.removeAttribute('tabindex');
    newTab.setAttribute('aria-selected', 'true');
    if (shouldSync) {
      newTab.focus();
      Tabs.#syncTabs(this, newTab);
      window.scrollTo({
        top: window.scrollY + (this.getBoundingClientRect().top - previousTabsOffset),
        behavior: 'instant',
      });
    }
  }

  #persistSyncedTabs(label: string) {
    if (!this.#syncKey || typeof localStorage === 'undefined') return;
    localStorage.setItem(this.#storageKeyPrefix + this.#syncKey, label);
  }

  static #syncTabs(emitter: Tabs, newTab: HTMLAnchorElement) {
    const syncKey = emitter.#syncKey;
    const label = Tabs.#getTabLabel(newTab);
    if (!syncKey || !label) return;
    const syncedTabs = Tabs.#syncedTabs.get(syncKey);
    if (!syncedTabs) return;

    for (const receiver of syncedTabs) {
      if (receiver === emitter) continue;
      const labelIndex = receiver.tabs.findIndex((tab) => Tabs.#getTabLabel(tab) === label);
      if (labelIndex === -1) continue;
      receiver.switchTab(receiver.tabs[labelIndex], labelIndex, false);
    }

    emitter.#persistSyncedTabs(label);
  }

  static #getTabLabel(tab: HTMLAnchorElement) {
    return tab.textContent?.trim();
  }
}

customElements.define('datum-tabs', Tabs);
