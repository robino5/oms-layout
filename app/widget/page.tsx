"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import WidgetBox from "../../components/WidgetBox";
import {
  ChartWidget,
  StockPriceTable,
  StockDetails,
  MarketDepth,
} from "../../components/widgets";

type WidgetType = "chart" | "table" | "details" | "depth";

const widgetComponents: Record<WidgetType, React.ComponentType<any>> = {
  chart: ChartWidget,
  table: StockPriceTable,
  details: StockDetails,
  depth: MarketDepth,
};

export default function WidgetPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as WidgetType | null;
  const idParam = searchParams.get("id");

  if (!typeParam || !(typeParam in widgetComponents)) {
    return <div className="text-white p-5">Invalid widget type</div>;
  }

  const Component = widgetComponents[typeParam as WidgetType];

  const widget = { id: idParam ?? null, type: typeParam as WidgetType };

  const openInNewTab = () => alert("Already in a new tab!");
  const removeWidget = () => alert("Cannot remove widget in this tab!");

  return (
    <div className="w-full h-screen bg-gray-900 p-5 text-white">
      <h1 className="text-xl mb-4">Widget: {typeParam}</h1>
      <div className="border border-gray-700 p-4 rounded bg-gray-800 h-[85%] overflow-auto">
        <WidgetBox
          widget={widget}
          index={0}
          openInNewTab={openInNewTab}
          removeWidget={removeWidget}
          Component={Component}
        />
      </div>
    </div>
  );
}
