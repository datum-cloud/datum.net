import { Icon } from '@mintlify/components';
import { toggleAssistant } from './events';

export function AssistantButton() {
  return (
    <button
      onClick={toggleAssistant}
      type="button"
      className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-white pr-3.5 pl-3 shadow-sm ring-1 ring-gray-400/20 transition-all hover:ring-gray-600/25"
      aria-label="Toggle AI Assistant"
    >
      <Icon icon="sparkles" iconLibrary="lucide" size={16} color="dimgray" className="shrink-0" />
      <span className="text-sm whitespace-nowrap text-gray-500">Ask AI</span>
    </button>
  );
}
