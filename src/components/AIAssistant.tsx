import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
  isNotification?: boolean;
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select('"Nome Completo"')
          .eq("id", user.id)
          .single();
        
        if (profile && profile["Nome Completo"]) {
          setUserName(profile["Nome Completo"].split(" ")[0]);
        }
      }
    };
    fetchUser();
  }, []);

  // Set initial greeting
  useEffect(() => {
    const greeting = userName 
      ? `Olá ${userName}! 👋 Sou o assistente virtual do METAFIT. Como posso ajudar-te hoje?`
      : "Olá! 👋 Sou o assistente virtual do METAFIT. Como posso ajudar-te hoje?";
    
    setMessages([{ role: "assistant", content: greeting }]);
  }, [userName]);

  // Load unread admin notifications and listen for new ones in real-time
  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        const unread = data.filter(
          (n: any) => !n.read_by?.includes(userId)
        );
        setUnreadCount(unread.length);

        // Add recent unread notifications as assistant messages
        const notifMessages: Message[] = unread.slice(0, 5).reverse().map((n: any) => ({
          role: "assistant" as const,
          content: `📢 **${n.title}**\n\n${n.message}`,
          isNotification: true,
        }));

        if (notifMessages.length > 0) {
          setMessages(prev => {
            const greeting = prev[0];
            return [greeting, ...notifMessages];
          });
        }
      }
    };

    loadNotifications();

    // Realtime: listen for new notifications
    const channel = supabase
      .channel("assistant-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as any;
          // Check if targeted at this user
          const isForMe =
            n.target_audience === "all" ||
            n.target_audience === `user:${userId}`;

          if (isForMe) {
            const msg: Message = {
              role: "assistant",
              content: `📢 **${n.title}**\n\n${n.message}`,
              isNotification: true,
            };
            setMessages(prev => [...prev, msg]);
            if (!isOpen) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isOpen]);

  // Mark notifications as read when opening chat
  useEffect(() => {
    if (isOpen && userId && unreadCount > 0) {
      setUnreadCount(0);
      // Mark as read in DB
      const markRead = async () => {
        const { data } = await supabase
          .from("notifications")
          .select("id, read_by")
          .limit(20);

        if (data) {
          for (const n of data) {
            if (!n.read_by?.includes(userId)) {
              const newReadBy = [...(n.read_by || []), userId];
              await supabase
                .from("notifications")
                .update({ read_by: newReadBy })
                .eq("id", n.id);
            }
          }
        }
      };
      markRead();
    }
  }, [isOpen, userId, unreadCount]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: [...messages, userMsg], userName }),
        }
      );

      if (!response.ok) throw new Error("Erro ao contactar assistente");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (let line of lines) {
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant" && !last.isNotification) {
                    return prev.map((m, i) =>
                      i === prev.length - 1
                        ? { ...m, content: assistantContent }
                        : m
                    );
                  }
                  return [...prev, { role: "assistant", content: assistantContent }];
                });
              }
            } catch (e) {
              console.error("Erro ao processar resposta:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpa, ocorreu um erro. Por favor, tenta novamente." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    await streamChat(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button with badge */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full shadow-elegant hover:shadow-glow relative"
            size="icon"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card variant="glass" className="fixed bottom-20 md:bottom-6 right-6 z-50 w-[90vw] md:w-96 h-[500px] shadow-elegant flex flex-col border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-primary rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-sm">
                  Assistente METAFIT
                </h3>
                <p className="text-xs text-primary-foreground/80">
                  Responde em segundos
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : msg.isNotification
                        ? "bg-blue-500/10 border border-blue-500/30 text-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.isNotification && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bell className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Notificação</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">A escrever...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escreve a tua pergunta..."
                disabled={isLoading}
                className="flex-1 bg-white/5 border-white/10 rounded-xl"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIAssistant;
