"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type BasicInfoData = {
  height?: number;
  sizes?: {
    tops: string;
    bottoms: number;
    dress: number;
    denim: number;
    bra?: string;
  };
  fitPreference?: "fitted" | "relaxed" | "oversized" | "standard";
  comfortLimits?: {
    straplessOk: boolean;
    maxHeelHeight: number;
    shapewearTolerance: "never" | "sometimes" | "always";
  };
};

type Props = {
  initialData: Partial<BasicInfoData>;
  onComplete: (data: BasicInfoData) => void;
  onBack: () => void;
};

export function BasicInfoStep({ initialData, onComplete, onBack }: Props) {
  // Convert initial height in inches to feet and inches
  const initialHeightInches = initialData.height || 0;
  const [feet, setFeet] = useState(Math.floor(initialHeightInches / 12));
  const [inches, setInches] = useState(initialHeightInches % 12);

  const [tops, setTops] = useState(initialData.sizes?.tops || "");
  const [bottoms, setBottoms] = useState(initialData.sizes?.bottoms?.toString() || "");
  const [dress, setDress] = useState(initialData.sizes?.dress?.toString() || "");
  const [denim, setDenim] = useState(initialData.sizes?.denim || 0);
  const [bra, setBra] = useState(initialData.sizes?.bra || "");
  const [fitPreference, setFitPreference] = useState<"fitted" | "relaxed" | "oversized" | "standard">(
    initialData.fitPreference || "standard"
  );
  const [straplessOk, setStraplessOk] = useState(initialData.comfortLimits?.straplessOk ?? true);
  const [maxHeelHeight, setMaxHeelHeight] = useState(initialData.comfortLimits?.maxHeelHeight || 3);
  const [shapewearTolerance, setShapewearTolerance] = useState<"never" | "sometimes" | "always">(
    initialData.comfortLimits?.shapewearTolerance || "sometimes"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert feet and inches to total inches
    const totalHeightInInches = (feet * 12) + inches;

    // Parse dress and bottoms sizes - handle "00", "0", etc.
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
      {/* Height */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Measurements</h3>

        <div>
          <Label>Height</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="feet" className="text-sm text-gray-600">Feet</Label>
              <Input
                id="feet"
                type="number"
                value={feet || ""}
                onChange={(e) => setFeet(Number(e.target.value))}
                placeholder="5"
                required
                min="4"
                max="7"
              />
            </div>
            <div>
              <Label htmlFor="inches" className="text-sm text-gray-600">Inches</Label>
              <Input
                id="inches"
                type="number"
                value={inches || ""}
                onChange={(e) => setInches(Number(e.target.value))}
                placeholder="6"
                required
                min="0"
                max="11"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {feet > 0 && `${feet}'${inches}"`}
          </p>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Usual Sizes</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tops">Tops</Label>
            <Select value={tops} onValueChange={setTops} required>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XXS">XXS</SelectItem>
                <SelectItem value="XS">XS</SelectItem>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
                <SelectItem value="XXL">XXL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dress">Dress Size</Label>
            <Input
              id="dress"
              type="text"
              value={dress}
              onChange={(e) => setDress(e.target.value)}
              placeholder="e.g., 00, 0, 2, 4, 6"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter 00, 0, 2, 4, 6, etc.</p>
          </div>

          <div>
            <Label htmlFor="bottoms">Bottoms Size</Label>
            <Input
              id="bottoms"
              type="text"
              value={bottoms}
              onChange={(e) => setBottoms(e.target.value)}
              placeholder="e.g., 00, 0, 2, 4, 6"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter 00, 0, 2, 4, 6, etc.</p>
          </div>

          <div>
            <Label htmlFor="denim">Denim (Waist)</Label>
            <Input
              id="denim"
              type="number"
              value={denim || ""}
              onChange={(e) => setDenim(Number(e.target.value))}
              placeholder="e.g., 28"
              required
              min="22"
              max="42"
            />
          </div>

          <div>
            <Label htmlFor="bra">Bra Size (Optional)</Label>
            <Input
              id="bra"
              type="text"
              value={bra}
              onChange={(e) => setBra(e.target.value)}
              placeholder="e.g., 34B"
            />
          </div>
        </div>
      </div>

      {/* Fit Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fit Preference</h3>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "fitted", label: "Fitted", desc: "Close to the body" },
            { value: "standard", label: "Standard", desc: "True to size" },
            { value: "relaxed", label: "Relaxed", desc: "Loose and comfortable" },
            { value: "oversized", label: "Oversized", desc: "Intentionally large" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                fitPreference === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setFitPreference(option.value as any)}
            >
              <CardContent className="p-4">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-600">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comfort Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comfort Limits</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Strapless Dresses?</Label>
              <p className="text-xs text-gray-500">Are you comfortable wearing strapless styles?</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={straplessOk ? "default" : "outline"}
                size="sm"
                onClick={() => setStraplessOk(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!straplessOk ? "default" : "outline"}
                size="sm"
                onClick={() => setStraplessOk(false)}
              >
                No
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="heelHeight">Max Heel Height (inches)</Label>
            <Input
              id="heelHeight"
              type="number"
              value={maxHeelHeight}
              onChange={(e) => setMaxHeelHeight(Number(e.target.value))}
              min="0"
              max="6"
              step="0.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              {maxHeelHeight === 0 && "Flats only"}
              {maxHeelHeight > 0 && maxHeelHeight <= 2 && "Low heels (kitten heels)"}
              {maxHeelHeight > 2 && maxHeelHeight <= 3.5 && "Medium heels"}
              {maxHeelHeight > 3.5 && "High heels"}
            </p>
          </div>

          <div>
            <Label>Shapewear</Label>
            <Select value={shapewearTolerance} onValueChange={(v) => setShapewearTolerance(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never - I prefer not to wear it</SelectItem>
                <SelectItem value="sometimes">Sometimes - For special occasions</SelectItem>
                <SelectItem value="always">{"Always - I'm comfortable with it"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack} disabled>
          Back
        </Button>
        <Button type="submit">
          Next Step →
        </Button>
      </div>
    </form>
  );
}
