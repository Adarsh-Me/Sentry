import { useCallback, useEffect, useState } from "react";
import { fetchSatellites, refreshTle, runScreening } from "./api";
import { useAppStore } from "./store";
import { AlertsPanel } from "./components/AlertsPanel";
import { AlertsView, AnalyticsView, CatalogView, ConjunctionsView, SettingsView } from "./components/DataViews";
import { ControlPanel } from "./components/ControlPanel";
import { ObjectInfoPanel } from "./components/ObjectInfoPanel";
import { OrbitScene } from "./components/OrbitScene";
import { OverviewStrip } from "./components/OverviewStrip";
import { ScoreBreakdown } from "./components/ScoreBreakdown";
import { Sidebar } from "./components/Sidebar";
import { StatusStrip } from "./components/StatusStrip";
import type { ViewKey } from "./types";
import "./styles.css";

function formatAge(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min ago`;
  return `${hours.toFixed(1)} h ago`;
}

const viewTitles: Record<Exclude<ViewKey, "live">, string> = {
  alerts: "Which satellites need attention",
  conjunctions: "Predicted close approaches",
  catalog: "Satellite catalog",
  analytics: "Screening summary",
  settings: "Data and screening settings",
};

export default function App() {
  const { satellites, positions, stale, status, error, params, currentView, setSatellites, setStatus, setResult } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadCatalog = useCallback(async (shouldRefresh = false) => {
    setStatus("loading");
    try {
      if (shouldRefresh) await refreshTle();
      const value = await fetchSatellites();
      setSatellites(value.satellites, value.stale);
      setStatus("idle");
    } catch (value) {
      setStatus("error", value instanceof Error ? value.message : "Satellite catalog unavailable");
    }
  }, [setSatellites, setStatus]);

  const run = useCallback(async () => {
    setStatus("loading");
    try {
      setResult(await runScreening(params));
    } catch (value) {
      setStatus("error", value instanceof Error ? value.message : "Screening failed");
    }
  }, [params, setResult, setStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCatalog(true);
    setRefreshing(false);
  }, [loadCatalog]);

  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  const freshest = satellites.length ? Math.min(...satellites.map((satellite) => satellite.hoursSinceEpoch)) : null;
  const hasScreening = Object.keys(positions).length > 0;
  const errorCopy = hasScreening ? error : `${error ?? "The live catalog is unavailable"}. Start the backend to load real satellite data; the globe is showing a labeled preview.`;

  const liveView = <>
    <div className="scene-column">
      <div className="stage-heading"><div><span className="stage-kicker">LIVE ORBIT MAP</span><h2>Where satellites are going</h2></div><div className="stage-time"><span className="status-led" />UTC <strong>{new Date().toISOString().slice(11, 19)}</strong></div></div>
      <OrbitScene />
      <div className="scene-tools"><ControlPanel onRun={run} /><div className="telemetry-note"><span className="note-icon">⌁</span><div><strong>{hasScreening ? "LIVE PROPAGATION ACTIVE" : "PROPAGATION PREVIEW"}</strong><small>{hasScreening ? "SGP4 state vectors updating against current TLE epoch" : "Two example satellites explain the view before live data is connected"}</small></div><span className="telemetry-arrow">↗</span></div></div>
      <OverviewStrip />
    </div>
    <div className="alerts-column"><AlertsPanel /><ObjectInfoPanel /><ScoreBreakdown /></div>
  </>;

  const secondaryView = currentView === "alerts" ? <AlertsView /> : currentView === "conjunctions" ? <ConjunctionsView /> : currentView === "catalog" ? <CatalogView /> : currentView === "analytics" ? <AnalyticsView /> : <SettingsView onRefresh={handleRefresh} refreshing={refreshing} />;

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><h1>ARGUS<span>-LEO</span></h1><p>SOVEREIGN LEO COLLISION RISK MONITOR</p></div></div>
      <div className={`freshness ${stale ? "stale" : ""}`}><span className="freshness-dot" /><div><small>{stale ? "CACHED DATA / VERIFY FRESHNESS" : "TLE DATA FEED"}</small><strong>{freshest === null ? "Awaiting catalog" : `${formatAge(freshest)} · ${satellites.length} objects`}</strong></div></div>
      <StatusStrip />
    </header>
    {error && <div className="error-banner"><strong>{hasScreening ? "SCREENING ERROR" : "DATA CONNECTION"}</strong><span>{errorCopy}</span></div>}
    <div className="dashboard-body"><Sidebar /><div className={`workspace ${currentView === "live" ? "" : "workspace-single"}`}>
      {currentView === "live" ? liveView : <div className="view-column"><div className="stage-heading"><div><span className="stage-kicker">ARGUS-LEO / {currentView.toUpperCase()}</span><h2>{viewTitles[currentView]}</h2></div><div className="stage-time"><span className="status-led" />{satellites.length} objects loaded</div></div>{secondaryView}</div>}
    </div></div>
    <footer className="disclaimer"><span>ⓘ</span><strong>SCREENING / TRIAGE LAYER</strong><p>Uses public TLE data and SGP4 propagation. Accuracy degrades with time since epoch; monitoring thresholds are not collision thresholds.</p><span className="build">ARGUS-LEO · LOCAL BUILD 0.1</span></footer>
  </main>;
}
