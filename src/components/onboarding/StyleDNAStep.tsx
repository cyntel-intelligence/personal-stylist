"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
  "Classic", "Modern", "Edgy", "Romantic", "Bohemian", "Minimalist",
  "Glamorous", "Preppy", "Vintage", "Trendy", "Elegant", "Casual",
  "Feminine", "Androgynous", "Sporty", "Sophisticated", "Eclectic"
];

export function StyleDNAStep({ initialData, onComplete, onBack }: Props) {
  const [styleWords, setStyleWords] = useState<string[]>(initialData.styleDNA?.styleWords || []);
  const [lovedBrands, setLovedBrands] = useState<string[]>(initialData.styleDNA?.lovedBrands || []);
  const [hatedBrands, setHatedBrands] = useState<string[]>(initialData.styleDNA?.hatedBrands || []);
  const [neverAgainList, setNeverAgainList] = useState<string[]>(initialData.styleDNA?.neverAgainList || []);

  const [dressMin, setDressMin] = useState(initialData.styleDNA?.priceRanges?.dresses.min || 50);
  const [dressMax, setDressMax] = useState(initialData.styleDNA?.priceRanges?.dresses.max || 200);
  const [shoesMin, setShoesMin] = useState(initialData.styleDNA?.priceRanges?.shoes.min || 30);
  const [shoesMax, setShoesMax] = useState(initialData.styleDNA?.priceRanges?.shoes.max || 150);
  const [bagsMin, setBagsMin] = useState(initialData.styleDNA?.priceRanges?.bags.min || 40);
  const [bagsMax, setBagsMax] = useState(initialData.styleDNA?.priceRanges?.bags.max || 200);
  const [jewelryMin, setJewelryMin] = useState(initialData.styleDNA?.priceRanges?.jewelry.min || 20);
  const [jewelryMax, setJewelryMax] = useState(initialData.styleDNA?.priceRanges?.jewelry.max || 100);

  const [brandInput, setBrandInput] = useState("");
  const [hatedBrandInput, setHatedBrandInput] = useState("");
  const [neverAgainInput, setNeverAgainInput] = useState("");

  const toggleStyleWord = (word: string) => {
    if (styleWords.includes(word)) {
      setStyleWords(styleWords.filter(w => w !== word));
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
          dresses: { min: dressMin, max: dressMax },
          shoes: { min: shoesMin, max: shoesMax },
          bags: { min: bagsMin, max: bagsMax },
          jewelry: { min: jewelryMin, max: jewelryMax },
        },
        neverAgainList,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Style Words */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Your Style in 5 Words</h3>
          <p className="text-sm text-gray-600">
            Choose up to 5 words that describe your style ({styleWords.length}/5 selected)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STYLE_WORD_OPTIONS.map((word) => (
            <Badge
              key={word}
              variant={styleWords.includes(word) ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => toggleStyleWord(word)}
            >
              {word}
            </Badge>
          ))}
        </div>
      </div>

      {/* Loved Brands */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Brands You Love</h3>
          <p className="text-sm text-gray-600">Add brands you consistently enjoy wearing</p>
        </div>

        <div className="flex gap-2">
          <Input
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLovedBrand())}
            placeholder="e.g., Zara, Reformation, Everlane"
          />
          <Button type="button" onClick={addLovedBrand}>Add</Button>
        </div>

        {lovedBrands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {lovedBrands.map((brand) => (
              <Badge key={brand} variant="secondary" className="px-3 py-1">
                {brand}
                <X
                  className="ml-2 h-3 w-3 cursor-pointer"
                  onClick={() => setLovedBrands(lovedBrands.filter(b => b !== brand))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Hated Brands */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Brands to Avoid</h3>
          <p className="text-sm text-gray-600">Brands that don't fit your style or body</p>
        </div>

        <div className="flex gap-2">
          <Input
            value={hatedBrandInput}
            onChange={(e) => setHatedBrandInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHatedBrand())}
            placeholder="e.g., Forever 21, H&M"
          />
          <Button type="button" onClick={addHatedBrand}>Add</Button>
        </div>

        {hatedBrands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hatedBrands.map((brand) => (
              <Badge key={brand} variant="destructive" className="px-3 py-1">
                {brand}
                <X
                  className="ml-2 h-3 w-3 cursor-pointer"
                  onClick={() => setHatedBrands(hatedBrands.filter(b => b !== brand))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Price Ranges */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Your Budget</h3>
          <p className="text-sm text-gray-600">Set your comfortable price range for each category</p>
        </div>

        <div className="grid gap-4">
          {[
            { label: "Dresses", min: dressMin, max: dressMax, setMin: setDressMin, setMax: setDressMax },
            { label: "Shoes", min: shoesMin, max: shoesMax, setMin: setShoesMin, setMax: setShoesMax },
            { label: "Bags", min: bagsMin, max: bagsMax, setMin: setBagsMin, setMax: setBagsMax },
            { label: "Jewelry", min: jewelryMin, max: jewelryMax, setMin: setJewelryMin, setMax: setJewelryMax },
          ].map((category) => (
            <div key={category.label} className="space-y-2">
              <Label>{category.label}</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={category.min}
                    onChange={(e) => category.setMin(Number(e.target.value))}
                    min="0"
                    step="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Min: ${category.min}</p>
                </div>
                <span className="text-gray-400">to</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={category.max}
                    onChange={(e) => category.setMax(Number(e.target.value))}
                    min={category.min}
                    step="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: ${category.max}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Never Again List */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">"Never Again" List</h3>
          <p className="text-sm text-gray-600">Specific styles or items you never want to wear again</p>
        </div>

        <div className="flex gap-2">
          <Input
            value={neverAgainInput}
            onChange={(e) => setNeverAgainInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNeverAgain())}
            placeholder="e.g., Bodycon dresses, Low back, Loud prints"
          />
          <Button type="button" onClick={addNeverAgain}>Add</Button>
        </div>

        {neverAgainList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {neverAgainList.map((item) => (
              <Badge key={item} variant="outline" className="px-3 py-1">
                {item}
                <X
                  className="ml-2 h-3 w-3 cursor-pointer"
                  onClick={() => setNeverAgainList(neverAgainList.filter(i => i !== item))}
                />
              </Badge>
            ))}
          </div>
        )}
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
