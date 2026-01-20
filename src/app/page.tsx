import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-cream">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="font-serif text-2xl tracking-tight">
            <span className="text-blush">Personal</span> Stylist
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm tracking-wide hover:text-blush transition-colors">
              Sign In
            </Link>
            <Button asChild size="sm" className="btn-luxe bg-gradient-luxe border-0 rounded-full px-6">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
            AI-Powered Personal Styling
          </p>
          <h1 className="text-5xl md:text-7xl leading-tight">
            Discover Your
            <span className="block text-gradient-luxe">Perfect Look</span>
          </h1>
          <p className="text-xl md:text-2xl font-display text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Curated outfit recommendations tailored to flatter your unique beauty,
            for every occasion in your life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="btn-luxe bg-gradient-luxe border-0 rounded-full px-10 py-6 text-lg">
              <Link href="/signup">Begin Your Style Journey</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-luxe rounded-full px-10 py-6 text-lg border-2">
              <Link href="/login">Welcome Back</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-blush font-medium mb-4">
              The Experience
            </p>
            <h2 className="text-3xl md:text-4xl">Styling, Reimagined</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group p-8 bg-card rounded-2xl shadow-luxe hover:shadow-luxe-lg transition-all duration-300 border border-border">
              <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <h3 className="text-xl mb-3 font-serif">Intelligent Curation</h3>
              <p className="text-muted-foreground font-display text-lg leading-relaxed">
                Our AI understands your body, your style preferences, and what makes you feel beautiful.
              </p>
            </div>

            <div className="group p-8 bg-card rounded-2xl shadow-luxe hover:shadow-luxe-lg transition-all duration-300 border border-border">
              <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-xl mb-3 font-serif">Event-Perfect Styling</h3>
              <p className="text-muted-foreground font-display text-lg leading-relaxed">
                From black-tie galas to casual brunches, we ensure you&apos;re impeccably dressed for every occasion.
              </p>
            </div>

            <div className="group p-8 bg-card rounded-2xl shadow-luxe hover:shadow-luxe-lg transition-all duration-300 border border-border">
              <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="text-xl mb-3 font-serif">Shop with Confidence</h3>
              <p className="text-muted-foreground font-display text-lg leading-relaxed">
                Direct links to your favorite brands. Every recommendation is available to purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm uppercase tracking-[0.3em] text-muted-foreground mb-12">
            Curated from Brands You Love
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-xl md:text-2xl font-display text-muted-foreground/60">
            <span>For Love & Lemons</span>
            <span className="text-blush/30">•</span>
            <span>Free People</span>
            <span className="text-blush/30">•</span>
            <span>Revolve</span>
            <span className="text-blush/30">•</span>
            <span>Show Me Your Mumu</span>
            <span className="text-blush/30">•</span>
            <span>LoveShackFancy</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white/50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-blush font-medium mb-4">
              Your Journey
            </p>
            <h2 className="text-3xl md:text-4xl">Three Steps to Your Best Look</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-luxe text-white flex items-center justify-center mx-auto mb-6 text-xl font-serif">
                  1
                </div>
                <h3 className="text-lg mb-2 font-serif">Tell Us About You</h3>
                <p className="text-muted-foreground font-display">
                  Share your style preferences, measurements, and what makes you feel confident.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-luxe text-white flex items-center justify-center mx-auto mb-6 text-xl font-serif">
                  2
                </div>
                <h3 className="text-lg mb-2 font-serif">Add Your Events</h3>
                <p className="text-muted-foreground font-display">
                  Tell us about your upcoming occasions and we&apos;ll consider every detail.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-luxe text-white flex items-center justify-center mx-auto mb-6 text-xl font-serif">
                  3
                </div>
                <h3 className="text-lg mb-2 font-serif">Receive Your Looks</h3>
                <p className="text-muted-foreground font-display">
                  Get personalized outfit recommendations curated just for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl mb-6">
              Ready to Transform
              <span className="block text-gradient-luxe">Your Wardrobe?</span>
            </h2>
            <p className="text-xl font-display text-muted-foreground mb-10">
              Join thousands of women who&apos;ve discovered their signature style.
            </p>
            <Button asChild size="lg" className="btn-luxe bg-gradient-luxe border-0 rounded-full px-12 py-6 text-lg">
              <Link href="/signup">Start Styling Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-serif text-xl tracking-tight">
              <span className="text-blush">Personal</span> Stylist
            </div>
            <p className="text-sm text-muted-foreground font-display">
              Curating confidence, one outfit at a time.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-blush transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-blush transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
