
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";

type Patient = {
  patient_id: string;
  full_name: string;
};

type GameSession = {
  game_name: string;
  completed_at: string;
};

type DayProgress = {
  label: string;
  completed: number;
};

export default function ProgressScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);

  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [mostPlayed, setMostPlayed] = useState("No games played yet");
  const [mostPlayedCount, setMostPlayedCount] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.rpc("get_my_patients");

      if (error) {
        console.error("Patient fetch error:", error);
        setLoading(false);
        return;
      }

      const patientList = (data || []) as Patient[];

      setPatients(patientList);

      if (patientList.length > 0) {
        setSelectedPatient(patientList[0].patient_id);
      }

      setLoading(false);
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;

    const fetchProgress = async () => {
      setProgressLoading(true);

      const now = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const startISO = startDate.toISOString();
      const nowISO = now.toISOString();

      const [tasksResult, routinesResult, gamesResult] =
        await Promise.all([
          supabase
            .from("patient_tasks")
            .select("id, is_completed, created_at")
            .eq("patient_id", selectedPatient)
            .gte("created_at", startISO)
            .lte("created_at", nowISO),

          supabase
            .from("patient_schedules")
            .select("id, is_completed, scheduled_at")
            .eq("patient_id", selectedPatient)
            .gte("scheduled_at", startISO)
            .lte("scheduled_at", nowISO),

          supabase
            .from("patient_game_sessions")
            .select("game_name, completed_at")
            .eq("patient_id", selectedPatient)
            .gte("completed_at", startISO)
            .lte("completed_at", nowISO),
        ]);

      if (tasksResult.error) {
        console.error("Task progress error:", tasksResult.error);
      }

      if (routinesResult.error) {
        console.error("Routine progress error:", routinesResult.error);
      }

      if (gamesResult.error) {
        console.error("Game progress error:", gamesResult.error);
      }

      const tasks = tasksResult.data || [];
      const routines = routinesResult.data || [];
      const games = (gamesResult.data || []) as GameSession[];

      const allActivities = [...tasks, ...routines];

      const completedCount = allActivities.filter(
        (item) => item.is_completed
      ).length;

      setCompleted(completedCount);
      setTotal(allActivities.length);

      setGamesPlayed(games.length);

      const gameCounts: Record<string, number> = {};

      games.forEach((game) => {
        gameCounts[game.game_name] =
          (gameCounts[game.game_name] || 0) + 1;
      });

      const mostPlayedGame = Object.entries(gameCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];

      setMostPlayed(mostPlayedGame?.[0] || "No games played yet");
      setMostPlayedCount(mostPlayedGame?.[1] || 0);

      const days: DayProgress[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const dayKey = date.toLocaleDateString("en-CA");

        const dayTasks = tasks.filter(
          (item) =>
            new Date(item.created_at).toLocaleDateString("en-CA") === dayKey &&
            item.is_completed
        );

        const dayRoutines = routines.filter(
          (item) =>
            new Date(item.scheduled_at).toLocaleDateString("en-CA") === dayKey &&
            item.is_completed
        );

        days.push({
          label: date.toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          completed: dayTasks.length + dayRoutines.length,
        });
      }

      setWeeklyProgress(days);
      setProgressLoading(false);
    };

    fetchProgress();
  }, [selectedPatient]);

  const compliance =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const maxDaily = Math.max(
    1,
    ...weeklyProgress.map((day) => day.completed)
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7955D9" />
        <Text style={styles.muted}>Loading patients...</Text>
      </View>
    );
  }

  if (patients.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Patient Progress</Text>
        <Text style={styles.muted}>
          Link a patient to start viewing their progress.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Patient Progress</Text>
      <Text style={styles.subtitle}>
        Understand activity and celebrate small achievements.
      </Text>

      <Text style={styles.sectionTitle}>Select Patient</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {patients.map((patient) => (
          <TouchableOpacity
            key={patient.patient_id}
            style={[
              styles.patientChip,
              selectedPatient === patient.patient_id &&
                styles.selectedChip,
            ]}
            onPress={() => setSelectedPatient(patient.patient_id)}
          >
            <Text
              style={[
                styles.patientChipText,
                selectedPatient === patient.patient_id &&
                  styles.selectedChipText,
              ]}
            >
              {patient.full_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {progressLoading ? (
        <ActivityIndicator
          size="large"
          color="#7955D9"
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          <View style={styles.complianceCard}>
            <Text style={styles.cardLabel}>Activity Compliance</Text>
            <Text style={styles.complianceValue}>{compliance}%</Text>
            <Text style={styles.cardDescription}>
              {completed} of {total} activities completed in the last 7 days
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${compliance}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.max(0, total - completed)}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Most Played Game</Text>

          <View style={styles.gameCard}>
            <Text style={styles.gameEmoji}>🧠</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameName}>{mostPlayed}</Text>
              <Text style={styles.muted}>
                {mostPlayedCount} completed sessions this week
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Games Activity</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games completed</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Weekly Activity</Text>

          <View style={styles.chartCard}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.chartColumn}>
                <Text style={styles.chartValue}>
                  {day.completed}
                </Text>

                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(day.completed / maxDaily) * 100}%`,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.chartLabel}>{day.label}</Text>
              </View>
            ))}
          </View>

          {total === 0 && gamesPlayed === 0 && (
            <Text style={styles.emptyText}>
              No activity recorded in the last 7 days yet.
            </Text>
          )}

          <Text style={styles.footer}>
            Progress is intended to help caregivers understand daily
            activity, not to grade the patient.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5FC",
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F7F5FC",
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#40317E",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    color: "#858096",
    marginTop: 6,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#40317E",
    marginTop: 24,
    marginBottom: 12,
  },
  muted: {
    fontSize: 13,
    color: "#858096",
    marginTop: 5,
  },
  patientChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7F1",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedChip: {
    backgroundColor: "#7955D9",
    borderColor: "#7955D9",
  },
  patientChipText: {
    color: "#40317E",
    fontWeight: "600",
  },
  selectedChipText: {
    color: "#FFFFFF",
  },
  complianceCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 22,
    marginTop: 25,
  },
  cardLabel: {
    fontSize: 15,
    color: "#858096",
  },
  complianceValue: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#7955D9",
    marginTop: 8,
  },
  cardDescription: {
    color: "#858096",
    marginTop: 5,
    fontSize: 13,
  },
  progressBackground: {
    height: 10,
    backgroundColor: "#EEE8FF",
    borderRadius: 10,
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7955D9",
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
  },
  statValue: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#40317E",
  },
  statLabel: {
    fontSize: 13,
    color: "#858096",
    marginTop: 5,
  },
  gameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  gameEmoji: {
    fontSize: 38,
  },
  gameName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#40317E",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 190,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartValue: {
    fontSize: 11,
    color: "#858096",
    marginBottom: 6,
  },
  barBackground: {
    height: 105,
    width: 19,
    backgroundColor: "#EEE8FF",
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    backgroundColor: "#7955D9",
    borderRadius: 10,
  },
  chartLabel: {
    fontSize: 11,
    color: "#858096",
    marginTop: 8,
  },
  emptyText: {
    color: "#858096",
    textAlign: "center",
    marginTop: 25,
  },
  footer: {
    color: "#858096",
    fontSize: 12,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 35,
    lineHeight: 18,
  },
});
