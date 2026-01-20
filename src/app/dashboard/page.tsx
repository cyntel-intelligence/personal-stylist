"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { closetService, eventService, recommendationService } from "@/lib/firebase/firestore";
import Link from "next/link";

interface DashboardStats {
  closetItems: number;
  upcomingEvents: number;
  recommendations: number;
}

export default function DashboardPage() {
  const { user, userProfile, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    closetItems: 0,
    upcomingEvents: 0,
    recommendations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.uid) return;

      try {
        // Fetch closet items, events, and recommendations in parallel
        const [closetItems, events, recommendationCount] = await Promise.all([
          closetService.getUserCloset(user.uid),
          eventService.getUserEvents(user.uid),
          recommendationService.getUserRecommendationCount(user.uid),
        ]);

        // Count upcoming events (events with dates in the future)
        const now = new Date();
        const upcomingEvents = events.filter(event => {
          const eventDate = event.dateTime?.toDate?.() || new Date(0);
          return eventDate > now;
        });

        setStats({
          closetItems: closetItems.length,
          upcomingEvents: upcomingEvents.length,
          recommendations: recommendationCount,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.uid]);

  const handleSignOut = async () => {
    await signOut();
  };

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
              <Link href="/dashboard/events" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                Events
              </Link>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-muted-foreground">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        {/* Welcome Header */}
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-blush font-medium mb-2">
            Welcome back
          </p>
          <h1 className="text-4xl md:text-5xl mb-3">
            {userProfile?.displayName || user?.displayName}
          </h1>
          <p className="text-lg font-display text-muted-foreground">
            Your personalized styling awaits
          </p>
        </div>

        {/* Profile Completion Notice */}
        {userProfile && !userProfile.onboardingCompleted && (
          <Card className="mb-10 border-blush/30 bg-blush shadow-luxe">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Complete Your Style Profile</CardTitle>
              <CardDescription className="font-display text-base">
                Tell us about your preferences so we can curate the perfect looks for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8">
                <a href="/onboarding">Complete Profile</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {userProfile && userProfile.onboardingCompleted && (
          <div className="grid grid-cols-3 gap-6 mb-12">
            <Card className="bg-card border-border shadow-luxe text-center py-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl font-serif text-gradient-luxe">
                  {loading ? "..." : stats.closetItems}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Closet Items</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-luxe text-center py-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl font-serif text-gradient-luxe">
                  {loading ? "..." : stats.upcomingEvents}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Upcoming Events</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-luxe text-center py-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl font-serif text-gradient-luxe">
                  {loading ? "..." : stats.recommendations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Recommendations</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Feature Cards */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-blush font-medium mb-6">
            Your Style Hub
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Events Card */}
          <Card className="group bg-card border-border shadow-luxe hover:shadow-luxe-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-blush flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <CardTitle className="font-serif text-xl">Upcoming Events</CardTitle>
              <CardDescription className="font-display text-base">
                Plan stunning outfits for every occasion on your calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full btn-luxe bg-gradient-luxe border-0 rounded-full" asChild>
                <a href="/dashboard/events">View Events</a>
              </Button>
            </CardContent>
          </Card>

          {/* Closet Card */}
          <Card className="group bg-card border-border shadow-luxe hover:shadow-luxe-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-blush flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <CardTitle className="font-serif text-xl">Your Closet</CardTitle>
              <CardDescription className="font-display text-base">
                Curate and organize your wardrobe essentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full btn-luxe bg-gradient-luxe border-0 rounded-full" asChild>
                <a href="/dashboard/closet">View Closet</a>
              </Button>
            </CardContent>
          </Card>

          {/* Shopping Card */}
          <Card className="group bg-card border-border shadow-luxe hover:shadow-luxe-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-blush flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <CardTitle className="font-serif text-xl">Shop Your Style</CardTitle>
              <CardDescription className="font-display text-base">
                Browse and purchase your curated recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full btn-luxe bg-gradient-luxe border-0 rounded-full" asChild>
                <a href="/dashboard/shopping">Start Shopping</a>
              </Button>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="group bg-card border-border shadow-luxe hover:shadow-luxe-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-blush flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <CardTitle className="font-serif text-xl">Style Preferences</CardTitle>
              <CardDescription className="font-display text-base">
                Refine your profile and styling preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full rounded-full" variant="outline" asChild>
                <a href="/dashboard/settings">Edit Profile</a>
              </Button>
            </CardContent>
          </Card>

          {/* Virtual Try-On Card - Coming Soon */}
          <Card className="group bg-card border-border shadow-luxe overflow-hidden opacity-75">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <CardTitle className="font-serif text-xl text-muted-foreground">Virtual Try-On</CardTitle>
              <CardDescription className="font-display text-base">
                See how outfits look on you before purchasing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full rounded-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Trip Planning Card - Coming Soon */}
          <Card className="group bg-card border-border shadow-luxe overflow-hidden opacity-75">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <CardTitle className="font-serif text-xl text-muted-foreground">Trip Planning</CardTitle>
              <CardDescription className="font-display text-base">
                Pack perfectly for every destination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full rounded-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
