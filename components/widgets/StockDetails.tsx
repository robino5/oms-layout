import React from "react";
import { useWidgetStock, useWidgetColor } from "../../contexts/StockContext";

// Types
interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: string;
    peRatio: number;
    dividend: string;
    volume: string;
}

interface StockDetailsProps {
    widgetId: string | null;
}

const StockDetails: React.FC<StockDetailsProps> = React.memo(({ widgetId }) => {
    const selectedStockRaw = widgetId ? useWidgetStock(widgetId) : null;
    const selectedStock: StockData | null = typeof selectedStockRaw === "object" && selectedStockRaw !== null
        ? (selectedStockRaw as StockData)
        : null;
    const widgetColor = widgetId ? useWidgetColor(widgetId) : undefined;

    console.log(`StockDetails ID: ${widgetId}, Color: ${widgetColor}`);
    console.log("Selected stock in StockDetails:", selectedStock);

    const stock: StockData = {
        symbol: selectedStock?.symbol ?? "AAPL",
        name: selectedStock?.name ?? "Apple Inc.",
        price: selectedStock?.price ?? 154.32,
        change: selectedStock?.change ?? 2.35,
        changePercent: selectedStock?.changePercent ?? 1.55,
        marketCap: selectedStock?.marketCap ?? "2.53T",
        peRatio: selectedStock?.peRatio ?? 28.76,
        dividend: selectedStock?.dividend ?? "0.88 (0.57%)",
        volume: selectedStock?.volume ?? "78.4M",
    };

    return (
        <div className="h-full p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold">{stock.symbol[0]}</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{stock.symbol}</h3>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="text-2xl font-bold mb-1">${stock.price.toFixed(2)}</div>
                <div className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-gray-400">Market Cap</p>
                    <p>{stock.marketCap}</p>
                </div>
                <div>
                    <p className="text-gray-400">P/E Ratio</p>
                    <p>{stock.peRatio}</p>
                </div>
                <div>
                    <p className="text-gray-400">Dividend</p>
                    <p>{stock.dividend}</p>
                </div>
                <div>
                    <p className="text-gray-400">Volume</p>
                    <p>{stock.volume}</p>
                </div>
            </div>
        </div>
    );
});

export default StockDetails;
