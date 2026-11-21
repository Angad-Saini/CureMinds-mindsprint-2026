
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

const resources = {

  en: {
    translation: {
      appName: "CureMinds",
      home: "Home",
      tasks: "My Tasks",
      progress: "My Progress",
      settings: "Settings",
      talk: "Talk",
      language: "Language",
      pending: "Pending",
      completed: "Completed",
      help: "Help",
      logout: "Log Out",
      greeting: "Hello!",
      noTasks: "No tasks assigned yet.",
      save: "Save",
      cancel: "Cancel",
      homeSubtitle: "YOUR DAILY COMPANION",
      goodMorning: "Good morning",
      howAreYou: "How are you feeling today?",
      letsTalk: "Let's talk!",
      todaysTasks: "Today's Tasks",
      allTasksDone: "You've completed all your tasks!",
      taskProgress: "Your daily progress",
      activities: "Activities",
      assistantGreeting: "Hello! How can I help you today?",
      listening: "Listening...",
      startTalking: "Tap to start talking",
    },
  },

  hi: {
    translation: {
      appName: "CureMinds",
      home: "होम",
      tasks: "मेरे कार्य",
      progress: "मेरी प्रगति",
      settings: "सेटिंग्स",
      talk: "बात करें",
      language: "भाषा",
      pending: "बाकी",
      completed: "पूरा हुआ",
      help: "मदद",
      logout: "लॉग आउट",
      greeting: "नमस्ते!",
      noTasks: "अभी कोई कार्य नहीं दिया गया है।",
      save: "सहेजें",
      cancel: "रद्द करें",
      homeSubtitle: "आपका दैनिक साथी",
      goodMorning: "सुप्रभात",
      howAreYou: "आज आप कैसा महसूस कर रहे हैं?",
      letsTalk: "आइए बात करें!",
      todaysTasks: "आज के कार्य",
      allTasksDone: "आपने अपने सभी कार्य पूरे कर लिए हैं!",
      taskProgress: "आपकी दैनिक प्रगति",
      activities: "गतिविधियाँ",
      assistantGreeting: "नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूँ?",
      listening: "सुन रहा हूँ...",
      startTalking: "बात शुरू करने के लिए टैप करें",
    },
  },

  mr: {
    translation: {
      appName: "CureMinds",
      home: "मुख्यपृष्ठ",
      tasks: "माझी कामे",
      progress: "माझी प्रगती",
      settings: "सेटिंग्ज",
      talk: "बोला",
      language: "भाषा",
      pending: "बाकी",
      completed: "पूर्ण",
      help: "मदत",
      logout: "लॉग आउट",
      greeting: "नमस्कार!",
      noTasks: "अद्याप कोणतेही काम दिलेले नाही.",
      save: "जतन करा",
      cancel: "रद्द करा",
      homeSubtitle: "तुमचा दैनंदिन साथीदार",
      goodMorning: "शुभ सकाळ",
      howAreYou: "आज तुम्हाला कसे वाटत आहे?",
      letsTalk: "चला, बोलूया!",
      todaysTasks: "आजची कामे",
      allTasksDone: "तुम्ही तुमची सर्व कामे पूर्ण केली आहेत!",
      taskProgress: "तुमची दैनंदिन प्रगती",
      activities: "उपक्रम",
      assistantGreeting: "नमस्कार! आज मी तुम्हाला कशी मदत करू शकतो?",
      listening: "ऐकत आहे...",
      startTalking: "बोलण्यासाठी टॅप करा",
    },
  },

  kn: {
    translation: {
      appName: "CureMinds",
      home: "ಮುಖಪುಟ",
      tasks: "ನನ್ನ ಕಾರ್ಯಗಳು",
      progress: "ನನ್ನ ಪ್ರಗತಿ",
      settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      talk: "ಮಾತನಾಡಿ",
      language: "ಭಾಷೆ",
      pending: "ಬಾಕಿ",
      completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      help: "ಸಹಾಯ",
      logout: "ಲಾಗ್ ಔಟ್",
      greeting: "ನಮಸ್ಕಾರ!",
      noTasks: "ಇನ್ನೂ ಯಾವುದೇ ಕಾರ್ಯಗಳನ್ನು ನೀಡಲಾಗಿಲ್ಲ.",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      homeSubtitle: "ನಿಮ್ಮ ದೈನಂದಿನ ಸಂಗಾತಿ",
      goodMorning: "ಶುಭೋದಯ",
      howAreYou: "ಇಂದು ನಿಮಗೆ ಹೇಗನಿಸುತ್ತಿದೆ?",
      letsTalk: "ಮಾತನಾಡೋಣ!",
      todaysTasks: "ಇಂದಿನ ಕಾರ್ಯಗಳು",
      allTasksDone: "ನೀವು ನಿಮ್ಮ ಎಲ್ಲಾ ಕಾರ್ಯಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ!",
      taskProgress: "ನಿಮ್ಮ ದೈನಂದಿನ ಪ್ರಗತಿ",
      activities: "ಚಟುವಟಿಕೆಗಳು",
      assistantGreeting: "ನಮಸ್ಕಾರ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
      listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ...",
      startTalking: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    },
  },

  ta: {
    translation: {
      appName: "CureMinds",
      home: "முகப்பு",
      tasks: "எனது பணிகள்",
      progress: "எனது முன்னேற்றம்",
      settings: "அமைப்புகள்",
      talk: "பேசுங்கள்",
      language: "மொழி",
      pending: "நிலுவையில்",
      completed: "முடிந்தது",
      help: "உதவி",
      logout: "வெளியேறு",
      greeting: "வணக்கம்!",
      noTasks: "இதுவரை பணிகள் எதுவும் ஒதுக்கப்படவில்லை.",
      save: "சேமி",
      cancel: "ரத்துசெய்",
      homeSubtitle: "உங்கள் தினசரி துணை",
      goodMorning: "காலை வணக்கம்",
      howAreYou: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
      letsTalk: "பேசலாம்!",
      todaysTasks: "இன்றைய பணிகள்",
      allTasksDone: "உங்கள் அனைத்து பணிகளையும் முடித்துவிட்டீர்கள்!",
      taskProgress: "உங்கள் தினசரி முன்னேற்றம்",
      activities: "செயல்பாடுகள்",
      assistantGreeting: "வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      listening: "கேட்டுக்கொண்டிருக்கிறேன்...",
      startTalking: "பேசத் தொடங்க தட்டவும்",
    },
  },
};



export type AppLanguage = keyof typeof resources;

export const supportedLanguages: AppLanguage[] = [
  "en",
  "hi",
  "mr",
  "kn",
  "ta",
];

export const languageNames: Record<AppLanguage, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  kn: "ಕನ್ನಡ",
  ta: "தமிழ்",
};

export const i18nReady = (async () => {
  const savedLanguage = await AsyncStorage.getItem("cureminds-language");

  const deviceLanguage =
    getLocales()[0]?.languageCode?.toLowerCase() || "en";

  const initialLanguage: AppLanguage =
    supportedLanguages.includes(savedLanguage as AppLanguage)
      ? (savedLanguage as AppLanguage)
      : supportedLanguages.includes(deviceLanguage as AppLanguage)
        ? (deviceLanguage as AppLanguage)
        : "en";

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
})();

export const changeAppLanguage = async (language: AppLanguage) => {
  await i18nReady;
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem("cureminds-language", language);
};

export default i18n;
