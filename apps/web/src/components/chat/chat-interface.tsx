import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { client } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, Bot, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
};

type Conversation = {
    id: string;
    title: string;
    updatedAt: string;
};

export function ChatInterface({ projectId }: { projectId?: string }) {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Fetch conversations
    const { data: conversations, isLoading: isLoadingConversations } = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.api.chat.conversations.$get();
            if (!res.ok) throw new Error("Failed to fetch conversations");
            return res.json();
        },
    });

    // Fetch messages for selected conversation
    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ["messages", selectedConversationId],
        queryFn: async () => {
            if (!selectedConversationId) return [];
            // @ts-ignore
            const res = await client.api.chat[":conversationId"].messages.$get({
                param: { conversationId: selectedConversationId },
            });
            if (!res.ok) throw new Error("Failed to fetch messages");
            return res.json();
        },
        enabled: !!selectedConversationId,
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            // @ts-ignore
            const res = await client.api.chat.$post({
                json: {
                    content,
                    conversationId: selectedConversationId || undefined,
                    projectId,
                },
            });
            if (!res.ok) throw new Error("Failed to send message");
            return res.json();
        },
        onSuccess: (data) => {
            setInput("");
            if (!selectedConversationId) {
                setSelectedConversationId(data.conversationId);
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
            }
            queryClient.invalidateQueries({ queryKey: ["messages", data.conversationId] });
        },
        onError: () => {
            toast.error("Failed to send message");
        },
    });

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessageMutation.mutate(input);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 border-r pr-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Chats</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedConversationId(null)}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="h-full">
                    <div className="space-y-2">
                        {isLoadingConversations ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : (
                            conversations?.map((conv: Conversation) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversationId(conv.id)}
                                    className={cn(
                                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                                        selectedConversationId === conv.id
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <p className="truncate font-medium">{conv.title}</p>
                                    <p className="text-xs opacity-70">
                                        {new Date(conv.updatedAt).toLocaleDateString()}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex flex-1 flex-col">
                <ScrollArea className="flex-1 rounded-lg border bg-background p-4 shadow-sm" ref={scrollRef}>
                    <div className="space-y-4">
                        {!selectedConversationId && messages?.length === 0 && (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                <p>Select a conversation or start a new one.</p>
                            </div>
                        )}
                        {messages?.slice().reverse().map((msg: Message) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                    )}
                                >
                                    {msg.role === "user" ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {sendMessageMutation.isPending && (
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="rounded-lg bg-muted px-4 py-2 text-sm">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <form onSubmit={handleSend} className="mt-4 flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about projects..."
                        disabled={sendMessageMutation.isPending}
                    />
                    <Button type="submit" disabled={sendMessageMutation.isPending}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
