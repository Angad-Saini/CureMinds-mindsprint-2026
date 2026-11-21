
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Plus,
  Trash2,
  ClipboardList,
  UserRound,
  CheckCircle2,
} from "lucide-react-native";
import { supabase } from "../../services/supabase";

type Patient = {
  patient_id: string;
  full_name: string;
  linked_at: string;
};

type Task = {
  id: string;
  patient_id: string;
  caretaker_id: string;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
};

export default function TasksScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setError("");

    const {
      data: patientData,
      error: patientError,
    } = await supabase.rpc("get_my_patients");

    if (patientError) {
      setError(patientError.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const linkedPatients = (patientData || []) as Patient[];
    setPatients(linkedPatients);

    const { data: taskData, error: taskError } = await supabase
      .from("patient_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (taskError) {
      setError(taskError.message);
    } else {
      setTasks(taskData || []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTask = async () => {
    if (!selectedPatient) {
      Alert.alert("Select a patient", "Choose a patient first.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing title", "Enter a task title.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    const { error } = await supabase.from("patient_tasks").insert({
      patient_id: selectedPatient,
      caretaker_id: user.id,
      title: title.trim(),
      description: description.trim(),
    });

    setSaving(false);

    if (error) {
      Alert.alert("Unable to create task", error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setSelectedPatient("");
    setShowForm(false);

    fetchData();
    Alert.alert("Task created", "The task has been assigned successfully.");
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      "Delete task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("patient_tasks")
              .delete()
              .eq("id", taskId);

            if (error) {
              Alert.alert("Unable to delete", error.message);
              return;
            }

            setTasks((previous) =>
              previous.filter((task) => task.id !== taskId)
            );
          },
        },
      ]
    );
  };

  const getPatientName = (patientId: string) => {
    return (
      patients.find((patient) => patient.patient_id === patientId)
        ?.full_name || "Unknown patient"
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const completedCount = tasks.filter((task) => task.is_completed).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CUREMINDS CARETAKER</Text>
        <Text style={styles.heading}>Tasks & Activities</Text>
        <Text style={styles.subtitle}>
          Create and manage activities for your patients.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {tasks.length - completedCount}
          </Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Plus color="#FFFFFF" size={20} />
        <Text style={styles.createButtonText}>
          {showForm ? "Close Form" : "Create New Task"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create a task</Text>

          <Text style={styles.label}>Assign to patient</Text>

          {patients.length === 0 ? (
            <Text style={styles.helperText}>
              Link a patient before creating tasks.
            </Text>
          ) : (
            <View style={styles.patientOptions}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.patient_id}
                  style={[
                    styles.patientOption,
                    selectedPatient === patient.patient_id &&
                      styles.selectedPatient,
                  ]}
                  onPress={() => setSelectedPatient(patient.patient_id)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      selectedPatient === patient.patient_id &&
                        styles.selectedPatientText,
                    ]}
                  >
                    {patient.full_name || "Unnamed Patient"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Task title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Complete memory game"
            placeholderTextColor="#A49DB1"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add some instructions..."
            placeholderTextColor="#A49DB1"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              (saving || patients.length === 0) && styles.disabledButton,
            ]}
            onPress={createTask}
            disabled={saving || patients.length === 0}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Assign Task</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Assigned Tasks</Text>
          <Text style={styles.sectionSubtitle}>
            Activities assigned to your patients
          </Text>
        </View>
        <ClipboardList color="#7955D9" size={23} />
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#7955D9" size="large" />
          <Text style={styles.emptyDescription}>Loading tasks...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyDescription}>{error}</Text>
          <TouchableOpacity onPress={fetchData}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <ClipboardList color="#7955D9" size={28} />
          </View>
          <Text style={styles.emptyTitle}>No tasks assigned</Text>
          <Text style={styles.emptyDescription}>
            Create your first task to get your patients started.
          </Text>
        </View>
      ) : (
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskTop}>
                <View style={styles.taskIcon}>
                  {task.is_completed ? (
                    <CheckCircle2 color="#319765" size={22} />
                  ) : (
                    <ClipboardList color="#7955D9" size={22} />
                  )}
                </View>

                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.patientRow}>
                    <UserRound size={13} color="#9690A3" />
                    <Text style={styles.patientName}>
                      {getPatientName(task.patient_id)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Trash2 size={18} color="#D45C70" />
                </TouchableOpacity>
              </View>

              {!!task.description && (
                <Text style={styles.taskDescription}>
                  {task.description}
                </Text>
              )}

              <View style={styles.taskFooter}>
                <Text style={styles.taskDate}>
                  Created {formatDate(task.created_at)}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    task.is_completed && styles.completedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      task.is_completed && styles.completedText,
                    ]}
                  >
                    {task.is_completed ? "Completed" : "Pending"}
                  </Text>
                </View>
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
    marginBottom: 23,
  },
  eyebrow: {
    color: "#7955D9",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  heading: {
    color: "#241B35",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#898397",
    fontSize: 13,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
  },
  statNumber: {
    fontSize: 25,
    color: "#7955D9",
    fontWeight: "800",
  },
  statLabel: {
    color: "#9690A3",
    fontSize: 11,
    marginTop: 5,
  },
  createButton: {
    backgroundColor: "#7955D9",
    padding: 16,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginBottom: 24,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 19,
    marginBottom: 25,
  },
  formTitle: {
    color: "#241B35",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 18,
  },
  label: {
    color: "#493D5E",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 9,
    marginTop: 12,
  },
  helperText: {
    color: "#9690A3",
    fontSize: 12,
  },
  patientOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  patientOption: {
    borderWidth: 1,
    borderColor: "#E7E1F0",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  selectedPatient: {
    backgroundColor: "#7955D9",
    borderColor: "#7955D9",
  },
  patientOptionText: {
    color: "#625A70",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedPatientText: {
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#F8F7FB",
    borderWidth: 1,
    borderColor: "#EAE6F1",
    borderRadius: 12,
    padding: 13,
    color: "#302641",
    fontSize: 13,
  },
  textArea: {
    minHeight: 85,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#53349D",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 18,
    alignItems: "center",
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F0EBFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyTitle: {
    color: "#302641",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyDescription: {
    color: "#9690A3",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 8,
  },
  retryText: {
    color: "#7955D9",
    fontWeight: "700",
    marginTop: 14,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
  },
  taskTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F0EBFC",
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    color: "#302641",
    fontWeight: "800",
    fontSize: 14,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  patientName: {
    color: "#9690A3",
    fontSize: 11,
  },
  deleteButton: {
    padding: 9,
  },
  taskDescription: {
    color: "#777083",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0EDF4",
    paddingTop: 12,
    marginTop: 14,
  },
  taskDate: {
    color: "#A19AAA",
    fontSize: 10,
  },
  statusBadge: {
    backgroundColor: "#FFF3E5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#C58A36",
    fontSize: 10,
    fontWeight: "800",
  },
  completedBadge: {
    backgroundColor: "#E8F7EF",
  },
  completedText: {
    color: "#319765",
  },
});
