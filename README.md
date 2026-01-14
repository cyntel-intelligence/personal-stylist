# Personal Stylist PWA

An AI-powered personal styling application that provides outfit recommendations, virtual try-on capabilities, closet management, and trip planning.

## 🚀 Features

- **AI-Powered Recommendations**: Get personalized outfit suggestions using Claude AI
- **Virtual Try-On**: See how outfits look on you before purchasing
- **Closet Management**: Organize and track your wardrobe
- **Event Planning**: Get outfit recommendations for specific events
- **Trip Planning**: Generate day-by-day outfits for your trips
- **Outfit Comparison**: Compare multiple outfit options with AI ranking
- **Progressive Web App**: Install on mobile devices for native app experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Firebase project
- An Anthropic API key
- (Optional) Weather API key (OpenWeather)
- (Optional) Affiliate network API keys

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd personal-stylist
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password sign-in method
   - **Firestore Database**: Create in production mode
   - **Storage**: Enable for image uploads

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click the web app icon
   - Copy the configuration values

### 3. Configure Environment Variables

1. Open `.env.local` in the project root
2. Add your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Weather API
OPENWEATHER_API_KEY=your_weather_api_key

# Optional: Affiliate Networks
SHOPSTYLE_API_KEY=
SHOPSTYLE_PARTNER_ID=
LTK_PUBLISHER_ID=
```

### 4. Set Up Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /events/{eventId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    match /closet_items/{itemId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    match /recommendations/{recId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Set Up Firebase Storage Rules

In Firebase Console, go to Storage > Rules and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Authentication components
│   └── ...                # Feature components
├── lib/
│   ├── firebase/          # Firebase configuration & helpers
│   ├── ai/                # Claude AI client & prompts
│   └── utils/             # Utility functions
├── contexts/              # React contexts (Auth, etc.)
└── types/                 # TypeScript type definitions
```

## 🎨 Key Features to Implement Next

Based on the implementation plan, here are the next phases:

### Phase 2: Events & Closet (Current)
- [ ] Event creation and management
- [ ] Weather API integration
- [ ] Photo upload to Firebase Storage
- [ ] Closet grid view with filtering

### Phase 3: Basic Recommendations
- [ ] Rule-based outfit matching
- [ ] Recommendation UI (carousel, cards)
- [ ] Feedback system
- [ ] Style board

### Phase 4: AI Integration
- [ ] Claude API integration for recommendations
- [ ] Auto-analyze closet items on upload
- [ ] Feedback learning system
- [ ] AI confidence scoring

### Phase 5: Virtual Try-On
- [ ] Multi-photo upload flow
- [ ] Claude Opus integration
- [ ] Fit warnings and size recommendations

### Phase 6: Advanced Features
- [ ] Outfit comparison tool
- [ ] Trip planning system
- [ ] PWA configuration
- [ ] Performance optimization

## 🔑 Getting API Keys

### Anthropic Claude API
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`

### OpenWeather API (Optional)
1. Sign up at [OpenWeather](https://openweathermap.org/api)
2. Get a free API key
3. Add to `.env.local` as `OPENWEATHER_API_KEY`

### Affiliate Networks (Optional)
- **ShopStyle**: Apply at [ShopStyle Collective](https://www.shopstylecollective.com/)
- **LTK**: Apply at [LTK Creator](https://www.shopltk.com/)
- **Amazon Associates**: Apply at [Amazon Associates](https://affiliate-program.amazon.com/)

## 💰 Estimated Costs

### Claude API Usage (per active user/month)
- Closet analysis: ~$1.00 (20 items)
- Event recommendations: ~$1.50 (5 events)
- Outfit comparisons: ~$0.60 (3 comparisons)
- Virtual try-on: ~$4.00 (2 sessions)
- **Total**: ~$7-10 per active user/month

### Suggested Pricing
- Free tier: Limited features, 3 recommendations/month
- Premium: $15-30/month for unlimited access

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [shadcn/ui Docs](https://ui.shadcn.com/)

## 🎯 Next Steps

1. **Complete Phase 1**: Finish profile forms and onboarding
2. **Set up Firebase**: Add your Firebase configuration
3. **Get Claude API key**: Sign up for Anthropic API
4. **Start Phase 2**: Begin building event and closet features

For detailed implementation guidance, see the plan file at:
`~/.claude/plans/mutable-meandering-porcupine.md`

## 💡 Tips

- Start with Phase 1 features to get users onboarded
- Test authentication flow thoroughly before moving to Phase 2
- Use Sonnet model for cost-effective AI features
- Cache AI analysis results to minimize API costs
- Implement usage limits on free tier to control costs

Happy coding! 🎉
