"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {userProfile?.displayName || user?.displayName}!
            </h1>
            <p className="text-gray-600 mt-2">Your personal styling dashboard</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Profile Completion Notice */}
        {userProfile && !userProfile.onboardingCompleted && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Complete Your Profile</CardTitle>
              <CardDescription className="text-blue-700">
                Finish setting up your profile to get personalized outfit recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/onboarding">Complete Profile</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="text-4xl mb-2">👗</div>
              <CardTitle>Events</CardTitle>
              <CardDescription>Plan outfits for upcoming events</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/events">View Events</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="text-4xl mb-2">👕</div>
              <CardTitle>Closet</CardTitle>
              <CardDescription>Manage your wardrobe</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/closet">View Closet</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="text-4xl mb-2">✨</div>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>AI-powered outfit suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="text-4xl mb-2">📸</div>
              <CardTitle>Virtual Try-On</CardTitle>
              <CardDescription>See outfits on you</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="text-4xl mb-2">🎨</div>
              <CardTitle>Style Board</CardTitle>
              <CardDescription>Save your favorite looks</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="text-4xl mb-2">✈️</div>
              <CardTitle>Trip Planning</CardTitle>
              <CardDescription>Pack perfectly for your trips</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        {userProfile && userProfile.onboardingCompleted && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Closet Items</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Events Planned</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Recommendations</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
