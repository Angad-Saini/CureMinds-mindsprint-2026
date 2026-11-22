
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";

type Patient = {
  patient_id: string;
  full_name: string;
};

type GameSession = {
  game_name: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

type DayProgress = {
  label: string;
  completed: number;
};

type GamePerformance = {
  name: string;
  played: number;
  score: number;
  total: number;
  percentage: number;
};

const escapeHtml = (value: unknown) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatReportDate = (value: string) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

async function fetchAllPages<T>(
  fetchPage: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const results: T[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await fetchPage(from, from + pageSize - 1);

    if (error) throw error;

    const page = data || [];
    results.push(...page);

    if (page.length < pageSize) break;

    from += pageSize;
  }

  return results;
}

export default function ProgressScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [mostPlayed, setMostPlayed] = useState("No games played yet");
  const [mostPlayedCount, setMostPlayedCount] = useState(0);

  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>([]);
  const [gamePerformance, setGamePerformance] = useState<GamePerformance[]>([]);
  const [recentGames, setRecentGames] = useState<GameSession[]>([]);

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

      try {
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
              .select("game_name, score, total_questions, completed_at")
              .eq("patient_id", selectedPatient)
              .gte("completed_at", startISO)
              .lte("completed_at", nowISO)
              .order("completed_at", { ascending: false }),
          ]);

        if (tasksResult.error) throw tasksResult.error;
        if (routinesResult.error) throw routinesResult.error;
        if (gamesResult.error) throw gamesResult.error;

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
        setRecentGames(games.slice(0, 5));

        const totalCorrect = games.reduce(
          (sum, game) => sum + Number(game.score || 0),
          0
        );

        const totalQuestions = games.reduce(
          (sum, game) => sum + Number(game.total_questions || 0),
          0
        );

        const average =
          totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        setAverageScore(average);

        const gameCounts: Record<string, number> = {};
        const gameStats: Record<
          string,
          { played: number; score: number; total: number }
        > = {};

        games.forEach((game) => {
          gameCounts[game.game_name] =
            (gameCounts[game.game_name] || 0) + 1;

          if (!gameStats[game.game_name]) {
            gameStats[game.game_name] = {
              played: 0,
              score: 0,
              total: 0,
            };
          }

          gameStats[game.game_name].played += 1;
          gameStats[game.game_name].score += Number(game.score || 0);
          gameStats[game.game_name].total += Number(
            game.total_questions || 0
          );
        });

        const mostPlayedGame = Object.entries(gameCounts).sort(
          (a, b) => b[1] - a[1]
        )[0];

        setMostPlayed(mostPlayedGame?.[0] || "No games played yet");
        setMostPlayedCount(mostPlayedGame?.[1] || 0);

        const performance = Object.entries(gameStats).map(
          ([name, stats]) => ({
            name,
            played: stats.played,
            score: stats.score,
            total: stats.total,
            percentage:
              stats.total > 0
                ? Math.round((stats.score / stats.total) * 100)
                : 0,
          })
        );

        setGamePerformance(performance);

        const days: DayProgress[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          const dayKey = date.toLocaleDateString("en-CA");

          const dayTasks = tasks.filter(
            (item) =>
              new Date(item.created_at).toLocaleDateString("en-CA") ===
                dayKey && item.is_completed
          );

          const dayRoutines = routines.filter(
            (item) =>
              new Date(item.scheduled_at).toLocaleDateString("en-CA") ===
                dayKey && item.is_completed
          );

          days.push({
            label: date.toLocaleDateString("en-IN", {
              weekday: "short",
            }),
            completed: dayTasks.length + dayRoutines.length,
          });
        }

        setWeeklyProgress(days);
      } catch (error) {
        console.error("Progress fetch error:", error);
      } finally {
        setProgressLoading(false);
      }
    };

    fetchProgress();
  }, [selectedPatient]);

  const compliance =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const maxDaily = Math.max(
    1,
    ...weeklyProgress.map((day) => day.completed)
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const exportPatientReport = async () => {
    if (!selectedPatient) return;

    const patient = patients.find(
      (item) => item.patient_id === selectedPatient
    );

    if (!patient) return;

    try {
      setExportLoading(true);

      const [tasks, routines, games] = await Promise.all([
        fetchAllPages<any>((from, to) =>
          supabase
            .from("patient_tasks")
            .select("*")
            .eq("patient_id", selectedPatient)
            .order("created_at", { ascending: true })
            .range(from, to)
        ),

        fetchAllPages<any>((from, to) =>
          supabase
            .from("patient_schedules")
            .select("*")
            .eq("patient_id", selectedPatient)
            .order("scheduled_at", { ascending: true })
            .range(from, to)
        ),

        fetchAllPages<GameSession>((from, to) =>
          supabase
            .from("patient_game_sessions")
            .select("game_name, score, total_questions, completed_at")
            .eq("patient_id", selectedPatient)
            .order("completed_at", { ascending: true })
            .range(from, to)
        ),
      ]);

      const completedTasks = tasks.filter(
        (task) => task.is_completed
      ).length;

      const completedRoutines = routines.filter(
        (routine) => routine.is_completed
      ).length;

      const totalActivities = tasks.length + routines.length;
      const completedActivities = completedTasks + completedRoutines;

      const totalCorrect = games.reduce(
        (sum, game) => sum + Number(game.score || 0),
        0
      );

      const totalQuestions = games.reduce(
        (sum, game) => sum + Number(game.total_questions || 0),
        0
      );

      const overallScore =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0;

      const taskRows = tasks
        .map((task, index) => {
          const name =
            task.title ||
            task.task_name ||
            task.name ||
            task.activity_name ||
            `Task ${index + 1}`;

          return `
            <tr>
              <td>${escapeHtml(name)}</td>
              <td>${escapeHtml(task.description || "—")}</td>
              <td>${task.is_completed ? "Completed" : "Pending"}</td>
              <td>${escapeHtml(
                formatReportDate(task.created_at || task.due_date)
              )}</td>
            </tr>
          `;
        })
        .join("");

      const routineRows = routines
        .map(
          (routine) => `
            <tr>
              <td>${escapeHtml(routine.title || "Routine")}</td>
              <td>${escapeHtml(routine.description || "—")}</td>
              <td>${escapeHtml(formatReportDate(routine.scheduled_at))}</td>
              <td>${routine.is_completed ? "Completed" : "Pending"}</td>
            </tr>
          `
        )
        .join("");

      const gameRows = games
        .map(
          (game) => `
            <tr>
              <td>${escapeHtml(game.game_name)}</td>
              <td>${Number(game.score || 0)} / ${Number(
                game.total_questions || 0
              )}</td>
              <td>${escapeHtml(formatReportDate(game.completed_at))}</td>
            </tr>
          `
        )
        .join("");

      const generatedAt = new Date().toLocaleString("en-IN", {
        dateStyle: "long",
        timeStyle: "short",
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #29243B;
              font-size: 12px;
            }

            h1 {
              color: #40317E;
              font-size: 25px;
              margin-bottom: 5px;
            }

            h2 {
              color: #40317E;
              font-size: 17px;
              margin-top: 28px;
              border-bottom: 1px solid #E5DFF5;
              padding-bottom: 7px;
            }

            p {
              color: #696477;
              line-height: 1.6;
            }

            .summary {
              background: #F5F1FF;
              padding: 15px;
              border-radius: 10px;
              margin-top: 20px;
            }

            .summary-item {
              margin: 7px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }

            th {
              background: #F0ECFA;
              color: #40317E;
              text-align: left;
            }

            th, td {
              padding: 9px;
              border: 1px solid #E8E4EF;
              vertical-align: top;
              word-break: break-word;
            }

            .notice {
              background: #F8F6FC;
              padding: 12px;
              margin-top: 30px;
              border-radius: 8px;
              line-height: 1.6;
            }

            .footer {
              margin-top: 25px;
              font-size: 10px;
              color: #858096;
              text-align: center;
            }
          </style>
        </head>

        <body>
          <h1>CureMinds</h1>
          <p>Patient Activity and Progress Report</p>

          <div class="summary">
            <div class="summary-item">
              <strong>Patient:</strong>
              ${escapeHtml(patient.full_name)}
            </div>

            <div class="summary-item">
              <strong>Report generated:</strong>
              ${escapeHtml(generatedAt)}
            </div>

            <div class="summary-item">
              <strong>Reporting period:</strong>
              All available recorded history
            </div>
          </div>

          <h2>Activity Summary</h2>

          <p>
            <strong>Total activities:</strong> ${totalActivities}<br/>
            <strong>Completed activities:</strong> ${completedActivities}<br/>
            <strong>Completed tasks:</strong> ${completedTasks}<br/>
            <strong>Completed routines:</strong> ${completedRoutines}<br/>
            <strong>Activity completion:</strong>
            ${
              totalActivities > 0
                ? Math.round(
                    (completedActivities / totalActivities) * 100
                  )
                : 0
            }%
          </p>

          <h2>Task History (${tasks.length})</h2>

          ${
            tasks.length > 0
              ? `
                <table>
                  <tr>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created / Due</th>
                  </tr>
                  ${taskRows}
                </table>
              `
              : "<p>No task records available.</p>"
          }

          <h2>Daily Routine History (${routines.length})</h2>

          ${
            routines.length > 0
              ? `
                <table>
                  <tr>
                    <th>Routine</th>
                    <th>Description</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                  </tr>
                  ${routineRows}
                </table>
              `
              : "<p>No routine records available.</p>"
          }

          <h2>Cognitive Game History (${games.length})</h2>

          <p>
            <strong>Completed sessions:</strong> ${games.length}<br/>
            <strong>Total recorded score:</strong> ${totalCorrect}<br/>
            <strong>Total questions:</strong> ${totalQuestions}<br/>
            <strong>Overall score:</strong> ${overallScore}%
          </p>

          ${
            games.length > 0
              ? `
                <table>
                  <tr>
                    <th>Game</th>
                    <th>Score</th>
                    <th>Completed At</th>
                  </tr>
                  ${gameRows}
                </table>
              `
              : "<p>No game sessions available.</p>"
          }

          <div class="notice">
            <strong>Important note:</strong>
            This report contains activity and game records collected
            through the CureMinds application. It is intended to help
            caregivers and healthcare professionals review recorded
            activity. It is not a medical diagnosis, clinical assessment,
            or substitute for professional evaluation.
          </div>

          <div class="footer">
            Generated by CureMinds · ${escapeHtml(generatedAt)}
          </div>
        </body>
        </html>
      `;

      // Generate the PDF and request its Base64 contents.
      const pdf = await Print.printToFileAsync({
        html,
        base64: true,
      });

      if (!pdf.base64) {
        throw new Error("PDF generation did not return Base64 data.");
      }

      // Save the PDF directly into the app cache.
      const cacheDirectory = FileSystem.cacheDirectory;

      if (!cacheDirectory) {
        throw new Error("App cache directory is unavailable.");
      }

      const destinationUri =
        `${cacheDirectory}CureMinds-Patient-Report-${Date.now()}.pdf`;

      await FileSystem.writeAsStringAsync(
        destinationUri,
        pdf.base64,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      console.log("PDF saved successfully:", destinationUri);

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          "Sharing unavailable",
          "Sharing is not supported on this device."
        );
        return;
      }

      await Sharing.shareAsync(destinationUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share CureMinds Patient Report",
        UTI: "com.adobe.pdf",
      });
    } catch (error: any) {
      console.error("PDF export error:", error);

      Alert.alert(
        "Export Failed",
        error?.message || "Unable to generate the patient report."
      );
    } finally {
      setExportLoading(false);
    }
  };

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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

      <TouchableOpacity
        style={[
          styles.reportButton,
          (exportLoading || progressLoading) && { opacity: 0.6 },
        ]}
        onPress={exportPatientReport}
        disabled={exportLoading || progressLoading}
      >
        {exportLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.reportButtonText}>
            Export Patient Report (PDF)
          </Text>
        )}
      </TouchableOpacity>

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

          <Text style={styles.sectionTitle}>Game Overview</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games completed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{averageScore}%</Text>
              <Text style={styles.statLabel}>Average score</Text>
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

          <Text style={styles.sectionTitle}>Game Performance</Text>

          {gamePerformance.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No games played in the last 7 days yet.
              </Text>
            </View>
          ) : (
            gamePerformance.map((game) => (
              <View key={game.name} style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.performancePercentage}>
                    {game.percentage}%
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${game.percentage}%` },
                    ]}
                  />
                </View>

                <Text style={styles.muted}>
                  {game.played} sessions · {game.score}/{game.total} correct
                </Text>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Recent Games</Text>

          {recentGames.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Completed games will appear here.
              </Text>
            </View>
          ) : (
            recentGames.map((game, index) => (
              <View
                key={`${game.game_name}-${game.completed_at}-${index}`}
                style={styles.recentGameCard}
              >
                <View style={styles.recentGameIcon}>
                  <Text style={styles.recentGameEmoji}>🎮</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.gameName}>{game.game_name}</Text>
                  <Text style={styles.muted}>
                    {formatDate(game.completed_at)}
                  </Text>
                </View>

                <Text style={styles.recentScore}>
                  {game.score}/{game.total_questions}
                </Text>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Weekly Activity</Text>

          <View style={styles.chartCard}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.chartColumn}>
                <Text style={styles.chartValue}>{day.completed}</Text>

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
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  reportButton: {
    backgroundColor: "#7955D9",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
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
    marginTop: 15,
    marginBottom: 8,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#40317E",
  },
  performanceCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
  },
  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  performancePercentage: {
    color: "#7955D9",
    fontWeight: "bold",
    fontSize: 18,
  },
  recentGameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recentGameIcon: {
    width: 45,
    height: 45,
    backgroundColor: "#EEE8FF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  recentGameEmoji: {
    fontSize: 23,
  },
  recentScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7955D9",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  emptyText: {
    color: "#858096",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
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
  chartLabel: {
    fontSize: 11,
    color: "#858096",
    marginTop: 7,
    textAlign: "center",
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
  footer: {
    color: "#858096",
    fontSize: 12,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 35,
    lineHeight: 18,
  },
});
