import { useAppStore } from "../store";
import type { ViewKey } from "../types";

const items: Array<[string, string, ViewKey]> = [
  ["◈", "Live View", "live"],
  ["◌", "Risk Alerts", "alerts"],
  ["✣", "Conjunctions", "conjunctions"],
  ["▣", "Catalog", "catalog"],
  ["▥", "Analytics", "analytics"],
  ["⚙", "Settings", "settings"],
];

export function Sidebar() {
  const { alerts, currentView, setView, status, stale } = useAppStore();
  const systemLabel = status === "error" ? "API unavailable" : stale ? "Cached data in use" : "All systems nominal";
  return <aside className="sidebar">
    <nav className="side-nav" aria-label="Primary navigation">
      {items.map(([icon, label, key]) => <button type="button" className={`nav-item ${currentView === key ? "active" : ""}`} key={key} onClick={() => setView(key)} aria-current={currentView === key ? "page" : undefined}>
        <span className="nav-icon">{icon}</span><span>{label}</span>{key === "alerts" && alerts.length > 0 && <b className="nav-count">{alerts.length}</b>}
      </button>)}
    </nav>
    <div className="system-status">
      <div className="eyebrow"><span className={`status-led ${status === "error" ? "status-led-error" : ""}`} />SYSTEM STATUS</div>
      <strong><span className={`status-led ${status === "error" ? "status-led-error" : ""}`} />{systemLabel}</strong>
      <small>SGP4 PROPAGATION · LOCAL API</small>
    </div>
  </aside>;
}
