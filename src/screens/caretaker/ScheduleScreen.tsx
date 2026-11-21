import React from "react";
import CaretakerPage from "../../components/CaretakerPage";

export default function ScheduleScreen() {
  return (
    <CaretakerPage
      title="Schedule"
      subtitle="Keep track of important daily routines."
      emptyTitle="Your schedule is empty"
      emptyDescription="Upcoming activities and reminders will appear here."
    />
  );
}