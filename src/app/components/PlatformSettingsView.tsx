import { useState } from "react";
import { ChevronRight, Check, Save } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] focus:ring-offset-2 ${
        checked ? "bg-[#7B2CBF]" : "bg-[#D1D5DB] dark:bg-[#374151]"
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-4 py-4 border-b border-[#ECECEC] dark:border-[#2D2040] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{label}</p>
        {description && <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function PlatformSettingsView() {
  const [platformName, setPlatformName] = useState("Finishi");
  const [tagline, setTagline] = useState("AI-powered micro-learning for Africa");
  const [supportEmail, setSupportEmail] = useState("support@finishi.org");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [waitlistMode, setWaitlistMode] = useState(true);
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-5">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Platform Name</Label>
            <Input value={platformName} onChange={e => setPlatformName(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Support Email</Label>
            <Input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Tagline</Label>
            <Input value={tagline} onChange={e => setTagline(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Default Language</Label>
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
                <option value="ha">Hausa</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#ECECEC] dark:border-[#2D2040] space-y-1">
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-1">Access & Registration</h3>
          <SettingRow label="User Registration Open" description="Allow new users to register directly">
            <Toggle checked={registrationOpen} onChange={setRegistrationOpen} />
          </SettingRow>
          <SettingRow label="Waitlist Mode" description="Collect emails and approve users manually">
            <Toggle checked={waitlistMode} onChange={setWaitlistMode} />
          </SettingRow>
          <SettingRow label="Maintenance Mode" description="Show a maintenance page to all non-admin visitors">
            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </SettingRow>
        </div>

        <div className="mt-6 pt-6 border-t border-[#ECECEC] dark:border-[#2D2040] flex justify-end">
          <Button onClick={handleSave} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
          </Button>
        </div>
      </Card>
    </div>
  );
}
