"use client";

import React from "react";

interface SpanCell {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

interface LayoutType {
  id: string;
  rows: number;
  cols: number;
  spans?: SpanCell[];
}

interface LayoutSelectorProps {
  setLayout: (layout: LayoutType) => void;
}

const layouts: LayoutType[] = [
  { id: "1x1", rows: 1, cols: 1 },
  { id: "1x2", rows: 1, cols: 2 },
  { id: "2x1", rows: 2, cols: 1 },
  { id: "2x2", rows: 2, cols: 2 },
  { id: "2x3", rows: 2, cols: 3 },
  { id: "3x2", rows: 3, cols: 2 },
  {
    id: "2col-span-right",
    rows: 2,
    cols: 2,
    spans: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 1, rowSpan: 2, colSpan: 1 },
    ],
  },
  {
    id: "2col-span-left",
    rows: 2,
    cols: 2,
    spans: [
      { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 0, rowSpan: 2, colSpan: 1 },
    ],
  },

  {
    id: "2col-span-top",
    rows: 2,
    cols: 2,
    spans: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 2 },
      { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
    ],
  },

  {
    id: "3 col-span-top",
    rows: 2,
    cols: 3,
    spans: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 3 },
    ],
  },

  {
    id: "2X3-complex",
    rows: 2,
    cols: 3,
    spans: [
      { row: 0, col: 0, rowSpan: 2, colSpan: 1 },
      { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 1, rowSpan: 1, colSpan: 2 },
    ],
  },

  {
    id: "3x3-complex",
    rows: 3,
    cols: 3,
    spans: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 2 },
      { row: 0, col: 2, rowSpan: 2, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 1, rowSpan: 2, colSpan: 1 },
      { row: 2, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 2, col: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
];

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ setLayout }) => {
  const renderLayoutPreview = (layout: LayoutType) => {
    const gridStyle = {
      gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
      gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
    };

    // If layout uses span blocks
    if (layout.spans) {
      return (
        <div className="grid gap-1 mb-2 w-full h-20" style={gridStyle}>
          {layout.spans.map((span, i) => (
            <div
              key={i}
              className="bg-blue-500 rounded-sm"
              style={{
                gridColumn: `${span.col + 1} / span ${span.colSpan}`,
                gridRow: `${span.row + 1} / span ${span.rowSpan}`,
              }}
            />
          ))}
        </div>
      );
    }

    // Standard grid
    return (
      <div className="grid gap-1 mb-2 w-full h-20" style={gridStyle}>
        {Array.from({ length: layout.rows * layout.cols }).map((_, i) => (
          <div key={i} className="bg-blue-500 rounded-sm" />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">OMS layout prototype</h1>
        <p className="text-gray-400">Select a layout to get started</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            onClick={() => setLayout(layout)}
          >
            <div className="flex flex-col items-center">
              {renderLayoutPreview(layout)}
              <span className="font-medium">
                {layout.id.includes("span")
                  ? layout.id.replace(/-/g, " ")
                  : `${layout.rows}x${layout.cols} Grid`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
