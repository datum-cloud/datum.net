import { useState } from 'react';
import { Icon, cn } from '@mintlify/components';
import { useContextualOptions, type ContextualOptionItem } from '../hooks/useContextualOptions';

type CopyState = 'idle' | 'copying' | 'copied' | 'error';

interface PageContextMenuProps {
  pathname: string;
  options?: string[];
  className?: string;
}

export function PageContextMenu({
  pathname,
  options: configOptions,
  className,
}: PageContextMenuProps) {
  const markdownPath = pathname === '/' ? '/index' : pathname;

  const { options } = useContextualOptions({
    pathname: markdownPath,
    options: configOptions,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  if (!options.length) return null;

  const handleAction = async (option: ContextualOptionItem) => {
    setIsOpen(false);
    if (option.id === 'copy') {
      setCopyState('copying');
      try {
        const result = await option.action();
        setCopyState(result === false ? 'error' : 'copied');
      } catch {
        setCopyState('error');
      }
      setTimeout(() => setCopyState('idle'), 2000);
    } else {
      option.action();
    }
  };

  const copyText =
    copyState === 'copying'
      ? 'Copying...'
      : copyState === 'copied'
        ? 'Copied!'
        : copyState === 'error'
          ? 'Error'
          : 'Copy page';

  const firstOption = options[0];

  return (
    <div className={cn('relative flex shrink-0 items-center', className)}>
      <div className="relative z-20 flex h-9 items-stretch">
        {firstOption && (
          <button
            className={cn(
              'h-full rounded-l-xl border border-stone-200 bg-white px-3 text-stone-700 transition-colors hover:bg-stone-50',
              options.length === 1 ? 'rounded-xl' : 'border-r-0',
              copyState !== 'idle' && 'text-stone-600'
            )}
            onClick={() => void handleAction(firstOption)}
            disabled={copyState === 'copying'}
            aria-label={firstOption.title}
          >
            <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
              {firstOption.icon && <firstOption.icon className="h-4 w-4 text-stone-600" />}
              <span>{firstOption.id === 'copy' ? copyText : firstOption.title}</span>
            </div>
          </button>
        )}
        {options.length > 1 && (
          <button
            className="flex aspect-square h-full items-center justify-center rounded-r-xl border border-stone-200 bg-white transition-colors hover:bg-stone-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="More actions"
          >
            <Icon
              icon="chevron-down"
              iconLibrary="lucide"
              size={16}
              color="currentColor"
              className={cn('text-stone-400 transition-transform', isOpen && 'rotate-180')}
            />
          </button>
        )}
      </div>
      {isOpen && options.length > 1 && (
        <>
          <button
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
            }}
            aria-label="Close menu"
            type="button"
          />
          <div className="absolute top-full left-0 z-20 mt-2 w-auto min-w-[280px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg sm:right-0 sm:left-auto sm:w-64">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => void handleAction(option)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-stone-50"
              >
                <div className="rounded-md border border-stone-200 p-1.5">
                  {option.icon && <option.icon className="h-4 w-4 text-stone-500" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-1 text-sm font-medium text-stone-800">
                    {option.title}
                    {option.externalLink && (
                      <Icon
                        icon="arrow-up-right"
                        iconLibrary="lucide"
                        size={12}
                        color="currentColor"
                        className="text-stone-500"
                      />
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-stone-600">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
