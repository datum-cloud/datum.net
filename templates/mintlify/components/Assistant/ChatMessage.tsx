import * as React from 'react';
import type { UIMessage } from '@ai-sdk/react';
import { cn } from '@mintlify/components';

interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: UIMessage;
}

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, message, ...props }, ref) => {
    const content = message.parts
      .filter((p) => p.type === 'text')
      .map((p) => ('text' in p ? p.text : ''))
      .join('');

    return (
      <div className="flex w-full flex-col items-end justify-end gap-2">
        <div
          ref={ref}
          className={cn(
            'flex w-fit items-start gap-4 rounded-2xl bg-gray-100 px-3 py-2',
            className
          )}
          {...props}
        >
          <div className="flex w-full items-start gap-4">
            <div className="flex w-full flex-col gap-1">
              <div className="text-base wrap-break-word hyphens-auto text-gray-800 lg:text-sm">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
ChatMessage.displayName = 'ChatMessage';
