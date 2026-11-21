
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

type Props = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
};

export default function CaretakerPage({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
}: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.brand}>CureMinds</Text>
      <Text style={styles.portal}>CARETAKER PORTAL</Text>

      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.emptyCard}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✦</Text>
        </View>

        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyDescription}>
          {emptyDescription}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Care that remembers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5FC",
  },
  content: {
    padding: 22,
    paddingTop: 18,
    flexGrow: 1,
  },
  brand: {
    fontSize: 23,
    fontWeight: "800",
    color: "#53349D",
  },
  portal: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#858096",
    marginTop: 4,
  },
  header: {
    marginTop: 38,
    marginBottom: 25,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#28243A",
  },
  subtitle: {
    fontSize: 14,
    color: "#858096",
    marginTop: 8,
    lineHeight: 21,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE7F1",
    marginTop: 10,
  },
  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  icon: {
    fontSize: 30,
    color: "#7955D9",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#28243A",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 13,
    color: "#858096",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 9,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 35,
    alignItems: "center",
  },
  footerText: {
    color: "#A6A1B3",
    fontSize: 12,
  },
});
