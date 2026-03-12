"use client";

import { useEffect, useState, type RefObject } from "react";

interface PressureState {
  force: number;
  isPressed: boolean;
  isSupported: boolean;
  peakForce: number;
  resetPeak: () => void;
}

export function usePressure(elementRef: RefObject<HTMLElement | null>): PressureState {
  const [force, setForce] = useState(0);
  const [peakForce, setPeakForce] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  function resetPeak() {
    setPeakForce(0);
    setForce(0);
  }

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let supported = false;
    let checkTimeout: NodeJS.Timeout;

    // Safari Force Touch events
    function onForceWillBegin(e: Event) {
      e.preventDefault();
      supported = true;
      setIsSupported(true);
    }

    function onForceChange(e: Event) {
      const me = e as MouseEvent & { webkitForce?: number };
      if (me.webkitForce !== undefined) {
        const normalized = Math.min(1, Math.max(0, (me.webkitForce - 1) / 2));
        setForce(normalized);
        setPeakForce((prev) => Math.max(prev, normalized));
      }
    }

    function onMouseDown(e: MouseEvent) {
      // Prevent text selection while measuring
      e.preventDefault();
      setIsPressed(true);
    }

    function onMouseUp() {
      setIsPressed(false);
      setForce(0);
    }

    // Pointer events fallback (Chrome etc.)
    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
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

    // Prevent context menu on long press
    function onContextMenu(e: Event) {
      e.preventDefault();
    }

    el.addEventListener("webkitmouseforcewillbegin", onForceWillBegin);
    el.addEventListener("webkitmouseforcechanged", onForceChange);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseUp);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);
    el.addEventListener("contextmenu", onContextMenu);

    checkTimeout = setTimeout(() => {
      if (!supported) setIsSupported(false);
    }, 3000);

    return () => {
      clearTimeout(checkTimeout);
      el.removeEventListener("webkitmouseforcewillbegin", onForceWillBegin);
      el.removeEventListener("webkitmouseforcechanged", onForceChange);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseUp);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
      el.removeEventListener("contextmenu", onContextMenu);
    };
  }, [elementRef]);

  return { force, isPressed, isSupported, peakForce, resetPeak };
}
