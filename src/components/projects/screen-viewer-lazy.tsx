"use client";

import dynamic from "next/dynamic";

/** Keep SSR enabled: the initial frame is present before hydration. */
export const ScreenViewerLazy = dynamic(() =>
  import("./screen-viewer").then((module) => module.ScreenViewer),
);
