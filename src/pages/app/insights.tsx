import {
  TrendingUp,
  Activity,
  DollarSign,
  Brain,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

const insights = [
  {
    icon: TrendingUp,
    title: "Health Trends",
    insight: "You tend to get headaches every 2–3 weeks",
    detail:
      "Based on 8 logged entries over the past 2 months. Most occur on weekdays between 3–6 PM.",
    trend: "stable",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Activity,
    title: "Recovery Patterns",
    insight: "Symptoms improved after medication within 4 hours on average",
    detail:
      "Paracetamol was effective in 90% of cases. Rest combined with medication showed fastest recovery.",
    trend: "improving",
    color: "text-success bg-success/10",
  },
  {
    icon: DollarSign,
    title: "Spending Insights",
    insight: "Most expenses from consultations (45%)",
    detail:
      "Consultations: ₹8,500 | Diagnostics: ₹6,400 | Medication: ₹4,200 — Total this quarter: ₹19,100",
    trend: "increasing",
    color: "text-accent bg-accent/20",
  },
  {
    icon: Brain,
    title: "AI Observation",
    insight: "Stress-related symptoms appear linked to work deadlines",
    detail:
      "3 out of 5 headache episodes coincided with week-end deadlines. Consider stress management techniques.",
    trend: "alert",
    color: "text-info bg-info/10",
  },
];

const Insights = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="opacity-0 animate-fade-in">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated patterns from your health data
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {insights.map((item, i) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft hover:shadow-card transition-all duration-300 opacity-0 animate-fade-in"
            style={{ animationDelay: `${i * 100 + 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`h-10 w-10 rounded-xl ${item.color} flex items-center justify-center`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              {item.trend === "improving" && (
                <ArrowDown className="h-4 w-4 text-success" />
              )}
              {item.trend === "increasing" && (
                <ArrowUp className="h-4 w-4 text-accent" />
              )}
            </div>
            <h3 className="font-display text-base font-semibold text-foreground mb-1">
              {item.title}
            </h3>
            <p className="text-sm font-medium text-foreground mb-2">
              {item.insight}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Insights;
