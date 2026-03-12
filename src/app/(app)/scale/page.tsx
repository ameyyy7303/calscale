"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Settings2, RotateCcw, Crosshair, Info } from "lucide-react";
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

  const scaleRef = useRef<HTMLDivElement>(null);
  const pressure = usePressure(scaleRef);

  const [unit, setUnit] = useState<"g" | "oz">("g");
  const [calibrationFactor, setCalibrationFactor] = useState(1.0);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationWeight, setCalibrationWeight] = useState("");
  const [calibrationForce, setCalibrationForce] = useState(0);
  const [step, setStep] = useState<"ready" | "tared" | "measuring">("ready");

  useEffect(() => {
    setCalibrationFactor(loadCalibration());
  }, []);

  // Apply calibration
  const currentGrams = Math.round(pressure.grams * calibrationFactor);
  const peakGrams = Math.round(pressure.peakGrams * calibrationFactor);
  const displayWeight = unit === "oz" ? gramsToOunces(currentGrams) : currentGrams;
  const peakDisplay = unit === "oz" ? gramsToOunces(peakGrams) : peakGrams;

  // Gauge
  const maxWeight = 3500;
  const gaugePercent = Math.min(100, (currentGrams / maxWeight) * 100);
  const arcLength = 251.2;
  const dashOffset = arcLength - (gaugePercent / 100) * arcLength;

  function handleTare() {
    pressure.tare();
    setStep("tared");
  }

  function handleReset() {
    pressure.resetPeak();
    setStep("ready");
  }

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

  // Detect when user starts pressing after tare
  useEffect(() => {
    if (step === "tared" && pressure.isPressed && pressure.grams > 10) {
      setStep("measuring");
    }
  }, [step, pressure.isPressed, pressure.grams]);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Scale</h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset">
            <RotateCcw className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowCalibration(true);
              setCalibrationForce(pressure.peakForce);
            }}
            title="Calibrate"
          >
            <Settings2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Steps instruction — like TrackWeight */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
            step === "ready"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>1</div>
          <div>
            <p className={cn("text-sm font-medium", step !== "ready" && "text-muted-foreground")}>
              Rest your finger on the trackpad
            </p>
            <p className="text-[11px] text-muted-foreground">
              Touch the scale area below lightly, then tap <strong>Tare</strong> to zero out your finger weight
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
            step === "tared"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>2</div>
          <div>
            <p className={cn("text-sm font-medium", step !== "tared" && "text-muted-foreground")}>
              Place your item on the trackpad
            </p>
            <p className="text-[11px] text-muted-foreground">
              Keep your finger on the trackpad while placing the object
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
            step === "measuring"
              ? "bg-emerald-500 text-white"
              : "bg-muted text-muted-foreground"
          )}>3</div>
          <div>
            <p className={cn("text-sm font-medium", step !== "measuring" && "text-muted-foreground")}>
              Read the weight
            </p>
            <p className="text-[11px] text-muted-foreground">
              The display shows the item weight (your finger weight subtracted)
            </p>
          </div>
        </div>
      </div>

      {/* Unsupported warning */}
      {!pressure.isSupported && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
          <Info className="size-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Force Touch not detected. Use <strong>Safari</strong> on a MacBook with Force Touch trackpad (2015+ Pro, 2018+ Air).
          </p>
        </div>
      )}

      {/* ====== SCALE SURFACE ====== */}
      <div
        ref={scaleRef}
        className={cn(
          "relative flex flex-col items-center rounded-2xl border-2 transition-all select-none cursor-pointer",
          "pt-6 pb-5 px-4",
          pressure.isPressed
            ? step === "tared" || step === "measuring"
              ? "border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
              : "border-blue-500/60 bg-blue-500/5"
            : "border-dashed border-muted-foreground/20 bg-muted/5 hover:border-muted-foreground/30"
        )}
        style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
      >
        {/* Status indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className={cn(
            "size-2 rounded-full transition-colors",
            pressure.isPressed
              ? step === "measuring" ? "bg-emerald-500 animate-pulse" : "bg-blue-500 animate-pulse"
              : "bg-muted-foreground/20"
          )} />
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-wider transition-colors",
            pressure.isPressed
              ? step === "measuring" ? "text-emerald-500" : "text-blue-500"
              : "text-muted-foreground/40"
          )}>
            {pressure.isPressed
              ? step === "measuring" ? "Measuring" : step === "tared" ? "Place item" : "Finger detected"
              : "Touch to start"}
          </span>
        </div>

        {/* Tare button */}
        {pressure.isPressed && step === "ready" && (
          <div className="absolute top-2.5 right-3">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); handleTare(); }}
              className="h-7 text-xs gap-1"
            >
              <Crosshair className="size-3" />
              Tare
            </Button>
          </div>
        )}

        {/* Gauge */}
        <svg width="200" height="120" viewBox="0 0 240 140" className="mt-4 mb-1">
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
            className="text-muted/20"
          />
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${arcLength}`}
            strokeDashoffset={dashOffset}
            className={cn(
              "transition-all duration-75",
              gaugePercent > 80 ? "text-red-500"
                : gaugePercent > 50 ? "text-amber-500"
                : "text-emerald-500"
            )}
            stroke="currentColor"
          />
          {[0, 25, 50, 75, 100].map((pct) => {
            const angle = Math.PI - (pct / 100) * Math.PI;
            const x1 = 120 + 86 * Math.cos(angle);
            const y1 = 130 - 86 * Math.sin(angle);
            const x2 = 120 + 79 * Math.cos(angle);
            const y2 = 130 - 79 * Math.sin(angle);
            return (
              <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" />
            );
          })}
        </svg>

        {/* Weight display */}
        <p className={cn(
          "font-mono text-6xl font-bold tracking-tighter transition-colors leading-none",
          pressure.isPressed && (step === "tared" || step === "measuring")
            ? "text-foreground"
            : pressure.isPressed
            ? "text-blue-500"
            : "text-muted-foreground/25"
        )}>
          {displayWeight}
        </p>
        <div className="mt-2 flex items-center gap-2">
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
          <p className="mt-2 text-xs text-muted-foreground">
            Peak: {peakDisplay} {unit}
          </p>
        )}

        {/* Tare info */}
        {pressure.tareOffset > 0 && (
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            Tared (finger weight subtracted)
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
        Log this weight — {peakGrams > 0 ? peakDisplay : displayWeight} {unit}
        <ArrowRight className="size-4" />
      </Button>

      {/* Calibration Dialog */}
      <Dialog open={showCalibration} onOpenChange={setShowCalibration}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calibrate Scale</DialogTitle>
            <DialogDescription>
              Place a known weight on the trackpad (keep your finger on it),
              note the peak reading, then enter the actual weight.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-xs text-muted-foreground">Last peak force</p>
              <p className="text-2xl font-mono font-bold">
                {(calibrationForce * 100).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actual weight (grams)</label>
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
