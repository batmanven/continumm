import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  IndianRupee,
  Shield,
  AlertCircle,
} from "lucide-react";

const mockBillData = {
  total: 8500,
  insurance: 5200,
  youPay: 3300,
  items: [
    {
      name: "General Consultation",
      amount: 1500,
      explanation:
        "Standard doctor visit fee for a 30-minute consultation with Dr. Sharma.",
    },
    {
      name: "Blood Work (CBC + Lipid Panel)",
      amount: 3200,
      explanation:
        "Complete blood count and cholesterol panel — routine diagnostic tests.",
    },
    {
      name: "ECG",
      amount: 1800,
      explanation:
        "Electrocardiogram to monitor heart rhythm. Standard procedure during annual checkup.",
    },
    {
      name: "Medication (Prescribed)",
      amount: 2000,
      explanation:
        "30-day supply of prescribed medication including supplements.",
    },
  ],
};

const BillExplainer = () => {
  const [billText, setBillText] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleExplain = () => {
    setShowResult(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="opacity-0 animate-fade-in">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Bill Explainer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Understand your medical bills in plain language
        </p>
      </div>

      {!showResult ? (
        <div
          className="rounded-2xl border border-border/50 bg-card p-8 shadow-soft text-center opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="mx-auto max-w-md">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Upload or paste your bill
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Drag & drop a file, or paste the bill text below
            </p>

            <div className="border-2 border-dashed border-border rounded-xl p-8 mb-4 hover:border-primary/30 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Drop file here (PDF, image, or text)
              </p>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">
                  or paste text
                </span>
              </div>
            </div>

            <Textarea
              placeholder="Paste your medical bill text here…"
              value={billText}
              onChange={(e) => setBillText(e.target.value)}
              className="min-h-[120px] mb-4"
            />

            <Button
              variant="hero"
              onClick={handleExplain}
              className="w-full gap-2"
            >
              Explain Bill
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 opacity-0 animate-fade-in">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Total Cost
                </span>
              </div>
              <p className="font-display text-2xl font-semibold text-foreground">
                ₹{mockBillData.total.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">
                  Insurance Covered
                </span>
              </div>
              <p className="font-display text-2xl font-semibold text-success">
                ₹{mockBillData.insurance.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">You Pay</span>
              </div>
              <p className="font-display text-2xl font-semibold text-accent">
                ₹{mockBillData.youPay.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Detailed Breakdown
            </h3>
            <div className="space-y-4">
              {mockBillData.items.map((item, i) => (
                <div key={i} className="rounded-xl bg-secondary/30 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      ₹{item.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowResult(false)}
            className="mt-2"
          >
            Analyze Another Bill
          </Button>
        </div>
      )}
    </div>
  );
};

export default BillExplainer;
