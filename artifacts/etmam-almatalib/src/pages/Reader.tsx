import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { books, getBook } from "@/data/books";
import { useSettings } from "@/hooks/useSettings";
import { useBookmarks } from "@/hooks/useBookmarks";
import Sidebar from "@/components/Sidebar";
import ContentViewer from "@/components/ContentViewer";
import SearchModal from "@/components/SearchModal";
import SettingsPanel from "@/components/SettingsPanel";
import {
  Menu, X, Search, Settings, Moon, Sun, Coffee,
  ChevronRight, ChevronLeft, Home, Bookmark, List,
} from "lucide-react";
import type { Bab, Fasl } from "@/types";

function useQueryParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return { bab: params.get("bab") || undefined, fasl: params.get("fasl") || undefined };
}

export default function Reader() {
  const params = useParams<{ bookId?: string }>();
  const [, navigate] = useLocation();
  const { settings, updateSettings } = useSettings();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();

  const bookId = params.bookId || books[0]?.id || "muqaddima";
  const queryParams = useQueryParams();
  const [currentBabId, setCurrentBabId] = useState<string | undefined>(queryParams.bab);
  const [currentFaslId, setCurrentFaslId] = useState<string | undefined>(queryParams.fasl);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const book = getBook(bookId) || books[0];
  const bab: Bab | undefined = currentBabId ? book?.abwab.find(b => b.id === currentBabId) : undefined;
  const fasl: Fasl | undefined = currentFaslId && bab ? bab.fusul.find(f => f.id === currentFaslId) : undefined;

  // Scroll to top when section changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [bookId, currentBabId, currentFaslId]);

  // Reading progress
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const progress = scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [bookId, currentBabId, currentFaslId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") { e.preventDefault(); setShowSearch(true); }
      if (e.key === "Escape") { setShowSearch(false); setShowSettings(false); setSidebarOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleNavigate = useCallback((bId: string, babId?: string, faslId?: string) => {
    setCurrentBabId(babId);
    setCurrentFaslId(faslId);
    navigate(`/read/${bId}`, { replace: true });
    setSidebarOpen(false);
  }, [navigate]);

  // Prev/Next navigation within book
  const allSections: Array<{ bookId: string; babId?: string; faslId?: string; title: string }> = [];
  if (book) {
    allSections.push({ bookId: book.id, title: book.title });
    for (const b of book.abwab) {
      allSections.push({ bookId: book.id, babId: b.id, title: b.title });
      for (const f of b.fusul) {
        allSections.push({ bookId: book.id, babId: b.id, faslId: f.id, title: f.title });
      }
    }
  }
  const currentSectionIdx = allSections.findIndex(s => s.babId === currentBabId && s.faslId === currentFaslId);
  const prevSection = currentSectionIdx > 0 ? allSections[currentSectionIdx - 1] : null;
  const nextSection = currentSectionIdx >= 0 && currentSectionIdx < allSections.length - 1 ? allSections[currentSectionIdx + 1] : null;

  // Prev/Next book navigation
  const bookIdx = books.findIndex(b => b.id === bookId);
  const prevBook = bookIdx > 0 ? books[bookIdx - 1] : null;
  const nextBook = bookIdx < books.length - 1 ? books[bookIdx + 1] : null;

  const themeIcon = settings.theme === "dark" ? <Sun size={16} /> : settings.theme === "sepia" ? <Coffee size={16} /> : <Moon size={16} />;
  const toggleTheme = () => {
    const next = settings.theme === "light" ? "dark" : settings.theme === "dark" ? "sepia" : "light";
    updateSettings({ theme: next });
  };

  const bookmarked = isBookmarked(book?.id, currentBabId, currentFaslId);
  const handleBookmarkToggle = () => {
    if (bookmarked) {
      const bm = bookmarks.find(b => b.bookId === book?.id && b.babId === currentBabId && b.faslId === currentFaslId);
      if (bm) removeBookmark(bm.id);
    } else if (book) {
      addBookmark({
        bookId: book.id,
        babId: currentBabId,
        faslId: currentFaslId,
        title: fasl?.title || bab?.title || book.title,
        bookTitle: book.title,
      });
    }
  };

  if (!book) return <div style={{ textAlign: "center", padding: 80 }}>الكتاب غير موجود</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Reading progress bar */}
      <div
        className="no-print"
        style={{
          position: "fixed", top: 0, right: 0, left: 0, height: 3, zIndex: 100,
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ height: "100%", width: `${readingProgress}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-light))", transition: "width 0.1s" }} />
      </div>

      {/* Top Toolbar */}
      <header className="no-print" style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 8px var(--shadow-color)",
      }}>
        {/* Left side */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={() => navigate("/")}
            title="الرئيسية"
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}
          >
            <Home size={16} />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="الفهرس"
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: sidebarOpen ? "var(--accent-bg)" : "var(--bg-secondary)", color: sidebarOpen ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", display: "flex" }}
          >
            <List size={16} />
          </button>
        </div>

        {/* Center - title */}
        <div style={{ flex: 1, textAlign: "center", overflow: "hidden" }}>
          <span style={{ fontSize: "clamp(12px, 2vw, 15px)", fontWeight: 700, color: "var(--accent)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fasl ? (fasl.title === "فَصْلٌ" ? "فَصْلٌ" : fasl.title) : bab ? bab.title : book.title}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {book.title}
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={handleBookmarkToggle}
            title={bookmarked ? "إزالة العلامة" : "إضافة علامة"}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: bookmarked ? "var(--accent-bg)" : "var(--bg-secondary)", color: bookmarked ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", display: "flex" }}
          >
            <Bookmark size={16} fill={bookmarked ? "var(--accent)" : "none"} />
          </button>
          <button
            onClick={() => setShowSearch(true)}
            title="بحث (Ctrl+K)"
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}
          >
            <Search size={16} />
          </button>
          <button onClick={toggleTheme} title="تغيير المظهر" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
            {themeIcon}
          </button>
          <button onClick={() => setShowSettings(true)} title="الإعدادات" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Desktop sidebar */}
        <div className="no-print" style={{
          width: sidebarOpen ? 280 : 0,
          overflow: "hidden",
          flexShrink: 0,
          transition: "width 0.25s ease",
          borderLeft: sidebarOpen ? "1px solid var(--border)" : "none",
        }}>
          {sidebarOpen && (
            <div style={{ width: 280, height: "100%" }}>
              <Sidebar
                currentBookId={bookId}
                currentBabId={currentBabId}
                currentFaslId={currentFaslId}
                onNavigate={handleNavigate}
              />
            </div>
          )}
        </div>

        {/* Content area */}
        <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "0" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
            <ContentViewer
              book={book}
              bab={bab}
              fasl={fasl}
              searchQuery={searchQuery}
            />

            {/* Navigation arrows */}
            <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              {/* Previous */}
              <div>
                {prevSection ? (
                  <button
                    onClick={() => handleNavigate(prevSection.bookId, prevSection.babId, prevSection.faslId)}
                    style={{
                      padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)",
                      background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <ChevronRight size={16} />
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>السابق</div>
                      <div style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prevSection.title}</div>
                    </div>
                  </button>
                ) : prevBook ? (
                  <button
                    onClick={() => navigate(`/read/${prevBook.id}`)}
                    style={{
                      padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)",
                      background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <ChevronRight size={16} />
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>الكتاب السابق</div>
                      <div style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prevBook.title}</div>
                    </div>
                  </button>
                ) : null}
              </div>

              {/* Next */}
              <div>
                {nextSection ? (
                  <button
                    onClick={() => handleNavigate(nextSection.bookId, nextSection.babId, nextSection.faslId)}
                    style={{
                      padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)",
                      background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>التالي</div>
                      <div style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextSection.title}</div>
                    </div>
                    <ChevronLeft size={16} />
                  </button>
                ) : nextBook ? (
                  <button
                    onClick={() => navigate(`/read/${nextBook.id}`)}
                    style={{
                      padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)",
                      background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>الكتاب التالي</div>
                      <div style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextBook.title}</div>
                    </div>
                    <ChevronLeft size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onNavigate={(bId, babId, faslId) => {
            setShowSearch(false);
            handleNavigate(bId, babId, faslId);
          }}
        />
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
