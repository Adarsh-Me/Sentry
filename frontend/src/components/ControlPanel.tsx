import { useAppStore } from "../store";

interface Props { onRun: () => void; }

export function ControlPanel({ onRun }: Props) {
  const { params, setParams, status, satellites } = useAppStore();
  const groupName = params.satelliteGroup === "oneweb" ? "OneWeb" : params.satelliteGroup === "active" ? "active" : "Starlink";
  const groupObjects = params.satelliteGroup === "active" ? satellites : satellites.filter((satellite) => satellite.isIndianAsset || satellite.name.toLowerCase().includes(groupName.toLowerCase()));
  const groupHint = params.satelliteGroup === "oneweb" && groupObjects.every((satellite) => satellite.isIndianAsset) ? "No OneWeb records are in the local cache; Indian assets remain included." : `${groupObjects.length} objects match this working set.`;
  return <section className="control-panel panel">
    <div className="eyebrow">CHOOSE WHAT TO CHECK</div>
    <label className="field-label" htmlFor="threshold">Flag pairs closer than <span>{params.thresholdKm} km</span></label>
    <input id="threshold" type="range" min="10" max="100" step="5" value={params.thresholdKm} onChange={(event) => setParams({ thresholdKm: Number(event.target.value) })} />
    <p className="field-hint">Smaller distance = fewer, more urgent alerts</p>
    <div className="control-grid">
      <label className="field-label">Window <select value={params.windowHours} onChange={(event) => setParams({ windowHours: Number(event.target.value) })}><option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option></select></label>
      <label className="field-label">Step <select value={params.stepMinutes} onChange={(event) => setParams({ stepMinutes: Number(event.target.value) })}><option value="1">1 min</option><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option></select></label>
    </div>
    <label className="field-label">Working set <select value={params.satelliteGroup} onChange={(event) => setParams({ satelliteGroup: event.target.value })}><option value="starlink">Starlink + Indian assets</option><option value="oneweb">OneWeb + Indian assets</option><option value="active">Active objects</option></select></label>
    <p className="field-hint">{groupHint}</p>
    <button className="primary-button" onClick={onRun} disabled={status === "loading"}>{status === "loading" ? "SCREENING…" : "RUN SCREENING"}<span>↗</span></button>
    <div className="set-count">{groupObjects.length ? `${groupObjects.length} objects ready for screening` : "No matching objects loaded"}</div>
  </section>;
}
