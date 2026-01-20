"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { eventService } from "@/lib/firebase/firestore";
import { EventForm } from "@/components/events/EventForm";
import { EventFormData } from "@/types/event";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<EventFormData | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const eventId = params.eventId as string;

  useEffect(() => {
    if (!user || !eventId) return;

    const loadEvent = async () => {
      try {
        const event = await eventService.getEvent(eventId);
        if (!event) {
          toast.error("Event not found");
          router.push("/dashboard/events");
          return;
        }

        // Check ownership
        if (event.userId !== user.uid) {
          toast.error("You don't have permission to edit this event");
          router.push("/dashboard/events");
          return;
        }

        // Convert event to form data
        setEventData({
          eventType: event.eventType,
          customEventType: event.customEventType,
          dressCode: event.dressCode,
          location: event.location,
          dateTime: event.dateTime,
          userRole: event.userRole,
          activityLevel: event.activityLevel,
          shippingDeadline: event.shippingDeadline,
          requirements: event.requirements,
          recommendationsGenerated: event.recommendationsGenerated,
          recommendationIds: event.recommendationIds,
          status: event.status,
        });
      } catch (error) {
        console.error("Error loading event:", error);
        toast.error("Failed to load event");
        router.push("/dashboard/events");
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [user, eventId, router]);

  const handleSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error("You must be logged in to edit events");
      return;
    }

    setLoading(true);
    try {
      // Build update object, excluding undefined values
      const updateData: any = {
        eventType: data.eventType,
        dressCode: data.dressCode,
        location: data.location,
        dateTime: data.dateTime,
        activityLevel: data.activityLevel,
        requirements: data.requirements,
      };

      // Only include optional fields if they have values
      if (data.customEventType) {
        updateData.customEventType = data.customEventType;
      }

      if (data.shippingDeadline) {
        updateData.shippingDeadline = data.shippingDeadline;
      }

      if (data.userRole) {
        updateData.userRole = data.userRole;
      }

      // Reset status to planning if it was stuck in generating state
      if (eventData?.status === "generating-recommendations") {
        updateData.status = "planning";
        updateData.recommendationsGenerated = false;
        updateData.recommendationIds = [];
      }

      await eventService.updateEvent(eventId, updateData);

      toast.success("Event updated successfully!");
      router.push(`/dashboard/events/${eventId}`);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/events/${eventId}`);
  };

  if (loadingEvent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push(`/dashboard/events/${eventId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Event
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>
            Update your event details. Changes will not affect generated recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm
            initialData={eventData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
