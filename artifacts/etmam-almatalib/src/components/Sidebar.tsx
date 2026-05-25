import { books } from "@/data/books";
import { useBookmarks } from "@/hooks/useBookmarks";
import { ChevronDown, ChevronLeft, Bookmark, BookOpen, X } from "lucide-react";
import { useState } from "react";

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
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set([currentBookId]));
  const [expandedBabs, setExpandedBabs] = useState<Set<string>>(new Set([currentBabId || ""]));

  const toggleBook = (id: string) => {
    setExpandedBooks(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const toggleBab = (id: string) => {
    setExpandedBabs(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const isCurrentSection = (bookId: string, babId?: string, faslId?: string) =>
    bookId === currentBookId && babId === currentBabId && faslId === currentFaslId;

  return (
    <div style={{
      width: isMobile ? "100%" : 280,
      background: "var(--sidebar-bg)",
      borderLeft: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
    }}>
      {/* Sidebar header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-card)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOpen size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>فهرس الكتاب</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {bookmarks.length > 0 && (
            <span style={{ fontSize: 11, background: "var(--accent)", color: "#fff", borderRadius: 20, padding: "2px 8px" }}>
              {bookmarks.length} علامة
            </span>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Bookmarks section */}
      {bookmarks.length > 0 && (
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <div style={{ padding: "10px 16px 4px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            العلامات المرجعية
          </div>
          {bookmarks.slice(0, 3).map(bm => (
            <button
              key={bm.id}
              onClick={() => { onNavigate(bm.bookId, bm.babId, bm.faslId); if (onClose) onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 16px",
                background: "none", border: "none", cursor: "pointer", textAlign: "right", fontFamily: "inherit",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <Bookmark size={12} style={{ color: "var(--accent-light)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {bm.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Books tree */}
      <div style={{ overflow: "auto", flex: 1, paddingBottom: 16 }}>
        {books.map(book => {
          const isExpanded = expandedBooks.has(book.id);
          const isActive = book.id === currentBookId;

          return (
            <div key={book.id}>
              {/* Book heading */}
              <button
                onClick={() => { toggleBook(book.id); onNavigate(book.id); if (isMobile && onClose && !book.abwab.length) onClose(); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "10px 16px", background: isActive && !currentBabId ? "var(--accent)" : "none",
                  border: "none", cursor: "pointer", fontFamily: "inherit", color: isActive && !currentBabId ? "#fff" : "var(--text-primary)",
                  borderBottom: "none",
                }}
                onMouseEnter={e => { if (!(isActive && !currentBabId)) (e.currentTarget.style.background = "var(--bg-secondary)"); }}
                onMouseLeave={e => { if (!(isActive && !currentBabId)) (e.currentTarget.style.background = "none"); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "right", flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {book.title}
                  </span>
                </div>
                {book.abwab.length > 0 && (
                  isExpanded
                    ? <ChevronDown size={14} style={{ flexShrink: 0 }} />
                    : <ChevronLeft size={14} style={{ flexShrink: 0 }} />
                )}
              </button>

              {/* Abwab */}
              {isExpanded && book.abwab.map(bab => {
                const isBabExpanded = expandedBabs.has(bab.id);
                const isBabActive = bab.id === currentBabId;

                return (
                  <div key={bab.id} style={{ borderRight: "2px solid var(--accent-light)", marginRight: 16 }}>
                    <button
                      onClick={() => { toggleBab(bab.id); onNavigate(book.id, bab.id); if (isMobile && onClose && !bab.fusul.length) onClose(); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "8px 12px 8px 8px",
                        background: isBabActive && !currentFaslId ? "var(--accent-bg)" : "none",
                        border: "none", cursor: "pointer", fontFamily: "inherit",
                        color: isBabActive && !currentFaslId ? "var(--accent)" : "var(--text-secondary)",
                        borderRight: isBabActive && !currentFaslId ? "3px solid var(--accent)" : "3px solid transparent",
                      }}
                      onMouseEnter={e => { if (!(isBabActive && !currentFaslId)) (e.currentTarget.style.background = "var(--bg-secondary)"); }}
                      onMouseLeave={e => { if (!(isBabActive && !currentFaslId)) (e.currentTarget.style.background = "none"); }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, textAlign: "right", lineHeight: 1.4 }}>
                        {bab.title}
                      </span>
                      {bab.fusul.length > 0 && (
                        isBabExpanded
                          ? <ChevronDown size={12} style={{ flexShrink: 0 }} />
                          : <ChevronLeft size={12} style={{ flexShrink: 0 }} />
                      )}
                    </button>

                    {/* Fusul */}
                    {isBabExpanded && bab.fusul.map((fasl, fi) => (
                      <button
                        key={fasl.id}
                        onClick={() => { onNavigate(book.id, bab.id, fasl.id); if (isMobile && onClose) onClose(); }}
                        style={{
                          display: "block", width: "100%", padding: "6px 8px 6px 4px", paddingRight: 20,
                          background: isCurrentSection(book.id, bab.id, fasl.id) ? "var(--accent-bg)" : "none",
                          border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                          color: isCurrentSection(book.id, bab.id, fasl.id) ? "var(--accent)" : "var(--text-muted)",
                          borderRight: isCurrentSection(book.id, bab.id, fasl.id) ? "3px solid var(--accent-light)" : "3px solid transparent",
                          fontSize: 11,
                        }}
                        onMouseEnter={e => { if (!isCurrentSection(book.id, bab.id, fasl.id)) (e.currentTarget.style.background = "var(--bg-secondary)"); }}
                        onMouseLeave={e => { if (!isCurrentSection(book.id, bab.id, fasl.id)) (e.currentTarget.style.background = "none"); }}
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
