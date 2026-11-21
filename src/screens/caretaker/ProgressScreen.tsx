import React from "react";
import CaretakerPage from "../../components/CaretakerPage";

export default function ProgressScreen() {
  return (
    <CaretakerPage
      title="Patient Progress"
      subtitle="Track activities and cognitive game progress."
      emptyTitle="No progress data yet"
      emptyDescription="Patient activity and game completion reports will appear here."
    />
  );
}