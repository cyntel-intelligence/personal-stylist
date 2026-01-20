"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Ruler, Info } from "lucide-react";

type BodyMeasurementsData = {
  height?: number;
  sizes?: {
    tops: string;
    bottoms: number;
    dress: number;
    denim: number;
    bra?: string;
  };
  measurements?: {
    bust?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
    shoulderWidth?: number;
  };
  bodyShape?: "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle";
  fitPreference?: "fitted" | "relaxed" | "oversized" | "standard";
  comfortLimits?: {
    straplessOk: boolean;
    maxHeelHeight: number;
    shapewearTolerance: "never" | "sometimes" | "always";
  };
};

type Props = {
  initialData: Partial<BodyMeasurementsData>;
  onComplete: (data: BodyMeasurementsData) => void;
  onBack: () => void;
};

const bodyShapeOptions = [
  {
    value: "hourglass",
    label: "Hourglass",
    icon: "⌛",
    desc: "Bust and hips are similar, with a defined waist",
  },
  {
    value: "pear",
    label: "Pear",
    icon: "🍐",
    desc: "Hips are wider than shoulders and bust",
  },
  {
    value: "apple",
    label: "Apple",
    icon: "🍎",
    desc: "Fuller midsection, slimmer hips and legs",
  },
  {
    value: "rectangle",
    label: "Rectangle",
    icon: "▭",
    desc: "Shoulders, waist, and hips are similar width",
  },
  {
    value: "inverted-triangle",
    label: "Inverted Triangle",
    icon: "▽",
    desc: "Shoulders are wider than hips",
  },
];

const measurementGuides = {
  bust: "Measure around the fullest part of your bust, keeping the tape parallel to the floor.",
  waist: "Measure around your natural waistline, which is the narrowest part of your torso (usually above your belly button).",
  hips: "Measure around the fullest part of your hips and buttocks, keeping the tape parallel to the floor.",
  inseam: "Measure from your inner thigh crotch seam down to where you want your pants to end.",
  shoulderWidth: "Measure from the edge of one shoulder to the edge of the other, across the back.",
};

export function BodyMeasurementsStep({ initialData, onComplete, onBack }: Props) {
  // Height
  const initialHeightInches = initialData.height || 0;
  const [feet, setFeet] = useState(Math.floor(initialHeightInches / 12));
  const [inches, setInches] = useState(initialHeightInches % 12);

  // Standard sizes
  const [tops, setTops] = useState(initialData.sizes?.tops || "");
  const [bottoms, setBottoms] = useState(initialData.sizes?.bottoms?.toString() || "");
  const [dress, setDress] = useState(initialData.sizes?.dress?.toString() || "");
  const [denim, setDenim] = useState(initialData.sizes?.denim || 0);
  const [bra, setBra] = useState(initialData.sizes?.bra || "");

  // Detailed measurements
  const [bust, setBust] = useState(initialData.measurements?.bust || 0);
  const [waist, setWaist] = useState(initialData.measurements?.waist || 0);
  const [hips, setHips] = useState(initialData.measurements?.hips || 0);
  const [inseam, setInseam] = useState(initialData.measurements?.inseam || 0);
  const [shoulderWidth] = useState(initialData.measurements?.shoulderWidth || 0);

  // Body shape
  const [bodyShape, setBodyShape] = useState<BodyMeasurementsData["bodyShape"]>(
    initialData.bodyShape
  );

  // Fit preference
  const [fitPreference, setFitPreference] = useState<"fitted" | "relaxed" | "oversized" | "standard">(
    initialData.fitPreference || "standard"
  );

  // Comfort limits
  const [straplessOk, setStraplessOk] = useState(initialData.comfortLimits?.straplessOk ?? true);
  const [maxHeelHeight, setMaxHeelHeight] = useState(initialData.comfortLimits?.maxHeelHeight || 3);
  const [shapewearTolerance, setShapewearTolerance] = useState<"never" | "sometimes" | "always">(
    initialData.comfortLimits?.shapewearTolerance || "sometimes"
  );

  // UI state
  const [showMeasurementGuide, setShowMeasurementGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalHeightInInches = feet * 12 + inches;
    const dressNumber = dress === "00" ? 0 : parseInt(dress) || 0;
    const bottomsNumber = bottoms === "00" ? 0 : parseInt(bottoms) || 0;

    onComplete({
      height: totalHeightInInches,
      sizes: {
        tops,
        bottoms: bottomsNumber,
        dress: dressNumber,
        denim,
        bra: bra || undefined,
      },
      measurements: {
        bust: bust || undefined,
        waist: waist || undefined,
        hips: hips || undefined,
        inseam: inseam || undefined,
        shoulderWidth: shoulderWidth || undefined,
      },
      bodyShape,
      fitPreference,
      comfortLimits: {
        straplessOk,
        maxHeelHeight,
        shapewearTolerance,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
          <Ruler className="h-8 w-8 text-blush" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Your Measurements</h2>
        <p className="text-muted-foreground font-display">
          Accurate measurements help us recommend pieces that fit beautifully
        </p>
      </div>

      {/* Height */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">1</span>
          Height
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="feet" className="text-sm text-muted-foreground">Feet</Label>
            <Select value={feet.toString()} onValueChange={(v) => setFeet(Number(v))}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Feet" />
              </SelectTrigger>
              <SelectContent>
                {[4, 5, 6, 7].map((f) => (
                  <SelectItem key={f} value={f.toString()}>{f} ft</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="inches" className="text-sm text-muted-foreground">Inches</Label>
            <Select value={inches.toString()} onValueChange={(v) => setInches(Number(v))}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Inches" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                  <SelectItem key={i} value={i.toString()}>{i} in</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {feet > 0 && (
          <p className="text-sm text-muted-foreground font-display">{feet}&apos;{inches}&quot;</p>
        )}
      </div>

      {/* Standard Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">2</span>
          Standard Sizes
        </h3>
        <p className="text-sm text-muted-foreground font-display">Your typical sizes when shopping</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tops">Tops</Label>
            <Select value={tops} onValueChange={setTops} required>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dress">Dress Size</Label>
            <Select value={dress} onValueChange={setDress} required>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {["00", "0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24"].map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bottoms">Bottoms Size</Label>
            <Select value={bottoms} onValueChange={setBottoms} required>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {["00", "0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24"].map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="denim">Denim (Waist)</Label>
            <Select value={denim.toString()} onValueChange={(v) => setDenim(Number(v))} required>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 21 }, (_, i) => 22 + i).map((size) => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="bra">Bra Size (Optional)</Label>
            <Input
              id="bra"
              type="text"
              value={bra}
              onChange={(e) => setBra(e.target.value)}
              placeholder="e.g., 34B, 36C"
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Detailed Measurements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">3</span>
            Body Measurements
            <span className="text-xs font-normal text-muted-foreground font-display">(Optional but recommended)</span>
          </h3>
        </div>

        <Collapsible open={showMeasurementGuide} onOpenChange={setShowMeasurementGuide}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-blush hover:text-blush/80 p-0 h-auto font-display">
              <Info className="h-4 w-4 mr-1" />
              How to measure
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showMeasurementGuide ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card className="border-blush/30 bg-blush/50">
              <CardContent className="p-4 space-y-3 text-sm font-display">
                <p className="font-medium text-foreground">Measuring Tips:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Use a soft measuring tape</li>
                  <li>• Stand naturally, don&apos;t hold your breath</li>
                  <li>• Keep the tape snug but not tight</li>
                  <li>• Measure over thin clothing or underwear</li>
                </ul>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "bust", label: "Bust", value: bust, setter: setBust, guide: measurementGuides.bust },
            { key: "waist", label: "Waist", value: waist, setter: setWaist, guide: measurementGuides.waist },
            { key: "hips", label: "Hips", value: hips, setter: setHips, guide: measurementGuides.hips },
            { key: "inseam", label: "Inseam", value: inseam, setter: setInseam, guide: measurementGuides.inseam },
          ].map((measurement) => (
            <div key={measurement.key} className="space-y-1">
              <Label htmlFor={measurement.key}>{measurement.label} (inches)</Label>
              <Input
                id={measurement.key}
                type="number"
                value={measurement.value || ""}
                onChange={(e) => measurement.setter(Number(e.target.value))}
                placeholder="0"
                min="0"
                max="80"
                step="0.5"
                className="rounded-full"
              />
              <p className="text-xs text-muted-foreground font-display line-clamp-2">{measurement.guide}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body Shape */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">4</span>
          Body Shape
        </h3>
        <p className="text-sm text-muted-foreground font-display">This helps us recommend the most flattering silhouettes</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bodyShapeOptions.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                bodyShape === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setBodyShape(option.value as BodyMeasurementsData["bodyShape"])}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fit Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">5</span>
          Fit Preference
        </h3>
        <p className="text-sm text-muted-foreground font-display">How do you like your clothes to fit?</p>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "fitted", label: "Fitted", desc: "Close to the body, shows your shape" },
            { value: "standard", label: "Standard", desc: "True to size, comfortable fit" },
            { value: "relaxed", label: "Relaxed", desc: "Loose and easy, room to move" },
            { value: "oversized", label: "Oversized", desc: "Intentionally large, trendy look" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                fitPreference === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setFitPreference(option.value as any)}
            >
              <CardContent className="p-4">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comfort Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">6</span>
          Comfort Preferences
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Strapless Styles</Label>
              <p className="text-xs text-muted-foreground font-display">Are you comfortable wearing strapless?</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={straplessOk ? "default" : "outline"}
                size="sm"
                onClick={() => setStraplessOk(true)}
                className={straplessOk ? "bg-gradient-luxe border-0" : "rounded-full"}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!straplessOk ? "default" : "outline"}
                size="sm"
                onClick={() => setStraplessOk(false)}
                className={!straplessOk ? "bg-gradient-luxe border-0" : "rounded-full"}
              >
                No
              </Button>
            </div>
          </div>

          <div>
            <Label className="font-medium">Maximum Heel Height</Label>
            <p className="text-xs text-muted-foreground font-display mb-2">What&apos;s the highest heel you&apos;ll wear?</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 0, label: "Flats Only" },
                { value: 2, label: "2\" (Low)" },
                { value: 3, label: "3\" (Medium)" },
                { value: 4, label: "4\" (High)" },
                { value: 5, label: "5\"+ (Sky High)" },
              ].map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={maxHeelHeight === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMaxHeelHeight(option.value)}
                  className={maxHeelHeight === option.value ? "bg-gradient-luxe border-0" : "rounded-full"}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="font-medium">Shapewear</Label>
            <p className="text-xs text-muted-foreground font-display mb-2">How do you feel about shapewear?</p>
            <Select value={shapewearTolerance} onValueChange={(v) => setShapewearTolerance(v as any)}>
              <SelectTrigger className="rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never - I prefer not to wear it</SelectItem>
                <SelectItem value="sometimes">Sometimes - For special occasions</SelectItem>
                <SelectItem value="always">Always - I&apos;m comfortable with it</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} disabled className="rounded-full">
          Back
        </Button>
        <Button type="submit" className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8">
          Continue
        </Button>
      </div>
    </form>
  );
}
