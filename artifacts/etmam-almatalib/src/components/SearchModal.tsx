import { useState, useEffect, useRef } from "react";
import { searchBooks } from "@/data/books";
import { X, Search } from "lucide-react";

interface Props {
  onClose: () => void;
  onNavigate: (bookId: string, babId?: string, faslId?: string) => void;
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="search-mark">{part}</mark> : part
  );
}

export default function SearchModal({ onClose, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchBooks>>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      const r = searchBooks(query, 40);
      setResults(r);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80, padding: "80px 16px 16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-card)",
        borderRadius: 16,
        width: "100%",
        maxWidth: 680,
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }} className="fade-in">
        {/* Search input */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <Search size={20} style={{ color: "var(--accent-light)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث في الكتاب..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 18,
              color: "var(--text-primary)",
              fontFamily: "inherit",
              direction: "rtl",
            }}
          />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div style={{ overflow: "auto", flex: 1 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>جارٍ البحث...</div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
              لم يُعثر على نتائج لـ "{query}"
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <div style={{ padding: "8px 20px", fontSize: 12, color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                {results.length} نتيجة
              </div>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(r.bookId, r.babId, r.faslId)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "right",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <div style={{ fontSize: 11, color: "var(--accent-light)", marginBottom: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span>{r.bookTitle}</span>
                    {r.babTitle && <><span style={{ color: "var(--border)" }}>›</span><span>{r.babTitle}</span></>}
                    {r.faslTitle && <><span style={{ color: "var(--border)" }}>›</span><span>{r.faslTitle}</span></>}
                  </div>
                  <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.8, textAlign: "justify" }}>
                    {highlightText(r.text.length > 200 ? r.text.substring(0, 200) + "..." : r.text, query)}
                  </p>
                </button>
              ))}
            </>
          )}
          {!query && (
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>اكتب للبحث في الكتاب</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>يمكنك البحث بالكلمات العربية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
