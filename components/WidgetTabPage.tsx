import React from "react";
import {
  ChartWidget,
  StockPriceTable,
  StockDetails,
  MarketDepth,
} from "./widgets";
import WidgetBox from "./WidgetBox"; // Import the reusable WidgetBox component

// Define the type of widget
type WidgetType = "chart" | "table" | "details" | "depth";

interface Widget {
  id: string | null;
  type: WidgetType;
}

// Mapping widget type to component
const widgetComponents: Record<WidgetType, React.ComponentType<any>> = {
  chart: ChartWidget,
  table: StockPriceTable,
  details: StockDetails,
  depth: MarketDepth,
};

const WidgetTabPage: React.FC = () => {
  // In Next.js, you should use useRouter to get query params
  // instead of window.location
  // This ensures it works during SSR as well
  const { query } = require("next/router").useRouter();
  const type = query.type as WidgetType;
  const id = query.id as string | undefined;

  if (!type || !(type in widgetComponents)) {
    return <div className="text-white p-5">Invalid widget type</div>;
  }
  const Component = widgetComponents[type];


  // Mock functions for WidgetBox props
  const openInNewTab = () => alert("Already in a new tab!");
  const removeWidget = () => alert("Cannot remove widget in this tab!");

  // Mock widget data
  const widget: Widget = { id: id ?? null, type };

  return (
    <div className="w-full h-screen bg-gray-900 p-5 text-white">
      <h1 className="text-xl mb-4">Widget: {type}</h1>
      <div className="border border-gray-700 p-4 rounded bg-gray-800 h-[85%] overflow-auto">
        <WidgetBox
          widget={widget}
          index={0} // Index is not relevant here
          openInNewTab={openInNewTab}
          removeWidget={removeWidget}
          Component={Component}
        />
      </div>
    </div>
  );
};

export default WidgetTabPage;
