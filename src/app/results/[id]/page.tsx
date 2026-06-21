import { ResultsView } from "@/components/exam/ResultsView";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResultsView sessionId={id} />;
}
