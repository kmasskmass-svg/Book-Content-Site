import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { books, getBook, getAllSections } from "@/data/books";
import { useSettings } from "@/hooks/useSettings";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useProgress } from "@/hooks/useProgress";
import { countWords } from "@/utils/arabic";
import Sidebar from "@/components/Sidebar";
import ContentViewer from "@/components/ContentViewer";
import SearchModal from "@/components/SearchModal";
import SettingsPanel from "@/components/SettingsPanel";
import {
  Menu, Search, Settings, Moon, Sun, Coffee,
  ChevronRight, ChevronLeft, Home, Bookmark, List,
  Maximize, Minimize, Minus, Plus, ArrowUp, Printer,
  Share2, Check,
} from "lucide-react";
import type { Bab, Fasl } from "@/types";

function getQP(key: string) {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get(key) || undefined;
}

export default function Reader() {
  const params = useParams<{ bookId?: string }>();
  const [, navigate] = useLocation();
  const { settings, updateSettings } = useSettings();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { addEntry } = useReadingHistory();
  const { markVisited, getBookProgress } = useProgress();

  const bookId = params.bookId || books[0]?.id || "muqaddima";
  const [currentBabId, setCurrentBabId] = useState<string | undefined>(getQP("bab"));
  const [currentFaslId, setCurrentFaslId] = useState<string | undefined>(getQP("fasl"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const book = getBook(bookId) || books[0];
  const bab: Bab | undefined = currentBabId ? book?.abwab.find(b => b.id === currentBabId) : undefined;
  const fasl: Fasl | undefined = currentFaslId && bab ? bab.fusul.find(f => f.id === currentFaslId) : undefined;

  const bookProgress = getBookProgress(bookId);

  // Track reading history & progress
  useEffect(() => {
    if (!book) return;
    addEntry({
      bookId: book.id,
      bookTitle: book.title,
      babId: bab?.id,
      babTitle: bab?.title,
      faslId: fasl?.id,
      faslTitle: fasl?.title,
    });
    markVisited(book.id, fasl?.id || bab?.id || book.id);
  }, [book?.id, bab?.id, fasl?.id]);

  // Scroll to top on section change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [bookId, currentBabId, currentFaslId]);

  // Reading progress + show scroll-top btn
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const progress = scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollTop(scrollTop > 400);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [bookId, currentBabId, currentFaslId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.ctrlKey && e.key === "k") { e.preventDefault(); setShowSearch(true); }
      if (e.key === "Escape") { setShowSearch(false); setShowSettings(false); setFullscreen(false); }
      if (e.key === "f" || e.key === "F") setFullscreen(v => !v);
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
      if (e.key === "=" || e.key === "+") updateSettings({ fontSize: Math.min(32, settings.fontSize + 1) });
      if (e.key === "-") updateSettings({ fontSize: Math.max(14, settings.fontSize - 1) });
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [settings.fontSize, bookId, currentBabId, currentFaslId]);

  // Handle browser back/forward
  useEffect(() => {
    setCurrentBabId(getQP("bab"));
    setCurrentFaslId(getQP("fasl"));
  }, [params.bookId]);

  const handleNavigate = useCallback((bId: string, babId?: string, faslId?: string) => {
    setCurrentBabId(babId);
    setCurrentFaslId(faslId);
    const qs = babId ? `?bab=${babId}${faslId ? `&fasl=${faslId}` : ""}` : "";
    navigate(`/read/${bId}${qs}`, { replace: true });
  }, [navigate]);

  // Sections nav
  const sections = useMemo(() => getAllSections(bookId), [bookId]);
  const currentIdx = sections.findIndex(s => s.babId === currentBabId && s.faslId === currentFaslId);
  const prevSection = currentIdx > 0 ? sections[currentIdx - 1] : null;
  const nextSection = currentIdx >= 0 && currentIdx < sections.length - 1 ? sections[currentIdx + 1] : null;
  const bookIdx = books.findIndex(b => b.id === bookId);
  const prevBook = bookIdx > 0 ? books[bookIdx - 1] : null;
  const nextBook = bookIdx < books.length - 1 ? books[bookIdx + 1] : null;

  const goPrev = useCallback(() => {
    if (prevSection) handleNavigate(prevSection.bookId, prevSection.babId, prevSection.faslId);
    else if (prevBook) navigate(`/read/${prevBook.id}`);
  }, [prevSection, prevBook, handleNavigate]);

  const goNext = useCallback(() => {
    if (nextSection) handleNavigate(nextSection.bookId, nextSection.babId, nextSection.faslId);
    else if (nextBook) navigate(`/read/${nextBook.id}`);
  }, [nextSection, nextBook, handleNavigate]);

  const bookmarked = isBookmarked(book?.id, currentBabId, currentFaslId);
  const toggleBookmark = () => {
    if (bookmarked) {
      const bm = bookmarks.find(b => b.bookId === book?.id && b.babId === currentBabId && b.faslId === currentFaslId);
      if (bm) removeBookmark(bm.id);
    } else if (book) {
      addBookmark({ bookId: book.id, babId: currentBabId, faslId: currentFaslId, title: fasl?.title || bab?.title || book.title, bookTitle: book.title });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: fasl?.title || bab?.title || book?.title || "", url });
    } else {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };

  const themeIcon = settings.theme === "dark" ? <Sun size={15} /> : settings.theme === "sepia" ? <Coffee size={15} /> : <Moon size={15} />;
  const toggleTheme = () => updateSettings({ theme: settings.theme === "light" ? "dark" : settings.theme === "dark" ? "sepia" : "light" });

  if (!book) return <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>الكتاب غير موجود</div>;

  const sectionTitle = fasl ? (fasl.title === "فَصْلٌ" ? "فَصْلٌ" : fasl.title) : bab ? bab.title : book.title;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Reading progress */}
      <div style={{ position: "fixed", top: 0, right: 0, left: 0, height: 3, zIndex: 100, background: "var(--bg-secondary)" }}>
        <div style={{ height: "100%", width: `${readingProgress}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-light))", transition: "width 0.15s" }} />
      </div>

      {/* Toolbar */}
      {!fullscreen && (
        <header className="no-print" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 6px var(--shadow-color)" }}>
          {/* Right controls */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => navigate("/")} title="الرئيسية" className="toolbar-btn">
              <Home size={15} />
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} title="الفهرس" className="toolbar-btn" style={{ background: sidebarOpen ? "var(--accent-bg)" : undefined, color: sidebarOpen ? "var(--accent)" : undefined }}>
              <List size={15} />
            </button>
          </div>

          {/* Prev/Next */}
          <div style={{ display: "flex", gap: 2 }}>
            <button onClick={goPrev} disabled={!prevSection && !prevBook} title="السابق (→)" className="toolbar-btn" style={{ opacity: (!prevSection && !prevBook) ? 0.4 : 1 }}>
              <ChevronRight size={15} />
            </button>
            <button onClick={goNext} disabled={!nextSection && !nextBook} title="التالي (←)" className="toolbar-btn" style={{ opacity: (!nextSection && !nextBook) ? 0.4 : 1 }}>
              <ChevronLeft size={15} />
            </button>
          </div>

          {/* Center */}
          <div style={{ flex: 1, textAlign: "center", overflow: "hidden", padding: "0 8px" }}>
            <span style={{ fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 700, color: "var(--accent)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sectionTitle}
            </span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{book.title}</span>
              {bookProgress > 0 && (
                <span style={{ fontSize: 10, color: "var(--accent-light)", background: "var(--accent-bg)", padding: "1px 6px", borderRadius: 10 }}>
                  {bookProgress}%
                </span>
              )}
            </div>
          </div>

          {/* Font size */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            <button onClick={() => updateSettings({ fontSize: Math.max(14, settings.fontSize - 1) })} title="تصغير الخط (−)" className="toolbar-btn">
              <Minus size={13} />
            </button>
            <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 26, textAlign: "center" }}>{settings.fontSize}</span>
            <button onClick={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 1) })} title="تكبير الخط (+)" className="toolbar-btn">
              <Plus size={13} />
            </button>
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={toggleBookmark} title={bookmarked ? "إزالة العلامة" : "إضافة علامة"} className="toolbar-btn" style={{ color: bookmarked ? "var(--accent)" : undefined }}>
              <Bookmark size={15} fill={bookmarked ? "var(--accent)" : "none"} />
            </button>
            <button onClick={handleShare} title="مشاركة الرابط" className="toolbar-btn" style={{ color: copied ? "var(--accent)" : undefined }}>
              {copied ? <Check size={15} /> : <Share2 size={15} />}
            </button>
            <button onClick={() => setShowSearch(true)} title="بحث (Ctrl+K)" className="toolbar-btn">
              <Search size={15} />
            </button>
            <button onClick={toggleTheme} title="تغيير المظهر" className="toolbar-btn">
              {themeIcon}
            </button>
            <button onClick={() => setShowSettings(true)} title="إعدادات القراءة" className="toolbar-btn">
              <Settings size={15} />
            </button>
            <button onClick={() => setFullscreen(true)} title="وضع القراءة الكامل (F)" className="toolbar-btn">
              <Maximize size={15} />
            </button>
            <button onClick={() => window.print()} title="طباعة" className="toolbar-btn no-print">
              <Printer size={15} />
            </button>
          </div>
        </header>
      )}

      {/* Fullscreen exit bar */}
      {fullscreen && (
        <div className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <button
            onClick={() => setFullscreen(false)}
            style={{ padding: "6px 20px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, display: "flex", gap: 6, alignItems: "center", opacity: 0.7 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
          >
            <Minimize size={13} /> خروج من وضع القراءة الكامل (Esc)
          </button>
        </div>
      )}

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        {!fullscreen && (
          <div className="no-print" style={{ width: sidebarOpen ? 290 : 0, overflow: "hidden", flexShrink: 0, transition: "width 0.2s ease", borderLeft: sidebarOpen ? "1px solid var(--border)" : "none" }}>
            {sidebarOpen && (
              <div style={{ width: 290, height: "100%" }}>
                <Sidebar currentBookId={bookId} currentBabId={currentBabId} currentFaslId={currentFaslId} onNavigate={handleNavigate} />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "0" }}>
          <div style={{ maxWidth: fullscreen ? 900 : 860, margin: "0 auto", padding: `${fullscreen ? "48px" : "28px"} 24px 80px` }}>
            <ContentViewer book={book} bab={bab} fasl={fasl} searchQuery={searchQuery} />

            {/* Bottom navigation */}
            <div style={{ marginTop: 52, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                {(prevSection || prevBook) && (
                  <button
                    onClick={goPrev}
                    style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-light)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <ChevronRight size={15} />
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{prevSection ? "السابق" : "الكتاب السابق"}</div>
                      <div style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {prevSection?.title || prevBook?.title}
                      </div>
                    </div>
                  </button>
                )}
              </div>
              <div>
                {(nextSection || nextBook) && (
                  <button
                    onClick={goNext}
                    style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-light)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{nextSection ? "التالي" : "الكتاب التالي"}</div>
                      <div style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nextSection?.title || nextBook?.title}
                      </div>
                    </div>
                    <ChevronLeft size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          title="العودة للأعلى"
          style={{
            position: "fixed", bottom: 24, left: 24, width: 42, height: 42,
            borderRadius: "50%", border: "1px solid var(--border)",
            background: "var(--bg-card)", color: "var(--accent)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px var(--shadow-color)", zIndex: 99,
          }}
          className="fade-in"
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* Modals */}
      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onNavigate={(bId, babId, faslId) => { setShowSearch(false); handleNavigate(bId, babId, faslId); }}
        />
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          * { color: black !important; }
        }
        .toolbar-btn {
          padding: 6px;
          border-radius: 7px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .toolbar-btn:hover {
          background: var(--accent-bg);
          color: var(--accent);
          border-color: var(--accent-light);
        }
      `}</style>
    </div>
  );
}
