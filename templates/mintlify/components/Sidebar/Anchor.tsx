import { cn, Icon } from '@mintlify/components';
import type { AnchorItem } from './types';

export function Anchor({ name, href, icon, color }: AnchorItem) {
  const isExternal =
    href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{ '--anchor-color': color || 'var(--primary)' } as React.CSSProperties}
      className={cn(
        'group mb-5 ml-4 flex items-center font-medium outline-offset-4 sm:mb-4 lg:ml-0 lg:text-sm lg:leading-6',
        'text-gray-600 hover:text-gray-900'
      )}
    >
      {icon && (
        <span
          className={cn(
            'mr-4 inline-flex h-6 w-6 items-center justify-center rounded-md p-1',
            'ring-1 ring-gray-950/[0.07] group-hover:[background:var(--anchor-color)]'
          )}
        >
          <Icon icon={icon} className="bg-gray-600 group-hover:bg-white" overrideColor size={16} />
        </span>
      )}
      {name}
    </a>
  );
}
