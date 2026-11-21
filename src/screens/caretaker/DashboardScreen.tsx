
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Users, UserRound, RefreshCw, CalendarDays } from "lucide-react-native";
import { supabase } from "../../services/supabase";

type Patient = {
  patient_id: string;
  full_name: string;
  linked_at: string;
};

export default function DashboardScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPatients = useCallback(async () => {
    setError("");

    const { data, error } = await supabase.rpc("get_my_patients");

    if (error) {
      setError(error.message);
      setPatients([]);
    } else {
      setPatients(data || []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CUREMINDS CARETAKER</Text>
        <Text style={styles.heading}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Here's an overview of your care activities.
        </Text>
      </View>

      <LinearGradient
        colors={["#7955D9", "#53349D"]}
        style={styles.summaryCard}
      >
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>LINKED PATIENTS</Text>
            <Text style={styles.summaryNumber}>
              {loading ? "—" : patients.length}
            </Text>
            <Text style={styles.summaryDescription}>
              Patients under your care
            </Text>
          </View>

          <View style={styles.summaryIcon}>
            <Users color="#FFFFFF" size={28} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Your Patients</Text>
          <Text style={styles.sectionSubtitle}>
            Patients connected to your account
          </Text>
        </View>

        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <RefreshCw size={18} color="#7955D9" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#7955D9" />
          <Text style={styles.stateText}>Loading your patients...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorTitle}>Unable to load patients</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPatients}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : patients.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Users size={30} color="#7955D9" />
          </View>
          <Text style={styles.emptyTitle}>No patients linked yet</Text>
          <Text style={styles.emptyDescription}>
            Once a patient connects using a pairing code, their information
            will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.patientList}>
          {patients.map((patient) => (
            <View key={patient.patient_id} style={styles.patientCard}>
              <View style={styles.patientAvatar}>
                <UserRound size={23} color="#7955D9" />
              </View>

              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>
                  {patient.full_name || "Unnamed Patient"}
                </Text>

                <View style={styles.dateRow}>
                  <CalendarDays size={13} color="#9992AA" />
                  <Text style={styles.patientDate}>
                    Linked on {formatDate(patient.linked_at)}
                  </Text>
                </View>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Linked</Text>
              </View>
            </View>
          ))}
        </View>
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
    padding: 22,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: "#7955D9",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#241B35",
  },
  subtitle: {
    color: "#898397",
    fontSize: 14,
    marginTop: 6,
  },
  summaryCard: {
    borderRadius: 22,
    padding: 23,
    marginBottom: 30,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#E4D9FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    marginTop: 7,
  },
  summaryDescription: {
    color: "#E4D9FF",
    fontSize: 13,
    marginTop: 3,
  },
  summaryIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#FFFFFF25",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#241B35",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#9690A3",
    fontSize: 12,
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: "#EEE9FA",
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stateContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },
  stateText: {
    color: "#898397",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
  errorTitle: {
    color: "#241B35",
    fontSize: 16,
    fontWeight: "700",
  },
  retryButton: {
    backgroundColor: "#7955D9",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#F0EBFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#241B35",
  },
  emptyDescription: {
    color: "#9690A3",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  patientList: {
    gap: 12,
  },
  patientCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  patientAvatar: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: "#F0EBFC",
    alignItems: "center",
    justifyContent: "center",
  },
  patientInfo: {
    flex: 1,
    marginLeft: 13,
  },
  patientName: {
    color: "#302641",
    fontSize: 14,
    fontWeight: "800",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  patientDate: {
    color: "#9690A3",
    fontSize: 11,
  },
  statusBadge: {
    backgroundColor: "#E8F7EF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#319765",
    fontSize: 10,
    fontWeight: "800",
  },
});
