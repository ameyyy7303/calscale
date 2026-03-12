"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info, RotateCcw, ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePressure } from "@/hooks/use-pressure";
import {
  forceToGrams,
  gramsToOunces,
  getCalibrationFactor,
  saveCalibration,
  loadCalibration,
} from "@/lib/pressure";
import { cn } from "@/lib/utils";

export default function ScalePage() {
  return (
    <Suspense>
      <ScalePageInner />
    </Suspense>
  );
}

function ScalePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const fdcId = searchParams.get("fdcId");

  // The entire scale area is the measurement surface
  const scaleRef = useRef<HTMLDivElement>(null);
  const { force, isPressed, isSupported, peakForce, resetPeak } = usePressure(scaleRef);

  const [unit, setUnit] = useState<"g" | "oz">("g");
  const [calibrationFactor, setCalibrationFactor] = useState(1.0);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationWeight, setCalibrationWeight] = useState("");
  const [calibrationForce, setCalibrationForce] = useState(0);

  useEffect(() => {
    setCalibrationFactor(loadCalibration());
  }, []);

  const currentGrams = forceToGrams(force, calibrationFactor);
  const peakGrams = forceToGrams(peakForce, calibrationFactor);
  const displayWeight = unit === "oz" ? gramsToOunces(currentGrams) : currentGrams;
  const peakDisplay = unit === "oz" ? gramsToOunces(peakGrams) : peakGrams;

  const maxWeight = 3500;
  const gaugePercent = Math.min(100, (currentGrams / maxWeight) * 100);
  const arcLength = 251.2;
  const dashOffset = arcLength - (gaugePercent / 100) * arcLength;

  function handleCalibrate() {
    const knownWeight = parseFloat(calibrationWeight);
    if (knownWeight > 0 && calibrationForce > 0) {
      const factor = getCalibrationFactor(knownWeight, calibrationForce);
      setCalibrationFactor(factor);
      saveCalibration(factor);
      setShowCalibration(false);
    }
  }

  function handleUseWeight() {
    const weight = peakGrams > 0 ? peakGrams : currentGrams;
    if (returnTo) {
      const url = fdcId
        ? `${returnTo}?weight=${weight}&fdcId=${fdcId}`
        : `${returnTo}?weight=${weight}`;
      router.push(url);
    } else {
      router.push(`/log?weight=${weight}`);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scale</h1>
          <p className="text-xs text-muted-foreground">
            Touch trackpad to start measuring
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              resetPeak();
            }}
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowCalibration(true);
              setCalibrationForce(peakForce);
            }}
          >
            <Settings2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Unsupported warning */}
      {!isSupported && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
          <Info className="size-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Force Touch not detected. Use Safari on a MacBook with Force Touch trackpad.
            Touch the scale area below to try.
          </p>
        </div>
      )}

      {/* ===================== SCALE SURFACE ===================== */}
      {/* This entire area is the weighing surface — touch anywhere to measure */}
      <div
        ref={scaleRef}
        className={cn(
          "relative flex flex-col items-center rounded-2xl border-2 transition-all select-none cursor-pointer",
          "pt-8 pb-6 px-4",
          isPressed
            ? "border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            : "border-dashed border-muted-foreground/25 bg-muted/10 hover:border-muted-foreground/40"
        )}
        style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
      >
        {/* Live indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className={cn(
            "size-2 rounded-full transition-colors",
            isPressed ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
          )} />
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            isPressed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"
          )}>
            {isPressed ? "LIVE" : "READY"}
          </span>
        </div>

        {/* Gauge */}
        <svg width="220" height="130" viewBox="0 0 240 140" className="mb-2">
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-muted/30"
          />
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${arcLength}`}
            strokeDashoffset={dashOffset}
            className={cn(
              "transition-all duration-100",
              gaugePercent > 80
                ? "text-red-500"
                : gaugePercent > 50
                ? "text-amber-500"
                : "text-emerald-500"
            )}
            stroke="currentColor"
          />
          {[0, 25, 50, 75, 100].map((pct) => {
            const angle = Math.PI - (pct / 100) * Math.PI;
            const x1 = 120 + 88 * Math.cos(angle);
            const y1 = 130 - 88 * Math.sin(angle);
            const x2 = 120 + 80 * Math.cos(angle);
            const y2 = 130 - 80 * Math.sin(angle);
            return (
              <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" />
            );
          })}
          <text x="10" y="138" className="fill-muted-foreground text-[10px]">0</text>
          <text x="108" y="28" className="fill-muted-foreground text-[10px]">1.75kg</text>
          <text x="205" y="138" className="fill-muted-foreground text-[10px]">3.5</text>
        </svg>

        {/* Big weight number */}
        <p className={cn(
          "font-mono text-6xl font-bold tracking-tighter transition-colors",
          isPressed ? "text-foreground" : "text-muted-foreground/40"
        )}>
          {displayWeight}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {(["g", "oz"] as const).map((u) => (
            <button
              key={u}
              onClick={(e) => { e.stopPropagation(); setUnit(u); }}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                unit === u
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Peak */}
        {peakGrams > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Peak: {peakDisplay} {unit}
          </p>
        )}

        {/* Instruction */}
        {!isPressed && (
          <p className="mt-4 text-xs text-muted-foreground/60 text-center">
            Place item on trackpad, then touch and hold anywhere in this area
          </p>
        )}
      </div>

      {/* Use weight button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleUseWeight}
        disabled={peakGrams === 0 && currentGrams === 0}
      >
        Use this weight — {peakGrams > 0 ? peakDisplay : displayWeight} {unit}
        <ArrowRight className="size-4" />
      </Button>

      {/* Calibration Dialog */}
      <Dialog open={showCalibration} onOpenChange={setShowCalibration}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calibrate Scale</DialogTitle>
            <DialogDescription>
              Place a known weight on the trackpad, press and hold to measure,
              then enter the actual weight below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-xs text-muted-foreground">Measured force</p>
              <p className="text-2xl font-mono font-bold">
                {(calibrationForce * 100).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Known weight (grams)</label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={calibrationWeight}
                onChange={(e) => setCalibrationWeight(e.target.value)}
              />
            </div>
            <Button onClick={handleCalibrate} className="w-full">
              Save Calibration
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setCalibrationFactor(1.0);
                saveCalibration(1.0);
                setShowCalibration(false);
              }}
            >
              Reset to Default
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
