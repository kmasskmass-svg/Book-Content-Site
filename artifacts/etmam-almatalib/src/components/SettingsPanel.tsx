import { useSettings } from "@/hooks/useSettings";
import { X, Sun, Moon, Coffee, Minus, Plus } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: Props) {
  const { settings, updateSettings } = useSettings();

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-card)",
        borderRadius: 16,
        width: "100%",
        maxWidth: 400,
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }} className="fade-in">
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--accent)" }}>إعدادات القراءة</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Theme */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>المظهر</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "light", label: "فاتح", icon: <Sun size={16} /> },
                { value: "dark", label: "داكن", icon: <Moon size={16} /> },
                { value: "sepia", label: "بني", icon: <Coffee size={16} /> },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ theme: opt.value as any })}
                  style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, border: `2px solid ${settings.theme === opt.value ? "var(--accent)" : "var(--border)"}`,
                    background: settings.theme === opt.value ? "var(--accent-bg)" : "var(--bg-secondary)",
                    color: settings.theme === opt.value ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: settings.theme === opt.value ? 700 : 400,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font family */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>الخط</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "amiri", label: "أميري" },
                { value: "noto", label: "نوتو" },
                { value: "scheherazade", label: "شهرزاد" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ fontFamily: opt.value as any })}
                  style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, border: `2px solid ${settings.fontFamily === opt.value ? "var(--accent)" : "var(--border)"}`,
                    background: settings.fontFamily === opt.value ? "var(--accent-bg)" : "var(--bg-secondary)",
                    color: settings.fontFamily === opt.value ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer", fontFamily: opt.value === "amiri" ? "Amiri, serif" : opt.value === "noto" ? "'Noto Naskh Arabic', serif" : "'Scheherazade New', serif",
                    fontSize: 14,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
              حجم الخط: <span style={{ color: "var(--accent)" }}>{settings.fontSize}px</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => updateSettings({ fontSize: Math.max(14, settings.fontSize - 2) })}
                style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}
              >
                <Minus size={16} />
              </button>
              <input
                type="range" min={14} max={32} value={settings.fontSize}
                onChange={e => updateSettings({ fontSize: Number(e.target.value) })}
                style={{ flex: 1, accentColor: "var(--accent)" }}
              />
              <button
                onClick={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })}
                style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Line height */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
              تباعد السطور: <span style={{ color: "var(--accent)" }}>{settings.lineHeight}</span>
            </label>
            <input
              type="range" min={1.6} max={3.0} step={0.2} value={settings.lineHeight}
              onChange={e => updateSettings({ lineHeight: Number(e.target.value) })}
              style={{ width: "100%", accentColor: "var(--accent)" }}
            />
          </div>

          {/* Preview */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
            <p style={{
              fontSize: settings.fontSize,
              lineHeight: settings.lineHeight,
              fontFamily: settings.fontFamily === "amiri" ? "Amiri, serif" : settings.fontFamily === "noto" ? "'Noto Naskh Arabic', serif" : "'Scheherazade New', serif",
              color: "var(--text-primary)",
              textAlign: "center",
            }}>
              بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
