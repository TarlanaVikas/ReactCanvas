import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import useUi from "../store/useUi";
import "./ToastHost.css";

const ICONS = { ok: CheckCircle2, error: AlertTriangle, info: Info };

export default function ToastHost() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  return (
    <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.tone}`} role={t.tone === "error" ? "alert" : "status"}>
            <Icon size={16} strokeWidth={2.2} className="toast-icon" />
            <div className="toast-text">
              <strong>{t.title}</strong>
              {t.detail && <span>{t.detail}</span>}
            </div>
            {t.action && (
              <button
                className="toast-action"
                onClick={() => {
                  t.action.run();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button className="toast-x" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
