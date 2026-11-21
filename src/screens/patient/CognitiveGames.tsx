
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabase";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type GameScreen = "home" | "memory" | "object" | "routine";

type GameObject = {
  name: string;
  image: string;
};

type MemoryCard = GameObject & {
  id: number;
};

type PatientSchedule = {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  is_completed: boolean;
};

const objects: GameObject[] = [
  {
    name: "Apple",
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500",
  },
  {
    name: "Banana",
    image:
      "https://images.unsplash.com/photo-1574226516831-e1dff420e8e8?w=500",
  },
  {
    name: "Flower",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500",
  },
  {
    name: "Cup",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
  },
];

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const saveGameSession = async (
  gameName: string,
  score: number,
  totalQuestions: number
) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Unable to get patient:", userError);
      return;
    }

    const { error } = await supabase
      .from("patient_game_sessions")
      .insert({
        patient_id: user.id,
        game_name: gameName,
        score,
        total_questions: totalQuestions,
      });

    if (error) {
      console.error("Unable to save game session:", error);
    }
  } catch (error) {
    console.error("Game session error:", error);
  }
};

export default function CognitiveGames() {
  const [screen, setScreen] = useState<GameScreen>("home");

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [memoryCompleted, setMemoryCompleted] = useState(false);

  const [question, setQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<GameObject[]>([]);
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [objectCompleted, setObjectCompleted] = useState(false);

  const [routines, setRoutines] = useState<PatientSchedule[]>([]);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [routineError, setRoutineError] = useState("");
  const [completingRoutine, setCompletingRoutine] = useState<string | null>(
    null
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memoryLocked = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const clearGameTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startMemory = () => {
    clearGameTimer();

    const shuffled = shuffle([...objects, ...objects]).map(
      (card, index) => ({
        ...card,
        id: index,
      })
    );

    setCards(shuffled);
    setSelected([]);
    setMatched([]);
    setMoves(0);
    setMemoryCompleted(false);
    memoryLocked.current = false;
    setScreen("memory");
  };

  const flipCard = (index: number) => {
    if (
      memoryLocked.current ||
      selected.length === 2 ||
      selected.includes(index) ||
      matched.includes(index) ||
      memoryCompleted
    ) {
      return;
    }

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((previous) => previous + 1);

      const first = cards[newSelected[0]];
      const second = cards[newSelected[1]];

      if (first.name === second.name) {
        const newMatched = [...matched, ...newSelected];

        setMatched(newMatched);
        setSelected([]);

        if (newMatched.length === cards.length) {
          setMemoryCompleted(true);
          saveGameSession("Memory Match", objects.length, objects.length);
        }
      } else {
        memoryLocked.current = true;

        timerRef.current = setTimeout(() => {
          setSelected([]);
          memoryLocked.current = false;
          timerRef.current = null;
        }, 1100);
      }
    }
  };

  const startObjectGame = () => {
    clearGameTimer();

    setQuestion(0);
    setScore(0);
    setFeedback("");
    setAnswered(false);
    setObjectCompleted(false);
    setOptions(shuffle(objects));
    setScreen("object");
  };

  const answerObject = (answer: string) => {
    if (answered || objectCompleted) return;

    setAnswered(true);

    const correct = objects[question].name;
    const isCorrect = answer === correct;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      setFeedback("Correct! Well done!");
    } else {
      setFeedback(`That's okay! The correct answer is ${correct}.`);
    }

    timerRef.current = setTimeout(() => {
      if (question < objects.length - 1) {
        setQuestion((previous) => previous + 1);
        setOptions(shuffle(objects));
        setFeedback("");
        setAnswered(false);
      } else {
        setObjectCompleted(true);

        saveGameSession(
          "Object Recognition",
          nextScore,
          objects.length
        );
      }

      timerRef.current = null;
    }, 1500);
  };

  const loadRoutines = async () => {
    setRoutineLoading(true);
    setRoutineError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Unable to identify your account. Please log in again.");
      }

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data, error } = await supabase
        .from("patient_schedules")
        .select("id, title, description, scheduled_at, is_completed")
        .eq("patient_id", user.id)
        .gte("scheduled_at", start.toISOString())
        .lt("scheduled_at", end.toISOString())
        .order("scheduled_at", { ascending: true });

      if (error) {
        throw error;
      }

      setRoutines(data || []);
    } catch (error) {
      console.error("Unable to load routines:", error);
      setRoutineError(
        error instanceof Error
          ? error.message
          : "Unable to load your routines."
      );
    } finally {
      setRoutineLoading(false);
    }
  };

  const startRoutine = () => {
    setScreen("routine");
    loadRoutines();
  };

  const completeRoutine = async (scheduleId: string) => {
    if (completingRoutine) return;

    setCompletingRoutine(scheduleId);
    setRoutineError("");

    try {
      const { error } = await supabase.rpc(
        "complete_patient_schedule",
        {
          p_schedule_id: scheduleId,
        }
      );

      if (error) {
        throw error;
      }

      setRoutines((previous) =>
        previous.map((item) =>
          item.id === scheduleId
            ? { ...item, is_completed: true }
            : item
        )
      );
    } catch (error) {
      console.error("Unable to complete routine:", error);
      setRoutineError(
        error instanceof Error
          ? error.message
          : "Unable to update this activity. Please try again."
      );
    } finally {
      setCompletingRoutine(null);
    }
  };

  const resetHome = () => {
    clearGameTimer();
    memoryLocked.current = false;
    setSelected([]);
    setFeedback("");
    setAnswered(false);
    setMemoryCompleted(false);
    setObjectCompleted(false);
    setScreen("home");
  };

  const renderActionButton = (
    label: string,
    onPress: () => void,
    secondary = false
  ) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        secondary && styles.secondaryButton,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.actionButtonText,
          secondary && styles.secondaryButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const completedRoutines = routines.filter(
    (item) => item.is_completed
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Cognitive Activities</Text>
      <Text style={styles.subtitle}>
        Take your time, enjoy yourself, and keep learning!
      </Text>

      {screen === "home" && (
        <View>
          <TouchableOpacity
            style={styles.gameCard}
            onPress={startMemory}
            activeOpacity={0.8}
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameEmoji}>🧠</Text>
            </View>

            <Text style={styles.gameTitle}>Memory Match</Text>
            <Text style={styles.description}>
              Find matching pictures by remembering where they are.
            </Text>

            <Text style={styles.cardButton}>Play Game →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={startObjectGame}
            activeOpacity={0.8}
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameEmoji}>🍎</Text>
            </View>

            <Text style={styles.gameTitle}>Object Recognition</Text>
            <Text style={styles.description}>
              Look at familiar objects and identify what you see.
            </Text>

            <Text style={styles.cardButton}>Play Game →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={startRoutine}
            activeOpacity={0.8}
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameEmoji}>🏠</Text>
            </View>

            <Text style={styles.gameTitle}>Daily Routine</Text>
            <Text style={styles.description}>
              Keep track of everyday activities and routines.
            </Text>

            <Text style={styles.cardButton}>Start Activity →</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "memory" && (
        <View style={styles.section}>
          <Text style={styles.gameTitle}>Memory Match</Text>

          <Text style={styles.description}>
            Find two pictures that look the same. Take your time!
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {matched.length / 2}
              </Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{moves}</Text>
              <Text style={styles.statLabel}>Moves</Text>
            </View>
          </View>

          {memoryCompleted ? (
            <View style={styles.center}>
              <Text style={styles.success}>Wonderful work! 🎉</Text>
              <Text style={styles.description}>
                You found every matching pair.
              </Text>

              <Text style={styles.score}>
                {objects.length} out of {objects.length} matches
              </Text>

              <Text style={styles.description}>
                Total moves: {moves}
              </Text>

              {renderActionButton("Play Again", startMemory)}
            </View>
          ) : (
            <View style={styles.grid}>
              {cards.map((card, index) => {
                const isVisible =
                  selected.includes(index) ||
                  matched.includes(index);

                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.tile,
                      matched.includes(index) && styles.matchedTile,
                    ]}
                    onPress={() => flipCard(index)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isVisible ? card.name : "Hidden card"
                    }
                  >
                    {isVisible ? (
                      <Image
                        source={{ uri: card.image }}
                        style={styles.tileImage}
                      />
                    ) : (
                      <View style={styles.hiddenCard}>
                        <Text style={styles.questionMark}>?</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {screen === "object" && (
        <View style={styles.section}>
          <Text style={styles.gameTitle}>Object Recognition</Text>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((question + (objectCompleted ? 1 : 0)) /
                      objects.length) *
                    100
                  }%`,
                },
              ]}
            />
          </View>

          {objectCompleted ? (
            <View style={styles.center}>
              <Text style={styles.success}>Activity Completed! 🎉</Text>

              <Text style={styles.description}>
                Great effort! You finished all the questions.
              </Text>

              <Text style={styles.score}>
                Score: {score} / {objects.length}
              </Text>

              {renderActionButton("Play Again", startObjectGame)}
            </View>
          ) : (
            <>
              <Text style={styles.questionCount}>
                Question {question + 1} of {objects.length}
              </Text>

              <Text style={styles.description}>
                Which object is shown in this picture?
              </Text>

              <Image
                source={{ uri: objects[question].image }}
                style={styles.objectImage}
              />

              <View style={styles.options}>
                {options.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.option,
                      answered &&
                        item.name === objects[question].name &&
                        styles.correctOption,
                    ]}
                    onPress={() => answerObject(item.name)}
                    disabled={answered}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        answered &&
                          item.name === objects[question].name &&
                          styles.correctOptionText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={[
                  styles.feedback,
                  feedback.startsWith("That's okay") &&
                    styles.neutralFeedback,
                ]}
              >
                {feedback}
              </Text>
            </>
          )}
        </View>
      )}

      {screen === "routine" && (
        <View style={styles.section}>
          <Text style={styles.gameTitle}>Daily Routine</Text>

          <Text style={styles.description}>
            Complete the activities assigned to you for today.
          </Text>

          {routineLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7955D9" />
              <Text style={styles.loadingText}>
                Loading your routines...
              </Text>
            </View>
          ) : (
            <>
              {routineError !== "" && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {routineError}
                  </Text>

                  {renderActionButton("Try Again", loadRoutines)}
                </View>
              )}

              {routines.length > 0 && (
                <>
                  <View style={styles.routineProgress}>
                    <Text style={styles.routineProgressText}>
                      Your progress
                    </Text>

                    <Text style={styles.routineProgressText}>
                      {completedRoutines} / {routines.length}
                    </Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            (completedRoutines / routines.length) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>

                  {routines.map((item) => {
                    const isDone = item.is_completed;
                    const isCompleting =
                      completingRoutine === item.id;

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.routineCard,
                          isDone && styles.completedRoutineCard,
                        ]}
                      >
                        <View style={styles.routineDetails}>
                          <Text style={styles.routineName}>
                            {item.title}
                          </Text>

                          {item.description ? (
                            <Text style={styles.routineDescription}>
                              {item.description}
                            </Text>
                          ) : null}

                          <Text style={styles.routineTime}>
                            {new Date(item.scheduled_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Text>

                          <Text
                            style={[
                              styles.routineStatus,
                              isDone && styles.completedStatus,
                            ]}
                          >
                            {isDone
                              ? "Completed ✓"
                              : isCompleting
                              ? "Saving..."
                              : "Not completed yet"}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.completeButton,
                            isDone && styles.completedButton,
                          ]}
                          onPress={() => completeRoutine(item.id)}
                          disabled={isDone || completingRoutine !== null}
                          activeOpacity={0.8}
                        >
                          {isCompleting ? (
                            <ActivityIndicator
                              size="small"
                              color="#FFFFFF"
                            />
                          ) : (
                            <Text style={styles.completeButtonText}>
                              {isDone ? "Done" : "Complete"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {completedRoutines === routines.length && (
                    <Text style={styles.success}>
                      All activities completed! 🎉
                    </Text>
                  )}
                </>
              )}

              {!routineLoading &&
                !routineError &&
                routines.length === 0 && (
                  <View style={styles.emptyRoutine}>
                    <Text style={styles.emptyEmoji}>📅</Text>
                    <Text style={styles.emptyTitle}>
                      No routines for today
                    </Text>
                    <Text style={styles.description}>
                      Your caretaker hasn't added any activities for today
                      yet. Check back later!
                    </Text>
                  </View>
                )}
            </>
          )}
        </View>
      )}

      {screen !== "home" && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={resetHome}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>← Back to Activities</Text>
        </TouchableOpacity>
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
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#40317E",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6E668F",
    marginBottom: 25,
    marginTop: 6,
    lineHeight: 23,
  },
  gameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5DDFB",
  },
  gameIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  gameEmoji: {
    fontSize: 28,
  },
  gameTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#40317E",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B6487",
    marginVertical: 10,
    lineHeight: 24,
  },
  cardButton: {
    color: "#7955D9",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 12,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 22,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#EAE7F1",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F2EEFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#53349D",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B6487",
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  tile: {
    width: "47%",
    height: 145,
    marginBottom: 15,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E7E0FF",
    borderWidth: 2,
    borderColor: "#E7E0FF",
  },
  matchedTile: {
    borderColor: "#5DAA85",
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  hiddenCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7955D9",
  },
  questionMark: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  objectImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    marginVertical: 15,
    resizeMode: "cover",
    backgroundColor: "#EEE8FF",
  },
  questionCount: {
    fontSize: 15,
    color: "#7955D9",
    fontWeight: "bold",
    marginTop: 10,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  option: {
    width: "47%",
    backgroundColor: "#EEE8FF",
    padding: 17,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5DDFB",
  },
  optionText: {
    textAlign: "center",
    color: "#40317E",
    fontSize: 17,
    fontWeight: "bold",
  },
  correctOption: {
    backgroundColor: "#E5F5EC",
    borderColor: "#5DAA85",
  },
  correctOptionText: {
    color: "#26734F",
  },
  feedback: {
    textAlign: "center",
    fontSize: 17,
    color: "#26734F",
    fontWeight: "bold",
    marginVertical: 12,
    minHeight: 25,
  },
  neutralFeedback: {
    color: "#7955D9",
  },
  progressContainer: {
    height: 9,
    backgroundColor: "#EEE8FF",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7955D9",
    borderRadius: 10,
  },
  routineProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  routineProgressText: {
    color: "#53349D",
    fontWeight: "bold",
    fontSize: 15,
  },
  routineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F7F5FC",
    borderRadius: 18,
    marginVertical: 9,
    gap: 12,
    borderWidth: 1,
    borderColor: "#EAE7F1",
  },
  completedRoutineCard: {
    backgroundColor: "#F0F8F3",
    borderColor: "#B9DEC9",
  },
  routineDetails: {
    flex: 1,
  },
  routineName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#40317E",
    marginBottom: 5,
  },
  routineDescription: {
    fontSize: 13,
    color: "#77718C",
    lineHeight: 18,
  },
  routineTime: {
    fontSize: 13,
    color: "#7955D9",
    marginTop: 6,
    fontWeight: "600",
  },
  routineStatus: {
    color: "#7955D9",
    fontWeight: "bold",
    marginTop: 7,
    fontSize: 14,
  },
  completedStatus: {
    color: "#26734F",
  },
  completeButton: {
    backgroundColor: "#7955D9",
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 12,
    minWidth: 85,
    alignItems: "center",
    justifyContent: "center",
  },
  completedButton: {
    backgroundColor: "#5DAA85",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    color: "#6B6487",
    marginTop: 12,
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: "#FFF1F1",
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
  },
  errorText: {
    color: "#A33A3A",
    fontSize: 14,
    lineHeight: 21,
  },
  emptyRoutine: {
    alignItems: "center",
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#40317E",
    textAlign: "center",
  },
  center: {
    alignItems: "center",
    padding: 20,
  },
  success: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#26734F",
    textAlign: "center",
    marginTop: 18,
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#40317E",
    textAlign: "center",
    marginTop: 18,
  },
  actionButton: {
    backgroundColor: "#7955D9",
    padding: 16,
    borderRadius: 15,
    marginTop: 20,
    width: "100%",
  },
  actionButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#EEE8FF",
  },
  secondaryButtonText: {
    color: "#53349D",
  },
  backButton: {
    backgroundColor: "#40317E",
    padding: 16,
    borderRadius: 15,
    marginTop: 20,
  },
  backText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
});
