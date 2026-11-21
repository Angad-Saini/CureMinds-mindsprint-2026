
import React, { useEffect, useState } from "react";
import {
  i18nReady,
  changeAppLanguage,
  supportedLanguages,
  languageNames,
} from "./src/i18n";
import CognitiveGames from "./src/screens/patient/CognitiveGames";
import LoginScreen from "./src/screens/auth/LoginScreen";
import { supabase } from "./src/services/supabase";
import { useTranslation } from "react-i18next";

import DashboardScreen from "./src/screens/caretaker/DashboardScreen";
import PatientsScreen from "./src/screens/caretaker/PatientsScreen";
import TasksScreen from "./src/screens/caretaker/TasksScreen";
import ScheduleScreen from "./src/screens/caretaker/ScheduleScreen";
import ProgressScreen from "./src/screens/caretaker/ProgressScreen";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Home,
  Brain,
  Mic,
  Check,
  Pill,
  Droplets,
  Gamepad2,
  ChevronRight,
  Volume2,
  ArrowLeft,
  Sparkles,
  Clock,
  Heart,
  MessageCircle,
} from "lucide-react-native";

type Task = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: "pill" | "water" | "game";
  completed: boolean;
};

type UserRole = "patient" | "caretaker";

const COLORS = {
  background: "#F7F5FC",
  surface: "#FFFFFF",
  primary: "#7955D9",
  primaryDark: "#53349D",
  lavender: "#EEE8FF",
  text: "#28243A",
  secondary: "#858096",
  border: "#EAE7F1",
  green: "#3A9B73",
  greenLight: "#E5F5EC",
};

function TaskIcon({ type }: { type: Task["icon"] }) {
  const props = { size: 25, color: COLORS.primary };

  if (type === "pill") return <Pill {...props} />;
  if (type === "water") return <Droplets {...props} />;

  return <Gamepad2 {...props} />;
}

function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const currentLanguage =
    i18n.resolvedLanguage?.split("-")[0] ||
    i18n.language.split("-")[0];

  return (
    <View style={styles.languageSection}>
      <Text style={styles.languageTitle}>
        {t("language")}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.languageOptions}>
          {supportedLanguages.map((language) => {
            const active = currentLanguage === language;

            return (
              <TouchableOpacity
                key={language}
                activeOpacity={0.75}
                onPress={() => {
                  void changeAppLanguage(language);
                }}
                style={[
                  styles.languageButton,
                  active && styles.activeLanguageButton,
                ]}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    active && styles.activeLanguageButtonText,
                  ]}
                >
                  {languageNames[language]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function Header() {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>
          {t("appName")}
        </Text>

        <Text style={styles.brandSub}>
          {t("homeSubtitle")}
        </Text>
      </View>

      <View style={styles.profileIcon}>
        <Heart size={22} color={COLORS.primary} />
      </View>
    </View>
  );
}

function TaskCard({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: () => void;
}) {
  return (
    <View
      style={[
        styles.taskCard,
        task.completed && styles.completedCard,
      ]}
    >
      <View style={styles.taskIcon}>
        <TaskIcon type={task.icon} />
      </View>

      <View style={styles.taskInfo}>
        <Text
          style={[
            styles.taskTitle,
            task.completed && styles.completedText,
          ]}
        >
          {task.title}
        </Text>

        <Text style={styles.taskDescription}>
          {task.description}
        </Text>

        <View style={styles.timeRow}>
          <Clock size={13} color={COLORS.secondary} />

          <Text style={styles.taskTime}>
            {task.time}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.75}
        style={[
          styles.checkButton,
          task.completed && styles.checkedButton,
        ]}
      >
        <Check
          size={21}
          color={task.completed ? "#FFFFFF" : COLORS.secondary}
        />
      </TouchableOpacity>
    </View>
  );
}

function PairingCodeCard() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const generateCode = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "create_patient_link_code"
    );

    setLoading(false);

    if (error) {
      Alert.alert(
        "Unable to generate code",
        error.message
      );
      return;
    }

    setCode(data);
  };

  return (
    <View style={styles.pairingCard}>
      <Text style={styles.pairingTitle}>
        {t("connectCaretaker")}
      </Text>

      <Text style={styles.pairingDescription}>
        {t("connectDescription")}
      </Text>

      {code ? (
        <View style={styles.pairingCodeContainer}>
          <Text style={styles.pairingCodeLabel}>
            {t("pairingCode")}
          </Text>

          <Text style={styles.pairingCode}>
            {code}
          </Text>

          <Text style={styles.pairingExpiry}>
            {t("expiresIn")}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={generateCode}
        disabled={loading}
        activeOpacity={0.8}
        style={styles.generateButton}
      >
        <Text style={styles.generateButtonText}>
          {loading
            ? t("generating")
            : code
              ? t("generateNewCode")
              : t("generatePairingCode")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function HomeScreen({
  patientName,
  tasks,
  toggleTask,
  openAssistant,
}: {
  patientName: string;
  tasks: Task[];
  toggleTask: (id: string) => void;
  openAssistant: () => void;
}) {
  const { t } = useTranslation();

  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Header />

      <LanguageSelector />

      <View style={styles.greeting}>
        <Text style={styles.greetingSmall}>
          {t("goodMorning")} ☀️
        </Text>

        <Text style={styles.greetingTitle}>
          {t("greeting")} {patientName}!
        </Text>

        <Text style={styles.greetingSub}>
          {t("greetingSub")}
        </Text>
      </View>

      <PairingCodeCard />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={openAssistant}
      >
        <LinearGradient
          colors={["#7955D9", "#9878E9", "#B49AF2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiCard}
        >
          <View style={styles.aiTop}>
            <View style={styles.aiTag}>
              <Sparkles size={14} color="#FFFFFF" />

              <Text style={styles.aiTagText}>
                {t("yourAICompanion")}
              </Text>
            </View>

            <Volume2 size={21} color="#FFFFFF" />
          </View>

          <View style={styles.aiMiddle}>
            <View style={styles.aiOrb}>
              <Mic size={32} color={COLORS.primaryDark} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>
                {t("letsTalk")}
              </Text>

              <Text style={styles.aiDescription}>
                {t("aiDescription")}
              </Text>
            </View>
          </View>

          <View style={styles.aiButton}>
            <Text style={styles.aiButtonText}>
              {t("tapToTalk")}
            </Text>

            <ChevronRight
              size={19}
              color={COLORS.primaryDark}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {t("todaysTasks")}
          </Text>

          <Text style={styles.sectionSub}>
            {t("littleSteps")}
          </Text>
        </View>

        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {completed}/{tasks.length}
          </Text>
        </View>
      </View>

      <View style={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={() => toggleTask(task.id)}
          />
        ))}

        {tasks.length === 0 && (
          <Text style={styles.emptyTasks}>
            {t("noTasks")}
          </Text>
        )}
      </View>

      {tasks.length > 0 && completed === tasks.length && (
        <View style={styles.allTasksDone}>
          <Text style={styles.allTasksDoneText}>
            {t("allTasksDone")}
          </Text>
        </View>
      )}

      <View style={styles.encouragement}>
        <View style={styles.encouragementIcon}>
          <Heart size={21} color={COLORS.green} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.encouragementTitle}>
            {t("doingGreat")}
          </Text>

          <Text style={styles.encouragementSub}>
            {t("takeYourTime")}
          </Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function AssistantScreen({
  goBack,
  navigateTo,
}: {
  goBack: () => void;
  navigateTo: (tab: string) => void;
}) {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");

  const { t } = useTranslation();

  const handleCommand = () => {
    const value = command.trim().toLowerCase();

    if (!value) return;

    const homeWords = [
      "home", "homepage", "go home", "घर", "मुख्यपृष्ठ",
      "முகப்பு", "ಮುಖಪುಟ",
    ];

    const activityWords = [
      "activity", "activities", "games", "game",
      "खेल", "खेळ", "चಟುವಟಿಕೆಗಳು", "விளையாட்டுகள்",
    ];

    const taskWords = [
      "task", "tasks", "my tasks", "काम", "कार्य",
      "பணிகள்", "ಕಾರ್ಯಗಳು",
    ];

    if (homeWords.some((word) => value.includes(word))) {
      navigateTo("home");
      setResponse("Opening your home screen.");
    } else if (
      activityWords.some((word) => value.includes(word))
    ) {
      navigateTo("activities");
      setResponse("Opening your activities.");
    } else if (
      taskWords.some((word) => value.includes(word))
    ) {
      navigateTo("home");
      setResponse("Your tasks are available on your home screen.");
    } else {
      setResponse(
        "I can help you open Home or Activities. Try asking me!"
      );
    }
  };

  return (
    <View style={styles.assistantScreen}>
      <View style={styles.assistantHeader}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
        >
          <ArrowLeft size={23} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.assistantHeaderTitle}>
          {t("aiCompanion")}
        </Text>

        <View style={{ width: 42 }} />
      </View>

      <View style={styles.assistantContent}>
        <View style={styles.assistantWelcome}>
          <View style={styles.assistantAvatar}>
            <Sparkles size={34} color={COLORS.primary} />
          </View>

          <Text style={styles.assistantTitle}>
            {t("assistantGreeting")}
          </Text>

          <Text style={styles.assistantDescription}>
            {t("friendlyCompanion")}
          </Text>
        </View>

        <View style={styles.voiceArea}>
          <View style={styles.micCircle}>
            <Mic size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.listeningText}>
            {t("letsTalk")}
          </Text>

          <Text style={styles.listeningSub}>
            Try typing a command below.
          </Text>
        </View>

        <View style={styles.commandContainer}>
          <TextInput
            value={command}
            onChangeText={setCommand}
            placeholder="Try 'Open my activities'"
            placeholderTextColor={COLORS.secondary}
            style={styles.commandInput}
            onSubmitEditing={handleCommand}
            returnKeyType="send"
          />

          <TouchableOpacity
            onPress={handleCommand}
            style={styles.commandButton}
          >
            <Text style={styles.commandButtonText}>
              Send
            </Text>
          </TouchableOpacity>
        </View>

        {response ? (
          <View style={styles.responseCard}>
            <Sparkles size={20} color={COLORS.primary} />
            <Text style={styles.responseText}>
              {response}
            </Text>
          </View>
        ) : null}

        <Text style={styles.aiDisclaimer}>
          {t("medicalDisclaimer")}
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [patientName, setPatientName] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [languageReady, setLanguageReady] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [caretakerTab, setCaretakerTab] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;

    i18nReady.then(() => {
      if (mounted) {
        setLanguageReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadRole = async (userId: string | null) => {
      if (!userId) {
        if (mounted) {
          setRole(null);
          setPatientName("");
          setAuthReady(true);
        }

        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", userId)
        .single();

      if (!mounted) return;

      if (
        error ||
        !data ||
        !["patient", "caretaker"].includes(data.role)
      ) {
        await supabase.auth.signOut();

        if (mounted) {
          setRole(null);
          setPatientName("");
        }
      } else {
        const userRole = data.role as UserRole;

        setRole(userRole);
        setPatientName(data.full_name || "Patient");
        setActiveTab("home");
        setCaretakerTab("dashboard");
      }

      if (mounted) {
        setAuthReady(true);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      void loadRole(data.session?.user.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void loadRole(session?.user.id ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (role !== "patient") {
      setTasks([]);
      return;
    }

    let active = true;

    const fetchTasks = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || !active) return;

      const { data, error } = await supabase
        .from("patient_tasks")
        .select(
          "id, title, description, is_completed, created_at"
        )
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error(
          "Unable to fetch patient tasks:",
          error.message
        );
        return;
      }

      setTasks(
        (data || []).map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          time: `Assigned ${new Date(
            task.created_at
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}`,
          icon: "game" as const,
          completed: task.is_completed,
        }))
      );
    };

    void fetchTasks();

    const interval = setInterval(() => {
      void fetchTasks();
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [role]);

  const toggleTask = async (id: string) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const newStatus = !task.completed;

    const { error } = await supabase
      .from("patient_tasks")
      .update({ is_completed: newStatus })
      .eq("id", id);

    if (error) {
      Alert.alert(
        "Unable to update task",
        error.message
      );
      return;
    }

    setTasks((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, completed: newStatus }
          : item
      )
    );
  };

  const openAssistant = () => {
    setActiveTab("assistant");
  };

  if (!authReady || !languageReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading CureMinds...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!role) {
    return <LoginScreen onLogin={setRole} />;
  }

  if (role === "caretaker") {
    const renderCaretakerScreen = () => {
      switch (caretakerTab) {
        case "patients":
          return <PatientsScreen />;

        case "tasks":
          return <TasksScreen />;

        case "schedule":
          return <ScheduleScreen />;

        case "progress":
          return <ProgressScreen />;

        default:
          return <DashboardScreen />;
      }
    };

    const caretakerTabs = [
      { id: "dashboard", label: "Home", icon: "⌂" },
      { id: "patients", label: "Patients", icon: "♙" },
      { id: "tasks", label: "Tasks", icon: "✓" },
      { id: "schedule", label: "Schedule", icon: "▦" },
      { id: "progress", label: "Progress", icon: "↗" },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={{ flex: 1 }}>
          {renderCaretakerScreen()}
        </View>

        <View style={styles.bottomNav}>
          {caretakerTabs.map((tab) => {
            const active = caretakerTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setCaretakerTab(tab.id)}
                style={styles.navItem}
              >
                <Text
                  style={[
                    styles.caretakerNavIcon,
                    active && styles.activeCaretakerNav,
                  ]}
                >
                  {tab.icon}
                </Text>

                <Text
                  style={[
                    styles.navLabel,
                    active && styles.activeNavLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              void supabase.auth.signOut();
            }}
          >
            <Text style={styles.logoutIcon}>↪</Text>

            <Text style={styles.logoutLabel}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={{ flex: 1 }}>
        {activeTab === "home" && (
          <HomeScreen
            patientName={patientName}
            tasks={tasks}
            toggleTask={toggleTask}
            openAssistant={openAssistant}
          />
        )}

        {activeTab === "assistant" && (
  <AssistantScreen
    goBack={() => setActiveTab("home")}
    navigateTo={setActiveTab}
  />
)}

        {activeTab === "activities" && (
          <CognitiveGames />
        )}
      </View>

      {activeTab !== "assistant" && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => setActiveTab("home")}
            style={styles.navItem}
          >
            <Home
              size={24}
              color={
                activeTab === "home"
                  ? COLORS.primary
                  : COLORS.secondary
              }
            />

            <Text
              style={[
                styles.navLabel,
                activeTab === "home" && styles.activeNavLabel,
              ]}
            >
              {t("home")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("activities")}
            style={styles.navItem}
          >
            <Brain
              size={24}
              color={
                activeTab === "activities"
                  ? COLORS.primary
                  : COLORS.secondary
              }
            />

            <Text
              style={[
                styles.navLabel,
                activeTab === "activities" &&
                  styles.activeNavLabel,
              ]}
            >
              {t("activities")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openAssistant}
            style={styles.navItem}
          >
            <Mic
              size={24}
              color={COLORS.secondary}
            />

            <Text style={styles.navLabel}>
              {t("talk")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              void supabase.auth.signOut();
            }}
            style={styles.navItem}
          >
            <Text style={styles.logoutIcon}>↪</Text>

            <Text style={styles.logoutLabel}>
              {t("logout")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  brand: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },

  brandSub: {
    fontSize: 9,
    color: COLORS.secondary,
    letterSpacing: 2,
    marginTop: 3,
  },

  profileIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.lavender,
    alignItems: "center",
    justifyContent: "center",
  },

  languageSection: {
    marginBottom: 22,
  },

  languageTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 11,
  },

  languageOptions: {
    flexDirection: "row",
    gap: 9,
  },

  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeLanguageButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  languageButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  activeLanguageButtonText: {
    color: "#FFFFFF",
  },

  greeting: {
    marginBottom: 23,
  },

  greetingSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  greetingTitle: {
    fontSize: 29,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.8,
  },

  greetingSub: {
    color: COLORS.secondary,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },

  pairingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  pairingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  pairingDescription: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 7,
    lineHeight: 20,
  },

  pairingCodeContainer: {
    backgroundColor: COLORS.lavender,
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 17,
  },

  pairingCodeLabel: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  pairingCode: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.primaryDark,
    letterSpacing: 8,
    marginTop: 8,
  },

  pairingExpiry: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 8,
  },

  generateButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },

  generateButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  aiCard: {
    borderRadius: 25,
    padding: 20,
    marginBottom: 30,
  },

  aiTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  aiTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  aiMiddle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 22,
    marginBottom: 23,
  },

  aiOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  aiTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  aiDescription: {
    color: "#F0EAFE",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },

  aiButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  aiButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSub: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 5,
  },

  progressBadge: {
    backgroundColor: COLORS.lavender,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
  },

  progressText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
    fontSize: 14,
  },

  taskList: {
    gap: 12,
  },

  emptyTasks: {
    fontSize: 13,
    color: COLORS.secondary,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    textAlign: "center",
  },

  allTasksDone: {
    backgroundColor: COLORS.greenLight,
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
  },

  allTasksDoneText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 19,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 13,
  },

  completedCard: {
    backgroundColor: "#F3FAF5",
    borderColor: "#D7EDE0",
  },

  taskIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: COLORS.lavender,
    alignItems: "center",
    justifyContent: "center",
  },

  taskInfo: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  completedText: {
    color: COLORS.green,
    textDecorationLine: "line-through",
  },

  taskDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 4,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  taskTime: {
    fontSize: 11,
    color: COLORS.secondary,
  },

  checkButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  checkedButton: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  encouragement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: COLORS.greenLight,
    padding: 16,
    borderRadius: 18,
    marginTop: 22,
  },

  encouragementIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  encouragementTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#286C50",
  },

  encouragementSub: {
    fontSize: 12,
    color: "#54816B",
    marginTop: 4,
  },

  bottomNav: {
    height: 75,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flex: 1,
  },

  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  activeNavLabel: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  assistantScreen: {
    flex: 1,
    paddingHorizontal: 22,
  },

  assistantHeader: {
    height: 65,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  assistantHeaderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  assistantContent: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },

  assistantWelcome: {
    alignItems: "center",
    paddingHorizontal: 15,
  },

  assistantAvatar: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: COLORS.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  assistantTitle: {
    fontSize: 29,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  assistantDescription: {
    fontSize: 15,
    color: COLORS.secondary,
    textAlign: "center",
    lineHeight: 23,
    marginTop: 10,
  },

  voiceArea: {
    alignItems: "center",
    gap: 13,
  },

  micCircle: {
  width: 155,
  height: 155,
  borderRadius: 78,
  backgroundColor: COLORS.primary,
  alignItems: "center",
  justifyContent: "center",
  elevation: 9,
},

  listeningText: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 12,
    textAlign: "center",
  },

  listeningSub: {
    fontSize: 13,
    color: COLORS.secondary,
    textAlign: "center",
  },

  suggestionCard: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  suggestionDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  aiDisclaimer: {
    fontSize: 11,
    color: COLORS.secondary,
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 12,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.primaryDark,
    fontSize: 17,
    fontWeight: "800",
  },

  caretakerNavIcon: {
    fontSize: 21,
    color: COLORS.secondary,
  },

  activeCaretakerNav: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  logoutIcon: {
    fontSize: 21,
    color: "#D65D72",
  },

  logoutLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D65D72",
  },

  commandContainer: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

commandInput: {
  flex: 1,
  backgroundColor: COLORS.surface,
  borderRadius: 14,
  paddingHorizontal: 15,
  paddingVertical: 15,
  borderWidth: 1,
  borderColor: COLORS.border,
  color: COLORS.text,
  fontSize: 14,
},

commandButton: {
  backgroundColor: COLORS.primary,
  paddingHorizontal: 20,
  paddingVertical: 15,
  borderRadius: 14,
},

commandButtonText: {
  color: "#FFFFFF",
  fontWeight: "800",
},

responseCard: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  backgroundColor: COLORS.lavender,
  borderRadius: 15,
  padding: 15,
},

responseText: {
  flex: 1,
  color: COLORS.primaryDark,
  fontSize: 13,
  fontWeight: "600",
  lineHeight: 20,
},
});

