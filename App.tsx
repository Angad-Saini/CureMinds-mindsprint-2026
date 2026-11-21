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
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert
} from "react-native";
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
  CalendarDays,
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

  return (
    <View style={{ marginBottom: 22 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "800",
          color: COLORS.text,
          marginBottom: 11,
        }}
      >
        {t("language")}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 9 }}>
          {supportedLanguages.map((language) => {
            const active = i18n.language === language;

            return (
              <TouchableOpacity
                key={language}
                onPress={() => changeAppLanguage(language)}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: active
                    ? COLORS.primary
                    : COLORS.surface,
                  borderWidth: 1,
                  borderColor: active
                    ? COLORS.primary
                    : COLORS.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: active ? "#FFFFFF" : COLORS.text,
                  }}
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
        <Text style={styles.brand}>{t("appName")}</Text>
        <Text style={styles.brandSub}>{t("homeSubtitle")}</Text>
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
    <View style={[styles.taskCard, task.completed && styles.completedCard]}>
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
        <Text style={styles.taskDescription}>{task.description}</Text>
        <View style={styles.timeRow}>
          <Clock size={13} color={COLORS.secondary} />
          <Text style={styles.taskTime}>{task.time}</Text>
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
      Alert.alert("Unable to generate code", error.message);
      return;
    }

    setCode(data);
  };

  return (
    <View style={{
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 20,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: COLORS.border,
    }}>
      <Text style={{
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.text,
      }}>
        Connect with your caretaker
      </Text>

      <Text style={{
        fontSize: 13,
        color: COLORS.secondary,
        marginTop: 7,
        lineHeight: 20,
      }}>
        Generate a code and share it with your caretaker to connect your accounts.
      </Text>

      {code ? (
        <View style={{
          backgroundColor: COLORS.lavender,
          padding: 17,
          borderRadius: 14,
          alignItems: "center",
          marginTop: 17,
        }}>
          <Text style={{
            fontSize: 11,
            color: COLORS.primaryDark,
            fontWeight: "700",
            letterSpacing: 1.5,
          }}>
            YOUR PAIRING CODE
          </Text>

          <Text style={{
            fontSize: 34,
            fontWeight: "900",
            color: COLORS.primaryDark,
            letterSpacing: 8,
            marginTop: 8,
          }}>
            {code}
          </Text>

          <Text style={{
            fontSize: 11,
            color: COLORS.secondary,
            marginTop: 8,
          }}>
            Expires in 15 minutes
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={generateCode}
        disabled={loading}
        style={{
          backgroundColor: COLORS.primary,
          padding: 15,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <Text style={{
          color: "#FFFFFF",
          fontWeight: "800",
          fontSize: 13,
        }}>
          {loading
            ? "Generating..."
            : code
            ? "Generate New Code"
            : "Generate Pairing Code"}
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
})  {
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Header />

      <View style={styles.greeting}>
        <Text style={styles.greetingSmall}>GOOD MORNING ☀️</Text>
        <Text style={styles.greetingTitle}>
  Hello, {patientName}!
</Text>
        <Text style={styles.greetingSub}>
          It's a beautiful day. Let's make it a good one.
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
              <Text style={styles.aiTagText}>YOUR AI COMPANION</Text>
            </View>
            <Volume2 size={21} color="#FFFFFF" />
          </View>

          <View style={styles.aiMiddle}>
            <View style={styles.aiOrb}>
              <Mic size={32} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Let's talk!</Text>
              <Text style={styles.aiDescription}>
                I'm here whenever you need me. Just tap and talk.
              </Text>
            </View>
          </View>

          <View style={styles.aiButton}>
            <Text style={styles.aiButtonText}>TAP TO TALK</Text>
            <ChevronRight size={19} color={COLORS.primaryDark} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Today's activities</Text>
          <Text style={styles.sectionSub}>
            Little steps make a great day.
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
      </View>

      <View style={styles.encouragement}>
        <View style={styles.encouragementIcon}>
          <Heart size={21} color={COLORS.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.encouragementTitle}>You're doing great!</Text>
          <Text style={styles.encouragementSub}>
            Take your time. There's no rush.
          </Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function AssistantScreen({ goBack }: { goBack: () => void }) {
  const [listening, setListening] = useState(false);

  return (
    <View style={styles.assistantScreen}>
      <View style={styles.assistantHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <ArrowLeft size={23} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.assistantHeaderTitle}>AI Companion</Text>
        <View style={{ width: 42 }} />
      </View>

      <View style={styles.assistantContent}>
        <View style={styles.assistantWelcome}>
          <View style={styles.assistantAvatar}>
            <Sparkles size={34} color={COLORS.primary} />
          </View>
          <Text style={styles.assistantTitle}>
            Hello there!
          </Text>
          <Text style={styles.assistantDescription}>
            I'm your friendly companion. You can talk to me about anything.
          </Text>
        </View>

        <View style={styles.voiceArea}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setListening(!listening)}
          >
            <LinearGradient
              colors={
                listening
                  ? ["#A58BEF", "#7955D9"]
                  : ["#9878E9", "#7955D9"]
              }
              style={styles.micCircle}
            >
              <Mic size={48} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.listeningText}>
            {listening ? "Listening..." : "Tap the microphone to talk"}
          </Text>
          <Text style={styles.listeningSub}>
            {listening
              ? "Tap again to stop"
              : "I'm always ready to listen"}
          </Text>
        </View>

        <View style={styles.suggestionCard}>
          <MessageCircle size={22} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.suggestionTitle}>Not sure what to say?</Text>
            <Text style={styles.suggestionDescription}>
              Try asking me what you have planned for today!
            </Text>
          </View>
        </View>

        <Text style={styles.aiDisclaimer}>
          Your companion is here to help. For medical concerns, please speak
          with your caregiver.
        </Text>
      </View>
    </View>
  );
}

type UserRole = "patient" | "caretaker";


export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [patientName, setPatientName] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [languageReady, setLanguageReady] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [caretakerTab, setCaretakerTab] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);

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

      if (error || !data || !["patient", "caretaker"].includes(data.role)) {
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

      if (mounted) setAuthReady(true);
    };

    supabase.auth.getSession().then(({ data }) => {
      void loadRole(data.session?.user.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadRole(session?.user.id ?? null);
    });

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
      .select("id, title, description, is_completed, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (!active) return;

    if (error) {
      console.error("Unable to fetch patient tasks:", error.message);
      return;
    }

    setTasks(
      (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        time: `Assigned ${new Date(task.created_at).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
          }
        )}`,
        icon: "game" as const,
        completed: task.is_completed,
      }))
    );
  };

  // Fetch immediately when the patient dashboard opens.
  void fetchTasks();

  // Keep the task list updated automatically.
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
    Alert.alert("Unable to update task", error.message);
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

  const openAssistant = () => setActiveTab("assistant");

  if (!authReady || !languageReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading CureMinds...</Text>
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
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

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
            <Text style={styles.logoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

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
          <AssistantScreen goBack={() => setActiveTab("home")} />
        )}

        {activeTab === "activities" && <CognitiveGames />}
      </View>

      {activeTab !== "assistant" && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => setActiveTab("home")}
            style={styles.navItem}
          >
            <Home
              size={24}
              color={activeTab === "home" ? COLORS.primary : COLORS.secondary}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === "home" && styles.activeNavLabel,
              ]}
            >
              Home
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
                activeTab === "activities" && styles.activeNavLabel,
              ]}
            >
              Activities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openAssistant}
            style={styles.navItem}
          >
            <Mic size={24} color={COLORS.secondary} />
            <Text style={styles.navLabel}>Talk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              void supabase.auth.signOut();
            }}
            style={styles.navItem}
          >
            <Text style={styles.logoutIcon}>↪</Text>
            <Text style={styles.logoutLabel}>Logout</Text>
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
    marginBottom: 30,
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
    alignItems: "center",
    justifyContent: "center",
    elevation: 9,
  },
  listeningText: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 12,
  },
  listeningSub: {
    fontSize: 13,
    color: COLORS.secondary,
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
  placeholderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 35,
  },
  placeholderIcon: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.lavender,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  placeholderTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.text,
  },
  placeholderDescription: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: "center",
    lineHeight: 23,
    marginTop: 10,
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
});
