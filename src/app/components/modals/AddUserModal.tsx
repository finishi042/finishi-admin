import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (user: { name: string; email: string; role: string; skills: string[] }) => void;
}

const skillOptions = [
  "Product Design",
  "Digital Marketing",
  "Frontend Development",
  "AI Prompt Engineering",
  "Data Analytics",
  "Content Writing",
];

const roleOptions = ["Learner", "Instructor", "Admin"];

export default function AddUserModal({ open, onClose, onSave }: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Learner");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onSave?.({ name, email, role, skills: selectedSkills });
    setName(""); setEmail(""); setRole("Learner"); setSelectedSkills([]);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">Add New User</DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Create a new user account for the platform</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Full Name <span className="text-[#EF4444]">*</span></Label>
            <Input
              placeholder="e.g. Adebayo Adeyemi"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Email Address <span className="text-[#EF4444]">*</span></Label>
            <Input
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Role</Label>
            <div className="flex gap-2">
              {roleOptions.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-md text-sm border transition-all ${
                    role === r
                      ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Skill Interests</Label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#ECECEC] dark:border-[#2D2040]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">An invitation email will be sent to the user with login instructions.</p>
            <p className="text-xs text-[#7B2CBF]">The user will be set to Active status upon first login.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !email.trim() || loading}
            className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
          >
            {loading ? "Adding..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
