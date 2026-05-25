import { books } from "@/data/books";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProgress } from "@/hooks/useProgress";
import { ChevronDown, ChevronLeft, Bookmark, BookOpen, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  currentBookId: string;
  currentBabId?: string;
  currentFaslId?: string;
  onNavigate: (bookId: string, babId?: string, faslId?: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ currentBookId, currentBabId, currentFaslId, onNavigate, onClose, isMobile }: Props) {
  const { bookmarks } = useBookmarks();
  const { getBookProgress } = useProgress();
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set([currentBookId]));
  const [expandedBabs, setExpandedBabs] = useState<Set<string>>(new Set([currentBabId || ""]));

  // Auto-expand current book when it changes
  useEffect(() => {
    setExpandedBooks(prev => new Set([...prev, currentBookId]));
    if (currentBabId) setExpandedBabs(prev => new Set([...prev, currentBabId]));
  }, [currentBookId, currentBabId]);

  const toggleBook = (id: string) => setExpandedBooks(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleBab = (id: string) => setExpandedBabs(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const isCurrent = (bookId: string, babId?: string, faslId?: string) =>
    bookId === currentBookId && babId === currentBabId && faslId === currentFaslId;

  return (
    <div style={{ width: isMobile ? "100%" : 290, background: "var(--sidebar-bg)", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOpen size={15} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>فهرس الكتاب</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {bookmarks.length > 0 && (
            <span style={{ fontSize: 10, background: "var(--accent)", color: "#fff", borderRadius: 20, padding: "2px 7px" }}>{bookmarks.length} علامة</span>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4 }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Bookmarks quick access */}
      {bookmarks.length > 0 && (
        <div style={{ borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ padding: "8px 14px 2px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>العلامات</div>
          {bookmarks.slice(0, 3).map(bm => (
            <button
              key={bm.id}
              onClick={() => { onNavigate(bm.bookId, bm.babId, bm.faslId); onClose?.(); }}
              style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "6px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "right", fontFamily: "inherit" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <Bookmark size={11} style={{ color: "var(--accent-light)", flexShrink: 0 }} fill="var(--accent-light)" />
              <span style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bm.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tree */}
      <div style={{ overflow: "auto", flex: 1, paddingBottom: 16 }}>
        {books.map(book => {
          const isExpanded = expandedBooks.has(book.id);
          const isBookActive = book.id === currentBookId;
          const progress = getBookProgress(book.id);

          return (
            <div key={book.id}>
              <button
                onClick={() => { toggleBook(book.id); onNavigate(book.id); if (isMobile && onClose && !book.abwab.length) onClose(); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "9px 14px",
                  background: isBookActive && !currentBabId ? "var(--accent)" : "none",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  color: isBookActive && !currentBabId ? "#fff" : "var(--text-primary)",
                  borderBottom: "1px solid transparent",
                  position: "relative",
                }}
                onMouseEnter={e => { if (!(isBookActive && !currentBabId)) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                onMouseLeave={e => { if (!(isBookActive && !currentBabId)) e.currentTarget.style.background = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{book.title}</span>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                  {progress > 0 && (
                    <span style={{ fontSize: 9, color: isBookActive && !currentBabId ? "rgba(255,255,255,0.8)" : "var(--accent-light)" }}>{progress}%</span>
                  )}
                  {book.abwab.length > 0 && (isExpanded ? <ChevronDown size={12} /> : <ChevronLeft size={12} />)}
                </div>
                {/* Progress bar */}
                {progress > 0 && !(isBookActive && !currentBabId) && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--bg-secondary)" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-light)" }} />
                  </div>
                )}
              </button>

              {isExpanded && book.abwab.map(bab => {
                const isBabExpanded = expandedBabs.has(bab.id);
                const isBabActive = bab.id === currentBabId;

                return (
                  <div key={bab.id} style={{ borderRight: "2px solid var(--accent-light)", marginRight: 14 }}>
                    <button
                      onClick={() => { toggleBab(bab.id); onNavigate(book.id, bab.id); if (isMobile && onClose && !bab.fusul.length) onClose(); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "7px 10px 7px 6px",
                        background: isBabActive && !currentFaslId ? "var(--accent-bg)" : "none",
                        border: "none", cursor: "pointer", fontFamily: "inherit",
                        color: isBabActive && !currentFaslId ? "var(--accent)" : "var(--text-secondary)",
                        borderRight: isBabActive && !currentFaslId ? "3px solid var(--accent)" : "3px solid transparent",
                      }}
                      onMouseEnter={e => { if (!(isBabActive && !currentFaslId)) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                      onMouseLeave={e => { if (!(isBabActive && !currentFaslId)) e.currentTarget.style.background = "none"; }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, textAlign: "right", lineHeight: 1.4, flex: 1 }}>{bab.title}</span>
                      {bab.fusul.length > 0 && (isBabExpanded ? <ChevronDown size={11} /> : <ChevronLeft size={11} />)}
                    </button>

                    {isBabExpanded && bab.fusul.map((fasl, fi) => (
                      <button
                        key={fasl.id}
                        onClick={() => { onNavigate(book.id, bab.id, fasl.id); if (isMobile && onClose) onClose(); }}
                        style={{
                          display: "block", width: "100%", padding: "5px 6px 5px 4px", paddingRight: 18,
                          background: isCurrent(book.id, bab.id, fasl.id) ? "var(--accent-bg)" : "none",
                          border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                          color: isCurrent(book.id, bab.id, fasl.id) ? "var(--accent)" : "var(--text-muted)",
                          borderRight: isCurrent(book.id, bab.id, fasl.id) ? "3px solid var(--accent-light)" : "3px solid transparent",
                          fontSize: 11,
                        }}
                        onMouseEnter={e => { if (!isCurrent(book.id, bab.id, fasl.id)) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                        onMouseLeave={e => { if (!isCurrent(book.id, bab.id, fasl.id)) e.currentTarget.style.background = "none"; }}
                      >
                        {fasl.title === "فَصْلٌ" ? `فصل ${fi + 1}` : fasl.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
