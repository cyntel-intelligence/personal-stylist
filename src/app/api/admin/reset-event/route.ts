import { NextRequest, NextResponse } from "next/server";
import { eventAdminService } from "@/lib/firebase/firestore-admin";

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();

    await eventAdminService.updateEvent(eventId, {
      status: "planning",
      recommendationsGenerated: false,
    });

    return NextResponse.json({ success: true, message: "Event status reset" });
  } catch (error: any) {
    console.error("Error resetting event:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
