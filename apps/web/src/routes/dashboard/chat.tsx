import { createFileRoute } from "@tanstack/react-router";
import { ChatInterface } from "@/components/chat/chat-interface";

export const Route = createFileRoute("/dashboard/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="h-full space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
      <ChatInterface />
    </div>
  );
}
