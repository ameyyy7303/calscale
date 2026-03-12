"use client";

import { useEffect, useState, useCallback, type RefObject } from "react";

interface PressureState {
  force: number;
  isPressed: boolean;
  isSupported: boolean;
  peakForce: number;
}

export function usePressure(elementRef: RefObject<HTMLElement | null>): PressureState {
  const [force, setForce] = useState(0);
  const [peakForce, setPeakForce] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const resetPeak = useCallback(() => setPeakForce(0), []);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check for Force Touch support
    let supported = false;

    // Try WebKit Force Touch events (Safari)
    function onForceWillBegin(e: Event) {
      e.preventDefault();
      supported = true;
      setIsSupported(true);
    }

    function onForceChange(e: Event) {
      const me = e as MouseEvent & { webkitForce?: number };
      if (me.webkitForce !== undefined) {
        // Normalize: webkitForce goes from 0 to ~3, we normalize to 0-1
        const normalized = Math.min(1, Math.max(0, (me.webkitForce - 1) / 2));
        setForce(normalized);
        setPeakForce((prev) => Math.max(prev, normalized));
      }
    }

    function onMouseDown() {
      setIsPressed(true);
    }

    function onMouseUp() {
      setIsPressed(false);
      setForce(0);
    }

    // Also try PointerEvent pressure (works in Chrome, limited on trackpad)
    function onPointerDown(e: PointerEvent) {
      setIsPressed(true);
      if (e.pressure > 0 && e.pressure < 1) {
        supported = true;
        setIsSupported(true);
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (e.buttons > 0 && e.pressure > 0) {
        supported = true;
        setIsSupported(true);
        const normalized = Math.min(1, e.pressure);
        setForce(normalized);
        setPeakForce((prev) => Math.max(prev, normalized));
      }
    }

    function onPointerUp() {
      setIsPressed(false);
      setForce(0);
    }

    // Register Safari force events
    el.addEventListener("webkitmouseforcewillbegin", onForceWillBegin);
    el.addEventListener("webkitmouseforcechanged", onForceChange);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseUp);

    // Register pointer events as fallback
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    // After a short delay, check if Force Touch was detected
    const timeout = setTimeout(() => {
      if (!supported) {
        setIsSupported(false);
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener("webkitmouseforcewillbegin", onForceWillBegin);
      el.removeEventListener("webkitmouseforcechanged", onForceChange);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseUp);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, [elementRef]);

  return { force, isPressed, isSupported, peakForce };
}
