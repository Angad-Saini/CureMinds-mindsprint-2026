
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../services/supabase";

type Patient = {
  patient_id: string;
  full_name: string;
  linked_at: string;
};

export default function PatientsScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  const loadPatients = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc("get_my_patients");

    if (error) {
      Alert.alert("Error loading patients", error.message);
    } else {
      setPatients(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const linkPatient = async () => {
    if (code.trim().length !== 6) {
      Alert.alert("Invalid code", "Enter the 6-digit patient code.");
      return;
    }

    setLinking(true);

    const { error } = await supabase.rpc("link_patient_with_code", {
      p_code: code.trim(),
    });

    setLinking(false);

    if (error) {
      Alert.alert("Unable to link patient", error.message);
      return;
    }

    setCode("");
    Alert.alert("Patient linked", "The patient was added successfully.");
    loadPatients();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.brand}>CureMinds</Text>
      <Text style={styles.portal}>CARETAKER PORTAL</Text>

      <View style={styles.header}>
        <Text style={styles.title}>My Patients</Text>
        <Text style={styles.subtitle}>
          Connect with patients and manage their care.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connect a patient</Text>
        <Text style={styles.description}>
          Ask your patient to generate a pairing code in their app.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit code"
          placeholderTextColor="#A6A1B3"
          value={code}
          onChangeText={(value) =>
            setCode(value.replace(/[^0-9]/g, "").slice(0, 6))
          }
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={linkPatient}
          disabled={linking}
        >
          {linking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Connect Patient</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Connected Patients</Text>
        <TouchableOpacity onPress={loadPatients}>
          <Text style={styles.refresh}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#7955D9" style={{ marginTop: 25 }} />
      ) : patients.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✦</Text>
          <Text style={styles.emptyTitle}>No patients linked yet</Text>
          <Text style={styles.description}>
            Once you connect a patient using their pairing code, they will
            appear here.
          </Text>
        </View>
      ) : (
        patients.map((patient) => (
          <View key={patient.patient_id} style={styles.patientCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(patient.full_name || "P").charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>
                {patient.full_name || "Patient"}
              </Text>
              <Text style={styles.patientDate}>
                Connected{" "}
                {new Date(patient.linked_at).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.connected}>Connected</Text>
          </View>
        ))
      )}

      <Text style={styles.footer}>Care that remembers.</Text>
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
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#EAE7F1",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#28243A",
  },
  description: {
    fontSize: 13,
    color: "#858096",
    lineHeight: 20,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F7F5FC",
    borderRadius: 12,
    padding: 15,
    marginTop: 18,
    fontSize: 16,
    color: "#28243A",
    letterSpacing: 3,
  },
  button: {
    backgroundColor: "#7955D9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#28243A",
  },
  refresh: {
    color: "#7955D9",
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE7F1",
  },
  emptyIcon: {
    fontSize: 30,
    color: "#7955D9",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#28243A",
  },
  patientCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAE7F1",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#7955D9",
  },
  patientName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#28243A",
  },
  patientDate: {
    fontSize: 11,
    color: "#858096",
    marginTop: 5,
  },
  connected: {
    fontSize: 10,
    color: "#39865B",
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: "#A6A1B3",
    fontSize: 12,
    marginTop: 35,
    marginBottom: 15,
  },
});
