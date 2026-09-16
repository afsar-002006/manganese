import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { miningService } from "@/services/mining-service";
import type { Mine } from "@/services/types";

interface MineContextValue {
  mines: Mine[];
  mine: Mine | undefined;
  mineId: string | undefined;
  setMineId: (id: string) => void;
  selectedZoneId: string | undefined;
  setSelectedZoneId: (id: string | undefined) => void;
  selectedBoreholeId: string | undefined;
  setSelectedBoreholeId: (id: string | undefined) => void;
  isLoading: boolean;
}

const MineContext = createContext<MineContextValue | undefined>(undefined);
const STORAGE_KEY = "mi.selected-mine";

export function MineProvider({ children }: { children: ReactNode }) {
  const { data: mines = [], isLoading } = useQuery({
    queryKey: ["mines"],
    queryFn: () => miningService.listMines(),
    staleTime: 5 * 60 * 1000,
  });

  const [mineId, setMineIdState] = useState<string | undefined>(undefined);
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>(undefined);
  const [selectedBoreholeId, setSelectedBoreholeId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (mines.length === 0) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const valid = stored && mines.some((m) => m.id === stored) ? stored : mines[0]!.id;
    setMineIdState((current) => current ?? valid);
  }, [mines]);

  const setMineId = (id: string) => {
    setMineIdState(id);
    setSelectedZoneId(undefined);
    setSelectedBoreholeId(undefined);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  };

  const value = useMemo<MineContextValue>(
    () => ({
      mines,
      mineId,
      mine: mines.find((m) => m.id === mineId),
      setMineId,
      selectedZoneId,
      setSelectedZoneId,
      selectedBoreholeId,
      setSelectedBoreholeId,
      isLoading,
    }),
    [mines, mineId, selectedZoneId, selectedBoreholeId, isLoading],
  );

  return <MineContext.Provider value={value}>{children}</MineContext.Provider>;
}

export function useMine() {
  const ctx = useContext(MineContext);
  if (!ctx) throw new Error("useMine must be used inside MineProvider");
  return ctx;
}
