export function AssistantEmptyState() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="mt-4 flex flex-col items-center text-sm">
        <div className="mx-8 text-center text-xs text-gray-400">
          Responses are generated using AI and may contain mistakes.
        </div>
      </div>
    </div>
  );
}
