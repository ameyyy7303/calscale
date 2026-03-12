"use client";

import { useEffect, useState, useRef, type RefObject } from "react";

interface PressureState {
  /** Current force reading (0 to 1 normalized) */
  force: number;
  /** Whether the trackpad is being touched */
  isPressed: boolean;
  /** Whether Force Touch is supported on this device */
  isSupported: boolean;
  /** Highest force reading since last reset */
  peakForce: number;
  /** Raw webkitForce value (0-3 range in Safari) */
  rawForce: number;
  /** Weight in grams (estimated) */
  grams: number;
  /** Peak weight in grams */
  peakGrams: number;
  /** Reset peak measurement */
  resetPeak: () => void;
  /** Tare (zero out current reading) */
  tare: () => void;
  /** Current tare offset */
  tareOffset: number;
}

export function usePressure(elementRef: RefObject<HTMLElement | null>): PressureState {
  const [rawForce, setRawForce] = useState(0);
  const [force, setForce] = useState(0);
  const [peakForce, setPeakForce] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [tareOffset, setTareOffset] = useState(0);
  const tareOffsetRef = useRef(0);

  function resetPeak() {
    setPeakForce(0);
    setForce(0);
    setRawForce(0);
  }

  function tare() {
    // Tare: save current force as offset so next readings subtract it
    setTareOffset(rawForce);
    tareOffsetRef.current = rawForce;
    setPeakForce(0);
  }

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let supported = false;
    let checkTimeout: NodeJS.Timeout;

    // Safari Force Touch: webkitForce ranges from 0 to ~3
    // 0 = no press, 1 = normal click threshold, 2+ = force click
    // The MultitouchSupport framework returns data in grams directly,
    // but Safari's webkitForce is normalized differently.
    // We map webkitForce to approximate grams:
    // webkitForce 0-3 roughly maps to 0-500g of finger pressure
    // Since the user places object + finger, the tare function zeros out the finger weight

    function onForceWillBegin(e: Event) {
      e.preventDefault();
      supported = true;
      setIsSupported(true);
    }

    function onForceChange(e: Event) {
      const me = e as MouseEvent & { webkitForce?: number };
      if (me.webkitForce !== undefined) {
        const raw = me.webkitForce;
        setRawForce(raw);

        // Apply tare offset
        const tared = Math.max(0, raw - tareOffsetRef.current);
        // Normalize to 0-1 range (webkitForce max is ~3)
        const normalized = Math.min(1, tared / 3);
        setForce(normalized);
        setPeakForce((prev) => Math.max(prev, normalized));
      }
    }

    function onMouseDown(e: MouseEvent) {
      e.preventDefault();
      setIsPressed(true);
    }

    function onMouseUp() {
      setIsPressed(false);
      setForce(0);
      setRawForce(0);
    }

    // Pointer events fallback
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
        const tared = Math.max(0, e.pressure - tareOffsetRef.current);
        const normalized = Math.min(1, tared);
        setRawForce(e.pressure);
        setForce(normalized);
        setPeakForce((prev) => Math.max(prev, normalized));
      }
    }

    function onPointerUp() {
      setIsPressed(false);
      setForce(0);
      setRawForce(0);
    }

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

  // Convert force to grams
  // TrackWeight found that MultitouchSupport data is already in grams
  // In Safari, webkitForce 0-3 maps roughly to 0-3500g
  // This is approximate — calibration improves it
  const grams = Math.round(force * 3500);
  const peakGrams = Math.round(peakForce * 3500);

  return {
    force,
    isPressed,
    isSupported,
    peakForce,
    rawForce,
    grams,
    peakGrams,
    resetPeak,
    tare,
    tareOffset,
  };
}
