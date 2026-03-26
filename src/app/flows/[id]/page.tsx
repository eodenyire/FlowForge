import { FlowEditor } from "@/components/flow-editor/FlowEditor";

export const metadata = {
  title: "Flow Editor | FlowForge",
  description: "Design and configure your data flow",
};

export default async function FlowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FlowEditor flowId={id} />;
}
