// src/components/Workspace.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { FaSave } from "react-icons/fa";
import WidgetBox from "./WidgetBox";
import { setCookie, getCookie } from "../utils/cookieUtils";
import { useStock } from "@/contexts/StockContext";
import {
  ChartWidget,
  StockPriceTable,
  StockDetails,
  MarketDepth,
} from "./widgets";

/* ----------------------- Types ------------------------ */

type Span = {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
};

export type Layout = {
  id?: string;
  rows: number;
  cols: number;
  spans?: Span[];
};

type WidgetType = "chart" | "table" | "details" | "depth";

type WidgetItem = {
  id: string;
  type: WidgetType;
} | null;

type WorkspaceProps = {
  layout: Layout;
  onReset: () => void;
};

/* mock widget components map
   Replace these names or imports with your real widget components if needed.
*/
const widgetComponents: Record<
  WidgetType,
  { component: React.ComponentType<any>; name: string }
> = {
  chart: { component: ChartWidget, name: "Chart" },
  table: { component: StockPriceTable, name: "Stock Table" },
  details: { component: StockDetails, name: "Stock Details" },
  depth: { component: MarketDepth, name: "Market Depth" },
};

/* -------------------- DroppableCell (memoized) -------------------- */

type DroppableCellProps = {
  id: string; // like "cell-0"
  index: number;
  widget: WidgetItem;
  showContextMenu: (e: React.MouseEvent, index: number) => void;
  openInNewTab: (widget: NonNullable<WidgetItem>) => void;
  removeWidget: (index: number) => void;
};

const DroppableCell: React.FC<DroppableCellProps> = React.memo(
  ({ id, index, widget, showContextMenu, openInNewTab, removeWidget }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } =
      useDraggable({
        id,
        disabled: !widget,
      });

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          opacity: isDragging ? 0.5 : 1,
        }
      : undefined;

    return (
      <div
        ref={setNodeRef}
        className={`bg-gray-800 rounded-lg border ${
          isOver ? "border-yellow-500 bg-gray-700" : "border-gray-700"
        } relative overflow-hidden h-full`}
        onContextMenu={(e) => {
          e.preventDefault();
          showContextMenu(e, index);
        }}
      >
        {widget ? (
          <div ref={setDragRef} style={style} {...attributes} {...listeners} className="h-full">
            <WidgetBox
              widget={widget}
              index={index}
              openInNewTab={openInNewTab}
              removeWidget={removeWidget}
              Component={widgetComponents[widget.type].component}
            />
          </div>
        ) : (
          <button
            onClick={(e) => showContextMenu(e, index)}
            className="w-full h-full flex items-center justify-center text-yellow-400 hover:text-yellow-300 border-2 border-dashed border-yellow-600 hover:border-yellow-500 rounded transition-all"
          >
            + Add Widget
          </button>
        )}
      </div>
    );
  }
);

/* ----------------------- Workspace ------------------------ */

const Workspace: React.FC<WorkspaceProps> = ({ layout, onReset }) => {
  const { removeWidgetColor } = useStock();

  const initialCount = layout.spans ? layout.spans.length : layout.rows * layout.cols;
  const [widgets, setWidgets] = useState<WidgetItem[]>(
    () => Array(initialCount).fill(null)
  );

  // active drag id like "cell-2"
  const [activeId, setActiveId] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    cellIndex: -1,
  });
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  /* ------------------ Persist / Load layout ------------------ */
  const saveLayout = useCallback(async () => {
    const layoutData = { layout, widgets };
    // Save to cookie (you may change to localStorage or API)
    setCookie("savedLayout", layoutData);
    // Example: try to POST to an API (optional)
    try {
      const res = await fetch("/api/save-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layoutData),
      });
      if (!res.ok) throw new Error("Server error");
      alert("Layout saved successfully!");
    } catch {
      // fallback success notice
      alert("Layout saved locally (cookie).");
    }
  }, [layout, widgets]);

  useEffect(() => {
    const saved: any = getCookie("savedLayout");
    if (
      saved &&
      saved.layout?.rows === layout.rows &&
      saved.layout?.cols === layout.cols &&
      Array.isArray(saved.widgets) &&
      saved.widgets.length === widgets.length
    ) {
      setWidgets(saved.widgets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.rows, layout.cols]);

  /* ------------------ Context menu outside click ------------------ */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((s) => ({ ...s, show: false }));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showContextMenu = useCallback(
    (event: React.MouseEvent, index: number) => {
      event.preventDefault();
      if (widgets[index]) return; // only show on empty cells
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        cellIndex: index,
      });
    },
    [widgets]
  );

  /* ------------------ Widget management ------------------ */
  const addWidget = useCallback(
    (type: WidgetType) => {
      const idx = contextMenu.cellIndex;
      if (idx < 0) return;
      setWidgets((prev) => {
        const copy = [...prev];
        copy[idx] = { id: `${type}-${idx}`, type };
        return copy;
      });
      setContextMenu((s) => ({ ...s, show: false }));
    },
    [contextMenu.cellIndex]
  );

  const removeWidget = useCallback(
    (index: number) => {
      let removedId: string | null = null;
      setWidgets((prev) => {
        const copy = [...prev];
        removedId = copy[index]?.id ?? null;
        copy[index] = null;
        return copy;
      });
      if (removedId) removeWidgetColor(removedId);
    },
    [removeWidgetColor]
  );

  /* ------------------ Drag handlers ------------------ */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const parseIndex = (id: string | number) => {
      const s = String(id).replace("cell-", "");
      const n = parseInt(s, 10);
      return Number.isNaN(n) ? -1 : n;
    };

    const activeIndex = parseIndex(active.id);
    const overIndex = parseIndex(over.id);

    if (activeIndex >= 0 && overIndex >= 0 && widgets[activeIndex]) {
      setWidgets((prev) => {
        const copy = [...prev];
        const tmp = copy[activeIndex];
        copy[activeIndex] = copy[overIndex];
        copy[overIndex] = tmp;
        return copy;
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => setActiveId(null);

  /* ------------------ Open widget in new tab ------------------ */
  const openInNewTab = useCallback((widget: NonNullable<WidgetItem>) => {
    const url = `/widget?type=${widget.type}&id=${widget.id}`;
    const width = 800;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const newWindow = window.open(
      url,
      "_blank",
      `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
    );
    if (!newWindow) {
      alert("Popup blocked! Please allow popups for this website.");
    }
  }, []);

  /* ------------------ Grid renderer ------------------ */
  const renderGrid = () => {
    // Matrix layouts -> use resizable panels
    if (!layout.spans) {
      const rows: React.ReactNode[] = [];

      for (let r = 0; r < layout.rows; r++) {
        const colsInRow: React.ReactNode[] = [];
        for (let c = 0; c < layout.cols; c++) {
          const index = r * layout.cols + c;
          colsInRow.push(
            <Panel key={`cell-${index}`} defaultSize={100 / layout.cols} minSize={10}>
              <DroppableCell
                id={`cell-${index}`}
                index={index}
                widget={widgets[index]}
                showContextMenu={showContextMenu}
                openInNewTab={openInNewTab}
                removeWidget={removeWidget}
              />
            </Panel>
          );
          if (c < layout.cols - 1) {
            colsInRow.push(
              <PanelResizeHandle
                key={`resize-h-${r}-${c}`}
                className="w-1 bg-gray-700 hover:bg-yellow-500 transition-colors"
              />
            );
          }
        }

        rows.push(
          <Panel key={`row-${r}`} defaultSize={100 / layout.rows} minSize={10}>
            <PanelGroup direction="horizontal">{colsInRow}</PanelGroup>
          </Panel>
        );

        if (r < layout.rows - 1) {
          rows.push(
            <PanelResizeHandle
              key={`resize-v-${r}`}
              className="h-1 bg-gray-700 hover:bg-yellow-500 transition-colors"
            />
          );
        }
      }

      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <PanelGroup direction="vertical" className="h-full">
            {rows}
          </PanelGroup>

          <DragOverlay>
            {activeId ? (
              (() => {
                const idx = parseInt(activeId.replace("cell-", ""), 10);
                const w = widgets[idx];
                if (!w) return null;
                return (
                  <div className="bg-gray-800 rounded-lg border border-yellow-500 opacity-80">
                    <WidgetBox
                      widget={w}
                      index={idx}
                      openInNewTab={openInNewTab}
                      removeWidget={removeWidget}
                      Component={widgetComponents[w.type].component}
                    />
                  </div>
                );
              })()
            ) : null}
          </DragOverlay>
        </DndContext>
      );
    }

    // Span-based grid -> CSS grid
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className="grid h-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
          }}
        >
          {layout.spans!.map((span, index) => (
            <div
              key={`cell-${index}`}
              style={{
                gridColumn: `${span.col + 1} / span ${span.colSpan}`,
                gridRow: `${span.row + 1} / span ${span.rowSpan}`,
              }}
            >
              <DroppableCell
                id={`cell-${index}`}
                index={index}
                widget={widgets[index]}
                showContextMenu={showContextMenu}
                openInNewTab={openInNewTab}
                removeWidget={removeWidget}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            (() => {
              const idx = parseInt(activeId.replace("cell-", ""), 10);
              const w = widgets[idx];
              if (!w) return null;
              return (
                <div className="bg-gray-800 rounded-lg border border-yellow-500 opacity-80">
                  <WidgetBox
                    widget={w}
                    index={idx}
                    openInNewTab={openInNewTab}
                    removeWidget={removeWidget}
                    Component={widgetComponents[w.type].component}
                  />
                </div>
              );
            })()
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  /* ------------------ Render ------------------ */
  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <button
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          onClick={onReset}
        >
          ← Back to Layouts
        </button>

        <div className="flex items-center space-x-10">
          <button
            className="bg-blue-500 px-1 py-1 rounded hover:bg-blue-600 transition-all duration-100 flex items-center"
            onClick={saveLayout}
          >
            <FaSave className="inline mr-2" size={16} /> Save Layout
          </button>

          <h2 className="text-xl font-semibold">
            {layout.id?.includes("span") ? layout.id.replace(/-/g, " ") : `${layout.rows}x${layout.cols} Workspace`}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-2">{renderGrid()}</div>

      {contextMenu.show && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="text-gray-400 px-4 py-2 text-sm border-b border-gray-700">Add Widget</div>
          {Object.entries(widgetComponents).map(([key, { name }]) => (
            <button
              key={key}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
              onClick={() => addWidget(key as WidgetType)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workspace;
