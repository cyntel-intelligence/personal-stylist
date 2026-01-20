"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Check, Thermometer } from "lucide-react";

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

const METAL_OPTIONS = [
  { value: "gold", label: "Gold", gradient: "from-yellow-300 to-yellow-500" },
  { value: "silver", label: "Silver", gradient: "from-gray-200 to-gray-400" },
  { value: "rose-gold", label: "Rose Gold", gradient: "from-pink-200 to-pink-400" },
  { value: "no-preference", label: "Mixed/Any", gradient: "from-gray-100 to-gray-200" },
];

export function ColorPreferencesStep({ initialData, onComplete, onBack, loading }: Props) {
  const [complimentColors, setComplimentColors] = useState<string[]>(
    initialData.colorPreferences?.complimentColors || []
  );
  const [avoidColors, setAvoidColors] = useState<string[]>(
    initialData.colorPreferences?.avoidColors || []
  );
  const [metalPreference, setMetalPreference] = useState<
    "gold" | "silver" | "rose-gold" | "no-preference"
  >(initialData.colorPreferences?.metalPreference || "no-preference");
  const [patternTolerance, setPatternTolerance] = useState<
    "none" | "subtle" | "bold" | "any"
  >(initialData.colorPreferences?.patternTolerance || "any");
  const [runsHot, setRunsHot] = useState(initialData.temperatureProfile?.runsHot || false);
  const [runsCold, setRunsCold] = useState(initialData.temperatureProfile?.runsCold || false);
  const [needsLayers, setNeedsLayers] = useState(
    initialData.temperatureProfile?.needsLayers || false
  );

  const toggleColor = (color: string, type: "compliment" | "avoid") => {
    if (type === "compliment") {
      if (complimentColors.includes(color)) {
        setComplimentColors(complimentColors.filter((c) => c !== color));
      } else {
        setComplimentColors([...complimentColors, color]);
        setAvoidColors(avoidColors.filter((c) => c !== color));
      }
    } else {
      if (avoidColors.includes(color)) {
        setAvoidColors(avoidColors.filter((c) => c !== color));
      } else {
        setAvoidColors([...avoidColors, color]);
        setComplimentColors(complimentColors.filter((c) => c !== color));
      }
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
          <Palette className="h-8 w-8 text-blush" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Color Palette</h2>
        <p className="text-muted-foreground font-display">
          Final step! Tell us about your perfect colors
        </p>
      </div>

      {/* Colors You Shine In */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            1
          </span>
          Colors You Shine In
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Select colors you always get compliments in ({complimentColors.length} selected)
        </p>

        <div className="grid grid-cols-6 gap-3">
          {COLORS.map((color) => {
            const isSelected = complimentColors.includes(color.name);
            return (
              <div
                key={color.name}
                className={`relative cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-green-500 ring-2 ring-green-200 scale-105"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleColor(color.name, "compliment")}
              >
                <div
                  className="h-12 rounded-t-md"
                  style={{
                    backgroundColor: color.hex,
                    border: color.name === "White" ? "1px solid #e5e7eb" : "none",
                  }}
                />
                <div className="p-1.5 text-center bg-card">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Colors to Avoid */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            2
          </span>
          Colors to Avoid
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Colors that don&apos;t work for you ({avoidColors.length} selected)
        </p>

        <div className="grid grid-cols-6 gap-3">
          {COLORS.map((color) => {
            const isSelected = avoidColors.includes(color.name);
            const isCompliment = complimentColors.includes(color.name);
            return (
              <div
                key={color.name}
                className={`relative cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-red-400 ring-2 ring-red-200"
                    : isCompliment
                    ? "opacity-40 cursor-not-allowed"
                    : "border-border hover:border-red-300"
                }`}
                onClick={() => !isCompliment && toggleColor(color.name, "avoid")}
              >
                <div
                  className="h-12 rounded-t-md"
                  style={{
                    backgroundColor: color.hex,
                    border: color.name === "White" ? "1px solid #e5e7eb" : "none",
                  }}
                />
                <div className="p-1.5 text-center bg-card">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                    ✗
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metal Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            3
          </span>
          Metal Preference
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Which metal looks best on you?
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METAL_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                metalPreference === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setMetalPreference(option.value as any)}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${option.gradient} mx-auto mb-2 shadow-inner`}
                />
                <div className="text-sm font-medium">{option.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pattern Tolerance */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            4
          </span>
          Pattern Preference
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          How do you feel about patterns?
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "any", label: "Any Pattern", icon: "🎨", desc: "I love variety" },
            { value: "subtle", label: "Subtle", icon: "〰️", desc: "Small prints, stripes" },
            { value: "bold", label: "Bold", icon: "🌺", desc: "Large, statement prints" },
            { value: "none", label: "Solid Only", icon: "⬛", desc: "No patterns please" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                patternTolerance === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setPatternTolerance(option.value as any)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">
                  {option.desc}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Temperature Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            5
          </span>
          Temperature Comfort
          <Thermometer className="h-4 w-4 text-blush" />
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Help us recommend weather-appropriate outfits
        </p>

        <div className="space-y-3">
          {[
            {
              key: "hot",
              label: "I run hot",
              desc: "I get warm easily - prefer breathable fabrics",
              icon: "🔥",
              value: runsHot,
              setter: () => {
                setRunsHot(!runsHot);
                if (!runsHot) setRunsCold(false);
              },
            },
            {
              key: "cold",
              label: "I run cold",
              desc: "I get chilly easily - prefer warmer options",
              icon: "❄️",
              value: runsCold,
              setter: () => {
                setRunsCold(!runsCold);
                if (!runsCold) setRunsHot(false);
              },
            },
            {
              key: "layers",
              label: "I need layers",
              desc: "Always include a blazer, cardigan, or wrap option",
              icon: "🧥",
              value: needsLayers,
              setter: () => setNeedsLayers(!needsLayers),
            },
          ].map((option) => (
            <Card
              key={option.key}
              className={`cursor-pointer transition-all duration-300 ${
                option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={option.setter}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground font-display">
                      {option.desc}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    option.value
                      ? "bg-gradient-luxe border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {option.value && <Check className="h-4 w-4 text-white" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="rounded-full"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">✨</span>
              Creating Your Profile...
            </>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </form>
  );
}
