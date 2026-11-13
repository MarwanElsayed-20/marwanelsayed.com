"use client";

import { Component, type ReactNode } from "react";

type HeroErrorBoundaryProps = {
  onError: () => void;
  children: ReactNode;
};

type HeroErrorBoundaryState = {
  failed: boolean;
};

/** Turns any render or initialization error in the 3D scene into a silent switch to the fallback. */
export class HeroErrorBoundary extends Component<HeroErrorBoundaryProps, HeroErrorBoundaryState> {
  state: HeroErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): HeroErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
