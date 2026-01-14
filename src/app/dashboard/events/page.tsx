"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { eventService } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadEvents = async () => {
      try {
        const userEvents = await eventService.getUserEvents(user.uid);
        setEvents(userEvents);
      } catch (error) {
        console.error("Error loading events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user]);

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "planning":
        return "bg-gray-200 text-gray-800";
      case "generating-recommendations":
        return "bg-blue-200 text-blue-800";
      case "recommendations-ready":
        return "bg-green-200 text-green-800";
      case "outfit-selected":
        return "bg-purple-200 text-purple-800";
      case "completed":
        return "bg-gray-300 text-gray-600";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusLabel = (status: Event["status"]) => {
    switch (status) {
      case "planning":
        return "Planning";
      case "generating-recommendations":
        return "Generating...";
      case "recommendations-ready":
        return "Ready to View";
      case "outfit-selected":
        return "Outfit Selected";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-2">Plan outfits for your upcoming occasions</p>
          </div>
          <Button onClick={() => router.push("/dashboard/events/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first event to get personalized outfit recommendations
              </p>
              <Button onClick={() => router.push("/dashboard/events/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/events/${event.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl capitalize">
                      {event.eventType === "other"
                        ? event.customEventType
                        : event.eventType.replace("-", " ")}
                    </CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusLabel(event.status)}
                    </Badge>
                  </div>
                  <CardDescription>{event.dressCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {format(event.dateTime.toDate(), "MMMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(event.dateTime.toDate(), "h:mm a")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {event.location.city}, {event.location.state}
                        </div>
                        {event.location.venue && (
                          <div className="text-xs text-gray-500">{event.location.venue}</div>
                        )}
                      </div>
                    </div>

                    {event.weather && (
                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">{event.weather.temperature}°F</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {event.weather.conditions}
                          </div>
                        </div>
                      </div>
                    )}

                    {event.status === "recommendations-ready" && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-green-700 font-medium">
                          {event.recommendationIds.length} outfit recommendations ready!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
