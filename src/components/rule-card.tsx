import type { GrammarRule } from "@/lib/types";

interface RuleCardProps {
  rule: GrammarRule;
}

export function RuleCard({ rule }: RuleCardProps) {
  return (
    <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
      <h4 className="font-semibold text-amber-900">{rule.title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-amber-800 whitespace-pre-line">
        {rule.content}
      </p>
      {rule.examples && rule.examples.length > 0 && (
        <ul className="mt-2 space-y-1">
          {rule.examples.map((ex, i) => (
            <li
              key={i}
              dir="rtl"
              lang="ar"
              className="font-arabic text-base text-amber-900"
            >
              {ex}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
