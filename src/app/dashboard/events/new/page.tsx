"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { EventForm } from "@/components/events/EventForm";
import { EventFormData } from "@/types/event";
import { eventService } from "@/lib/firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        ...data,
        userId: user.uid,
      };
      const eventId = await eventService.createEvent(eventData as any);
      toast.success("Event created successfully!");
      router.push(`/dashboard/events/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/events");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>
              Tell us about your upcoming event and we'll help you find the perfect outfit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
