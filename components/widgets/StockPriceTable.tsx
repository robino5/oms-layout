import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useStock, useWidgetColor } from "../../contexts/StockContext";

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

interface StockPriceTableProps {
  widgetId: string | null;
}

const StockPriceTable: React.FC<StockPriceTableProps> = React.memo(
  ({ widgetId }) => {
    const { updateSelectedStock } = useStock();
    const widgetColor = widgetId ? useWidgetColor(widgetId) : undefined;

    console.log(`StockPriceTable ID: ${widgetId}, Color: ${widgetColor}`);

    const data: StockData[] = useMemo(
      () => [
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 154.32,
          change: 2.35,
          changePercent: 1.55,
          marketCap: "2.53T",
          peRatio: 28.76,
          dividend: "0.88 (0.57%)",
          volume: "78.4M",
        },
        {
          symbol: "MSFT",
          name: "Microsoft Corporation",
          price: 328.39,
          change: -1.24,
          changePercent: -0.38,
          marketCap: "2.45T",
          peRatio: 32.15,
          dividend: "2.48 (0.75%)",
          volume: "32.1M",
        },
        {
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          price: 2752.11,
          change: 15.32,
          changePercent: 0.56,
          marketCap: "1.83T",
          peRatio: 24.89,
          dividend: "N/A",
          volume: "1.5M",
        },
        {
          symbol: "AMZN",
          name: "Amazon.com Inc.",
          price: 3345.21,
          change: -23.45,
          changePercent: -0.7,
          marketCap: "1.71T",
          peRatio: 58.32,
          dividend: "N/A",
          volume: "4.2M",
        },
        {
          symbol: "TSLA",
          name: "Tesla Inc.",
          price: 1024.86,
          change: 32.54,
          changePercent: 3.28,
          marketCap: "1.03T",
          peRatio: 112.45,
          dividend: "N/A",
          volume: "25.7M",
        },
        {
          symbol: "NFLX",
          name: "Netflix Inc.",
          price: 500.12,
          change: -5.67,
          changePercent: -1.12,
          marketCap: "220.5B",
          peRatio: 35.67,
          dividend: "N/A",
          volume: "3.1M",
        },
        {
          symbol: "META",
          name: "Meta Platforms Inc.",
          price: 300.45,
          change: 4.56,
          changePercent: 1.54,
          marketCap: "850B",
          peRatio: 22.34,
          dividend: "N/A",
          volume: "2.8M",
        },
        {
          symbol: "NVDA",
          name: "NVIDIA Corporation",
          price: 200.78,
          change: 1.23,
          changePercent: 0.61,
          marketCap: "500B",
          peRatio: 45.67,
          dividend: "0.16 (0.08%)",
          volume: "10.5M",
        },
        {
          symbol: "AMD",
          name: "Advanced Micro Devices Inc.",
          price: 100.34,
          change: -0.45,
          changePercent: -0.45,
          marketCap: "150B",
          peRatio: 35.12,
          dividend: "N/A",
          volume: "8.2M",
        },
        {
          symbol: "INTC",
          name: "Intel Corporation",
          price: 50.12,
          change: 0.78,
          changePercent: 1.57,
          marketCap: "200B",
          peRatio: 15.67,
          dividend: "1.39 (2.77%)",
          volume: "5.4M",
        },
      ],
      []
    );

    const columns = useMemo<ColumnDef<StockData>[]>(
      () => [
        {
          accessorKey: "symbol",
          header: "Symbol",
          cell: (info) => (
            <button
              onClick={() => {
                if (widgetId) {
                  updateSelectedStock(info.row.original.symbol, widgetId);
                }
              }}
              className="hover:text-blue-400 hover:underline"
            >
              {info.getValue() as string}
            </button>
          ),
        },
        {
          accessorKey: "name",
          header: "Name",
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "price",
          header: "Price",
          cell: (info) => `$${(info.getValue() as number).toFixed(2)}`,
        },
        {
          accessorKey: "change",
          header: "Change",
          cell: (info) => {
            const { change, changePercent } = info.row.original;
            const isPositive = change >= 0;
            return (
              <span className={isPositive ? "text-green-500" : "text-red-500"}>
                {isPositive ? "+" : ""}
                {change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            );
          },
        },
        {
          accessorKey: "marketCap",
          header: "Market Cap",
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "peRatio",
          header: "P/E Ratio",
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "dividend",
          header: "Dividend",
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "volume",
          header: "Volume",
          cell: (info) => info.getValue(),
        },
      ],
      [updateSelectedStock, widgetId]
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      initialState: { pagination: { pageSize: 5 } },
    });

    return (
      <div className="h-full p-3 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-400">
          Stock Prices
        </h3>

        <div className="mb-4">
          <input
            placeholder="Search stocks..."
            value={table.getState().globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 w-full md:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left pb-2 px-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center cursor-pointer hover:text-white">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2 px-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-600 disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-600 disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </strong>
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
            >
              {[5, 10, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
);

export default StockPriceTable;
