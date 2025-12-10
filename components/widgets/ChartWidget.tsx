import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  BarController,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useWidgetStock, useWidgetColor } from "../../contexts/StockContext";

// Register Chart.js components
ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface ChartWidgetProps {
  widgetId: string | null;
}

interface StockChartEntry {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// ---------- FULL FIX STARTS HERE ----------
const ChartWidget: React.FC<ChartWidgetProps> = React.memo(({ widgetId }) => {
  // --- 1) Handle missing widgetId ---
  const effectiveWidgetId = widgetId ?? "AAPL"; // fallback so chart never stays empty

  // --- 2) Read global state ---
  const selectedStockSymbol: string | null = useWidgetStock(effectiveWidgetId);
  const widgetColor = useWidgetColor(effectiveWidgetId);

  console.log("ChartWidget ID:", effectiveWidgetId, "Color:", widgetColor);

  const selectedStock = selectedStockSymbol
    ? { symbol: selectedStockSymbol, price: 0 }
    : null;

  // --- 3) Mock chart data ---
  const stockChartData: StockChartEntry[] = useMemo(() => {
    if (!selectedStock) return [];

    const symbol = selectedStock.symbol;

    const stockMap: Record<string, StockChartEntry[]> = {
      AAPL: [
        { time: "9:30", open: 150, high: 155, low: 148, close: 153 },
        { time: "10:00", open: 153, high: 156, low: 151, close: 154 },
        { time: "10:30", open: 154, high: 158, low: 153, close: 157 },
        { time: "11:00", open: 157, high: 159, low: 155, close: 156 },
        { time: "11:30", open: 156, high: 157, low: 152, close: 154 },
      ],
      GOOGL: [
        { time: "9:30", open: 2750, high: 2760, low: 2745, close: 2755 },
        { time: "10:00", open: 2755, high: 2765, low: 2750, close: 2760 },
        { time: "10:30", open: 2760, high: 2770, low: 2755, close: 2765 },
        { time: "11:00", open: 2765, high: 2775, low: 2760, close: 2770 },
        { time: "11:30", open: 2770, high: 2780, low: 2765, close: 2775 },
      ],
      MSFT: [
        { time: "9:30", open: 330, high: 335, low: 328, close: 332 },
        { time: "10:00", open: 332, high: 336, low: 330, close: 334 },
        { time: "10:30", open: 334, high: 338, low: 331, close: 336 },
        { time: "11:00", open: 336, high: 340, low: 335, close: 339 },
        { time: "11:30", open: 339, high: 341, low: 334, close: 337 },
      ],
    };

    return stockMap[symbol] || [];
  }, [selectedStock]);

  // --- 4) Labels for X-axis ---
  const labels = stockChartData.map((entry) => entry.time);

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "High",
        data: stockChartData.map((entry) => entry.high),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Low",
        data: stockChartData.map((entry) => entry.low),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label ?? ""}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: false },
    },
  };

  return (
    <div className="h-full p-4 bg-neutral-950 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-blue-400">
        {selectedStock ? `${selectedStock.symbol} Chart` : "Select a Stock"}
      </h3>

      <div className="h-64 w-full">
        {stockChartData.length > 0 ? (
          <Chart type="bar" data={data} options={options} />
        ) : (
          <p className="text-gray-400 text-center">
            No data available for the selected stock.
          </p>
        )}
      </div>

      {selectedStock && (
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-green-500">+2.5%</span>
          <span>{selectedStock.price} USD</span>
        </div>
      )}
    </div>
  );
});

export default ChartWidget;
