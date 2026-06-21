import { AttemptDetailView } from "@/components/exam/AttemptDetailView";
import { AttemptsAccessGate } from "@/components/exam/AttemptsAccessGate";

export default async function AttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AttemptsAccessGate backHref="/attempts" backLabel="Attempts">
      <AttemptDetailView sessionId={id} />
    </AttemptsAccessGate>
  );
}
