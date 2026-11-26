import { KNOWLEDGE_SOURCES } from "@/lib/knowledge";

export function AnalysisBasis() {
  return (
    <details className="group mt-4 rounded-xl border border-ink-950/10 bg-cream-50 px-4 py-3">
      <summary className="cursor-pointer list-none text-[10px] font-medium text-ink-400 transition-colors hover:text-ember-600">
        这版参考了什么？点击看分析框架
      </summary>
      <div className="mt-3 space-y-2.5">
        {KNOWLEDGE_SOURCES.map((source) => (
          <div key={source.name}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-ink-700 underline decoration-ink-950/15 underline-offset-2 hover:text-ember-600"
            >
              {source.name}
            </a>
            <span className="ml-1.5 text-[9px] text-ink-400">
              {source.org}
            </span>
            <p className="mt-0.5 text-[10px] leading-4 text-ink-500">
              {source.takeaway}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
