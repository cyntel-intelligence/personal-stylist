// Temporary script to create missing user profile
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function createUserProfile() {
  const userId = 'O4mYnT6MLjd9DxTWFmH8cd1KFI02';
  const email = 'carlycyntel@gmail.com';
  const displayName = 'Carly Caldwell';

  const profileData = {
    uid: userId,
    email: email,
    displayName: displayName,
    profile: {
      height: 0,
      sizes: {
        tops: "",
        bottoms: 0,
        dress: 0,
        denim: 0,
      },
      fitPreference: "standard",
    },
    comfortLimits: {
      straplessOk: true,
      maxHeelHeight: 0,
      shapewearTolerance: "sometimes",
    },
    styleDNA: {
      styleWords: [],
      lovedBrands: [],
      hatedBrands: [],
      priceRanges: {
        dresses: { min: 0, max: 0 },
        shoes: { min: 0, max: 0 },
        bags: { min: 0, max: 0 },
        jewelry: { min: 0, max: 0 },
      },
      neverAgainList: [],
    },
    flatteryMap: {
      favoriteBodyParts: [],
      minimizeBodyParts: [],
      necklinePreferences: {
        loved: [],
        avoid: [],
      },
      lengthPreferences: {
        dresses: "any",
        sleeves: "any",
      },
      waistDefinition: "sometimes",
    },
    colorPreferences: {
      complimentColors: [],
      avoidColors: [],
      metalPreference: "no-preference",
      patternTolerance: "any",
    },
    temperatureProfile: {
      runsHot: false,
      runsCold: false,
      needsLayers: false,
    },
    shoppingPreferences: {
      preferredRetailers: [],
      avoidReturns: false,
      fastShippingOnly: false,
    },
    onboardingCompleted: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('users').doc(userId).set(profileData);
    console.log('✅ User profile created successfully!');
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Display Name:', displayName);
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    process.exit(1);
  }

  process.exit(0);
}

createUserProfile();
