
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarDays,
  Clock,
  Plus,
  Check,
  Trash2,
  Users,
  X,
} from "lucide-react-native";
import { supabase } from "../../services/supabase";

type Patient = {
  patient_id: string;
  full_name: string;
  linked_at: string;
};

type Schedule = {
  id: string;
  caretaker_id: string;
  patient_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  is_completed: boolean;
  created_at: string;
};

export default function ScheduleScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState("10:00");

  const fetchScheduleData = useCallback(async () => {
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Unable to identify your account. Please sign in again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data: patientData, error: patientError } =
      await supabase.rpc("get_my_patients");

    if (patientError) {
      setError(patientError.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const patientList = (patientData || []) as Patient[];
    setPatients(patientList);

    if (!selectedPatient && patientList.length > 0) {
      setSelectedPatient(patientList[0].patient_id);
    }

    const { data: scheduleData, error: scheduleError } = await supabase
      .from("patient_schedules")
      .select("*")
      .eq("caretaker_id", user.id)
      .order("scheduled_at", { ascending: true });

    if (scheduleError) {
      setError(scheduleError.message);
    } else {
      setSchedules((scheduleData || []) as Schedule[]);
    }

    setLoading(false);
    setRefreshing(false);
  }, [selectedPatient]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScheduleData();
  };

  const handleCreateSchedule = async () => {
    if (!selectedPatient) {
      Alert.alert("Select a patient", "Please select a patient first.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter an activity title.");
      return;
    }

    const dateTimePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!dateTimePattern.test(date) || !timePattern.test(time)) {
      Alert.alert(
        "Invalid date or time",
        "Use YYYY-MM-DD for the date and HH:MM for the time."
      );
      return;
    }

    const scheduledDate = new Date(`${date}T${time}:00`);

    if (Number.isNaN(scheduledDate.getTime())) {
      Alert.alert("Invalid date", "Please enter a valid date.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Session expired", "Please sign in again.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("patient_schedules")
      .insert({
        caretaker_id: user.id,
        patient_id: selectedPatient,
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: scheduledDate.toISOString(),
      });

    setSaving(false);

    if (insertError) {
      Alert.alert("Unable to create schedule", insertError.message);
      return;
    }

    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setTime("10:00");
    setShowForm(false);

    Alert.alert("Schedule created", "Your activity has been added.");
    fetchScheduleData();
  };

  const toggleComplete = async (item: Schedule) => {
    const { error: updateError } = await supabase
      .from("patient_schedules")
      .update({ is_completed: !item.is_completed })
      .eq("id", item.id);

    if (updateError) {
      Alert.alert("Unable to update activity", updateError.message);
      return;
    }

    fetchScheduleData();
  };

  const deleteSchedule = (id: string) => {
    Alert.alert(
      "Delete activity",
      "Are you sure you want to delete this scheduled activity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteError } = await supabase
              .from("patient_schedules")
              .delete()
              .eq("id", id);

            if (deleteError) {
              Alert.alert("Unable to delete", deleteError.message);
              return;
            }

            fetchScheduleData();
          },
        },
      ]
    );
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value: string) => {
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPatientName = (patientId: string) => {
    return (
      patients.find((patient) => patient.patient_id === patientId)
        ?.full_name || "Patient"
    );
  };

  const upcomingSchedules = schedules.filter(
    (item) => !item.is_completed
  );

  const completedSchedules = schedules.filter(
    (item) => item.is_completed
  );

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
        <Text style={styles.heading}>Schedule</Text>
        <Text style={styles.subtitle}>
          Keep track of important daily routines.
        </Text>
      </View>

      <LinearGradient
        colors={["#7955D9", "#53349D"]}
        style={styles.summaryCard}
      >
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>TOTAL ACTIVITIES</Text>
            <Text style={styles.summaryNumber}>{schedules.length}</Text>
            <Text style={styles.summaryDescription}>
              Across all your linked patients
            </Text>
          </View>
          <View style={styles.summaryIcon}>
            <CalendarDays color="#FFFFFF" size={28} />
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryStats}>
          <View>
            <Text style={styles.summaryStatNumber}>
              {upcomingSchedules.length}
            </Text>
            <Text style={styles.summaryStatLabel}>Upcoming</Text>
          </View>
          <View>
            <Text style={styles.summaryStatNumber}>
              {completedSchedules.length}
            </Text>
            <Text style={styles.summaryStatLabel}>Completed</Text>
          </View>
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.85}
      >
        {showForm ? (
          <X size={20} color="#FFFFFF" />
        ) : (
          <Plus size={20} color="#FFFFFF" />
        )}
        <Text style={styles.addButtonText}>
          {showForm ? "Close Form" : "Add Activity"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Activity</Text>
          <Text style={styles.formSubtitle}>
            Add an activity to a patient's schedule.
          </Text>

          <Text style={styles.inputLabel}>SELECT PATIENT</Text>

          {patients.length === 0 ? (
            <Text style={styles.noPatientsText}>
              Link a patient before creating a schedule.
            </Text>
          ) : (
            <View style={styles.patientOptions}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.patient_id}
                  style={[
                    styles.patientOption,
                    selectedPatient === patient.patient_id &&
                      styles.patientOptionActive,
                  ]}
                  onPress={() => setSelectedPatient(patient.patient_id)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      selectedPatient === patient.patient_id &&
                        styles.patientOptionTextActive,
                    ]}
                  >
                    {patient.full_name || "Unnamed Patient"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.inputLabel}>ACTIVITY TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning walk"
            placeholderTextColor="#A7A1B3"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Add some details..."
            placeholderTextColor="#A7A1B3"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeField}>
              <Text style={styles.inputLabel}>DATE</Text>
              <View style={styles.inputWithIcon}>
                <CalendarDays size={17} color="#7955D9" />
                <TextInput
                  style={styles.dateTimeInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#A7A1B3"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.dateTimeField}>
              <Text style={styles.inputLabel}>TIME</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={17} color="#7955D9" />
                <TextInput
                  style={styles.dateTimeInput}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#A7A1B3"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (saving || patients.length === 0) && styles.disabledButton,
            ]}
            onPress={handleCreateSchedule}
            disabled={saving || patients.length === 0}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Create Schedule</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          <Text style={styles.sectionSubtitle}>
            Activities that still need attention
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {upcomingSchedules.length}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="large" color="#7955D9" />
          <Text style={styles.stateText}>Loading schedule...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchScheduleData}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : upcomingSchedules.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <CalendarDays size={28} color="#7955D9" />
          </View>
          <Text style={styles.emptyTitle}>No upcoming activities</Text>
          <Text style={styles.emptyDescription}>
            Add an activity to start building your patient's schedule.
          </Text>
        </View>
      ) : (
        <View style={styles.scheduleList}>
          {upcomingSchedules.map((item) => (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.scheduleAccent} />

              <View style={styles.scheduleContent}>
                <View style={styles.scheduleTop}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <TouchableOpacity
                    onPress={() => deleteSchedule(item.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={17} color="#C66B78" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.schedulePatient}>
                  <Users size={13} color="#7955D9" />{" "}
                  {getPatientName(item.patient_id)}
                </Text>

                {!!item.description && (
                  <Text style={styles.scheduleDescription}>
                    {item.description}
                  </Text>
                )}

                <View style={styles.scheduleFooter}>
                  <View style={styles.scheduleDate}>
                    <CalendarDays size={14} color="#7955D9" />
                    <Text style={styles.scheduleDateText}>
                      {formatDate(item.scheduled_at)}
                    </Text>
                  </View>

                  <View style={styles.scheduleDate}>
                    <Clock size={14} color="#7955D9" />
                    <Text style={styles.scheduleDateText}>
                      {formatTime(item.scheduled_at)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => toggleComplete(item)}
                >
                  <Check size={15} color="#319765" />
                  <Text style={styles.completeButtonText}>
                    Mark as completed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.sectionHeader, styles.completedHeader]}>
        <View>
          <Text style={styles.sectionTitle}>Completed Activities</Text>
          <Text style={styles.sectionSubtitle}>
            Activities already finished
          </Text>
        </View>
        <View style={styles.completedCountBadge}>
          <Text style={styles.completedCountText}>
            {completedSchedules.length}
          </Text>
        </View>
      </View>

      {completedSchedules.length === 0 ? (
        <View style={styles.completedEmpty}>
          <Text style={styles.completedEmptyText}>
            Completed activities will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.scheduleList}>
          {completedSchedules.map((item) => (
            <View
              key={item.id}
              style={[styles.scheduleCard, styles.completedCard]}
            >
              <View style={[styles.scheduleAccent, styles.completedAccent]} />

              <View style={styles.scheduleContent}>
                <View style={styles.scheduleTop}>
                  <Text style={[styles.scheduleTitle, styles.completedTitle]}>
                    {item.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteSchedule(item.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={17} color="#C66B78" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.schedulePatient}>
                  <Users size={13} color="#7955D9" />{" "}
                  {getPatientName(item.patient_id)}
                </Text>

                <View style={styles.completedStatus}>
                  <Check size={13} color="#319765" />
                  <Text style={styles.completedStatusText}>Completed</Text>
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
    paddingBottom: 45,
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
    marginBottom: 20,
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
  summaryDivider: {
    height: 1,
    backgroundColor: "#FFFFFF35",
    marginVertical: 18,
  },
  summaryStats: {
    flexDirection: "row",
    gap: 45,
  },
  summaryStatNumber: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },
  summaryStatLabel: {
    color: "#E4D9FF",
    fontSize: 12,
    marginTop: 3,
  },
  addButton: {
    backgroundColor: "#7955D9",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 28,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 19,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },
  formTitle: {
    fontSize: 19,
    color: "#241B35",
    fontWeight: "800",
  },
  formSubtitle: {
    color: "#9690A3",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 22,
  },
  inputLabel: {
    color: "#898397",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 9,
    marginTop: 14,
  },
  patientOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  patientOption: {
    borderWidth: 1,
    borderColor: "#E8E3F1",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  patientOptionActive: {
    backgroundColor: "#F0EBFC",
    borderColor: "#7955D9",
  },
  patientOptionText: {
    color: "#777084",
    fontSize: 12,
    fontWeight: "600",
  },
  patientOptionTextActive: {
    color: "#7955D9",
    fontWeight: "800",
  },
  noPatientsText: {
    color: "#C66B78",
    fontSize: 12,
  },
  input: {
    backgroundColor: "#FAF9FC",
    borderWidth: 1,
    borderColor: "#EAE6F1",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    color: "#302641",
    fontSize: 13,
  },
  descriptionInput: {
    height: 85,
    textAlignVertical: "top",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateTimeField: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF9FC",
    borderWidth: 1,
    borderColor: "#EAE6F1",
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  dateTimeInput: {
    flex: 1,
    paddingVertical: 13,
    paddingLeft: 8,
    color: "#302641",
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: "#7955D9",
    borderRadius: 12,
    padding: 15,
    marginTop: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  countBadge: {
    backgroundColor: "#EEE9FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  countBadgeText: {
    color: "#7955D9",
    fontWeight: "800",
    fontSize: 12,
  },
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },
  stateText: {
    color: "#898397",
    fontSize: 13,
    marginTop: 12,
  },
  errorText: {
    color: "#C66B78",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  retryText: {
    color: "#7955D9",
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: "#F0EBFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
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
  scheduleList: {
    gap: 12,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },
  scheduleAccent: {
    width: 5,
    backgroundColor: "#7955D9",
  },
  scheduleContent: {
    flex: 1,
    padding: 15,
  },
  scheduleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleTitle: {
    color: "#302641",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  schedulePatient: {
    color: "#7955D9",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },
  scheduleDescription: {
    color: "#898397",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
  scheduleFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 14,
  },
  scheduleDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scheduleDateText: {
    color: "#777084",
    fontSize: 11,
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "#EAF7EF",
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  completeButtonText: {
    color: "#319765",
    fontSize: 12,
    fontWeight: "800",
  },
  completedHeader: {
    marginTop: 32,
  },
  completedCountBadge: {
    backgroundColor: "#EAF7EF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  completedCountText: {
    color: "#319765",
    fontWeight: "800",
    fontSize: 12,
  },
  completedEmpty: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  completedEmptyText: {
    color: "#9690A3",
    fontSize: 12,
  },
  completedCard: {
    backgroundColor: "#FCFBFD",
  },
  completedAccent: {
    backgroundColor: "#319765",
  },
  completedTitle: {
    color: "#898397",
  },
  completedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },
  completedStatusText: {
    color: "#319765",
    fontSize: 11,
    fontWeight: "800",
  },
});
