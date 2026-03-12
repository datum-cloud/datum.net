import { useMemo } from 'react';
import type { UIMessage } from '@ai-sdk/react';
import { ChatItem } from './ChatItem';

interface AssistantHistoryListProps {
  messages: UIMessage[];
  status: 'ready' | 'streaming' | 'submitted' | 'error';
}

const hasVisibleParts = (parts: UIMessage['parts'] | undefined) =>
  parts?.some((part) => part.type === 'text' || part.type === 'tool-search') ?? false;

function LoadingIndicator() {
  return (
    <div className="mb-4 flex h-3 items-end gap-0.5 py-2">
      <span className="animate-dot-bounce size-1 rounded-full bg-zinc-400" />
      <span className="animate-dot-bounce size-1 rounded-full bg-zinc-400 [animation-delay:0.2s]" />
      <span className="animate-dot-bounce size-1 rounded-full bg-zinc-400 [animation-delay:0.4s]" />
    </div>
  );
}

export function AssistantHistoryList({ messages, status }: AssistantHistoryListProps) {
  const isLoading = useMemo(() => {
    if (status === 'submitted') return true;
    if (status !== 'streaming') return false;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return false;
    if (lastMessage.role === 'user') return true;

    const lastPart = lastMessage.parts[lastMessage.parts.length - 1];
    return lastPart?.type !== 'text' || !lastPart.text;
  }, [status, messages]);

  const visibleMessages = messages.filter(
    (msg) => msg.role !== 'system' && (msg.role !== 'assistant' || hasVisibleParts(msg.parts))
  );

  return (
    <div className="space-y-4">
      {visibleMessages.map((msg, index) => (
        <ChatItem key={msg.id} message={msg} isLast={index === visibleMessages.length - 1} />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  );
}
