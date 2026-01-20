"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";

type VisualStyleQuizData = {
  visualStyleQuiz?: {
    selectedOutfits: string[];
    styleProfile: {
      primary: string;
      secondary?: string;
      confidence: number;
    };
  };
};

type Props = {
  initialData: Partial<VisualStyleQuizData>;
  onComplete: (data: VisualStyleQuizData) => void;
  onBack: () => void;
};

// Outfit options with style tags for analysis
const outfitOptions = [
  {
    id: "classic-blazer",
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=500&fit=crop",
    styles: ["classic", "sophisticated", "professional"],
    alt: "Classic tailored blazer outfit",
  },
  {
    id: "boho-maxi",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
    styles: ["bohemian", "romantic", "feminine"],
    alt: "Flowy bohemian maxi dress",
  },
  {
    id: "edgy-leather",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop",
    styles: ["edgy", "modern", "bold"],
    alt: "Edgy leather jacket look",
  },
  {
    id: "minimalist-neutral",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
    styles: ["minimalist", "modern", "clean"],
    alt: "Minimalist neutral outfit",
  },
  {
    id: "glamorous-sequin",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
    styles: ["glamorous", "bold", "statement"],
    alt: "Glamorous sequin dress",
  },
  {
    id: "preppy-stripe",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop",
    styles: ["preppy", "classic", "polished"],
    alt: "Preppy striped outfit",
  },
  {
    id: "romantic-floral",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
    styles: ["romantic", "feminine", "soft"],
    alt: "Romantic floral dress",
  },
  {
    id: "sporty-athleisure",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=500&fit=crop",
    styles: ["sporty", "casual", "modern"],
    alt: "Sporty athleisure look",
  },
  {
    id: "vintage-retro",
    image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&h=500&fit=crop",
    styles: ["vintage", "eclectic", "unique"],
    alt: "Vintage retro inspired outfit",
  },
  {
    id: "elegant-cocktail",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop",
    styles: ["elegant", "sophisticated", "glamorous"],
    alt: "Elegant cocktail dress",
  },
  {
    id: "casual-denim",
    image: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=400&h=500&fit=crop",
    styles: ["casual", "relaxed", "effortless"],
    alt: "Casual denim look",
  },
  {
    id: "trendy-statement",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop",
    styles: ["trendy", "bold", "fashion-forward"],
    alt: "Trendy statement piece outfit",
  },
];

// Style definitions with descriptions
const styleDefinitions: Record<string, { label: string; description: string }> = {
  classic: { label: "Classic", description: "Timeless, refined pieces that never go out of style" },
  sophisticated: { label: "Sophisticated", description: "Polished and put-together with elegant details" },
  bohemian: { label: "Bohemian", description: "Free-spirited, flowing silhouettes with artistic flair" },
  romantic: { label: "Romantic", description: "Soft, feminine pieces with delicate details" },
  edgy: { label: "Edgy", description: "Bold, unconventional pieces that make a statement" },
  modern: { label: "Modern", description: "Contemporary, sleek designs with clean lines" },
  minimalist: { label: "Minimalist", description: "Simple, pared-back elegance with quality basics" },
  glamorous: { label: "Glamorous", description: "Luxurious, show-stopping pieces for special moments" },
  preppy: { label: "Preppy", description: "Polished, collegiate-inspired with classic patterns" },
  feminine: { label: "Feminine", description: "Soft shapes, pretty colors, and girly details" },
  sporty: { label: "Sporty", description: "Athletic-inspired comfort meets casual style" },
  casual: { label: "Casual", description: "Effortless, comfortable pieces for everyday" },
  vintage: { label: "Vintage", description: "Retro-inspired pieces with nostalgic charm" },
  elegant: { label: "Elegant", description: "Graceful, refined looks for formal occasions" },
  trendy: { label: "Trendy", description: "Fashion-forward, of-the-moment styles" },
  bold: { label: "Bold", description: "Eye-catching pieces that stand out from the crowd" },
};

function analyzeStyleProfile(selectedIds: string[]): { primary: string; secondary?: string; confidence: number } {
  // Count style occurrences
  const styleCounts: Record<string, number> = {};

  selectedIds.forEach((id) => {
    const outfit = outfitOptions.find((o) => o.id === id);
    if (outfit) {
      outfit.styles.forEach((style) => {
        styleCounts[style] = (styleCounts[style] || 0) + 1;
      });
    }
  });

  // Sort by count
  const sortedStyles = Object.entries(styleCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([style]) => style);

  const primary = sortedStyles[0] || "classic";
  const secondary = sortedStyles[1] !== primary ? sortedStyles[1] : sortedStyles[2];

  // Calculate confidence based on how dominant the primary style is
  const totalSelections = selectedIds.length;
  const primaryCount = styleCounts[primary] || 0;
  const confidence = Math.min(100, Math.round((primaryCount / (totalSelections * 2)) * 100));

  return { primary, secondary, confidence };
}

export function VisualStyleQuizStep({ initialData, onComplete, onBack }: Props) {
  const [selectedOutfits, setSelectedOutfits] = useState<string[]>(
    initialData.visualStyleQuiz?.selectedOutfits || []
  );
  const [showResults, setShowResults] = useState(false);

  const toggleOutfit = (id: string) => {
    setSelectedOutfits((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedOutfits.length < 3) return;

    const styleProfile = analyzeStyleProfile(selectedOutfits);
    setShowResults(true);

    // Short delay to show results before continuing
    setTimeout(() => {
      onComplete({
        visualStyleQuiz: {
          selectedOutfits,
          styleProfile,
        },
      });
    }, 2000);
  };

  const styleProfile = analyzeStyleProfile(selectedOutfits);
  const primaryStyle = styleDefinitions[styleProfile.primary];
  const secondaryStyle = styleProfile.secondary ? styleDefinitions[styleProfile.secondary] : null;

  if (showResults) {
    return (
      <div className="text-center py-12 space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-gradient-luxe flex items-center justify-center mx-auto">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-serif mb-2">Your Style DNA</h2>
          <p className="text-muted-foreground font-display">Based on your selections</p>
        </div>
        <div className="space-y-4">
          <div className="inline-block px-6 py-3 bg-blush rounded-full">
            <span className="text-xl font-serif text-gradient-luxe">{primaryStyle?.label}</span>
          </div>
          <p className="text-muted-foreground font-display max-w-md mx-auto">
            {primaryStyle?.description}
          </p>
          {secondaryStyle && (
            <p className="text-sm text-muted-foreground font-display">
              with hints of <span className="text-blush font-medium">{secondaryStyle.label}</span>
            </p>
          )}
        </div>
        <div className="pt-4">
          <div className="text-sm text-muted-foreground font-display">Loading next step...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-blush" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Style Quiz</h2>
        <p className="text-muted-foreground font-display">
          Select the outfits that speak to you
        </p>
        <p className="text-sm text-muted-foreground font-display mt-2">
          Choose at least 3 (the more the better!)
        </p>
      </div>

      {/* Selection count */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blush rounded-full">
          <span className="font-display text-sm">
            {selectedOutfits.length} selected
          </span>
          {selectedOutfits.length >= 3 && (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </div>
      </div>

      {/* Outfit Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {outfitOptions.map((outfit) => {
          const isSelected = selectedOutfits.includes(outfit.id);
          return (
            <Card
              key={outfit.id}
              className={`cursor-pointer overflow-hidden transition-all duration-300 ${
                isSelected
                  ? "ring-2 ring-primary shadow-luxe-lg scale-[1.02]"
                  : "shadow-luxe hover:shadow-luxe-lg hover:scale-[1.01]"
              }`}
              onClick={() => toggleOutfit(outfit.id)}
            >
              <CardContent className="p-0 relative aspect-[4/5]">
                <Image
                  src={outfit.image}
                  alt={outfit.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Style Preview */}
      {selectedOutfits.length >= 2 && (
        <Card className="shadow-luxe border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-display mb-2">Your emerging style:</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blush rounded-full text-sm font-medium">
                  {primaryStyle?.label}
                </span>
                {secondaryStyle && (
                  <>
                    <span className="text-muted-foreground">+</span>
                    <span className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {secondaryStyle.label}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} className="rounded-full">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedOutfits.length < 3}
          className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8"
        >
          {selectedOutfits.length < 3
            ? `Select ${3 - selectedOutfits.length} more`
            : "See My Style"}
        </Button>
      </div>
    </div>
  );
}
