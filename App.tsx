import React, { useState } from "react";
import CognitiveGames from "./src/screens/patient/CognitiveGames";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
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
  id: number;
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

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Take your medicine",
    description: "Your morning medicine",
    time: "09:00 AM",
    icon: "pill",
    completed: false,
  },
  {
    id: 2,
    title: "Drink some water",
    description: "Stay hydrated today",
    time: "10:00 AM",
    icon: "water",
    completed: false,
  },
  {
    id: 3,
    title: "Memory game",
    description: "Let's exercise your memory",
    time: "11:00 AM",
    icon: "game",
    completed: false,
  },
];

function TaskIcon({ type }: { type: Task["icon"] }) {
  const props = { size: 25, color: COLORS.primary };

  if (type === "pill") return <Pill {...props} />;
  if (type === "water") return <Droplets {...props} />;
  return <Gamepad2 {...props} />;
}

function Header() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>[APP NAME]</Text>
        <Text style={styles.brandSub}>YOUR DAILY COMPANION</Text>
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

function HomeScreen({
  tasks,
  toggleTask,
  openAssistant,
}: {
  tasks: Task[];
  toggleTask: (id: number) => void;
  openAssistant: () => void;
}) {
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Header />

      <View style={styles.greeting}>
        <Text style={styles.greetingSmall}>GOOD MORNING ☀️</Text>
        <Text style={styles.greetingTitle}>Hello, [Patient Name]!</Text>
        <Text style={styles.greetingSub}>
          It's a beautiful day. Let's make it a good one.
        </Text>
      </View>

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

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const openAssistant = () => setActiveTab("assistant");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={{ flex: 1 }}>
        {activeTab === "home" && (
          <HomeScreen
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
            <Text style={[styles.navLabel, activeTab === "home" && styles.activeNavLabel]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("activities")}
            style={styles.navItem}
          >
            <Brain
              size={24}
              color={activeTab === "activities" ? COLORS.primary : COLORS.secondary}
            />
            <Text style={[styles.navLabel, activeTab === "activities" && styles.activeNavLabel]}>
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
});
