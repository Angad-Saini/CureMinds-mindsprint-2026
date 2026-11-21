import React, { useState } from "react";
import { supabase } from "../../services/supabase";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const saveGameSession = async (
  gameName: string,
  score: number,
  totalQuestions: number
) => {
  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

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
};

const objects = [
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

const routines = [
  {
    name: "Drink Water",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500",
  },
  {
    name: "Morning Walk",
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500",
  },
  {
    name: "Take Medicine",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
  },
];

const memoryCards = [
  objects[0],
  objects[1],
  objects[2],
  objects[3],
];

export default function CognitiveGames() {
  const [screen, setScreen] = useState("home");
  const [question, setQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState(false);
  const [routineDone, setRoutineDone] = useState<number[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const startMemory = () => {
    const shuffled = [...memoryCards, ...memoryCards]
      .map((card, i) => ({ ...card, id: i }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setSelected([]);
    setMatched([]);
    setScore(0);
    setCompleted(false);
    setScreen("memory");
  };

  const flipCard = (index: number) => {
    if (
      selected.length === 2 ||
      selected.includes(index) ||
      matched.includes(index)
    ) {
      return;
    }

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const first = cards[newSelected[0]];
      const second = cards[newSelected[1]];

      if (first.name === second.name) {
        const newMatched = [...matched, ...newSelected];
        setMatched(newMatched);
        setScore((s) => s + 1);
        setSelected([]);

        if (newMatched.length === cards.length) {
  setCompleted(true);
  saveGameSession("Memory Match", score + 1, cards.length / 2);
}
      } else {
        setTimeout(() => setSelected([]), 900);
      }
    }
  };

  const startObjectGame = () => {
    setQuestion(0);
    setScore(0);
    setFeedback("");
    setCompleted(false);
    setScreen("object");
  };

  const answerObject = (answer: string) => {
  if (feedback !== "") return;

  const correct = objects[question].name;
  const nextScore = answer === correct ? score + 1 : score;

  if (answer === correct) {
    setScore(nextScore);
    setFeedback("Correct! Well done.");
  } else {
    setFeedback("Try again next time!");
  }

  setTimeout(() => {
    if (question < objects.length - 1) {
      setQuestion((q) => q + 1);
      setFeedback("");
    } else {
      setCompleted(true);
      saveGameSession(
        "Object Recognition",
        nextScore,
        objects.length
      );
    }
  }, 1200);
};

  const toggleRoutine = (index: number) => {
    setRoutineDone((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const resetHome = () => {
    setScreen("home");
    setFeedback("");
    setCompleted(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>CureMinds</Text>
      <Text style={styles.subtitle}>
        Let's play and keep our minds active!
      </Text>

      {screen === "home" && (
        <View>
          <TouchableOpacity
            style={styles.gameCard}
            onPress={startMemory}
          >
            <Text style={styles.gameTitle}>🧠 Memory Match</Text>
            <Text style={styles.description}>
              Find matching pictures.
            </Text>
            <Text style={styles.button}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={startObjectGame}
          >
            <Text style={styles.gameTitle}>🍎 Object Recognition</Text>
            <Text style={styles.description}>
              Identify familiar objects.
            </Text>
            <Text style={styles.button}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => setScreen("routine")}
          >
            <Text style={styles.gameTitle}>🏠 Daily Routine</Text>
            <Text style={styles.description}>
              Remember everyday activities.
            </Text>
            <Text style={styles.button}>Start Activity</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MEMORY MATCH GAME */}

      {screen === "memory" && (
        <View style={styles.section}>
          <Text style={styles.gameTitle}>Memory Match</Text>

          <Text style={styles.description}>
            Tap two pictures to find a matching pair.
          </Text>

          {completed ? (
            <View style={styles.center}>
              <Text style={styles.success}>Wonderful! 🎉</Text>
              <Text style={styles.description}>
                You matched all the pictures!
              </Text>
              <Text style={styles.score}>
                Matches: {score}
              </Text>
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
                    style={styles.tile}
                    onPress={() => flipCard(index)}
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

      {/* OBJECT RECOGNITION GAME */}

      {screen === "object" && (
        <View style={styles.section}>
          <Text style={styles.gameTitle}>
            Object Recognition
          </Text>

          {completed ? (
            <View style={styles.center}>
              <Text style={styles.success}>Game Completed! 🎉</Text>
              <Text style={styles.score}>
                Score: {score} / {objects.length}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.description}>
                Which object is shown below?
              </Text>

              <Image
                source={{ uri: objects[question].image }}
                style={styles.objectImage}
              />

              <View style={styles.options}>
                {objects.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.option}
                    onPress={() => answerObject(item.name)}
                  >
                    <Text style={styles.optionText}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.feedback}>{feedback}</Text>

              <Text style={styles.description}>
                Question {question + 1} of {objects.length}
              </Text>
            </>
          )}
        </View>
      )}

      {/* DAILY ROUTINE */}

      {screen === "routine" && (
        <View style={styles.section}>
          <Text style={styles.gameTitle}>Daily Routine</Text>
          <Text style={styles.description}>
            Tap an activity when it is completed.
          </Text>

          {routines.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.routineCard}
              onPress={() => toggleRoutine(index)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.routineImage}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.routineName}>
                  {item.name}
                </Text>

                <Text
                  style={{
                    color: routineDone.includes(index)
                      ? "#17854A"
                      : "#D18B27",
                    fontWeight: "700",
                  }}
                >
                  {routineDone.includes(index)
                    ? "Completed ✓"
                    : "Pending"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <Text style={styles.score}>
            Completed: {routineDone.length} / {routines.length}
          </Text>
        </View>
      )}

      {screen !== "home" && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={resetHome}
        >
          <Text style={styles.backText}>← Back to Games</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    padding: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#40317E",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 17,
    color: "#6E668F",
    marginBottom: 25,
  },
  gameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5DDFB",
  },
  gameTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#40317E",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B6487",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#6C55CF",
    color: "#FFFFFF",
    textAlign: "center",
    padding: 14,
    borderRadius: 14,
    overflow: "hidden",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 12,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 22,
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  tile: {
    width: "47%",
    height: 155,
    marginBottom: 15,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E7E0FF",
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  hiddenCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C55CF",
  },
  questionMark: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  objectImage: {
    width: "100%",
    height: 230,
    borderRadius: 20,
    marginVertical: 15,
    resizeMode: "cover",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  option: {
    width: "47%",
    backgroundColor: "#EAE5FF",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
  },
  optionText: {
    textAlign: "center",
    color: "#40317E",
    fontSize: 17,
    fontWeight: "bold",
  },
  feedback: {
    textAlign: "center",
    fontSize: 18,
    color: "#17854A",
    fontWeight: "bold",
    marginVertical: 12,
  },
  routineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F7F5FF",
    borderRadius: 18,
    marginVertical: 10,
    gap: 15,
  },
  routineImage: {
    width: 90,
    height: 90,
    borderRadius: 15,
  },
  routineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#40317E",
    marginBottom: 8,
  },
  center: {
    alignItems: "center",
    padding: 20,
  },
  success: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#17854A",
    textAlign: "center",
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#40317E",
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#40317E",
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  backText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
});