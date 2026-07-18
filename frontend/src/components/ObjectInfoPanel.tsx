import { useAppStore } from "../store";

export function ObjectInfoPanel() {
  const { satellites, selectedAlertId, selectedSatelliteName, alerts } = useAppStore();
  const selected = alerts.find((alert) => alert.id === selectedAlertId);
  const name = selectedSatelliteName ?? selected?.satA ?? satellites.find((satellite) => satellite.isIndianAsset)?.name ?? satellites[0]?.name ?? "Awaiting catalogue";
  const satellite = satellites.find((item) => item.name === name) ?? satellites[0];
  return <section className="object-panel panel">
    <div className="panel-heading"><div><div className="eyebrow">ABOUT THIS SATELLITE</div><h2>Selected object</h2></div><span className="object-status">● TRACKED</span></div>
    <div className="object-name"><span className="object-glyph">◉</span><div><strong>{name}</strong><small>{satellite ? `NORAD ${satellite.noradId}` : "NO OBJECT LOCK"}</small></div></div>
    <div className="object-facts">
      <span><small>OBJECT TYPE</small><strong>{satellite?.isIndianAsset ? "PAYLOAD / INDIAN ASSET" : "PAYLOAD"}</strong></span>
      <span><small>ORBIT ALTITUDE</small><strong>{satellite ? `${satellite.altitudeKm.toFixed(1)} km` : "—"}</strong></span>
      <span><small>INCLINATION</small><strong>{satellite ? `${satellite.inclinationDeg.toFixed(2)}°` : "—"}</strong></span>
      <span><small>VELOCITY</small><strong>{satellite ? `${satellite.velocityKms.toFixed(3)} km/s` : "—"}</strong></span>
    </div>
    <div className="object-footer"><span className="status-led" />Propagation healthy <b>ECI / SGP4</b></div>
  </section>;
}
