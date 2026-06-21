import { AttemptsView } from "@/components/exam/AttemptsView";
import { AttemptsAccessGate } from "@/components/exam/AttemptsAccessGate";

export default function AttemptsPage() {
  return (
    <AttemptsAccessGate>
      <AttemptsView />
    </AttemptsAccessGate>
  );
}
