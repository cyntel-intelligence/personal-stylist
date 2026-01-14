"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

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
  "Shoulders", "Bust", "Arms", "Waist", "Hips", "Legs", "Back", "Décolletage"
];

const NECKLINES = [
  "V-Neck", "Scoop", "Boat", "Off-Shoulder", "Halter",
  "Sweetheart", "Square", "High Neck", "Cowl", "Asymmetric"
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
  const [dressLength, setDressLength] = useState<"mini" | "knee" | "midi" | "maxi" | "any">(
    initialData.flatteryMap?.lengthPreferences?.dresses || "any"
  );
  const [sleeveLength, setSleeveLength] = useState<"sleeveless" | "cap" | "short" | "3/4" | "long" | "any">(
    initialData.flatteryMap?.lengthPreferences?.sleeves || "any"
  );
  const [waistDefinition, setWaistDefinition] = useState<"always" | "sometimes" | "never">(
    initialData.flatteryMap?.waistDefinition || "sometimes"
  );

  const toggleFavorite = (part: string) => {
    if (favoriteBodyParts.includes(part)) {
      setFavoriteBodyParts(favoriteBodyParts.filter(p => p !== part));
    } else if (favoriteBodyParts.length < 2) {
      setFavoriteBodyParts([...favoriteBodyParts, part]);
      // Remove from minimize if it's there
      setMinimizeBodyParts(minimizeBodyParts.filter(p => p !== part));
    }
  };

  const toggleMinimize = (part: string) => {
    if (minimizeBodyParts.includes(part)) {
      setMinimizeBodyParts(minimizeBodyParts.filter(p => p !== part));
    } else if (minimizeBodyParts.length < 2) {
      setMinimizeBodyParts([...minimizeBodyParts, part]);
      // Remove from favorites if it's there
      setFavoriteBodyParts(favoriteBodyParts.filter(p => p !== part));
    }
  };

  const toggleLovedNeckline = (neckline: string) => {
    if (lovedNecklines.includes(neckline)) {
      setLovedNecklines(lovedNecklines.filter(n => n !== neckline));
    } else {
      setLovedNecklines([...lovedNecklines, neckline]);
      // Remove from avoid if it's there
      setAvoidNecklines(avoidNecklines.filter(n => n !== neckline));
    }
  };

  const toggleAvoidNeckline = (neckline: string) => {
    if (avoidNecklines.includes(neckline)) {
      setAvoidNecklines(avoidNecklines.filter(n => n !== neckline));
    } else {
      setAvoidNecklines([...avoidNecklines, neckline]);
      // Remove from loved if it's there
      setLovedNecklines(lovedNecklines.filter(n => n !== neckline));
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
      {/* Favorite Body Parts */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Show Off Your Best Features</h3>
          <p className="text-sm text-gray-600">
            Pick up to 2 body parts you love to highlight ({favoriteBodyParts.length}/2)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {BODY_PARTS.map((part) => (
            <Badge
              key={part}
              variant={favoriteBodyParts.includes(part) ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => toggleFavorite(part)}
            >
              {part}
            </Badge>
          ))}
        </div>
      </div>

      {/* Minimize Body Parts */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Areas to Downplay</h3>
          <p className="text-sm text-gray-600">
            Pick up to 2 areas you prefer to minimize ({minimizeBodyParts.length}/2)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {BODY_PARTS.map((part) => (
            <Badge
              key={part}
              variant={minimizeBodyParts.includes(part) ? "destructive" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => toggleMinimize(part)}
            >
              {part}
            </Badge>
          ))}
        </div>
      </div>

      {/* Neckline Preferences */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Neckline Preferences</h3>
          <p className="text-sm text-gray-600">Select necklines you love and ones to avoid</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-green-700">✓ Love These</Label>
            <div className="flex flex-wrap gap-2">
              {NECKLINES.map((neckline) => (
                <Badge
                  key={neckline}
                  variant={lovedNecklines.includes(neckline) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleLovedNeckline(neckline)}
                >
                  {neckline}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-red-700">✗ Avoid These</Label>
            <div className="flex flex-wrap gap-2">
              {NECKLINES.map((neckline) => (
                <Badge
                  key={neckline}
                  variant={avoidNecklines.includes(neckline) ? "destructive" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleAvoidNeckline(neckline)}
                >
                  {neckline}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Length Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Length Preferences</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dress Length</Label>
            <Select value={dressLength} onValueChange={(v) => setDressLength(v as any)}>
              <SelectTrigger>
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

          <div>
            <Label>Sleeve Length</Label>
            <Select value={sleeveLength} onValueChange={(v) => setSleeveLength(v as any)}>
              <SelectTrigger>
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
        <div>
          <h3 className="text-lg font-semibold">Waist Definition</h3>
          <p className="text-sm text-gray-600">Do you prefer dresses that define your waist?</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "always", label: "Always", desc: "Fitted or belted waist" },
            { value: "sometimes", label: "Sometimes", desc: "Depends on the style" },
            { value: "never", label: "Never", desc: "Prefer straight or loose" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                waistDefinition === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setWaistDefinition(option.value as any)}
            >
              <CardContent className="p-4 text-center">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button type="submit">
          Next Step →
        </Button>
      </div>
    </form>
  );
}
