"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Sparkles, Heart, Ban, DollarSign, XCircle } from "lucide-react";

type StyleDNAData = {
  styleDNA?: {
    styleWords: string[];
    lovedBrands: string[];
    hatedBrands: string[];
    priceRanges: {
      dresses: { min: number; max: number };
      shoes: { min: number; max: number };
      bags: { min: number; max: number };
      jewelry: { min: number; max: number };
    };
    neverAgainList: string[];
  };
};

type Props = {
  initialData: Partial<StyleDNAData>;
  onComplete: (data: StyleDNAData) => void;
  onBack: () => void;
};

const STYLE_WORD_OPTIONS = [
  { word: "Classic", icon: "👔" },
  { word: "Modern", icon: "🔲" },
  { word: "Edgy", icon: "🖤" },
  { word: "Romantic", icon: "🌸" },
  { word: "Bohemian", icon: "🌻" },
  { word: "Minimalist", icon: "◻️" },
  { word: "Glamorous", icon: "✨" },
  { word: "Preppy", icon: "🎀" },
  { word: "Vintage", icon: "📷" },
  { word: "Trendy", icon: "🔥" },
  { word: "Elegant", icon: "👑" },
  { word: "Casual", icon: "☕" },
  { word: "Feminine", icon: "💕" },
  { word: "Androgynous", icon: "⚡" },
  { word: "Sporty", icon: "🏃‍♀️" },
  { word: "Sophisticated", icon: "🍸" },
  { word: "Eclectic", icon: "🎨" },
];

const PRICE_TIERS = [
  { label: "Budget-Friendly", ranges: { dresses: 100, shoes: 75, bags: 75, jewelry: 50 } },
  { label: "Mid-Range", ranges: { dresses: 250, shoes: 150, bags: 200, jewelry: 100 } },
  { label: "Investment", ranges: { dresses: 500, shoes: 350, bags: 500, jewelry: 250 } },
  { label: "Luxury", ranges: { dresses: 1000, shoes: 600, bags: 1000, jewelry: 500 } },
];

export function StyleDNAStep({ initialData, onComplete, onBack }: Props) {
  const [styleWords, setStyleWords] = useState<string[]>(initialData.styleDNA?.styleWords || []);
  const [lovedBrands, setLovedBrands] = useState<string[]>(initialData.styleDNA?.lovedBrands || []);
  const [hatedBrands, setHatedBrands] = useState<string[]>(initialData.styleDNA?.hatedBrands || []);
  const [neverAgainList, setNeverAgainList] = useState<string[]>(initialData.styleDNA?.neverAgainList || []);

  const [dressMax, setDressMax] = useState(initialData.styleDNA?.priceRanges?.dresses.max || 200);
  const [shoesMax, setShoesMax] = useState(initialData.styleDNA?.priceRanges?.shoes.max || 150);
  const [bagsMax, setBagsMax] = useState(initialData.styleDNA?.priceRanges?.bags.max || 200);
  const [jewelryMax, setJewelryMax] = useState(initialData.styleDNA?.priceRanges?.jewelry.max || 100);

  const [brandInput, setBrandInput] = useState("");
  const [hatedBrandInput, setHatedBrandInput] = useState("");
  const [neverAgainInput, setNeverAgainInput] = useState("");

  const toggleStyleWord = (word: string) => {
    if (styleWords.includes(word)) {
      setStyleWords(styleWords.filter((w) => w !== word));
    } else if (styleWords.length < 5) {
      setStyleWords([...styleWords, word]);
    }
  };

  const addLovedBrand = () => {
    if (brandInput.trim() && !lovedBrands.includes(brandInput.trim())) {
      setLovedBrands([...lovedBrands, brandInput.trim()]);
      setBrandInput("");
    }
  };

  const addHatedBrand = () => {
    if (hatedBrandInput.trim() && !hatedBrands.includes(hatedBrandInput.trim())) {
      setHatedBrands([...hatedBrands, hatedBrandInput.trim()]);
      setHatedBrandInput("");
    }
  };

  const addNeverAgain = () => {
    if (neverAgainInput.trim() && !neverAgainList.includes(neverAgainInput.trim())) {
      setNeverAgainList([...neverAgainList, neverAgainInput.trim()]);
      setNeverAgainInput("");
    }
  };

  const applyPriceTier = (tier: (typeof PRICE_TIERS)[0]) => {
    setDressMax(tier.ranges.dresses);
    setShoesMax(tier.ranges.shoes);
    setBagsMax(tier.ranges.bags);
    setJewelryMax(tier.ranges.jewelry);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (styleWords.length === 0) {
      alert("Please select at least one style word");
      return;
    }

    onComplete({
      styleDNA: {
        styleWords,
        lovedBrands,
        hatedBrands,
        priceRanges: {
          dresses: { min: 0, max: dressMax },
          shoes: { min: 0, max: shoesMax },
          bags: { min: 0, max: bagsMax },
          jewelry: { min: 0, max: jewelryMax },
        },
        neverAgainList,
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
        <h2 className="text-2xl font-serif mb-2">Style Preferences</h2>
        <p className="text-muted-foreground font-display">
          Tell us about your taste and budget
        </p>
      </div>

      {/* Style Words */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            1
          </span>
          Your Style in 5 Words
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Choose up to 5 words that describe your style ({styleWords.length}/5 selected)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {STYLE_WORD_OPTIONS.map(({ word, icon }) => (
            <Button
              key={word}
              type="button"
              variant={styleWords.includes(word) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStyleWord(word)}
              disabled={!styleWords.includes(word) && styleWords.length >= 5}
              className={`justify-start rounded-full ${
                styleWords.includes(word) ? "bg-gradient-luxe border-0" : ""
              }`}
            >
              <span className="mr-2">{icon}</span>
              {word}
            </Button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            2
          </span>
          Your Budget
          <DollarSign className="h-4 w-4 text-blush" />
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Quick select a tier or customize below
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRICE_TIERS.map((tier) => (
            <Button
              key={tier.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPriceTier(tier)}
              className="rounded-full"
            >
              {tier.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Dresses", value: dressMax, setter: setDressMax, icon: "👗" },
            { label: "Shoes", value: shoesMax, setter: setShoesMax, icon: "👠" },
            { label: "Bags", value: bagsMax, setter: setBagsMax, icon: "👜" },
            { label: "Jewelry", value: jewelryMax, setter: setJewelryMax, icon: "💎" },
          ].map((category) => (
            <div key={category.label} className="space-y-2">
              <Label className="font-display">
                {category.icon} {category.label} (max)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={category.value || ""}
                  onChange={(e) => category.setter(Number(e.target.value) || 0)}
                  min="0"
                  max="5000"
                  step="25"
                  className="pl-7 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loved Brands */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            3
          </span>
          Brands You Love
          <Heart className="h-4 w-4 text-blush" />
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Add brands you consistently enjoy wearing
        </p>

        <div className="flex gap-2">
          <Input
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLovedBrand())}
            placeholder="e.g., Reformation, Free People, Revolve"
            className="rounded-full"
          />
          <Button type="button" onClick={addLovedBrand} className="rounded-full">
            Add
          </Button>
        </div>

        {lovedBrands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {lovedBrands.map((brand) => (
              <Badge
                key={brand}
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2 bg-green-100 text-green-800"
              >
                {brand}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => setLovedBrands(lovedBrands.filter((b) => b !== brand))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Hated Brands */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            4
          </span>
          Brands to Avoid
          <Ban className="h-4 w-4 text-red-400" />
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Brands that don&apos;t fit your style or body
        </p>

        <div className="flex gap-2">
          <Input
            value={hatedBrandInput}
            onChange={(e) => setHatedBrandInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHatedBrand())}
            placeholder="e.g., Forever 21, Shein"
            className="rounded-full"
          />
          <Button type="button" onClick={addHatedBrand} variant="outline" className="rounded-full">
            Add
          </Button>
        </div>

        {hatedBrands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hatedBrands.map((brand) => (
              <Badge
                key={brand}
                variant="destructive"
                className="px-3 py-1 flex items-center gap-2"
              >
                {brand}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setHatedBrands(hatedBrands.filter((b) => b !== brand))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Never Again List */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">
            5
          </span>
          &quot;Never Again&quot; List
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </h3>
        <p className="text-sm text-muted-foreground font-display">
          Specific styles or items you never want to wear again
        </p>

        <div className="flex gap-2">
          <Input
            value={neverAgainInput}
            onChange={(e) => setNeverAgainInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNeverAgain())}
            placeholder="e.g., Bodycon dresses, Low back, Loud prints"
            className="rounded-full"
          />
          <Button type="button" onClick={addNeverAgain} variant="outline" className="rounded-full">
            Add
          </Button>
        </div>

        {neverAgainList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {neverAgainList.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="px-3 py-1 flex items-center gap-2"
              >
                {item}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => setNeverAgainList(neverAgainList.filter((i) => i !== item))}
                />
              </Badge>
            ))}
          </div>
        )}
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
