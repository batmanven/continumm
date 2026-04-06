import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("continuum_user") ||
      '{"name":"Alex","email":"alex@example.com"}',
  );
  const [name, setName] = useState(user.name || "Alex");
  const [email, setEmail] = useState(user.email || "alex@example.com");

  const handleLogout = () => {
    localStorage.removeItem("continuum_user");
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="opacity-0 animate-fade-in">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <div
        className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft opacity-0 animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <h3 className="font-display text-base font-semibold text-foreground mb-4">
          Profile
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button variant="hero" size="sm">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <div
        className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft opacity-0 animate-fade-in"
        style={{ animationDelay: "150ms" }}
      >
        <h3 className="font-display text-base font-semibold text-foreground mb-4">
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Toggle dark theme</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggle} />
        </div>
      </div>

      {/* Privacy */}
      <div
        className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft opacity-0 animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <h3 className="font-display text-base font-semibold text-foreground mb-4">
          Data & Privacy
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Your health data is stored locally and encrypted. We never share your
          data with third parties.
        </p>
        <Button variant="outline" size="sm">
          Export My Data
        </Button>
      </div>

      <Separator />

      <Button variant="destructive" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
};

export default SettingsPage;
