import { create } from "zustand";
import type { ConjunctionAlert, Satellite, ScreeningParams, ScreeningResult, ViewKey } from "./types";

interface AppState {
  satellites: Satellite[];
  alerts: ConjunctionAlert[];
  positions: ScreeningResult["positions"];
  selectedAlertId: string | null;
  selectedSatelliteName: string | null;
  currentView: ViewKey;
  params: ScreeningParams;
  stale: boolean;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  setSatellites: (satellites: Satellite[], stale: boolean) => void;
  setParams: (params: Partial<ScreeningParams>) => void;
  setResult: (result: ScreeningResult) => void;
  selectAlert: (id: string | null) => void;
  selectSatellite: (name: string | null) => void;
  setView: (view: ViewKey) => void;
  setStatus: (status: AppState["status"], error?: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  satellites: [],
  alerts: [],
  positions: {},
  selectedAlertId: null,
  selectedSatelliteName: null,
  currentView: "live",
  params: { windowHours: 24, stepMinutes: 5, thresholdKm: 50, satelliteGroup: "starlink" },
  stale: false,
  status: "idle",
  error: null,
  setSatellites: (satellites, stale) => set({ satellites, stale, error: null }),
  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  setResult: (result) => set((state) => ({ alerts: result.alerts, positions: result.positions, params: result.params, stale: result.stale, status: "ready", error: null, selectedAlertId: result.alerts.some((alert) => alert.id === state.selectedAlertId) ? state.selectedAlertId : null })),
  selectAlert: (selectedAlertId) => set({ selectedAlertId }),
  selectSatellite: (selectedSatelliteName) => set({ selectedSatelliteName }),
  setView: (currentView) => set({ currentView }),
  setStatus: (status, error = null) => set({ status, error }),
}));
