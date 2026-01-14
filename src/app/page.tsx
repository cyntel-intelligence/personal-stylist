import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Your Personal AI Stylist
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Perfect outfit recommendations powered by AI. Every time.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 py-12">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">👗</div>
              <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">
                Get AI-powered outfit suggestions tailored to your style, body type, and the event
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Virtual Try-On</h3>
              <p className="text-gray-600">
                See how outfits look on you before you buy with our AI try-on feature
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Closet Management</h3>
              <p className="text-gray-600">
                Organize your wardrobe and get suggestions on what to wear
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Value Props */}
          <div className="pt-12 space-y-4 text-gray-600">
            <p>✨ Personalized to your unique style and body type</p>
            <p>🌤️ Weather-aware outfit suggestions</p>
            <p>🛍️ Direct shopping links to your favorite retailers</p>
            <p>💰 Stay within your budget with smart price filtering</p>
          </div>
        </div>
      </div>
    </div>
  );
}
