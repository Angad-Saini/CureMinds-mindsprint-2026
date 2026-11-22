# CureMinds 

**Care that remembers.**

CureMinds is a React Native application built for **MindSprint 2026** to simplify everyday patient care and caretaker coordination.

It connects patients and caretakers through shared routines, task management, cognitive activities, and progress tracking.

## ✨ Features

- **Role-based accounts:** Separate Patient and Caretaker dashboards.
- **Patient-Caretaker Linking:** Connect patients with multiple caretakers using pairing codes.
- **Task Management:** Create, assign, and complete daily tasks.
- **Daily Schedules:** Manage and view patient routines.
- **Cognitive Games:** Memory Match and Object Recognition.
- **Progress Tracking:** View activity progress and export PDF reports.
- **Multilingual Support:** English, Hindi, Marathi, Kannada, and Tamil.
- **Assistant:** Command-based in-app navigation.

## 🛠️ Tech Stack

- React Native & Expo
- TypeScript
- Supabase (Auth, PostgreSQL, RLS)
- AsyncStorage
- i18next
- Expo Print & Sharing

## 🚀 Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Angad-Saini/CureMinds-mindsprint-2026.git
cd CureMinds-mindsprint-2026
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**4. Start the application**

```bash
npx expo start
```

## 📦 Production Builds

Install EAS CLI and configure your project:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Build for Android or iOS:

```bash
eas build --platform android
eas build --platform ios
```

## 🔐 Security

- Row Level Security (RLS).
- Role-based access control.
- Secure patient-caretaker linking.
- Expiring pairing codes.

Never expose Supabase service-role keys in the application.

## ⚠️ Disclaimer

CureMinds is a hackathon prototype for everyday care coordination. It is not a medical device and does not replace professional medical advice.

## 👨‍💻 Team & License

Built for **MindSprint 2026**.

Licensed under the [MIT License](LICENSE).
