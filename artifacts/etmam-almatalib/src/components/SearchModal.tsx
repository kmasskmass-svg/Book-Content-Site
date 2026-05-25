import { useState, useEffect, useRef } from "react";
import { searchBooks } from "@/data/books";
import { normalizeArabic } from "@/utils/arabic";
import { X, Search } from "lucide-react";

interface Props {
  onClose: () => void;
  onNavigate: (bookId: string, babId?: string, faslId?: string) => void;
  initialQuery?: string;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const nq = normalizeArabic(query);
  const parts: React.ReactElement[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const idx = normalizeArabic(remaining).indexOf(nq);
    if (idx === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
    if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    parts.push(<mark key={key++} className="search-mark">{remaining.slice(idx, idx + nq.length + 2)}</mark>);
    remaining = remaining.slice(idx + nq.length + 2);
  }
  return <>{parts}</>;
}

export default function SearchModal({ onClose, onNavigate, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ReturnType<typeof searchBooks>>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(searchBooks(query, 50));
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "72px 16px 16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: "column", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.35)", overflow: "hidden" }} className="fade-in">

        {/* Input */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={20} style={{ color: "var(--accent-light)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث في الكتاب... (يعمل بدون تشكيل)"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 17, color: "var(--text-primary)", fontFamily: "inherit", direction: "rtl" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4, borderRadius: 6 }}>
              <X size={16} />
            </button>
          )}
          <button onClick={onClose} style={{ background: "var(--bg-secondary)", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "4px 10px", borderRadius: 6, fontSize: 11 }}>
            Esc
          </button>
        </div>

        {/* Results */}
        <div style={{ overflow: "auto", flex: 1 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              جارٍ البحث...
            </div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😔</div>
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>لم يُعثر على نتائج لـ "{query}"</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>جرب كلمات مختلفة — البحث يتجاهل التشكيل</p>
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <div style={{ padding: "8px 20px", fontSize: 12, color: "var(--text-muted)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{results.length} نتيجة</span>
                <span style={{ fontSize: 11 }}>البحث يتجاهل التشكيل تلقائياً ✓</span>
              </div>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(r.bookId, r.babId, r.faslId)}
                  style={{ display: "block", width: "100%", textAlign: "right", padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "none", border: "none", borderLeft: "none", borderRight: "none", borderTop: "none", cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <div style={{ fontSize: 11, color: "var(--accent-light)", marginBottom: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700 }}>{r.bookTitle}</span>
                    {r.babTitle && <><span style={{ color: "var(--border)" }}>›</span><span>{r.babTitle}</span></>}
                    {r.faslTitle && <><span style={{ color: "var(--border)" }}>›</span><span>{r.faslTitle}</span></>}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.8, textAlign: "justify" }}>
                    <HighlightedText text={r.text.length > 220 ? r.text.substring(0, 220) + "..." : r.text} query={query} />
                  </p>
                </button>
              ))}
            </>
          )}
          {!query && (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>📖</div>
              <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>البحث في الكتاب</p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>اكتب أي كلمة — مع تشكيل أو بدونه</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {["طهارة", "صلاة", "زكاة", "نكاح", "بيع"].map(kw => (
                  <button
                    key={kw}
                    onClick={() => setQuery(kw)}
                    style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--accent)", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
