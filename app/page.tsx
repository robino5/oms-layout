"use client";

import { useState, useEffect } from "react";
import LayoutSelector from "../components/LayoutSelector";
import Workspace from "../components/Workspace";
import { getCookie } from "../utils/cookieUtils";

export default function HomePage() {
  const [currentLayout, setCurrentLayout] = useState<any | null>(null);

  useEffect(() => {
    const savedLayout = getCookie("savedLayout");
    if (savedLayout) {
      setCurrentLayout(savedLayout.layout);
    }
  }, []);

  return (
      <div className="min-h-screen bg-gray-900 text-white p-0">
        {!currentLayout ? (
          <LayoutSelector setLayout={setCurrentLayout} />
        ) : (
          <Workspace
            layout={currentLayout}
            onReset={() => setCurrentLayout(null)}
          />
        )}
      </div>
  );
}
