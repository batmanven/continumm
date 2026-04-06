import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ClipboardList, User, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface TimelineEntry {
  day: string;
  text: string;
}

const initialTimeline: TimelineEntry[] = [
  { day: "Mar 28", text: "Fever (101°F), body aches, fatigue" },
  { day: "Mar 29", text: "Took Paracetamol 500mg, rest" },
  { day: "Mar 30", text: "Fever reduced, mild headache persists" },
  { day: "Mar 31", text: "Feeling much better, resumed light activity" },
];

const mockResponses = [
  "I've logged your symptoms. Based on what you described, here's what I noted:\n\n• **Primary symptom**: Headache (tension-type)\n• **Duration**: Started this morning\n• **Severity**: Moderate\n• **Associated**: Mild neck stiffness\n\nThis has been added to your timeline. Consider staying hydrated and resting.",
  "Got it. I've recorded that you took medication. Here's the update:\n\n• **Medication**: Ibuprofen 400mg\n• **Time**: Just now\n• **For**: Headache relief\n\nI'll track how you feel in the next few hours. Let me know if symptoms change.",
  "Your symptom has been logged:\n\n• **Symptom**: Fatigue\n• **Context**: After poor sleep\n• **Pattern**: This is the 3rd occurrence this week\n\n💡 **Insight**: You've reported fatigue frequently. Consider tracking your sleep schedule — I can help identify patterns.",
];

const HealthMemory = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hi! I'm your health companion. Tell me how you're feeling, and I'll organize it into your health timeline. 💚",
    },
  ]);
  const [input, setInput] = useState("");
  const [timeline] = useState<TimelineEntry[]>(initialTimeline);
  const [showSummary, setShowSummary] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const aiMsg: Message = {
      role: "ai",
      content: mockResponses[responseIndex % mockResponses.length],
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setResponseIndex((i) => i + 1);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Health Memory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chat naturally, we'll organize everything
          </p>
        </div>
        <Button
          variant="hero-outline"
          size="sm"
          onClick={() => setShowSummary(true)}
          className="gap-2"
        >
          <ClipboardList className="h-3.5 w-3.5" /> Generate Doctor Summary
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div
          className="lg:col-span-2 rounded-2xl border border-border/50 bg-card shadow-soft flex flex-col h-[600px] opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "ai" && (
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content.split("\n").map((line, j) => (
                    <span key={j}>
                      {line.includes("**") ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: line.replace(
                              /\*\*(.*?)\*\*/g,
                              "<strong>$1</strong>",
                            ),
                          }}
                        />
                      ) : (
                        line
                      )}
                      {j < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Describe how you're feeling…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="hero" size="icon" type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Timeline */}
        <div
          className="rounded-2xl border border-border/50 bg-card shadow-soft p-5 h-fit opacity-0 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Health Timeline
          </h3>
          <div className="space-y-4">
            {timeline.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/60 mt-1.5" />
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-medium text-primary">
                    {entry.day}
                  </p>
                  <p className="text-sm text-foreground mt-0.5">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Doctor-Ready Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-secondary/50 p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Patient Summary
              </h4>
              <p className="text-muted-foreground">
                Patient reported fever and body aches starting March 28.
                Self-medicated with Paracetamol 500mg. Symptoms improved over 3
                days with rest. Currently reports feeling well with residual
                mild headaches.
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4">
              <h4 className="font-semibold text-foreground mb-2">Timeline</h4>
              <ul className="space-y-1 text-muted-foreground">
                {timeline.map((e, i) => (
                  <li key={i}>
                    •{" "}
                    <span className="font-medium text-foreground">{e.day}</span>
                    : {e.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Key Insights
              </h4>
              <p className="text-muted-foreground">
                Recurring headache pattern observed over the past month.
                Frequency: ~every 2 weeks. Consider discussing migraine
                screening with your doctor.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthMemory;
