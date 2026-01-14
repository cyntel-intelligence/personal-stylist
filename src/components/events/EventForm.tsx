"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  EventType,
  EventFormData,
  dressCodeOptions,
  eventRoleOptions,
} from "@/types/event";

type Props = {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  loading?: boolean;
};

const eventTypeOptions: { value: EventType; label: string; icon: string }[] = [
  { value: "wedding", label: "Wedding", icon: "💍" },
  { value: "formal", label: "Formal Event", icon: "🎩" },
  { value: "cocktail", label: "Cocktail Party", icon: "🍸" },
  { value: "work", label: "Work Event", icon: "💼" },
  { value: "casual", label: "Casual Outing", icon: "👕" },
  { value: "date", label: "Date Night", icon: "💕" },
  { value: "vacation", label: "Vacation", icon: "✈️" },
  { value: "gala", label: "Gala", icon: "✨" },
  { value: "holiday-party", label: "Holiday Party", icon: "🎄" },
  { value: "graduation", label: "Graduation", icon: "🎓" },
  { value: "baby-shower", label: "Baby Shower", icon: "👶" },
  { value: "bridal-shower", label: "Bridal Shower", icon: "👰" },
  { value: "other", label: "Other", icon: "📅" },
];

export function EventForm({ initialData, onSubmit, onCancel, loading }: Props) {
  const [eventType, setEventType] = useState<EventType>(initialData?.eventType || "cocktail");
  const [customEventType, setCustomEventType] = useState(initialData?.customEventType || "");
  const [dressCode, setDressCode] = useState(initialData?.dressCode || "");
  const [city, setCity] = useState(initialData?.location?.city || "");
  const [state, setState] = useState(initialData?.location?.state || "");
  const [venue, setVenue] = useState(initialData?.location?.venue || "");
  const [eventDate, setEventDate] = useState<Date | undefined>(
    initialData?.dateTime ? new Date(initialData.dateTime as any) : undefined
  );
  const [userRole, setUserRole] = useState(initialData?.userRole || "");
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "moderate" | "active">(
    initialData?.activityLevel || "moderate"
  );
  const [shippingDeadline, setShippingDeadline] = useState<Date | undefined>(
    initialData?.shippingDeadline ? new Date(initialData.shippingDeadline as any) : undefined
  );
  const [preferRewear, setPreferRewear] = useState(initialData?.requirements?.preferRewear ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventDate) {
      alert("Please select an event date");
      return;
    }

    if (!shippingDeadline) {
      alert("Please select a shipping deadline");
      return;
    }

    if (!dressCode) {
      alert("Please select a dress code");
      return;
    }

    if (!city || !state) {
      alert("Please enter event location");
      return;
    }

    const formData: any = {
      eventType,
      dressCode,
      location: {
        city,
        state,
      },
      dateTime: eventDate as any,
      userRole,
      activityLevel,
      shippingDeadline: shippingDeadline as any,
      requirements: {
        mustUseClosetItems: [],
        preferRewear,
      },
      recommendationsGenerated: false,
      recommendationIds: [],
      status: "planning",
    };

    // Only add optional fields if they have values
    if (eventType === "other" && customEventType) {
      formData.customEventType = customEventType;
    }

    if (venue) {
      formData.location.venue = venue;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Event Type */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Event Type</h3>
          <p className="text-sm text-gray-600">What kind of event is this?</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {eventTypeOptions.map((option) => (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                eventType === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}
              onClick={() => setEventType(option.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {eventType === "other" && (
          <div className="mt-4">
            <Label htmlFor="customEventType">Specify Event Type</Label>
            <Input
              id="customEventType"
              value={customEventType}
              onChange={(e) => setCustomEventType(e.target.value)}
              placeholder="e.g., Charity fundraiser, Book club meeting"
              required
            />
          </div>
        )}
      </div>

      {/* Dress Code */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Dress Code</h3>
          <p className="text-sm text-gray-600">What's the expected attire?</p>
        </div>

        <Select value={dressCode} onValueChange={setDressCode} required>
          <SelectTrigger>
            <SelectValue placeholder="Select dress code" />
          </SelectTrigger>
          <SelectContent>
            {dressCodeOptions.map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Event Location</h3>
          <p className="text-sm text-gray-600">Where is the event taking place?</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., San Francisco"
              required
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., CA"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="venue">Venue (Optional)</Label>
          <Input
            id="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g., The Ritz-Carlton"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Event Date</h3>
          <p className="text-sm text-gray-600">When is the event?</p>
        </div>

        <div>
          <Label htmlFor="eventDate">Date</Label>
          <Input
            id="eventDate"
            type="date"
            value={eventDate ? format(eventDate, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value + "T00:00:00") : undefined;
              setEventDate(date);
            }}
            required
          />
        </div>
      </div>

      {/* Your Role */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Your Role</h3>
          <p className="text-sm text-gray-600">What's your role at this event?</p>
        </div>

        <Select value={userRole} onValueChange={setUserRole} required>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {eventRoleOptions.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Level */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Activity Level</h3>
          <p className="text-sm text-gray-600">How active will you be?</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "sedentary", label: "Sedentary", desc: "Mostly sitting" },
            { value: "moderate", label: "Moderate", desc: "Some movement" },
            { value: "active", label: "Active", desc: "Lots of movement" },
          ].map((option) => (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-all",
                activityLevel === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}
              onClick={() => setActivityLevel(option.value as any)}
            >
              <CardContent className="p-4 text-center">
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-600">{option.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Shipping Deadline */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Shipping Deadline</h3>
          <p className="text-sm text-gray-600">Latest date to receive items by</p>
        </div>

        <div>
          <Label htmlFor="shippingDeadline">Deadline</Label>
          <Input
            id="shippingDeadline"
            type="date"
            value={shippingDeadline ? format(shippingDeadline, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value + "T00:00:00") : undefined;
              setShippingDeadline(date);
            }}
            required
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Preferences</h3>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label>Prefer to rewear existing items</Label>
            <p className="text-xs text-gray-500">Prioritize items from your closet</p>
          </div>
          <Switch checked={preferRewear} onCheckedChange={setPreferRewear} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating Event..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
