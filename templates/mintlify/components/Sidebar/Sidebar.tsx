import { useState } from 'react';
import type { NavNode } from '@mintlify/astro/helpers';
import { unwrapNav } from '@mintlify/astro/helpers';
import { Icon } from '@mintlify/components';
import { type SidebarItemStyle, type AnchorItem } from './types';
import { SidebarEntries } from './SidebarEntries';
import { Anchors } from './Anchors';

interface SidebarProps {
  navigation: NavNode;
  currentPath: string;
  anchors?: AnchorItem[];
  sidebarItemStyle?: SidebarItemStyle;
  showDivider?: boolean;
}

export default function Sidebar({
  navigation,
  currentPath,
  anchors = [],
  sidebarItemStyle = 'container',
  showDivider = false,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const entries = unwrapNav(navigation, currentPath);

  if (isCollapsed) {
    return (
      <div className="sticky top-28 isolate hidden h-[calc(100vh-7rem)] w-8 shrink-0 flex-col lg:flex">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="mt-1 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Open sidebar"
        >
          <Icon icon="panel-left-open" iconLibrary="lucide" size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-28 isolate hidden h-[calc(100vh-7rem)] w-[18rem] shrink-0 flex-col bg-white lg:flex">
      <div className="sticky top-0 z-10 flex justify-end bg-white pt-1 pb-1">
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close sidebar"
        >
          <Icon icon="panel-left-close" iconLibrary="lucide" size={18} />
        </button>
      </div>
      <nav className="relative flex-1 overflow-y-auto pr-8 pb-10 lg:text-sm lg:leading-6">
        <div className="sticky top-0 z-5 h-8 bg-linear-to-b from-white" />

        {anchors.length > 0 && <Anchors anchors={anchors} />}

        <SidebarEntries
          entries={entries}
          currentPath={currentPath}
          sidebarItemStyle={sidebarItemStyle}
          showDivider={showDivider}
        />
      </nav>
    </div>
  );
}
