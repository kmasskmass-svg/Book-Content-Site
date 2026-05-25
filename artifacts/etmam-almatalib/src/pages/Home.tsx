import { useLocation } from "wouter";
import { books } from "@/data/books";
import { useSettings } from "@/hooks/useSettings";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useProgress } from "@/hooks/useProgress";
import { Settings, Moon, Sun, Coffee, Bookmark, Search, BookOpen, ChevronLeft, Clock, History, TrendingUp } from "lucide-react";
import { useState } from "react";
import SearchModal from "@/components/SearchModal";
import SettingsPanel from "@/components/SettingsPanel";

const BOOK_ICONS: Record<string, string> = {
  k1: "💧", k2: "🕌", k3: "⚰️", k4: "💰", k5: "🌙", k6: "🕌",
  k7: "🕋", k8: "⚔️", k9: "🛒", k10: "⚖️", k11: "🤝", k12: "🔑",
  k13: "🛡️", k14: "🏛️", k15: "📝", k16: "📊", k17: "🔓", k18: "💍",
  k19: "💎", k20: "📋", k21: "✂️", k22: "🚫", k23: "🔄", k24: "⚖️",
  k25: "⏳", k26: "🍼", k27: "💵", k28: "⚔️", k29: "🩸", k30: "⛓️",
  k31: "🔨", k32: "🍖", k33: "🎯", k34: "🤲", k35: "🏛️", k36: "👁️", k37: "📣",
};

export default function Home() {
  const [, navigate] = useLocation();
  const { settings, updateSettings } = useSettings();
  const { bookmarks } = useBookmarks();
  const { history } = useReadingHistory();
  const { getBookProgress, getTotalProgress } = useProgress();
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"books" | "history" | "bookmarks">("books");

  const mainBooks = books.filter(b => b.id !== "muqaddima");
  const muqaddima = books.find(b => b.id === "muqaddima");
  const totalProgress = getTotalProgress();

  const toggleTheme = () => updateSettings({ theme: settings.theme === "light" ? "dark" : settings.theme === "dark" ? "sepia" : "light" });
  const themeIcon = settings.theme === "dark" ? <Sun size={17} /> : settings.theme === "sepia" ? <Coffee size={17} /> : <Moon size={17} />;

  const recentHistory = history.slice(0, 10);

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", boxShadow: "0 1px 10px var(--shadow-color)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>📚</span>
            <div>
              <h1 style={{ fontSize: "clamp(13px, 2.5vw, 17px)", fontWeight: 700, color: "var(--accent)", lineHeight: 1.2 }}>متن إتمام المطالب</h1>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>بتكميل دليل الطالب</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {totalProgress > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--bg-secondary)", fontSize: 12, color: "var(--accent)" }}>
                <TrendingUp size={13} />
                <span>{totalProgress}% مكتمل</span>
              </div>
            )}
            <button onClick={() => setShowSearch(true)} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--accent)", cursor: "pointer", display: "flex" }}>
              <Search size={17} />
            </button>
            <button onClick={toggleTheme} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
              {themeIcon}
            </button>
            <button onClick={() => setShowSettings(true)} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
              <Settings size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3d2106 0%, var(--accent) 50%, #5a3520 100%)", padding: "52px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.9) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📚</div>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 40px)", fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 10 }}>
            متن إتمام المطالب
          </h1>
          <h2 style={{ fontSize: "clamp(14px, 3vw, 20px)", color: "rgba(255,255,255,0.85)", marginBottom: 14, fontWeight: 400 }}>
            بتكميل دليل الطالب المجرد من الحواشي والتعليقات
          </h2>
          <p style={{ fontSize: "clamp(13px, 2vw, 15px)", color: "rgba(255,255,255,0.65)", marginBottom: 32 }}>
            تأليف: كليب بن أحمد بن ضيف الله الزهراني — ربيع الثاني ١٤٤٧هـ
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                const last = history[0];
                last ? navigate(`/read/${last.bookId}${last.babId ? `?bab=${last.babId}${last.faslId ? `&fasl=${last.faslId}` : ""}` : ""}`) : navigate("/read/k1");
              }}
              style={{ padding: "12px 28px", borderRadius: 10, background: "#fff", color: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}
            >
              <BookOpen size={18} />
              {history.length > 0 ? "تابع القراءة" : "ابدأ القراءة"}
            </button>
            {muqaddima && (
              <button
                onClick={() => navigate("/read/muqaddima")}
                style={{ padding: "12px 28px", borderRadius: 10, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: "inherit", fontSize: 16 }}
              >
                المقدمة
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "14px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
          {[
            { label: "كتاباً", value: mainBooks.length },
            { label: "باباً", value: mainBooks.reduce((a, b) => a + b.abwab.length, 0) },
            { label: "فصلاً", value: mainBooks.reduce((a, b) => a + b.abwab.reduce((c, d) => c + d.fusul.length, 0), 0) },
            { label: "كلمة تقريباً", value: "٨٠,٠٠٠+" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{stat.value}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", marginRight: 6 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 0" }}>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          {([
            { key: "books", label: "الكتب", icon: <BookOpen size={14} /> },
            { key: "history", label: `السجل (${recentHistory.length})`, icon: <History size={14} /> },
            { key: "bookmarks", label: `العلامات (${bookmarks.length})`, icon: <Bookmark size={14} /> },
          ] as { key: typeof activeTab; label: string; icon: React.ReactElement }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 14, display: "flex", alignItems: "center", gap: 6,
                color: activeTab === tab.key ? "var(--accent)" : "var(--text-muted)",
                borderBottom: `2px solid ${activeTab === tab.key ? "var(--accent)" : "transparent"}`,
                marginBottom: -1,
                transition: "all 0.15s",
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Books grid */}
        {activeTab === "books" && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", marginBottom: 20, textAlign: "center" }}>✦ محتويات الكتاب ✦</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14, paddingBottom: 40 }}>
              {mainBooks.map(book => {
                const progress = getBookProgress(book.id);
                return (
                  <button
                    key={book.id}
                    onClick={() => navigate(`/read/${book.id}`)}
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 16px", cursor: "pointer", textAlign: "right", fontFamily: "inherit", color: "var(--text-primary)", transition: "all 0.2s ease", display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-light)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px var(--shadow-color)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                  >
                    {progress > 0 && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--bg-secondary)" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-light)", transition: "width 0.5s" }} />
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 22 }}>{BOOK_ICONS[book.id] || "📖"}</span>
                      <div style={{ display: "flex", gap: 4, flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 7px", borderRadius: 20 }}>{book.abwab.length} باب</span>
                        {progress > 0 && <span style={{ fontSize: 10, color: "var(--accent-light)" }}>{progress}%</span>}
                      </div>
                    </div>
                    <h3 style={{ fontSize: "clamp(13px, 2vw, 15px)", fontWeight: 700, color: "var(--accent)", lineHeight: 1.4 }}>{book.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{book.abwab.reduce((a, b) => a + b.fusul.length, 0)} فصل</span>
                      <ChevronLeft size={13} style={{ color: "var(--accent-light)" }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div style={{ paddingBottom: 40 }}>
            {recentHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                <p>لم تقرأ بعد — ابدأ بفتح أي كتاب</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentHistory.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/read/${h.bookId}${h.babId ? `?bab=${h.babId}${h.faslId ? `&fasl=${h.faslId}` : ""}` : ""}`)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "right" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-light)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <Clock size={16} style={{ color: "var(--accent-light)", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--accent)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.faslTitle || h.babTitle || h.bookTitle}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{h.bookTitle}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                      {new Date(h.visitedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks */}
        {activeTab === "bookmarks" && (
          <div style={{ paddingBottom: 40 }}>
            {bookmarks.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
                <p>لا توجد علامات مرجعية بعد</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>أضف علامة من أي صفحة قراءة بالضغط على أيقونة العلامة</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bookmarks.map(bm => (
                  <button
                    key={bm.id}
                    onClick={() => navigate(`/read/${bm.bookId}${bm.babId ? `?bab=${bm.babId}${bm.faslId ? `&fasl=${bm.faslId}` : ""}` : ""}`)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "right" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-light)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <Bookmark size={16} style={{ color: "var(--accent)", flexShrink: 0 }} fill="var(--accent)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--accent)", fontSize: 14 }}>{bm.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{bm.bookTitle}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                      {new Date(bm.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px 20px", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>
        <p>كليب بن أحمد بن ضيف الله الزهراني — ربيع الثاني ١٤٤٧هـ</p>
        <p style={{ marginTop: 4 }}>
          <a href="https://t.me/Kazhrani" style={{ color: "var(--accent-light)" }}>@Kazhrani</a>
          {" · "}etmam1442@gmail.com
        </p>
      </footer>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onNavigate={(bookId, babId, faslId) => { setShowSearch(false); navigate(`/read/${bookId}${babId ? `?bab=${babId}${faslId ? `&fasl=${faslId}` : ""}` : ""}`); }} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
