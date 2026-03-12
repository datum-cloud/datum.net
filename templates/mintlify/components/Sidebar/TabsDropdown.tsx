import { useState } from 'react';
import { cn, Icon } from '@mintlify/components';
import type { TabInfo } from '@mintlify/astro/helpers';

interface TabsDropdownProps {
  tabs: TabInfo[];
}

export function TabsDropdown({ tabs }: TabsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeTab = tabs.find((tab) => tab.isActive);

  if (tabs.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between gap-1.5 rounded-[0.85rem] border border-gray-200/70 px-4 py-2.5 hover:bg-gray-600/5"
      >
        <span className="text-base font-normal text-gray-800">
          {activeTab?.name || tabs[0]?.name}
        </span>
        <Icon
          icon="chevron-down"
          iconLibrary="lucide"
          className={cn('transition-transform', isOpen && 'rotate-180')}
          size={16}
        />
      </button>

      {isOpen && (
        <>
          <button
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Close dropdown"
            type="button"
          />
          <div className="absolute top-full right-0 left-0 z-20 mt-1 rounded-lg border border-gray-200/70 bg-white p-1.5 shadow-lg">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={cn(
                  'flex items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium hover:bg-gray-100',
                  tab.isActive ? 'text-primary' : 'text-gray-800'
                )}
                onClick={() => setIsOpen(false)}
              >
                {tab.name}
                {tab.isActive && (
                  <Icon icon="check" iconLibrary="lucide" className="text-primary" size={16} />
                )}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
