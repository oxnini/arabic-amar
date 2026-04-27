import type { Conversation } from "@/lib/types";

interface ConversationDisplayProps {
  conversation: Conversation;
}

export function ConversationDisplay({
  conversation,
}: ConversationDisplayProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h4 className="mb-3 font-semibold text-stone-700">
        {conversation.title}
      </h4>
      <div className="space-y-3">
        {conversation.lines.map((line, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 ${
              i % 2 === 0
                ? "ml-0 mr-12 bg-stone-100"
                : "ml-12 mr-0 bg-amber-50"
            }`}
          >
            <p className="text-xs font-medium text-stone-400">
              {line.speaker}
            </p>
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-lg leading-relaxed text-stone-900"
            >
              {line.arabic}
            </p>
            <p className="text-sm text-amber-700">{line.transliteration}</p>
            <p className="text-sm text-stone-500">{line.english}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
