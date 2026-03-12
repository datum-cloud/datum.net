import { Icon } from '@mintlify/components';
import { openSearch } from './SearchBar';
import { toggleAssistant } from './Assistant/events';

export function MobileActionButtons() {
  return (
    <div className="flex items-center gap-2 lg:hidden">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-600"
        onClick={openSearch}
        aria-label="Search"
      >
        <Icon icon="search" iconLibrary="lucide" size={16} color="dimgray" />
      </button>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-600"
        onClick={toggleAssistant}
        aria-label="AI Assistant"
      >
        <Icon icon="sparkles" iconLibrary="lucide" size={16} color="dimgray" />
      </button>
    </div>
  );
}

export function MobileNavToggle({
  pageTitle,
  groupName,
}: {
  pageTitle: string;
  groupName?: string;
}) {
  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  return (
    <button
      type="button"
      className="flex h-14 w-full items-center py-4 text-left focus:outline-0 lg:hidden lg:px-[5vw]"
      onClick={handleToggle}
    >
      <div className="flex items-center text-gray-500 hover:text-gray-600">
        <span className="sr-only">Navigation</span>
        <Icon icon="menu" iconLibrary="lucide" size={18} />
      </div>
      <div className="ml-4 flex min-w-0 space-x-3 overflow-hidden text-sm leading-6 whitespace-nowrap">
        {groupName && (
          <div className="flex shrink-0 items-center space-x-3">
            <span>{groupName}</span>
            <Icon icon="chevron-right" iconLibrary="lucide" size={16} className="text-gray-400" />
          </div>
        )}
        <div className="min-w-0 flex-1 truncate font-semibold text-gray-900">{pageTitle}</div>
      </div>
    </button>
  );
}
