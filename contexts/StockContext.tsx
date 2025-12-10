"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

// ---------- Types ----------
export interface WidgetStocks {
  [widgetId: string]: string; // stock symbol string
}

export interface WidgetColors {
  [widgetId: string]: string; // colorId
}

export interface StockContextType {
  widgetStocks: WidgetStocks;
  widgetColors: WidgetColors;
  updateWidgetColor: (widgetId: string, colorId: string) => void;
  removeWidgetColor: (widgetId: string) => void;
  updateSelectedStock: (stock: string, widgetId: string) => void;
}

// ---------- Create Context ----------
const StockContext = createContext<StockContextType | null>(null);

// ---------- Provider ----------
export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [widgetStocks, setWidgetStocks] = useState<WidgetStocks>({});
  const [widgetColors, setWidgetColors] = useState<WidgetColors>({});

  // Load from localStorage (Client Only)
  useEffect(() => {
    const savedStocks =
      JSON.parse(localStorage.getItem("widgetStocks") || "{}") || {};
    const savedColors =
      JSON.parse(localStorage.getItem("widgetColors") || "{}") || {};

    setWidgetStocks(savedStocks);
    setWidgetColors(savedColors);
  }, []);

  // Sync incoming changes from other tabs
  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === "widgetStocks") {
        setWidgetStocks(JSON.parse(event.newValue || "{}"));
      } else if (event.key === "widgetColors") {
        setWidgetColors(JSON.parse(event.newValue || "{}"));
      }
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  // Update widget color
  const updateWidgetColor = useCallback(
    (widgetId: string, colorId: string) => {
      setWidgetColors((prev) => {
        const updated = { ...prev, [widgetId]: colorId };
        localStorage.setItem("widgetColors", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Remove widget color
  const removeWidgetColor = useCallback((widgetId: string) => {
    setWidgetColors((prev) => {
      const updated = { ...prev };
      delete updated[widgetId];
      localStorage.setItem("widgetColors", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update selected stock (all widgets with same color)
  const updateSelectedStock = useCallback(
    (stock: string, widgetId: string) => {
      setWidgetStocks((prev) => {
        const colors = JSON.parse(localStorage.getItem("widgetColors") || "{}");
        const widgetColor = colors[widgetId];

        const matchingWidgets = Object.keys(colors).filter(
          (id) => colors[id] === widgetColor
        );

        if (matchingWidgets.length > 0) {
          const updated = { ...prev };

          matchingWidgets.forEach((id) => {
            updated[id] = stock;
          });

          localStorage.setItem("widgetStocks", JSON.stringify(updated));
          return updated;
        }

        return prev;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      widgetStocks,
      widgetColors,
      updateWidgetColor,
      updateSelectedStock,
      removeWidgetColor,
    }),
    [
      widgetStocks,
      widgetColors,
      updateWidgetColor,
      updateSelectedStock,
      removeWidgetColor,
    ]
  );

  return (
    <StockContext.Provider value={value}>{children}</StockContext.Provider>
  );
};

// ---------- Hooks ----------
export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock must be used inside StockProvider");
  }
  return context;
};

// Selector hooks
export const useWidgetStock = (widgetId: string) => {
  const { widgetStocks } = useStock();
  return useMemo(() => widgetStocks[widgetId], [widgetStocks, widgetId]);
};

export const useWidgetColor = (widgetId: string) => {
  const { widgetColors } = useStock();
  return useMemo(() => widgetColors[widgetId], [widgetColors, widgetId]);
};
