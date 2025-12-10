import React from "react";

type WidgetType = "chart" | "table" | "details" | "depth";

type WidgetItem = {
  id: string | null;
  type: WidgetType;
};

type WidgetBoxProps = {
  widget: WidgetItem;
  index: number;
  openInNewTab: (widget: { id: string; type: WidgetType }) => void;
  removeWidget: (index: number) => void;
  Component: React.ComponentType<{ widgetId?: string | null }>;
};

const WidgetBox: React.FC<WidgetBoxProps> = ({ widget, index, openInNewTab, removeWidget, Component }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-900">
        <div className="text-sm text-gray-200">{widget.type} — Widget</div>
        <div className="flex items-center space-x-2">
          <button
            title="Open in new tab"
            onClick={() => {
              if (widget.id) openInNewTab({ id: widget.id, type: widget.type });
            }}
            className="text-yellow-400 hover:text-yellow-300 px-2"
          >
            ↗
          </button>
          <button
            title="Remove widget"
            onClick={() => removeWidget(index)}
            className="text-red-400 hover:text-red-300 px-2"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <Component widgetId={widget.id} />
      </div>
    </div>
  );
};

export default WidgetBox;
