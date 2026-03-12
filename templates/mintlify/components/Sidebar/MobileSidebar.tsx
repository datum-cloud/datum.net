import { useState, useEffect } from 'react';
import { cn, Icon } from '@mintlify/components';
import type { NavNode, TabInfo } from '@mintlify/astro/helpers';
import { unwrapNav } from '@mintlify/astro/helpers';
import { type SidebarItemStyle, type AnchorItem } from './types';
import { SidebarEntries } from './SidebarEntries';
import { Anchors } from './Anchors';
import { TabsDropdown } from './TabsDropdown';

interface MobileSidebarProps {
  navigation: NavNode;
  currentPath: string;
  tabs?: TabInfo[];
  anchors?: AnchorItem[];
  sidebarItemStyle?: SidebarItemStyle;
  showDivider?: boolean;
}

export function MobileSidebar({
  navigation,
  currentPath,
  tabs = [],
  anchors = [],
  sidebarItemStyle = 'container',
  showDivider = false,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entries = unwrapNav(navigation, currentPath);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-60 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed top-4 right-4 z-80 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-md hover:text-gray-600 lg:hidden"
          aria-label="Close navigation"
        >
          <Icon icon="x" iconLibrary="lucide" size={18} />
        </button>
      )}

      <div
        className={cn(
          'fixed top-0 bottom-0 left-0 z-70 w-[20rem] bg-white transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-6 pb-4">
            <img src="/datum-light.svg" alt="Mint Starter Kit" className="h-7 w-auto" />
          </div>

          <nav className="flex-1 overflow-y-auto pt-4 pb-8">
            {tabs.length > 0 && (
              <div className="mb-4 px-4">
                <TabsDropdown tabs={tabs} />
              </div>
            )}

            {anchors.length > 0 && (
              <div className="px-2">
                <Anchors anchors={anchors} />
              </div>
            )}

            <div className="px-4">
              <SidebarEntries
                entries={entries}
                currentPath={currentPath}
                sidebarItemStyle={sidebarItemStyle}
                showDivider={showDivider}
              />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
