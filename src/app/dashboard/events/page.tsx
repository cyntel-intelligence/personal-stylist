"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { eventService } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Cloud } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Helper function to safely convert any date format to Date object
const toSafeDate = (value: any): Date => {
  if (!value) return new Date();

  // Check if it's a Firestore Timestamp with toDate method
  if (value.toDate && typeof value.toDate === 'function') {
    return value.toDate();
  }

  // Check if it's already a Date
  if (value instanceof Date) {
    return value;
  }

  // Try to parse as date string or number
  const date = new Date(value);

  // If invalid, return current date as fallback
  if (isNaN(date.getTime())) {
    console.warn('Invalid date value:', value);
    return new Date();
  }

  return date;
};

export default function EventsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
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

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "planning":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Planning</Badge>;
      case "generating-recommendations":
        return <Badge className="bg-blush text-blush border border-primary/30">Generating...</Badge>;
      case "recommendations-ready":
        return <Badge className="bg-gradient-luxe text-white border-0">Ready to View</Badge>;
      case "outfit-selected":
        return <Badge className="bg-accent text-accent-foreground">Outfit Selected</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-display text-muted-foreground">Loading your events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-serif text-xl tracking-tight">
              <span className="text-blush">Personal</span> Stylist
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/dashboard/shopping" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                Shopping
              </Link>
              <Link href="/dashboard/closet" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                Closet
              </Link>
              <Link href="/dashboard/events" className="text-sm text-blush font-medium">
                Events
              </Link>
              <Button onClick={() => signOut()} variant="ghost" size="sm" className="text-muted-foreground">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blush font-medium mb-2">
              Your Calendar
            </p>
            <h1 className="text-4xl md:text-5xl">Upcoming Events</h1>
            <p className="text-lg font-display text-muted-foreground mt-2">
              Plan stunning outfits for every occasion
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/events/new")}
            className="btn-luxe bg-gradient-luxe border-0 rounded-full px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <Card className="shadow-luxe border-border">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-blush flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-blush" />
              </div>
              <h3 className="text-2xl font-serif mb-3">No events yet</h3>
              <p className="text-muted-foreground font-display text-lg mb-8 max-w-md mx-auto">
                Create your first event to receive personalized outfit recommendations curated just for you
              </p>
              <Button
                onClick={() => router.push("/dashboard/events/new")}
                className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="group cursor-pointer shadow-luxe hover:shadow-luxe-lg transition-all duration-300 border-border overflow-hidden"
                onClick={() => router.push(`/dashboard/events/${event.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="font-serif text-xl capitalize">
                      {event.eventType === "other"
                        ? event.customEventType
                        : event.eventType.replace("-", " ")}
                    </CardTitle>
                    {getStatusBadge(event.status)}
                  </div>
                  <CardDescription className="font-display text-base">{event.dressCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blush flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blush" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {format(toSafeDate(event.dateTime), "MMMM d, yyyy")}
                        </div>
                        <div className="text-muted-foreground font-display">
                          {format(toSafeDate(event.dateTime), "h:mm a")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blush flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-blush" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {event.location.city}, {event.location.state}
                        </div>
                        {event.location.venue && (
                          <div className="text-muted-foreground font-display">{event.location.venue}</div>
                        )}
                      </div>
                    </div>

                    {event.weather && (
                      <div className="flex items-start gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-blush flex items-center justify-center flex-shrink-0">
                          <Cloud className="h-4 w-4 text-blush" />
                        </div>
                        <div>
                          <div className="font-medium">{event.weather.temperature}°F</div>
                          <div className="text-muted-foreground font-display capitalize">
                            {event.weather.conditions}
                          </div>
                        </div>
                      </div>
                    )}

                    {event.status === "recommendations-ready" && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-blush font-medium font-display">
                          {event.recommendationIds.length} outfit {event.recommendationIds.length === 1 ? 'recommendation' : 'recommendations'} ready!
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
