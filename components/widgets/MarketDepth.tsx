import React, { useMemo } from "react";
import { useWidgetStock, useWidgetColor } from "../../contexts/StockContext";

// Types
interface StockData {
  symbol: string;
  price: number;
}

interface MarketDepthProps {
  widgetId: string | null;
}

interface Order {
  price: number;
  size: number;
  total: number;
}

interface MarketData {
  bids: Order[];
  asks: Order[];
}

// Memoized component
const MarketDepth: React.FC<MarketDepthProps> = React.memo(({ widgetId }) => {
  const selectedStock = widgetId ? useWidgetStock(widgetId) : null;
  const widgetColor = widgetId ? useWidgetColor(widgetId) : undefined;

  console.log(`MarketDepth ID: ${widgetId}, Color: ${widgetColor}`);

  // Example bids and asks
  const marketData: MarketData = useMemo(() => {
    if (!selectedStock) return { bids: [], asks: [] };

    const symbol = selectedStock;

    const mockData: Record<string, MarketData> = {
      GOOGL: {
        bids: [
          { price: 2752.1, size: 1000, total: 1000 },
          { price: 2751.9, size: 800, total: 1800 },
          { price: 2751.7, size: 1200, total: 3000 },
          { price: 2751.5, size: 900, total: 3900 },
          { price: 2751.3, size: 1100, total: 5000 },
        ],
        asks: [
          { price: 2752.3, size: 700, total: 700 },
          { price: 2752.5, size: 900, total: 1600 },
          { price: 2752.7, size: 1100, total: 2700 },
          { price: 2752.9, size: 1300, total: 4000 },
          { price: 2753.1, size: 1000, total: 5000 },
        ],
      },
      AAPL: {
        bids: [
          { price: 154.31, size: 500, total: 500 },
          { price: 154.29, size: 300, total: 800 },
          { price: 154.27, size: 400, total: 1200 },
          { price: 154.25, size: 600, total: 1800 },
          { price: 154.23, size: 700, total: 2500 },
        ],
        asks: [
          { price: 154.33, size: 400, total: 400 },
          { price: 154.35, size: 600, total: 1000 },
          { price: 154.37, size: 800, total: 1800 },
          { price: 154.39, size: 1000, total: 2800 },
          { price: 154.41, size: 900, total: 3700 },
        ],
      },
      MSFT: {
        bids: [
          { price: 328.38, size: 200, total: 200 },
          { price: 328.36, size: 300, total: 500 },
          { price: 328.34, size: 400, total: 900 },
          { price: 328.32, size: 500, total: 1400 },
          { price: 328.3, size: 600, total: 2000 },
        ],
        asks: [
          { price: 328.4, size: 300, total: 300 },
          { price: 328.42, size: 400, total: 700 },
          { price: 328.44, size: 500, total: 1200 },
          { price: 328.46, size: 600, total: 1800 },
          { price: 328.48, size: 700, total: 2500 },
        ],
      },
      // Add more symbols as needed
    };

    return mockData[symbol] || { bids: [], asks: [] };
  }, [selectedStock]);

  const { bids, asks } = marketData;

  const maxTotal = Math.max(
    ...bids.map((b) => b.total),
    ...asks.map((a) => a.total),
    1 // Avoid division by zero
  );

  return (
    <div className="h-full p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-blue-400">
        Market Depth {selectedStock ? `(${selectedStock})` : ""}
      </h3>

      <div className="text-sm">
        {/* Asks */}
        <div className="mb-1">
          {asks.slice().reverse().map((ask, i) => (
            <div key={i} className="flex mb-1">
              <div className="w-1/3 text-right pr-2 text-red-500">{ask.price.toFixed(2)}</div>
              <div className="w-1/3 text-right pr-2">{ask.size}</div>
              <div className="w-1/3 relative">
                <div
                  className="bg-red-900 h-5 absolute right-0"
                  style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                />
                <span className="absolute right-1 text-xs">{ask.total}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="text-center my-2 text-gray-400">
          Spread: {asks[0]?.price && bids[0]?.price ? (asks[0].price - bids[0].price).toFixed(2) : "N/A"}
        </div>

        {/* Bids */}
        <div className="mt-1">
          {bids.map((bid, i) => (
            <div key={i} className="flex mb-1">
              <div className="w-1/3 text-right pr-2 text-green-500">{bid.price.toFixed(2)}</div>
              <div className="w-1/3 text-right pr-2">{bid.size}</div>
              <div className="w-1/3 relative">
                <div
                  className="bg-green-900 h-5 absolute right-0"
                  style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                />
                <span className="absolute right-1 text-xs">{bid.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MarketDepth;
