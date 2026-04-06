import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";

const SettingsPage = () => {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useSupabaseAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Update form fields when user data changes
  useEffect(() => {
    console.log("User data in settings:", user);
    if (user) {
      const userName = user?.user_metadata?.name || "";
      const userEmail = user?.email || "";
      console.log("Setting name:", userName, "email:", userEmail);
      setName(userName);
      setEmail(userEmail);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
      console.error("Logout error:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateProfile(name.trim());
      if (error) {
        toast.error("Error updating profile");
        console.error("Profile update error:", error);
      } else {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
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
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
              placeholder="Your email address"
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
          <Button 
            variant="hero" 
            size="sm" 
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>



      <Separator />

      <Button variant="destructive" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
};

export default SettingsPage;
