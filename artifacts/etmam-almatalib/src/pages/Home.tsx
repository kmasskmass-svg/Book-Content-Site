import { useLocation } from "wouter";
import { books } from "@/data/books";
import { useSettings } from "@/hooks/useSettings";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Settings, Moon, Sun, Bookmark, Search, BookOpen, ChevronLeft } from "lucide-react";
import { useState } from "react";
import SearchModal from "@/components/SearchModal";
import SettingsPanel from "@/components/SettingsPanel";

const BOOK_ICONS: Record<string, string> = {
  muqaddima: "📜",
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
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const mainBooks = books.filter(b => b.id !== "muqaddima");
  const muqaddima = books.find(b => b.id === "muqaddima");

  const themeIcon = settings.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />;
  const toggleTheme = () => {
    const next = settings.theme === "light" ? "dark" : settings.theme === "dark" ? "sepia" : "light";
    updateSettings({ theme: next });
  };

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="no-print" style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 2px 12px var(--shadow-color)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>📚</span>
            <div>
              <h1 style={{ fontSize: "clamp(14px, 2.5vw, 18px)", fontWeight: 700, color: "var(--accent)", lineHeight: 1.2 }}>
                متن إتمام المطالب
              </h1>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>بتكميل دليل الطالب</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {bookmarks.length > 0 && (
              <button
                onClick={() => navigate("/read/muqaddima")}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
              >
                <Bookmark size={15} />
                <span>{bookmarks.length}</span>
              </button>
            )}
            <button onClick={() => setShowSearch(true)} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--accent)", cursor: "pointer", display: "flex" }}>
              <Search size={18} />
            </button>
            <button onClick={toggleTheme} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
              {themeIcon}
            </button>
            <button onClick={() => setShowSettings(true)} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--accent) 0%, #4a3318 50%, var(--bg-secondary) 100%)",
        padding: "48px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 36px)", fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 8 }}>
            متن إتمام المطالب
          </h1>
          <h2 style={{ fontSize: "clamp(14px, 2.5vw, 20px)", color: "rgba(255,255,255,0.85)", marginBottom: 16, fontWeight: 400 }}>
            بتكميل دليل الطالب المجرد من الحواشي والتعليقات
          </h2>
          <p style={{ fontSize: "clamp(13px, 2vw, 16px)", color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>
            تأليف: كليب بن أحمد بن ضيف الله الزهراني
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/read/k1")}
              style={{
                padding: "12px 28px", borderRadius: 10, background: "#fff", color: "var(--accent)",
                border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <BookOpen size={18} />
              ابدأ القراءة
            </button>
            {muqaddima && (
              <button
                onClick={() => navigate("/read/muqaddima")}
                style={{
                  padding: "12px 28px", borderRadius: 10, background: "rgba(255,255,255,0.15)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "inherit", fontSize: 16,
                }}
              >
                المقدمة
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "12px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { label: "كتاباً", value: mainBooks.length },
            { label: "باباً", value: mainBooks.reduce((a, b) => a + b.abwab.length, 0) },
            { label: "فصلاً", value: mainBooks.reduce((a, b) => a + b.abwab.reduce((c, d) => c + d.fusul.length, 0), 0) },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{stat.value}</span>
              <span style={{ fontSize: 14, color: "var(--text-muted)", marginRight: 6 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Books grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", marginBottom: 24, textAlign: "center" }}>
          ✦ محتويات الكتاب ✦
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}>
          {mainBooks.map((book, idx) => (
            <button
              key={book.id}
              onClick={() => navigate(`/read/${book.id}`)}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "20px 16px",
                cursor: "pointer",
                textAlign: "right",
                fontFamily: "inherit",
                color: "var(--text-primary)",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-light)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px var(--shadow-color)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 24 }}>{BOOK_ICONS[book.id] || "📖"}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: 20 }}>
                  {book.abwab.length} باب
                </span>
              </div>
              <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: "var(--accent)", lineHeight: 1.4 }}>
                {book.title}
              </h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {book.abwab.reduce((a, b) => a + b.fusul.length, 0)} فصل
                </span>
                <ChevronLeft size={14} style={{ color: "var(--accent-light)" }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px 20px", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13, marginTop: 20 }}>
        <p>كليب بن أحمد بن ضيف الله الزهراني — ربيع الثاني 1447هـ</p>
        <p style={{ marginTop: 4 }}>
          <a href="https://t.me/Kazhrani" style={{ color: "var(--accent-light)" }}>@Kazhrani</a>
          {" · "}
          etmam1442@gmail.com
        </p>
      </footer>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onNavigate={(bookId, babId, faslId) => { setShowSearch(false); navigate(`/read/${bookId}${babId ? `?bab=${babId}` : ""}${faslId ? `&fasl=${faslId}` : ""}`); }} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
