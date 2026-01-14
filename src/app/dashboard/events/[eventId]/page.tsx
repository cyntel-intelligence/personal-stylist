"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { eventService } from "@/lib/firebase/firestore";
import { fetchWeather, getWeatherDescription, getTemperatureGuidance, getStyleSuggestions } from "@/lib/weather/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, User, Activity, Sparkles, Cloud, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    if (!user || !eventId) return;

    const loadEvent = async () => {
      try {
        const eventData = await eventService.getEvent(eventId);
        if (eventData && eventData.userId === user.uid) {
          setEvent(eventData);
        } else {
          toast.error("Event not found");
          router.push("/dashboard/events");
        }
      } catch (error) {
        console.error("Error loading event:", error);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [user, eventId, router]);

  const handleFetchWeather = async () => {
    if (!event) return;

    setLoadingWeather(true);
    try {
      const weatherData = await fetchWeather(event.location.city, event.location.state);

      await eventService.updateEvent(eventId, {
        weather: {
          temperature: weatherData.temperature,
          conditions: weatherData.conditions,
          humidity: weatherData.humidity,
          feelsLike: weatherData.feelsLike,
          windSpeed: weatherData.windSpeed,
          lastFetched: Timestamp.now(),
        } as any,
      });

      // Reload event data
      const updatedEvent = await eventService.getEvent(eventId);
      if (updatedEvent) {
        setEvent(updatedEvent);
        toast.success("Weather data updated!");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast.error("Failed to fetch weather data");
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!user || !event) return;

    // Update local state optimistically
    setEvent({ ...event, status: "generating-recommendations" });
    toast.info("Generating your personalized outfit recommendations...");

    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate recommendations");
      }

      const data = await response.json();
      toast.success(`Generated ${data.count} outfit recommendations!`);

      // Reload event to see updated status
      const updatedEvent = await eventService.getEvent(eventId);
      if (updatedEvent) {
        setEvent(updatedEvent);
      }

      // Navigate to recommendations page
      router.push(`/dashboard/events/${eventId}/recommendations`);

    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate recommendations");

      // Reload event to restore correct status
      const updatedEvent = await eventService.getEvent(eventId);
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/dashboard/events")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {event.eventType === "other" ? event.customEventType : event.eventType.replace("-", " ")}
              </h1>
              <p className="text-gray-600 mt-2">{event.dressCode}</p>
            </div>
            <Badge className={`text-sm px-4 py-2 ${
              event.status === "planning" ? "bg-gray-200 text-gray-800" :
              event.status === "recommendations-ready" ? "bg-green-200 text-green-800" :
              "bg-blue-200 text-blue-800"
            }`}>
              {event.status.replace("-", " ")}
            </Badge>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Date & Time</div>
                <div className="font-medium">
                  {format(event.dateTime.toDate(), "EEEE, MMMM d, yyyy")}
                </div>
                <div className="text-sm text-gray-600">
                  {format(event.dateTime.toDate(), "h:mm a")}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                <div className="font-medium">
                  {event.location.city}, {event.location.state}
                </div>
                {event.location.venue && (
                  <div className="text-sm text-gray-600">{event.location.venue}</div>
                )}
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Role
                </div>
                <div className="font-medium">{event.userRole}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Level
                </div>
                <div className="font-medium capitalize">{event.activityLevel}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Shipping Deadline
                </div>
                <div className="font-medium">
                  {format(event.shippingDeadline.toDate(), "MMMM d, yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather Forecast
              </CardTitle>
              <CardDescription>Expected conditions for your event</CardDescription>
            </CardHeader>
            <CardContent>
              {!event.weather ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Weather data not yet fetched</p>
                  <Button onClick={handleFetchWeather} disabled={loadingWeather}>
                    {loadingWeather ? "Fetching..." : "Fetch Weather"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-blue-600">
                      {event.weather.temperature}°F
                    </div>
                    <div className="text-xl capitalize mt-2">{event.weather.conditions}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {getWeatherDescription(event.weather.conditions, event.weather.temperature)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Humidity: {event.weather.humidity}%
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-sm font-semibold mb-2">Temperature Guidance</div>
                    <ul className="space-y-1">
                      {getTemperatureGuidance(event.weather.temperature).map((guidance, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {guidance}</li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-sm font-semibold mb-2">Style Suggestions</div>
                    <ul className="space-y-1">
                      {getStyleSuggestions(event.weather as any).map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFetchWeather}
                      disabled={loadingWeather}
                      className="w-full"
                    >
                      {loadingWeather ? "Refreshing..." : "Refresh Weather"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Outfit Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered outfit suggestions based on your event details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {event.status === "planning" ? (
              <div className="text-center py-8">
                <Alert className="mb-4">
                  <AlertDescription>
                    {!event.weather
                      ? "Fetch weather data first to get the most accurate recommendations."
                      : "Ready to generate personalized outfit recommendations!"}
                  </AlertDescription>
                </Alert>
                <Button onClick={handleGenerateRecommendations} size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Recommendations
                </Button>
              </div>
            ) : event.status === "generating-recommendations" ? (
              <div className="text-center py-8">
                <div className="text-lg font-medium mb-2">Generating recommendations...</div>
                <p className="text-gray-600">This may take a few minutes</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  {event.recommendationIds.length} recommendations available
                </p>
                <Button onClick={() => router.push(`/dashboard/events/${eventId}/recommendations`)}>
                  View Recommendations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
