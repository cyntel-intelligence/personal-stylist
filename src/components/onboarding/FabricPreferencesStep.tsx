"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Shirt, Leaf } from "lucide-react";
import { FabricPreferences } from "@/types/user";

type FabricPreferencesStepData = {
  fabricPreferences?: FabricPreferences;
};

type Props = {
  initialData: Partial<FabricPreferencesStepData>;
  onComplete: (data: FabricPreferencesStepData) => void;
  onBack: () => void;
};

const fabricOptions = [
  { value: "silk", label: "Silk", icon: "🪷", desc: "Luxurious, smooth, elegant drape" },
  { value: "cotton", label: "Cotton", icon: "☁️", desc: "Breathable, comfortable, versatile" },
  { value: "linen", label: "Linen", icon: "🌾", desc: "Light, airy, perfect for warm weather" },
  { value: "cashmere", label: "Cashmere", icon: "🐑", desc: "Ultra-soft, warm, luxurious" },
  { value: "wool", label: "Wool", icon: "🧶", desc: "Warm, durable, classic" },
  { value: "velvet", label: "Velvet", icon: "✨", desc: "Rich texture, sophisticated" },
  { value: "satin", label: "Satin", icon: "💫", desc: "Glossy, smooth, glamorous" },
  { value: "chiffon", label: "Chiffon", icon: "🌸", desc: "Sheer, flowing, romantic" },
  { value: "lace", label: "Lace", icon: "🕊️", desc: "Delicate, feminine, detailed" },
  { value: "denim", label: "Denim", icon: "👖", desc: "Sturdy, casual, timeless" },
  { value: "leather", label: "Leather", icon: "🖤", desc: "Edgy, durable, statement" },
  { value: "sequins", label: "Sequins/Beading", icon: "💎", desc: "Sparkly, festive, glamorous" },
];

const sensitivityOptions = [
  { value: "wool-itchy", label: "Wool feels itchy", icon: "🧶❌" },
  { value: "polyester-sweaty", label: "Polyester makes me sweat", icon: "💦" },
  { value: "synthetic-irritation", label: "Synthetic fabrics irritate my skin", icon: "⚠️" },
  { value: "rough-textures", label: "Rough textures are uncomfortable", icon: "🪨" },
  { value: "tight-elastics", label: "Tight elastics are uncomfortable", icon: "🔒" },
  { value: "none", label: "No sensitivities", icon: "✅" },
];

const carePreferenceOptions = [
  {
    value: "dry-clean-ok",
    label: "Dry Clean OK",
    desc: "I don't mind dry cleaning special pieces",
  },
  {
    value: "machine-wash-preferred",
    label: "Machine Wash Preferred",
    desc: "I prefer easy-care, machine washable items",
  },
  {
    value: "no-preference",
    label: "No Preference",
    desc: "I'll care for items however needed",
  },
];

export function FabricPreferencesStep({ initialData, onComplete, onBack }: Props) {
  const [lovedFabrics, setLovedFabrics] = useState<string[]>(
    initialData.fabricPreferences?.lovedFabrics || []
  );
  const [avoidFabrics, setAvoidFabrics] = useState<string[]>(
    initialData.fabricPreferences?.avoidFabrics || []
  );
  const [sensitivities, setSensitivities] = useState<string[]>(
    initialData.fabricPreferences?.sensitivities || []
  );
  const [carePreference, setCarePreference] = useState<FabricPreferences["carePreference"] | undefined>(
    initialData.fabricPreferences?.carePreference
  );
  const [ecoFriendly, setEcoFriendly] = useState(
    initialData.fabricPreferences?.ecoFriendly || false
  );

  const toggleFabric = (type: "loved" | "avoid", value: string) => {
    if (type === "loved") {
      // Remove from avoid if it's there
      setAvoidFabrics((prev) => prev.filter((f) => f !== value));
      setLovedFabrics((prev) =>
        prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
      );
    } else {
      // Remove from loved if it's there
      setLovedFabrics((prev) => prev.filter((f) => f !== value));
      setAvoidFabrics((prev) =>
        prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
      );
    }
  };

  const toggleSensitivity = (value: string) => {
    if (value === "none") {
      setSensitivities(["none"]);
    } else {
      setSensitivities((prev) => {
        const withoutNone = prev.filter((s) => s !== "none");
        return withoutNone.includes(value)
          ? withoutNone.filter((s) => s !== value)
          : [...withoutNone, value];
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onComplete({
      fabricPreferences: {
        lovedFabrics,
        avoidFabrics,
        sensitivities: sensitivities.filter((s) => s !== "none"),
        carePreference: carePreference || "no-preference",
        ecoFriendly,
      },
    });
  };

  const getFabricStatus = (value: string): "loved" | "avoid" | "neutral" => {
    if (lovedFabrics.includes(value)) return "loved";
    if (avoidFabrics.includes(value)) return "avoid";
    return "neutral";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
          <Shirt className="h-8 w-8 text-blush" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Fabric Preferences</h2>
        <p className="text-muted-foreground font-display">
          Help us recommend pieces you&apos;ll love to wear and feel great in
        </p>
      </div>

      {/* Fabric Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">1</span>
          Fabrics You Love & Avoid
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Tap once to love 💕, tap again to avoid ❌, tap once more to reset
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {fabricOptions.map((fabric) => {
            const status = getFabricStatus(fabric.value);
            return (
              <Card
                key={fabric.value}
                className={`cursor-pointer transition-all duration-300 ${
                  status === "loved"
                    ? "shadow-luxe-lg border-green-500 bg-green-50"
                    : status === "avoid"
                    ? "shadow-luxe border-red-300 bg-red-50"
                    : "shadow-luxe hover:shadow-luxe-lg border-border"
                }`}
                onClick={() => {
                  if (status === "neutral") {
                    toggleFabric("loved", fabric.value);
                  } else if (status === "loved") {
                    toggleFabric("avoid", fabric.value);
                  } else {
                    // Reset to neutral
                    setLovedFabrics((prev) => prev.filter((f) => f !== fabric.value));
                    setAvoidFabrics((prev) => prev.filter((f) => f !== fabric.value));
                  }
                }}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{fabric.icon}</span>
                    {status === "loved" && <span className="text-green-600 text-xs">💕 Love</span>}
                    {status === "avoid" && <span className="text-red-500 text-xs">❌ Avoid</span>}
                  </div>
                  <div className="font-medium text-sm">{fabric.label}</div>
                  <div className="text-xs text-muted-foreground font-display mt-1 line-clamp-1">
                    {fabric.desc}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selection Summary */}
        {(lovedFabrics.length > 0 || avoidFabrics.length > 0) && (
          <Card className="shadow-luxe border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-700 mb-1">💕 Love ({lovedFabrics.length})</p>
                  <p className="text-muted-foreground font-display">
                    {lovedFabrics.length > 0
                      ? lovedFabrics.map((f) => fabricOptions.find((o) => o.value === f)?.label).join(", ")
                      : "None selected"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-red-600 mb-1">❌ Avoid ({avoidFabrics.length})</p>
                  <p className="text-muted-foreground font-display">
                    {avoidFabrics.length > 0
                      ? avoidFabrics.map((f) => fabricOptions.find((o) => o.value === f)?.label).join(", ")
                      : "None selected"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sensitivities */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">2</span>
          Fabric Sensitivities
        </h3>
        <p className="text-sm text-muted-foreground font-display">Any materials that bother you?</p>

        <div className="flex flex-wrap gap-2">
          {sensitivityOptions.map((option) => {
            const isSelected = sensitivities.includes(option.value);
            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSensitivity(option.value)}
                className={`rounded-full ${isSelected ? "bg-gradient-luxe border-0" : ""}`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
                {isSelected && <Check className="h-3 w-3 ml-1" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Care Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">3</span>
          Care Preference
        </h3>
        <p className="text-sm text-muted-foreground font-display">How do you prefer to care for your clothes?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {carePreferenceOptions.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                carePreference === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setCarePreference(option.value as FabricPreferences["carePreference"])}
            >
              <CardContent className="p-4">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Eco-Friendly */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">4</span>
          Sustainability
          <Leaf className="h-4 w-4 text-green-600" />
        </h3>

        <Card
          className={`cursor-pointer transition-all duration-300 ${
            ecoFriendly
              ? "shadow-luxe-lg border-green-500 bg-green-50"
              : "shadow-luxe hover:shadow-luxe-lg border-border"
          }`}
          onClick={() => setEcoFriendly(!ecoFriendly)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Prioritize sustainable & eco-friendly options
              </div>
              <div className="text-xs text-muted-foreground font-display mt-1">
                We&apos;ll highlight brands and fabrics that are better for the planet
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                ecoFriendly ? "bg-green-500 border-green-500" : "border-muted-foreground"
              }`}
            >
              {ecoFriendly && <Check className="h-4 w-4 text-white" />}
            </div>
          </CardContent>
        </Card>
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
