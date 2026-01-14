"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ColorPreferencesData = {
  colorPreferences?: {
    complimentColors: string[];
    avoidColors: string[];
    metalPreference: "gold" | "silver" | "rose-gold" | "no-preference";
    patternTolerance: "none" | "subtle" | "bold" | "any";
  };
  temperatureProfile?: {
    runsHot: boolean;
    runsCold: boolean;
    needsLayers: boolean;
  };
};

type Props = {
  initialData: Partial<ColorPreferencesData>;
  onComplete: (data: ColorPreferencesData) => void;
  onBack: () => void;
  loading?: boolean;
};

const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#000080" },
  { name: "Red", hex: "#DC143C" },
  { name: "Pink", hex: "#FFB6C1" },
  { name: "Blush", hex: "#DE5D83" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Orange", hex: "#FF6347" },
  { name: "Yellow", hex: "#FFD700" },
  { name: "Green", hex: "#228B22" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Blue", hex: "#4169E1" },
  { name: "Teal", hex: "#008080" },
  { name: "Purple", hex: "#9370DB" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Gray", hex: "#808080" },
  { name: "Cream", hex: "#FFFDD0" },
];

export function ColorPreferencesStep({ initialData, onComplete, onBack, loading }: Props) {
  const [complimentColors, setComplimentColors] = useState<string[]>(
    initialData.colorPreferences?.complimentColors || []
  );
  const [avoidColors, setAvoidColors] = useState<string[]>(
    initialData.colorPreferences?.avoidColors || []
  );
  const [metalPreference, setMetalPreference] = useState<"gold" | "silver" | "rose-gold" | "no-preference">(
    initialData.colorPreferences?.metalPreference || "no-preference"
  );
  const [patternTolerance, setPatternTolerance] = useState<"none" | "subtle" | "bold" | "any">(
    initialData.colorPreferences?.patternTolerance || "any"
  );
  const [runsHot, setRunsHot] = useState(initialData.temperatureProfile?.runsHot || false);
  const [runsCold, setRunsCold] = useState(initialData.temperatureProfile?.runsCold || false);
  const [needsLayers, setNeedsLayers] = useState(initialData.temperatureProfile?.needsLayers || false);

  const toggleComplimentColor = (color: string) => {
    if (complimentColors.includes(color)) {
      setComplimentColors(complimentColors.filter(c => c !== color));
    } else {
      setComplimentColors([...complimentColors, color]);
      // Remove from avoid if it's there
      setAvoidColors(avoidColors.filter(c => c !== color));
    }
  };

  const toggleAvoidColor = (color: string) => {
    if (avoidColors.includes(color)) {
      setAvoidColors(avoidColors.filter(c => c !== color));
    } else {
      setAvoidColors([...avoidColors, color]);
      // Remove from compliment if it's there
      setComplimentColors(complimentColors.filter(c => c !== color));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (complimentColors.length === 0) {
      alert("Please select at least one color that you get compliments in");
      return;
    }

    onComplete({
      colorPreferences: {
        complimentColors,
        avoidColors,
        metalPreference,
        patternTolerance,
      },
      temperatureProfile: {
        runsHot,
        runsCold,
        needsLayers,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Colors You Get Compliments In */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Colors You Shine In</h3>
          <p className="text-sm text-gray-600">
            Select colors you always get compliments in ({complimentColors.length} selected)
          </p>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {COLORS.map((color) => (
            <div
              key={color.name}
              className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                complimentColors.includes(color.name)
                  ? "border-green-500 ring-2 ring-green-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleComplimentColor(color.name)}
            >
              <div
                className="h-16 rounded-t-md"
                style={{
                  backgroundColor: color.hex,
                  border: color.name === "White" ? "1px solid #e5e7eb" : "none",
                }}
              />
              <div className="p-2 text-center">
                <p className="text-xs font-medium">{color.name}</p>
              </div>
              {complimentColors.includes(color.name) && (
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Colors to Avoid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Colors to Avoid</h3>
          <p className="text-sm text-gray-600">
            Colors that don't work for you ({avoidColors.length} selected)
          </p>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {COLORS.map((color) => (
            <div
              key={color.name}
              className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                avoidColors.includes(color.name)
                  ? "border-red-500 ring-2 ring-red-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleAvoidColor(color.name)}
            >
              <div
                className="h-16 rounded-t-md"
                style={{
                  backgroundColor: color.hex,
                  border: color.name === "White" ? "1px solid #e5e7eb" : "none",
                }}
              />
              <div className="p-2 text-center">
                <p className="text-xs font-medium">{color.name}</p>
              </div>
              {avoidColors.includes(color.name) && (
                <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  ✗
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Metal Preference */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Metal Preference</h3>
          <p className="text-sm text-gray-600">Which metal looks best on you?</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { value: "gold", label: "Gold", color: "bg-yellow-400" },
            { value: "silver", label: "Silver", color: "bg-gray-300" },
            { value: "rose-gold", label: "Rose Gold", color: "bg-pink-300" },
            { value: "no-preference", label: "No Preference", color: "bg-gray-200" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                metalPreference === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setMetalPreference(option.value as any)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full ${option.color} mx-auto mb-2`} />
                <div className="text-sm font-medium">{option.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pattern Tolerance */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Pattern Preference</h3>
          <p className="text-sm text-gray-600">How do you feel about patterns?</p>
        </div>

        <Select value={patternTolerance} onValueChange={(v) => setPatternTolerance(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Pattern - I love variety</SelectItem>
            <SelectItem value="subtle">Subtle Patterns - Small prints, stripes</SelectItem>
            <SelectItem value="bold">Bold Patterns - Large prints, statement pieces</SelectItem>
            <SelectItem value="none">No Patterns - Solid colors only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Temperature Preferences */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Temperature Preferences</h3>
          <p className="text-sm text-gray-600">Help us recommend weather-appropriate outfits</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>I run hot (get warm easily)</Label>
              <p className="text-xs text-gray-500">Prefer lighter fabrics and breathable materials</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={runsHot ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setRunsHot(!runsHot);
                  if (!runsHot) setRunsCold(false);
                }}
              >
                Yes
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>I run cold (get chilly easily)</Label>
              <p className="text-xs text-gray-500">Prefer warmer fabrics and layering options</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={runsCold ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setRunsCold(!runsCold);
                  if (!runsCold) setRunsHot(false);
                }}
              >
                Yes
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>I need layers</Label>
              <p className="text-xs text-gray-500">Always include blazers, cardigans, or wraps</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={needsLayers ? "default" : "outline"}
                size="sm"
                onClick={() => setNeedsLayers(!needsLayers)}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          ← Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving Profile..." : "Complete Setup 🎉"}
        </Button>
      </div>
    </form>
  );
}
