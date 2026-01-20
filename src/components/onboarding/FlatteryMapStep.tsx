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
import { Sparkles, Check } from "lucide-react";

type FlatteryMapData = {
  flatteryMap?: {
    favoriteBodyParts: string[];
    minimizeBodyParts: string[];
    necklinePreferences: {
      loved: string[];
      avoid: string[];
    };
    lengthPreferences: {
      dresses: "mini" | "knee" | "midi" | "maxi" | "any";
      sleeves: "sleeveless" | "cap" | "short" | "3/4" | "long" | "any";
    };
    waistDefinition: "always" | "sometimes" | "never";
  };
};

type Props = {
  initialData: Partial<FlatteryMapData>;
  onComplete: (data: FlatteryMapData) => void;
  onBack: () => void;
};

const BODY_PARTS = [
  { name: "Shoulders", icon: "💪" },
  { name: "Bust", icon: "👙" },
  { name: "Arms", icon: "✋" },
  { name: "Waist", icon: "⏳" },
  { name: "Hips", icon: "🍑" },
  { name: "Legs", icon: "🦵" },
  { name: "Back", icon: "🔙" },
  { name: "Décolletage", icon: "✨" },
];

const NECKLINES = [
  { name: "V-Neck", icon: "∨" },
  { name: "Scoop", icon: "⌣" },
  { name: "Boat", icon: "⎯" },
  { name: "Off-Shoulder", icon: "↔" },
  { name: "Halter", icon: "△" },
  { name: "Sweetheart", icon: "💕" },
  { name: "Square", icon: "□" },
  { name: "High Neck", icon: "▲" },
  { name: "Cowl", icon: "∪" },
  { name: "Asymmetric", icon: "∠" },
];

export function FlatteryMapStep({ initialData, onComplete, onBack }: Props) {
  const [favoriteBodyParts, setFavoriteBodyParts] = useState<string[]>(
    initialData.flatteryMap?.favoriteBodyParts || []
  );
  const [minimizeBodyParts, setMinimizeBodyParts] = useState<string[]>(
    initialData.flatteryMap?.minimizeBodyParts || []
  );
  const [lovedNecklines, setLovedNecklines] = useState<string[]>(
    initialData.flatteryMap?.necklinePreferences?.loved || []
  );
  const [avoidNecklines, setAvoidNecklines] = useState<string[]>(
    initialData.flatteryMap?.necklinePreferences?.avoid || []
  );
  const [dressLength, setDressLength] = useState<
    "mini" | "knee" | "midi" | "maxi" | "any"
  >(initialData.flatteryMap?.lengthPreferences?.dresses || "any");
  const [sleeveLength, setSleeveLength] = useState<
    "sleeveless" | "cap" | "short" | "3/4" | "long" | "any"
  >(initialData.flatteryMap?.lengthPreferences?.sleeves || "any");
  const [waistDefinition, setWaistDefinition] = useState<
    "always" | "sometimes" | "never"
  >(initialData.flatteryMap?.waistDefinition || "sometimes");

  const toggleFavorite = (part: string) => {
    if (favoriteBodyParts.includes(part)) {
      setFavoriteBodyParts(favoriteBodyParts.filter((p) => p !== part));
    } else if (favoriteBodyParts.length < 2) {
      setFavoriteBodyParts([...favoriteBodyParts, part]);
      setMinimizeBodyParts(minimizeBodyParts.filter((p) => p !== part));
    }
  };

  const toggleMinimize = (part: string) => {
    if (minimizeBodyParts.includes(part)) {
      setMinimizeBodyParts(minimizeBodyParts.filter((p) => p !== part));
    } else if (minimizeBodyParts.length < 2) {
      setMinimizeBodyParts([...minimizeBodyParts, part]);
      setFavoriteBodyParts(favoriteBodyParts.filter((p) => p !== part));
    }
  };

  const toggleNeckline = (neckline: string, type: "love" | "avoid") => {
    if (type === "love") {
      if (lovedNecklines.includes(neckline)) {
        setLovedNecklines(lovedNecklines.filter((n) => n !== neckline));
      } else {
        setLovedNecklines([...lovedNecklines, neckline]);
        setAvoidNecklines(avoidNecklines.filter((n) => n !== neckline));
      }
    } else {
      if (avoidNecklines.includes(neckline)) {
        setAvoidNecklines(avoidNecklines.filter((n) => n !== neckline));
      } else {
        setAvoidNecklines([...avoidNecklines, neckline]);
        setLovedNecklines(lovedNecklines.filter((n) => n !== neckline));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onComplete({
      flatteryMap: {
        favoriteBodyParts,
        minimizeBodyParts,
        necklinePreferences: {
          loved: lovedNecklines,
          avoid: avoidNecklines,
        },
        lengthPreferences: {
          dresses: dressLength,
          sleeves: sleeveLength,
        },
        waistDefinition,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-blush" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Flattery Map</h2>
        <p className="text-muted-foreground font-display">
          Help us find silhouettes that make you shine
        </p>
      </div>

      {/* Favorite Body Parts */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            1
          </span>
          Show Off Your Best Features
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Pick up to 2 body parts you love to highlight ({favoriteBodyParts.length}/2)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BODY_PARTS.map((part) => {
            const isSelected = favoriteBodyParts.includes(part.name);
            return (
              <Card
                key={part.name}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "shadow-luxe-lg border-green-500 bg-green-50"
                    : "shadow-luxe hover:shadow-luxe-lg border-border"
                }`}
                onClick={() => toggleFavorite(part.name)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-1">{part.icon}</div>
                  <div className="text-sm font-medium">{part.name}</div>
                  {isSelected && (
                    <div className="text-xs text-green-600 mt-1">Highlight</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Minimize Body Parts */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            2
          </span>
          Areas to Downplay
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Pick up to 2 areas you prefer to minimize ({minimizeBodyParts.length}/2)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BODY_PARTS.map((part) => {
            const isSelected = minimizeBodyParts.includes(part.name);
            const isFavorite = favoriteBodyParts.includes(part.name);
            return (
              <Card
                key={part.name}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "shadow-luxe border-red-300 bg-red-50"
                    : isFavorite
                    ? "opacity-50 cursor-not-allowed"
                    : "shadow-luxe hover:shadow-luxe-lg border-border"
                }`}
                onClick={() => !isFavorite && toggleMinimize(part.name)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-1">{part.icon}</div>
                  <div className="text-sm font-medium">{part.name}</div>
                  {isSelected && (
                    <div className="text-xs text-red-600 mt-1">Minimize</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Neckline Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            3
          </span>
          Neckline Preferences
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Tap once to love, tap again to avoid, tap once more to reset
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {NECKLINES.map((neckline) => {
            const isLoved = lovedNecklines.includes(neckline.name);
            const isAvoided = avoidNecklines.includes(neckline.name);
            return (
              <Card
                key={neckline.name}
                className={`cursor-pointer transition-all duration-300 ${
                  isLoved
                    ? "shadow-luxe-lg border-green-500 bg-green-50"
                    : isAvoided
                    ? "shadow-luxe border-red-300 bg-red-50"
                    : "shadow-luxe hover:shadow-luxe-lg border-border"
                }`}
                onClick={() => {
                  if (!isLoved && !isAvoided) {
                    toggleNeckline(neckline.name, "love");
                  } else if (isLoved) {
                    setLovedNecklines(lovedNecklines.filter((n) => n !== neckline.name));
                    toggleNeckline(neckline.name, "avoid");
                  } else {
                    setAvoidNecklines(avoidNecklines.filter((n) => n !== neckline.name));
                  }
                }}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-lg mb-1 font-mono">{neckline.icon}</div>
                  <div className="text-xs font-medium">{neckline.name}</div>
                  {isLoved && (
                    <div className="text-xs text-green-600 mt-1">Love</div>
                  )}
                  {isAvoided && (
                    <div className="text-xs text-red-600 mt-1">Avoid</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Length Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            4
          </span>
          Length Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-display">Preferred Dress Length</Label>
            <Select value={dressLength} onValueChange={(v) => setDressLength(v as any)}>
              <SelectTrigger className="rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Length</SelectItem>
                <SelectItem value="mini">Mini (above knee)</SelectItem>
                <SelectItem value="knee">Knee Length</SelectItem>
                <SelectItem value="midi">Midi (below knee)</SelectItem>
                <SelectItem value="maxi">Maxi (ankle length)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-display">Preferred Sleeve Length</Label>
            <Select value={sleeveLength} onValueChange={(v) => setSleeveLength(v as any)}>
              <SelectTrigger className="rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Length</SelectItem>
                <SelectItem value="sleeveless">Sleeveless</SelectItem>
                <SelectItem value="cap">Cap Sleeve</SelectItem>
                <SelectItem value="short">Short Sleeve</SelectItem>
                <SelectItem value="3/4">3/4 Sleeve</SelectItem>
                <SelectItem value="long">Long Sleeve</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Waist Definition */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            5
          </span>
          Waist Definition
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Do you prefer dresses that define your waist?
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "always", label: "Always", desc: "Fitted or belted waist", icon: "⏳" },
            { value: "sometimes", label: "Sometimes", desc: "Depends on the style", icon: "〰️" },
            { value: "never", label: "Never", desc: "Prefer straight or loose", icon: "▭" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                waistDefinition === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setWaistDefinition(option.value as any)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">
                  {option.desc}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} className="rounded-full">
          Back
        </Button>
        <Button type="submit" className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8">
          Continue
        </Button>
      </div>
    </form>
  );
}
