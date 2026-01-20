"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, PartyPopper, Sun, MapPin, Check } from "lucide-react";
import { LifestyleProfile } from "@/types/user";

type LifestyleStepData = {
  lifestyleProfile?: LifestyleProfile;
};

type Props = {
  initialData: Partial<LifestyleStepData>;
  onComplete: (data: LifestyleStepData) => void;
  onBack: () => void;
};

const workEnvironmentOptions = [
  {
    value: "corporate",
    label: "Corporate",
    icon: "🏢",
    desc: "Traditional office, formal dress code",
  },
  {
    value: "business-casual",
    label: "Business Casual",
    icon: "👔",
    desc: "Professional but relaxed dress code",
  },
  {
    value: "creative",
    label: "Creative",
    icon: "🎨",
    desc: "Artistic environment, flexible dress",
  },
  {
    value: "remote",
    label: "Remote/WFH",
    icon: "🏠",
    desc: "Work from home, video calls",
  },
  {
    value: "active",
    label: "Active/On-feet",
    icon: "👟",
    desc: "Healthcare, retail, hospitality",
  },
  {
    value: "varied",
    label: "Varied/Hybrid",
    icon: "🔄",
    desc: "Mix of settings and dress codes",
  },
];

const socialLifestyleOptions = [
  {
    value: "frequent-events",
    label: "Social Butterfly",
    icon: "🦋",
    desc: "Frequent events, parties, and gatherings",
  },
  {
    value: "occasional-outings",
    label: "Selective Socialite",
    icon: "✨",
    desc: "Special occasions and planned outings",
  },
  {
    value: "active-social",
    label: "Active & Social",
    icon: "🏃‍♀️",
    desc: "Sports, fitness, outdoor activities",
  },
  {
    value: "homebody",
    label: "Cozy Homebody",
    icon: "🏡",
    desc: "Prefer intimate gatherings and comfort",
  },
];

const occasionOptions = [
  { value: "weddings", label: "Weddings", icon: "💒" },
  { value: "galas", label: "Galas & Black Tie", icon: "🎭" },
  { value: "cocktail-parties", label: "Cocktail Parties", icon: "🍸" },
  { value: "date-nights", label: "Date Nights", icon: "💕" },
  { value: "brunches", label: "Brunches", icon: "🥂" },
  { value: "business-dinners", label: "Business Dinners", icon: "🍽️" },
  { value: "travel", label: "Travel & Vacation", icon: "✈️" },
  { value: "concerts", label: "Concerts & Shows", icon: "🎵" },
  { value: "outdoor-events", label: "Outdoor Events", icon: "🌳" },
  { value: "holiday-parties", label: "Holiday Parties", icon: "🎄" },
  { value: "baby-showers", label: "Showers & Celebrations", icon: "🎀" },
  { value: "religious-services", label: "Religious Services", icon: "⛪" },
];

const climateOptions = [
  { value: "hot", label: "Hot & Humid", icon: "☀️", desc: "Year-round warm weather" },
  { value: "cold", label: "Cold & Snowy", icon: "❄️", desc: "Long winters, cold temps" },
  { value: "mild", label: "Mild & Temperate", icon: "🌤️", desc: "Moderate year-round" },
  { value: "seasonal", label: "Four Seasons", icon: "🍂", desc: "Distinct seasons" },
];

export function LifestyleStep({ initialData, onComplete, onBack }: Props) {
  const [workEnvironment, setWorkEnvironment] = useState<LifestyleProfile["workEnvironment"] | undefined>(
    initialData.lifestyleProfile?.workEnvironment
  );
  const [workDressCode, setWorkDressCode] = useState(
    initialData.lifestyleProfile?.workDressCode || ""
  );
  const [socialLifestyle, setSocialLifestyle] = useState<LifestyleProfile["socialLifestyle"] | undefined>(
    initialData.lifestyleProfile?.socialLifestyle
  );
  const [typicalOccasions, setTypicalOccasions] = useState<string[]>(
    initialData.lifestyleProfile?.typicalOccasions || []
  );
  const [climate, setClimate] = useState<LifestyleProfile["climate"] | undefined>(
    initialData.lifestyleProfile?.climate
  );
  const [city, setCity] = useState(initialData.lifestyleProfile?.location?.city || "");
  const [state, setState] = useState(initialData.lifestyleProfile?.location?.state || "");

  const toggleOccasion = (value: string) => {
    setTypicalOccasions((prev) =>
      prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workEnvironment || !socialLifestyle || !climate) return;

    onComplete({
      lifestyleProfile: {
        workEnvironment,
        workDressCode: workDressCode || undefined,
        socialLifestyle,
        typicalOccasions,
        climate,
        location: city || state ? { city: city || undefined, state: state || undefined } : undefined,
      },
    });
  };

  const isValid = workEnvironment && socialLifestyle && climate;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
          <Briefcase className="h-8 w-8 text-blush" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Your Lifestyle</h2>
        <p className="text-muted-foreground font-display">
          Tell us about your daily life so we can recommend the right pieces
        </p>
      </div>

      {/* Work Environment */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">1</span>
          Work Environment
        </h3>
        <p className="text-sm text-muted-foreground font-display">Where do you spend your weekdays?</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {workEnvironmentOptions.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                workEnvironment === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setWorkEnvironment(option.value as LifestyleProfile["workEnvironment"])}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workEnvironment && (
          <div className="mt-4">
            <Label htmlFor="workDressCode" className="text-sm">Any specific dress code notes? (Optional)</Label>
            <Input
              id="workDressCode"
              value={workDressCode}
              onChange={(e) => setWorkDressCode(e.target.value)}
              placeholder="e.g., No jeans, closed-toe shoes required"
              className="rounded-full mt-2"
            />
          </div>
        )}
      </div>

      {/* Social Lifestyle */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">2</span>
          Social Life
        </h3>
        <p className="text-sm text-muted-foreground font-display">How would you describe your social calendar?</p>

        <div className="grid grid-cols-2 gap-3">
          {socialLifestyleOptions.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                socialLifestyle === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setSocialLifestyle(option.value as LifestyleProfile["socialLifestyle"])}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Typical Occasions */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">3</span>
          Occasions You Attend
          <PartyPopper className="h-4 w-4 text-blush" />
        </h3>
        <p className="text-sm text-muted-foreground font-display">Select all that apply to your lifestyle</p>

        <div className="flex flex-wrap gap-2">
          {occasionOptions.map((option) => {
            const isSelected = typicalOccasions.includes(option.value);
            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOccasion(option.value)}
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

      {/* Climate */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">4</span>
          Your Climate
          <Sun className="h-4 w-4 text-blush" />
        </h3>
        <p className="text-sm text-muted-foreground font-display">What&apos;s the weather like where you live?</p>

        <div className="grid grid-cols-2 gap-3">
          {climateOptions.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 ${
                climate === option.value
                  ? "shadow-luxe-lg border-primary bg-blush"
                  : "shadow-luxe hover:shadow-luxe-lg border-border"
              }`}
              onClick={() => setClimate(option.value as LifestyleProfile["climate"])}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground font-display mt-1">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blush text-blush text-xs flex items-center justify-center font-medium">5</span>
          Location
          <MapPin className="h-4 w-4 text-blush" />
          <span className="text-xs font-normal text-muted-foreground font-display">(Optional)</span>
        </h3>
        <p className="text-sm text-muted-foreground font-display">Helps us suggest weather-appropriate outfits</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Austin"
              className="rounded-full"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., Texas"
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} className="rounded-full">
          Back
        </Button>
        <Button
          type="submit"
          disabled={!isValid}
          className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
