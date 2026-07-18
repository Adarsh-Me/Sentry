import type { ReactNode } from "react";
import { useAppStore } from "../store";
import type { ConjunctionAlert } from "../types";

function formatTime(value: string) {
  return `${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(value))} UTC`;
}

function ViewShell({ eyebrow, title, description, children, actions }: { eyebrow: string; title: string; description: string; children: ReactNode; actions?: ReactNode }) {
  return <section className="data-view panel"><div className="data-view-header"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>{actions && <div className="data-view-actions">{actions}</div>}</div>{children}</section>;
}

function RiskPill({ alert }: { alert: ConjunctionAlert }) {
  return <span className={`risk-badge risk-${alert.riskLevel.toLowerCase()}`}><i />{alert.riskLevel}</span>;
}

export function AlertsView() {
  const { alerts, selectedAlertId, selectAlert, setView } = useAppStore();
  return <ViewShell eyebrow="PRIORITIZED EVENTS" title="Risk alerts" description="These are the satellite pairs that need the most attention in the current screening run.">
    {alerts.length === 0 ? <div className="view-empty"><strong>No alerts yet</strong><span>Run screening from Live View to compare the current catalog.</span><button type="button" className="secondary-button" onClick={() => setView("live")}>GO TO LIVE VIEW</button></div> : <div className="alert-table">{alerts.map((alert) => <button type="button" className={`alert-row ${selectedAlertId === alert.id ? "selected" : ""}`} key={alert.id} onClick={() => { selectAlert(alert.id); setView("live"); }}><RiskPill alert={alert} /><strong>{alert.satA} × {alert.satB}</strong><span>{alert.minDistanceKm.toFixed(2)} km apart</span><span>{formatTime(alert.timeOfClosestApproach)}</span><b>{alert.riskScore.toFixed(1)} / 100 →</b></button>)}</div>}
  </ViewShell>;
}

export function ConjunctionsView() {
  const { alerts, setView, selectAlert } = useAppStore();
  return <ViewShell eyebrow="PAIRWISE SCREENING" title="Conjunctions" description="A conjunction is a predicted close approach between two tracked orbital objects. Select a row to focus it on the globe.">
    <div className="definition-callout"><span className="callout-icon">ⓘ</span><div><strong>What counts as a conjunction?</strong><p>A pair is listed when its predicted minimum separation is below your monitoring threshold. This is a screening signal, not a confirmed collision.</p></div></div>
    {alerts.length === 0 ? <div className="view-empty"><strong>No conjunctions found</strong><span>Try a wider monitoring threshold or a longer screening window.</span><button type="button" className="secondary-button" onClick={() => setView("live")}>ADJUST SCREENING</button></div> : <div className="conjunction-table"><div className="table-head"><span>PAIR</span><span>MISS DISTANCE</span><span>CLOSEST APPROACH</span><span>RISK</span></div>{alerts.map((alert) => <button type="button" className="conjunction-row" key={alert.id} onClick={() => { selectAlert(alert.id); setView("live"); }}><strong>{alert.satA} × {alert.satB}</strong><span>{alert.minDistanceKm.toFixed(2)} km</span><span>{formatTime(alert.timeOfClosestApproach)}</span><b>{alert.riskScore.toFixed(1)} / 100</b></button>)}</div>}
  </ViewShell>;
}

export function CatalogView() {
  const { satellites, selectedSatelliteName, selectSatellite, setView } = useAppStore();
  return <ViewShell eyebrow="TRACKED OBJECTS" title="Satellite catalog" description="These are the TLE-backed objects currently available to the screening service."><div className="catalog-summary"><strong>{satellites.length}</strong><span>objects available for screening</span><small>Rows marked Indian asset are included alongside the selected constellation group.</small></div>{satellites.length === 0 ? <div className="view-empty"><strong>Catalog unavailable</strong><span>Start the backend or refresh the data connection.</span></div> : <div className="catalog-table"><div className="table-head"><span>OBJECT</span><span>NORAD ID</span><span>TLE AGE</span><span>TYPE</span></div>{satellites.map((satellite) => <button type="button" className={`catalog-row ${selectedSatelliteName === satellite.name ? "selected" : ""}`} key={satellite.name} onClick={() => { selectSatellite(satellite.name); setView("live"); }}><strong>{satellite.name}</strong><span>{satellite.noradId}</span><span>{satellite.hoursSinceEpoch.toFixed(1)} h</span><span>{satellite.isIndianAsset ? "INDIAN ASSET" : "PAYLOAD"}</span></button>)}</div>}</ViewShell>;
}

export function AnalyticsView() {
  const { alerts, satellites, positions, stale } = useAppStore();
  const low = alerts.filter((alert) => alert.riskLevel === "LOW").length;
  const medium = alerts.filter((alert) => alert.riskLevel === "MEDIUM").length;
  const high = alerts.filter((alert) => alert.riskLevel === "HIGH").length;
  return <ViewShell eyebrow="SCREENING SUMMARY" title="Analytics" description="A compact readout of the current catalog, propagation run, and alert mix."><div className="analytics-grid"><div className="metric-card"><small>CATALOG OBJECTS</small><strong>{satellites.length}</strong><span>{stale ? "cached TLE data" : "fresh TLE data"}</span></div><div className="metric-card"><small>OBJECTS PROPAGATED</small><strong>{Object.keys(positions).length}</strong><span>state-vector series</span></div><div className="metric-card metric-danger"><small>FLAGGED PAIRS</small><strong>{alerts.length}</strong><span>{high} high · {medium} medium · {low} low</span></div></div><div className="analytics-section"><div className="eyebrow">RISK MIX</div><div className="analytics-bars"><div><span style={{ width: `${Math.max(2, low / Math.max(1, alerts.length) * 100)}%` }} /><b>LOW <em>{low}</em></b></div><div><span style={{ width: `${Math.max(2, medium / Math.max(1, alerts.length) * 100)}%` }} /><b>MEDIUM <em>{medium}</em></b></div><div><span style={{ width: `${Math.max(2, high / Math.max(1, alerts.length) * 100)}%` }} /><b>HIGH <em>{high}</em></b></div></div></div></ViewShell>;
}

export function SettingsView({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  const { params, setParams, stale, status } = useAppStore();
  return <ViewShell eyebrow="DATA AND SCREENING" title="Settings" description="Control how the local screening service fetches and evaluates satellite data."><div className="settings-grid"><div className="setting-card"><div><strong>Refresh TLE catalog</strong><p>Fetch the latest available elements when the cache is stale. The service keeps the current cache if upstream refresh fails.</p></div><button type="button" className="secondary-button" onClick={onRefresh} disabled={refreshing}>{refreshing ? "REFRESHING…" : "REFRESH DATA"}</button><small className={stale ? "setting-warning" : "setting-good"}>{stale ? "Cached data may be out of date" : "Catalog freshness is within the service window"}</small></div><div className="setting-card"><div><strong>Current screening defaults</strong><p>These values are shared with the Live View screening controls.</p></div><label>Window<select value={params.windowHours} onChange={(event) => setParams({ windowHours: Number(event.target.value) })}><option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option></select></label><label>Step<select value={params.stepMinutes} onChange={(event) => setParams({ stepMinutes: Number(event.target.value) })}><option value="1">1 minute</option><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label><small className="setting-good">API status: {status === "error" ? "unavailable" : "connected or ready"}</small></div></div></ViewShell>;
}
