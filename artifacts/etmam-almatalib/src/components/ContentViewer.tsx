import { useSettings } from "@/hooks/useSettings";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Bookmark, BookmarkCheck, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Book, Bab, Fasl } from "@/types";

interface Props {
  book: Book;
  bab?: Bab;
  fasl?: Fasl;
  searchQuery?: string;
}

function highlightText(text: string, query: string) {
  if (!query || query.length < 2) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="search-mark">{part}</mark> : part
      )}
    </>
  );
}

export default function ContentViewer({ book, bab, fasl, searchQuery = "" }: Props) {
  const { settings } = useSettings();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [copied, setCopied] = useState(false);

  const fontFamilyMap = {
    amiri: "'Amiri', serif",
    noto: "'Noto Naskh Arabic', serif",
    scheherazade: "'Scheherazade New', serif",
  };
  const fontFamily = fontFamilyMap[settings.fontFamily] || "'Amiri', serif";

  const bookmarked = isBookmarked(book.id, bab?.id, fasl?.id);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(`${book.id}__${bab?.id || ""}__${fasl?.id || ""}`);
      // Find and remove the actual bookmark
      const { bookmarks, removeBookmark: rm } = { bookmarks: [], removeBookmark: removeBookmark };
    } else {
      addBookmark({
        bookId: book.id,
        babId: bab?.id,
        faslId: fasl?.id,
        title: fasl?.title || bab?.title || book.title,
        bookTitle: book.title,
      });
    }
  };

  const handleCopy = () => {
    const lines = fasl ? fasl.content : bab ? [...bab.content, ...bab.fusul.flatMap(f => f.content)] : (book.introContent || []);
    const text = lines.join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const textStyle = {
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    fontFamily,
    color: "var(--text-primary)",
    textAlign: "justify" as const,
    direction: "rtl" as const,
  };

  const renderLines = (lines: string[]) =>
    lines.map((line, i) => (
      <p key={i} style={{ ...textStyle, marginBottom: "0.8em" }}>
        {searchQuery ? highlightText(line, searchQuery) : line}
      </p>
    ));

  const isMuqaddima = book.id === "muqaddima";

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: "0 auto", padding: "0 4px" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {isMuqaddima ? (
          <span>المقدمة</span>
        ) : (
          <>
            <span style={{ color: "var(--accent)" }}>{book.title}</span>
            {bab && <><span>›</span><span>{bab.title}</span></>}
            {fasl && <><span>›</span><span>{fasl.title === "فَصْلٌ" ? "فصل" : fasl.title}</span></>}
          </>
        )}
      </div>

      {/* Section title + actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          {/* Book title (when showing book intro) */}
          {!bab && !fasl && (
            <h1 style={{
              ...textStyle,
              fontSize: Math.max(settings.fontSize + 8, 28),
              fontWeight: 700,
              color: "var(--accent)",
              textAlign: "center",
              marginBottom: 8,
            }}>
              {book.title}
            </h1>
          )}

          {/* Bab title */}
          {bab && !fasl && (
            <h2 style={{
              ...textStyle,
              fontSize: Math.max(settings.fontSize + 4, 24),
              fontWeight: 700,
              color: "var(--accent)",
              textAlign: "center",
              marginBottom: 8,
            }}>
              {bab.title}
            </h2>
          )}

          {/* Fasl title */}
          {fasl && (
            <h3 style={{
              ...textStyle,
              fontSize: Math.max(settings.fontSize + 2, 20),
              fontWeight: 700,
              color: "var(--green)",
              textAlign: "center",
              marginBottom: 8,
            }}>
              {fasl.title === "فَصْلٌ" ? "فَصْلٌ" : fasl.title}
            </h3>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0, paddingTop: 4 }}>
          <button
            onClick={handleBookmark}
            title={bookmarked ? "إزالة العلامة" : "إضافة علامة مرجعية"}
            style={{
              padding: "8px", borderRadius: 8, border: "1px solid var(--border)",
              background: bookmarked ? "var(--accent-bg)" : "var(--bg-secondary)",
              color: bookmarked ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer", display: "flex",
            }}
          >
            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <button
            onClick={handleCopy}
            title="نسخ النص"
            style={{
              padding: "8px", borderRadius: 8, border: "1px solid var(--border)",
              background: copied ? "var(--accent-bg)" : "var(--bg-secondary)",
              color: copied ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer", display: "flex",
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Ornamental divider */}
      <div style={{ textAlign: "center", marginBottom: 28, color: "var(--accent-light)", fontSize: 20 }}>
        ﷽
      </div>

      {/* Content */}
      {fasl ? (
        <div>{renderLines(fasl.content)}</div>
      ) : bab ? (
        <div>
          {renderLines(bab.content)}
          {bab.fusul.map((f, fi) => (
            <div key={f.id} style={{ marginTop: 32 }}>
              <div style={{ textAlign: "center", margin: "16px 0" }}>
                <span style={{
                  display: "inline-block",
                  fontSize: Math.max(settings.fontSize + 2, 20),
                  fontFamily,
                  fontWeight: 700,
                  color: "var(--green)",
                  padding: "4px 20px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--bg-secondary)",
                }}>
                  {f.title === "فَصْلٌ" ? `فَصْلٌ ${fi + 1}` : f.title}
                </span>
              </div>
              {renderLines(f.content)}
            </div>
          ))}
        </div>
      ) : (
        <div>{renderLines(book.introContent || [])}</div>
      )}
    </div>
  );
}
