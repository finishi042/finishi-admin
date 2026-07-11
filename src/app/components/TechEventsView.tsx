import { useState } from "react";
import {
  Cpu, Plus, Search, Calendar, Clock, Users, MapPin,
  Edit, Trash2, ChevronDown, X, Check, ExternalLink,
  Code2, Brain, Shield, Database, Smartphone, Layers, Rocket,
  Zap, Trophy, Mic2, Monitor, Star, Globe, Ticket,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

/* ─── Types ─── */
type EventFormat = "conference" | "hackathon" | "meetup" | "webinar" | "workshop" | "bootcamp" | "summit" | "talk";
type EventMode   = "in-person" | "virtual" | "hybrid";
type EventStatus = "upcoming" | "live" | "completed" | "cancelled";

interface Speaker {
  name: string;
  title: string;
  company: string;
  avatar: string;
}

interface TechEvent {
  id: string;
  title: string;
  format: EventFormat;
  techCategory: string;
  date: string;
  endDate: string;
  time: string;
  mode: EventMode;
  location: string;
  platform: string;
  registrationUrl: string;
  capacity: number;
  registered: number;
  price: string;
  status: EventStatus;
  description: string;
  techStack: string[];
  speakers: Speaker[];
  organizer: string;
  featured: boolean;
  coverImage: string;
}

/* ─── Image Assets ─── */
const COVER_IMAGES: Record<EventFormat, string> = {
  conference: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=420&fit=crop",
  hackathon:  "https://images.unsplash.com/photo-1631350397792-8e0c2de5b637?w=800&h=420&fit=crop",
  meetup:     "https://images.unsplash.com/photo-1675716921224-e087a0cca69a?w=800&h=420&fit=crop",
  webinar:    "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=420&fit=crop",
  workshop:   "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=420&fit=crop",
  bootcamp:   "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?w=800&h=420&fit=crop",
  summit:     "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&h=420&fit=crop",
  talk:       "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&h=420&fit=crop",
};

const SPEAKER_AVATARS = [
  "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1602009786436-96b827675d32?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1616805765352-beedbad46b2a?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1588178454780-441fa5b99fa5?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1561406636-b80293969660?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573497019189-90a00bb1f26f?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1610903866883-c280999dcc0e?w=120&h=120&fit=crop&crop=face",
];

/* ─── Constants ─── */
const FORMAT_META: Record<EventFormat, { label: string; icon: React.ElementType; color: string; dark: string }> = {
  conference: { label: "Conference", icon: Monitor, color: "#7B2CBF", dark: "#9D4EDD" },
  hackathon:  { label: "Hackathon",  icon: Trophy,  color: "#F97316", dark: "#FB923C" },
  meetup:     { label: "Meetup",     icon: Users,   color: "#22C55E", dark: "#4ADE80" },
  webinar:    { label: "Webinar",    icon: Globe,   color: "#3B82F6", dark: "#60A5FA" },
  workshop:   { label: "Workshop",   icon: Code2,   color: "#C77DFF", dark: "#D8B4FE" },
  bootcamp:   { label: "Bootcamp",   icon: Rocket,  color: "#EC4899", dark: "#F472B6" },
  summit:     { label: "Summit",     icon: Zap,     color: "#14B8A6", dark: "#2DD4BF" },
  talk:       { label: "Tech Talk",  icon: Mic2,    color: "#8B5CF6", dark: "#A78BFA" },
};

const TECH_CATEGORIES = [
  { value: "ai-ml",         label: "AI / ML",          icon: Brain    },
  { value: "web-dev",       label: "Web Dev",           icon: Globe    },
  { value: "mobile",        label: "Mobile",            icon: Smartphone },
  { value: "devops",        label: "DevOps & Cloud",    icon: Layers   },
  { value: "data-science",  label: "Data Science",      icon: Database },
  { value: "cybersecurity", label: "Cybersecurity",     icon: Shield   },
  { value: "blockchain",    label: "Web3",              icon: Code2    },
  { value: "design",        label: "Product & Design",  icon: Star     },
  { value: "general",       label: "General Tech",      icon: Cpu      },
];

const TECH_STACKS = [
  "React","Next.js","Vue","Python","Node.js","TypeScript",
  "Go","Rust","TensorFlow","PyTorch","AWS","GCP","Azure",
  "Docker","Kubernetes","Solidity","Flutter","SwiftUI",
];

const VIRTUAL_PLATFORMS = ["Zoom","Google Meet","Hopin","Airmeet","YouTube Live","Twitter Spaces","Discord"];

const STATUS_OVERLAY: Record<EventStatus, string> = {
  upcoming:  "bg-white/20 text-white backdrop-blur-sm border border-white/30",
  live:      "bg-[#22C55E]/90 text-white",
  completed: "bg-black/50 text-white/80",
  cancelled: "bg-[#EF4444]/80 text-white",
};

/* ─── Seed Data ─── */
const SEED: TechEvent[] = [
  {
    id: "1", title: "Africa Tech Summit 2026", format: "conference", techCategory: "general",
    date: "2026-07-14", endDate: "2026-07-16", time: "09:00", mode: "hybrid",
    location: "Lagos, Nigeria", platform: "Hopin", registrationUrl: "https://africatechsummit.com",
    capacity: 2000, registered: 1540, price: "Free", status: "upcoming",
    description: "The continent's largest annual gathering of tech founders, investors, developers, and innovators. 3 days of keynotes, workshops, and networking.",
    techStack: ["React","Python","AWS","Node.js"],
    speakers: [
      { name: "Yele Bademosi",    title: "CEO",                 company: "Nestcoin",         avatar: SPEAKER_AVATARS[1] },
      { name: "Juliet Ehimuan",   title: "Managing Director",   company: "Google West Africa",avatar: SPEAKER_AVATARS[0] },
    ],
    organizer: "Finishi Tech", featured: true, coverImage: COVER_IMAGES.conference,
  },
  {
    id: "2", title: "AI & ML Hackathon Lagos", format: "hackathon", techCategory: "ai-ml",
    date: "2026-06-20", endDate: "2026-06-22", time: "08:00", mode: "in-person",
    location: "CcHub, Lagos", platform: "", registrationUrl: "https://mlhackathon.ng",
    capacity: 120, registered: 118, price: "₦5,000", status: "upcoming",
    description: "48-hour hackathon challenging teams to build AI-powered solutions to real African problems. ₦1M prize pool.",
    techStack: ["Python","TensorFlow","PyTorch","AWS"],
    speakers: [{ name: "Dr. Emeka Okafor", title: "AI Lead", company: "Microsoft Africa", avatar: SPEAKER_AVATARS[3] }],
    organizer: "AI Nigeria", featured: false, coverImage: COVER_IMAGES.hackathon,
  },
  {
    id: "3", title: "DevOps & Cloud Bootcamp", format: "bootcamp", techCategory: "devops",
    date: "2026-06-07", endDate: "2026-06-07", time: "10:00", mode: "virtual",
    location: "Online", platform: "Zoom", registrationUrl: "",
    capacity: 80, registered: 80, price: "Free", status: "live",
    description: "Full-day intensive on Docker, Kubernetes, CI/CD pipelines, and cloud deployment strategies.",
    techStack: ["Docker","Kubernetes","AWS","GCP"],
    speakers: [{ name: "Chisom Eze", title: "DevOps Engineer", company: "Andela", avatar: SPEAKER_AVATARS[2] }],
    organizer: "Cloud Africa", featured: false, coverImage: COVER_IMAGES.bootcamp,
  },
  {
    id: "4", title: "Web3 Builders Meetup", format: "meetup", techCategory: "blockchain",
    date: "2026-05-30", endDate: "2026-05-30", time: "18:00", mode: "in-person",
    location: "Abuja, Nigeria", platform: "", registrationUrl: "",
    capacity: 60, registered: 54, price: "Free", status: "completed",
    description: "Monthly gathering of Web3 developers and blockchain enthusiasts. Project demos, networking, and open discussion.",
    techStack: ["Solidity","React","Node.js"],
    speakers: [{ name: "Amara Nwosu", title: "Blockchain Dev", company: "Binance", avatar: SPEAKER_AVATARS[6] }],
    organizer: "Web3 Africa", featured: false, coverImage: COVER_IMAGES.meetup,
  },
  {
    id: "5", title: "Frontend Engineering Summit", format: "summit", techCategory: "web-dev",
    date: "2026-08-05", endDate: "2026-08-06", time: "09:00", mode: "hybrid",
    location: "Nairobi, Kenya", platform: "Airmeet", registrationUrl: "https://frontendafrica.com",
    capacity: 500, registered: 230, price: "$20", status: "upcoming",
    description: "Two-day summit on the future of frontend engineering: performance, accessibility, design systems, and AI-assisted coding.",
    techStack: ["React","Next.js","TypeScript","Vue"],
    speakers: [
      { name: "Prosper Otemuyiwa", title: "Developer Advocate", company: "Cloudinary", avatar: SPEAKER_AVATARS[4] },
      { name: "Sarah Fossheim",    title: "Frontend Engineer",  company: "Stripe",      avatar: SPEAKER_AVATARS[5] },
    ],
    organizer: "Frontend Africa", featured: true, coverImage: COVER_IMAGES.summit,
  },
  {
    id: "6", title: "Cybersecurity Masterclass", format: "webinar", techCategory: "cybersecurity",
    date: "2026-06-25", endDate: "2026-06-25", time: "15:00", mode: "virtual",
    location: "Online", platform: "Zoom", registrationUrl: "https://cybersec.ng",
    capacity: 300, registered: 178, price: "Free", status: "upcoming",
    description: "Defending against modern threats: penetration testing, zero-trust architecture, and incident response playbooks.",
    techStack: ["Python","AWS","Docker"],
    speakers: [{ name: "Toluwani Adeyemo", title: "Security Engineer", company: "Paystack", avatar: SPEAKER_AVATARS[7] }],
    organizer: "SecureNG", featured: false, coverImage: COVER_IMAGES.webinar,
  },
];

/* ─── Helpers ─── */
function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}
function pct(registered: number, capacity: number) {
  return Math.min(Math.round((registered / capacity) * 100), 100);
}

/* ─── Speaker avatar picker (inside form) ─── */
function AvatarPicker({ selected, onChange }: { selected: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {SPEAKER_AVATARS.map((av, i) => (
        <button key={i} type="button" onClick={() => onChange(av)}
          className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all shrink-0 ${
            selected === av ? "ring-[#7B2CBF] scale-110" : "ring-transparent hover:ring-[#C77DFF]"
          }`}>
          <img src={av} alt="" className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  );
}

/* ─── Speaker Sub-form ─── */
function SpeakerForm({ speakers, onChange }: { speakers: Speaker[]; onChange: (s: Speaker[]) => void }) {
  const [draft, setDraft] = useState<Speaker>({ name: "", title: "", company: "", avatar: SPEAKER_AVATARS[0] });

  const add = () => {
    if (!draft.name.trim()) return;
    onChange([...speakers, draft]);
    setDraft({ name: "", title: "", company: "", avatar: SPEAKER_AVATARS[0] });
  };
  const remove = (i: number) => onChange(speakers.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {speakers.map((sp, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#E9D5FF] dark:border-[#2D2040]">
          <img src={sp.avatar} alt={sp.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7B2CBF]/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] truncate">{sp.name}</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{sp.title} · {sp.company}</p>
          </div>
          <button onClick={() => remove(i)} className="p-1 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-md shrink-0">
            <X className="w-3.5 h-3.5 text-[#EF4444]" />
          </button>
        </div>
      ))}

      <div className="space-y-2 p-3 rounded-xl border border-dashed border-[#ECECEC] dark:border-[#2D2040]">
        <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Add speaker</p>
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Full name *" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] text-sm" />
          <Input placeholder="Title" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] text-sm" />
          <Input placeholder="Company" value={draft.company} onChange={e => setDraft(d => ({ ...d, company: e.target.value }))}
            className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] text-sm" />
        </div>
        <div>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">Speaker photo</p>
          <AvatarPicker selected={draft.avatar} onChange={av => setDraft(d => ({ ...d, avatar: av }))} />
        </div>
        <button onClick={add} disabled={!draft.name.trim()}
          className="flex items-center gap-1.5 text-sm text-[#7B2CBF] hover:underline disabled:opacity-40 font-medium">
          <Plus className="w-3.5 h-3.5" /> Add Speaker
        </button>
      </div>
    </div>
  );
}

/* ─── Tech Stack Selector ─── */
function StackSelector({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
  const toggle = (t: string) => onChange(selected.includes(t) ? selected.filter(x => x !== t) : [...selected, t]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {TECH_STACKS.map(t => (
        <button key={t} onClick={() => toggle(t)}
          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
            selected.includes(t)
              ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
              : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

/* ─── Event Modal ─── */
type FormState = Omit<TechEvent, "id" | "registered" | "status">;
const emptyForm: FormState = {
  title: "", format: "conference", techCategory: "general",
  date: "", endDate: "", time: "", mode: "virtual",
  location: "Online", platform: "Zoom", registrationUrl: "",
  capacity: 100, price: "Free", description: "",
  techStack: [], speakers: [], organizer: "", featured: false,
  coverImage: COVER_IMAGES.conference,
};

interface ModalProps {
  open: boolean; onClose: () => void;
  onSave: (e: FormState) => void;
  editing?: TechEvent | null;
}

function TechEventModal({ open, onClose, onSave, editing }: ModalProps) {
  const [form, setForm] = useState<FormState>(editing ? { ...editing, techStack: [...editing.techStack], speakers: [...editing.speakers] } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  const handleFormatChange = (fmt: EventFormat) => {
    set("format", fmt);
    set("coverImage", COVER_IMAGES[fmt]);
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time || !form.organizer) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onSave(form);
    setSaving(false);
    onClose();
    if (!editing) { setForm(emptyForm); setStep(1); }
  };

  const closeModal = () => { onClose(); if (!editing) { setForm(emptyForm); setStep(1); } };

  const step1Valid = form.title && form.date && form.time && form.organizer;

  return (
    <Dialog open={open} onOpenChange={v => !v && closeModal()}>
      <DialogContent className="sm:max-w-[660px] max-h-[92vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">
            {editing ? "Edit Tech Event" : "Add Tech Event"}
          </DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Create a conference, hackathon, meetup, or talk for the community.
          </p>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-1 mb-4">
          {[{ n: 1, label: "Details" }, { n: 2, label: "Speakers & Stack" }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <button onClick={() => (n < step || (n === 2 && step1Valid)) && setStep(n)}
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 transition-all ${
                  step === n ? "bg-[#7B2CBF] text-white ring-4 ring-[#7B2CBF]/20"
                  : step > n  ? "bg-[#22C55E] text-white"
                              : "bg-[#E5E7EB] dark:bg-[#2D2040] text-[#6B7280]"
                }`}>
                {step > n ? <Check className="w-3.5 h-3.5" /> : n}
              </button>
              <span className={`text-xs font-medium ${step === n ? "text-[#7B2CBF]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}>{label}</span>
              {n < 2 && <div className={`flex-1 h-0.5 rounded ${step > n ? "bg-[#7B2CBF]" : "bg-[#E5E7EB] dark:bg-[#2D2040]"}`} />}
            </div>
          ))}
        </div>

        {/* Cover preview strip */}
        <div className="relative h-32 rounded-xl overflow-hidden mb-2">
          <img src={form.coverImage} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{form.title || "Event Title"}</p>
              <p className="text-white/70 text-xs">{FORMAT_META[form.format].label} · {form.mode} · {fmtDate(form.date) || "Date TBD"}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: FORMAT_META[form.format].color + "cc" }}>
              {(() => { const I = FORMAT_META[form.format].icon; return <I className="w-3.5 h-3.5 text-white" />; })()}
              <span className="text-white text-xs font-medium">{FORMAT_META[form.format].label}</span>
            </div>
          </div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Title <span className="text-[#EF4444]">*</span></Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Africa Tech Summit 2026"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>

            {/* Format grid */}
            <div className="space-y-1.5">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Event Format</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(FORMAT_META) as EventFormat[]).map(f => {
                  const m = FORMAT_META[f]; const I = m.icon; const sel = form.format === f;
                  return (
                    <button key={f} onClick={() => handleFormatChange(f)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                        sel ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030]" : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/40"
                      }`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color }}>
                        <I className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-[10px] font-medium leading-tight text-center ${sel ? "text-[#7B2CBF]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tech category */}
            <div className="space-y-1.5">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Tech Category</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {TECH_CATEGORIES.map(cat => {
                  const I = cat.icon; const sel = form.techCategory === cat.value;
                  return (
                    <button key={cat.value} onClick={() => set("techCategory", cat.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                        sel ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030]" : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/40"
                      }`}>
                      <I className={`w-3.5 h-3.5 shrink-0 ${sel ? "text-[#7B2CBF]" : "text-[#6B7280]"}`} />
                      <span className={`text-xs font-medium truncate ${sel ? "text-[#7B2CBF]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Start Date <span className="text-[#EF4444]">*</span></Label>
                <Input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">End Date</Label>
                <Input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              </div>
            </div>

            {/* Time + Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Start Time <span className="text-[#EF4444]">*</span></Label>
                <Input type="time" value={form.time} onChange={e => set("time", e.target.value)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Mode</Label>
                <div className="flex gap-1">
                  {(["virtual","in-person","hybrid"] as EventMode[]).map(m => (
                    <button key={m} onClick={() => set("mode", m)}
                      className={`flex-1 py-2.5 rounded-lg text-xs capitalize border transition-all ${
                        form.mode === m ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                        : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                      }`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location + Platform */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Location</Label>
                <Input placeholder={form.mode === "virtual" ? "Online" : "Lagos, Nigeria"} value={form.location}
                  onChange={e => set("location", e.target.value)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              </div>
              {form.mode !== "in-person" && (
                <div className="space-y-1.5">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Streaming Platform</Label>
                  <div className="relative">
                    <select value={form.platform} onChange={e => set("platform", e.target.value)}
                      className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]">
                      {VIRTUAL_PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Capacity + Price + Organizer */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Capacity</Label>
                <Input type="number" min="1" value={form.capacity} onChange={e => set("capacity", parseInt(e.target.value) || 100)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Price</Label>
                <Input placeholder="Free / $20" value={form.price} onChange={e => set("price", e.target.value)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Organizer <span className="text-[#EF4444]">*</span></Label>
                <Input placeholder="e.g. Finishi" value={form.organizer} onChange={e => set("organizer", e.target.value)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              </div>
            </div>

            {/* Reg URL */}
            <div className="space-y-1.5">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Registration URL</Label>
              <Input placeholder="https://..." value={form.registrationUrl} onChange={e => set("registrationUrl", e.target.value)}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Description</Label>
              <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} resize-none
                placeholder="What's this event about? Include agenda, prizes, prerequisites..."
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none" />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#E9D5FF] dark:border-[#2D2040]">
              <button onClick={() => set("featured", !form.featured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.featured ? "bg-[#7B2CBF]" : "bg-[#D1D5DB] dark:bg-[#374151]"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.featured ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Feature this event</p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Highlight on the learner dashboard</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Speakers / Panelists</Label>
              <SpeakerForm speakers={form.speakers} onChange={s => set("speakers", s)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Tech Stack / Topics</Label>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Select all relevant technologies.</p>
              <StackSelector selected={form.techStack} onChange={s => set("techStack", s)} />
            </div>
          </div>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={closeModal} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!step1Valid} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
                Next: Speakers & Stack →
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">← Back</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Event"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Event Card ─── */
interface CardProps {
  event: TechEvent;
  onEdit: (e: TechEvent) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onStatusChange: (id: string, s: EventStatus) => void;
}

function TechEventCard({ event, onEdit, onDelete, onToggleFeatured, onStatusChange }: CardProps) {
  const meta = FORMAT_META[event.format];
  const FormatIcon = meta.icon;
  const fill = pct(event.registered, event.capacity);
  const isFull = event.registered >= event.capacity;
  const catInfo = TECH_CATEGORIES.find(c => c.value === event.techCategory);

  return (
    <Card className={`overflow-hidden border bg-white dark:bg-[#160D20] hover:shadow-xl dark:hover:shadow-[#2D2040]/60 transition-all duration-300 group flex flex-col ${
      event.featured ? "border-[#7B2CBF]/50 dark:border-[#7B2CBF]/40" : "border-[#ECECEC] dark:border-[#2D2040]"
    }`}>
      {/* Cover Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Format pill – top left */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: meta.color + "e0" }}>
            <FormatIcon className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">{meta.label}</span>
          </div>
        </div>

        {/* Actions – top right (hover) */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onToggleFeatured(event.id)} title="Toggle featured"
            className="w-7 h-7 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-amber-500/70 flex items-center justify-center transition-colors">
            <Star className={`w-3.5 h-3.5 ${event.featured ? "text-amber-400 fill-amber-400" : "text-white"}`} />
          </button>
          <button onClick={() => onEdit(event)}
            className="w-7 h-7 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors">
            <Edit className="w-3.5 h-3.5 text-white" />
          </button>
          <button onClick={() => onDelete(event.id)}
            className="w-7 h-7 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-red-500/60 flex items-center justify-center transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Bottom overlay: status + date */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_OVERLAY[event.status]}`}>
            {event.status === "live" ? "🔴 Live" : event.status}
          </span>
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <Calendar className="w-3 h-3" />
            <span>{fmtDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${fmtDate(event.endDate)}` : ""}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {catInfo && (
            <Badge className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] border-0 text-xs flex items-center gap-1">
              <catInfo.icon className="w-2.5 h-2.5" /> {catInfo.label}
            </Badge>
          )}
          <Badge className={`border-0 text-xs ${
            event.mode === "virtual"   ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" :
            event.mode === "in-person" ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" :
                                         "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
          }`}>
            {event.mode === "in-person" ? "In-Person" : event.mode === "hybrid" ? "Hybrid" : "Virtual"}
          </Badge>
          {event.featured && (
            <Badge className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-0 text-xs flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-current" /> Featured
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] leading-snug mb-1.5 line-clamp-2">{event.title}</h3>

        {event.description && (
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] line-clamp-2 mb-3 flex-1">{event.description}</p>
        )}

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <Clock className="w-3.5 h-3.5 text-[#7B2CBF] shrink-0" />
            <span>{fmtTime(event.time)} · by {event.organizer}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <MapPin className="w-3.5 h-3.5 text-[#7B2CBF] shrink-0" />
            <span className="truncate">{event.location}{event.platform ? ` · ${event.platform}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <Ticket className="w-3.5 h-3.5 text-[#7B2CBF] shrink-0" />
            <span>{event.price}</span>
            {event.registrationUrl && (
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-[#7B2CBF] hover:underline flex items-center gap-1">
                Register <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Speakers row */}
        {event.speakers.length > 0 && (
          <div className="flex items-center gap-2.5 mb-3 p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#0D0914] border border-[#ECECEC] dark:border-[#2D2040]">
            <div className="flex -space-x-2">
              {event.speakers.slice(0, 3).map((sp, i) => (
                <img key={i} src={sp.avatar} alt={sp.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-[#160D20]"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#111827] dark:text-[#F9FAFB] truncate">
                {event.speakers.map(s => s.name).join(", ")}
              </p>
              {event.speakers[0] && (
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">
                  {event.speakers[0].title} · {event.speakers[0].company}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tech stack */}
        {event.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {event.techStack.slice(0, 4).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] text-xs font-mono">{t}</span>
            ))}
            {event.techStack.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">+{event.techStack.length - 4}</span>
            )}
          </div>
        )}

        {/* Registration bar */}
        <div className="border-t border-[#ECECEC] dark:border-[#2D2040] pt-3 mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              <Users className="w-3.5 h-3.5" />
              <span><span className="font-medium text-[#111827] dark:text-[#F9FAFB]">{event.registered.toLocaleString()}</span> / {event.capacity.toLocaleString()}</span>
            </div>
            <span className={`text-xs font-semibold ${isFull ? "text-[#EF4444]" : "text-[#7B2CBF]"}`}>
              {isFull ? "FULL" : `${fill}%`}
            </span>
          </div>
          <div className="w-full bg-[#F3F4F6] dark:bg-[#1F2937] rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${fill}%`, backgroundColor: isFull ? "#EF4444" : meta.color }} />
          </div>
        </div>

        {/* Status buttons */}
        <div className="flex gap-1 mt-3 pt-3 border-t border-[#ECECEC] dark:border-[#2D2040]">
          {(["upcoming","live","completed","cancelled"] as EventStatus[]).map(s => (
            <button key={s} onClick={() => onStatusChange(event.id, s)}
              className={`flex-1 py-1 rounded-md text-[10px] capitalize font-medium transition-all ${
                event.status === s
                  ? s === "live" ? "bg-[#22C55E] text-white"
                    : s === "cancelled" ? "bg-[#EF4444] text-white"
                    : s === "completed" ? "bg-[#6B7280] text-white"
                    : "bg-[#7B2CBF] text-white"
                  : "bg-[#F3F4F6] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#E5E7EB] dark:hover:bg-[#2D2040]"
              }`}>{s}</button>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ─── Main View ─── */
export default function TechEventsView() {
  const [events, setEvents] = useState<TechEvent[]>(SEED);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TechEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all");
  const [formatFilter, setFormatFilter] = useState<"all" | EventFormat>("all");
  const [catFilter, setCatFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState<"all" | EventMode>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = events.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (formatFilter !== "all" && e.format !== formatFilter) return false;
    if (catFilter !== "all" && e.techCategory !== catFilter) return false;
    if (modeFilter !== "all" && e.mode !== modeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !e.organizer.toLowerCase().includes(q) &&
          !e.techStack.some(t => t.toLowerCase().includes(q)) &&
          !e.speakers.some(s => s.name.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const stats = [
    { label: "Total",    value: events.length },
    { label: "Featured", value: events.filter(e => e.featured).length },
    { label: "Live",     value: events.filter(e => e.status === "live").length },
    { label: "Upcoming", value: events.filter(e => e.status === "upcoming").length },
    { label: "Capacity", value: events.reduce((s, e) => s + e.capacity, 0) },
    { label: "Seats Taken", value: events.reduce((s, e) => s + e.registered, 0) },
  ];

  const handleCreate = (data: FormState) =>
    setEvents(prev => [{ ...data, id: Date.now().toString(), registered: 0, status: "upcoming" }, ...prev]);

  const handleEdit = (data: FormState) => {
    if (!editingEvent) return;
    setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...data } : e));
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => { setEvents(prev => prev.filter(e => e.id !== id)); setDeleteTarget(null); };
  const openEdit = (e: TechEvent) => { setEditingEvent(e); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingEvent(null); };
  const toggleFeatured = (id: string) => setEvents(prev => prev.map(e => e.id === id ? { ...e, featured: !e.featured } : e));
  const changeStatus = (id: string, status: EventStatus) => setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));

  const hasFilters = search || statusFilter !== "all" || formatFilter !== "all" || catFilter !== "all" || modeFilter !== "all";

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Modals */}
      <TechEventModal open={modalOpen} onClose={closeModal} onSave={editingEvent ? handleEdit : handleCreate} editing={editingEvent} />

      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">Delete Tech Event</DialogTitle>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">This will permanently remove the event and all its data.</p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">Cancel</Button>
            <Button onClick={() => deleteTarget && handleDelete(deleteTarget)} className="bg-[#EF4444] hover:bg-[#DC2626] text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="p-3 md:p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] text-center">
            <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">{s.label}</p>
            <p className="text-xl md:text-2xl font-semibold text-[#7B2CBF] dark:text-[#C77DFF] mt-0.5">{s.value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#7B2CBF]" /> Tech Events
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Conferences, hackathons, meetups and talks for the dev community</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Tech Event
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input type="text" placeholder="Search title, organizer, stack..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] placeholder:text-[#6B7280]" />
          </div>
          <div className="flex gap-1 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg p-1 bg-white dark:bg-[#160D20]">
            {(["grid","list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === v ? "bg-[#7B2CBF] text-white" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}>
                {v === "grid" ? "⊞ Grid" : "☰ List"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all","upcoming","live","completed","cancelled"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === f ? "bg-[#7B2CBF] text-white"
                : "bg-white dark:bg-[#160D20] border border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
              }`}>
              {f === "all" ? "All Status" : f}
            </button>
          ))}

          {[
            { label: "All Formats", value: formatFilter, setter: (v: string) => setFormatFilter(v as "all" | EventFormat), options: [{ value: "all", label: "All Formats" }, ...Object.entries(FORMAT_META).map(([v, m]) => ({ value: v, label: m.label }))] },
            { label: "All Categories", value: catFilter, setter: setCatFilter, options: [{ value: "all", label: "All Categories" }, ...TECH_CATEGORIES.map(c => ({ value: c.value, label: c.label }))] },
            { label: "All Modes", value: modeFilter, setter: (v: string) => setModeFilter(v as "all" | EventMode), options: [{ value: "all", label: "All Modes" }, { value: "virtual", label: "Virtual" }, { value: "in-person", label: "In-Person" }, { value: "hybrid", label: "Hybrid" }] },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select value={sel.value} onChange={e => sel.setter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#160D20] text-[#111827] dark:text-[#F9FAFB] text-xs focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]">
                {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6B7280] pointer-events-none" />
            </div>
          ))}

          {hasFilters && (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); setFormatFilter("all"); setCatFilter("all"); setModeFilter("all"); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[#EF4444] border border-[#FECACA] dark:border-[#7f1d1d] hover:bg-[#FEE2E2] dark:hover:bg-red-950/20 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Showing {filtered.length} of {events.length} events</p>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card className="p-16 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="flex flex-col items-center text-center">
            <Cpu className="w-14 h-14 text-[#C77DFF] mb-4" />
            <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB] mb-2">No tech events found</h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">
              {hasFilters ? "Adjust your filters." : "Add your first tech event."}
            </p>
            <Button onClick={() => setModalOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Tech Event
            </Button>
          </div>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(event => (
            <TechEventCard key={event.id} event={event} onEdit={openEdit}
              onDelete={id => setDeleteTarget(id)} onToggleFeatured={toggleFeatured} onStatusChange={changeStatus} />
          ))}
        </div>
      ) : (
        <Card className="border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#110C1A]">
                  {["Event","Format","Category","Date","Mode","Registered","Status",""].map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(event => {
                  const m = FORMAT_META[event.format]; const I = m.icon;
                  const fill = pct(event.registered, event.capacity);
                  return (
                    <tr key={event.id} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB] max-w-[180px] truncate">{event.title}</p>
                            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{event.organizer}</p>
                          </div>
                          {event.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: m.color }}>
                            <I className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{m.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {TECH_CATEGORIES.find(c => c.value === event.techCategory)?.label}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap">
                        {fmtDate(event.date)}<br />{fmtTime(event.time)}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#6B7280] dark:text-[#9CA3AF] capitalize">{event.mode}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <div className="flex-1 bg-[#F6EEFF] dark:bg-[#1E1030] rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${fill}%`, backgroundColor: m.color }} />
                          </div>
                          <span className="text-xs text-[#6B7280] shrink-0">{fill}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                          event.status === "upcoming"  ? "bg-[#F6EEFF] text-[#7B2CBF] dark:bg-[#1E1030] dark:text-[#C77DFF]" :
                          event.status === "live"      ? "bg-[#DCFCE7] text-[#16A34A] dark:bg-[#052e16] dark:text-[#4ade80]" :
                          event.status === "completed" ? "bg-[#F3F4F6] text-[#6B7280] dark:bg-[#1F2937] dark:text-[#9CA3AF]" :
                                                         "bg-[#FEE2E2] text-[#DC2626] dark:bg-[#450a0a] dark:text-[#f87171]"
                        }`}>{event.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(event)} className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg">
                            <Edit className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF]" />
                          </button>
                          <button onClick={() => setDeleteTarget(event.id)} className="p-1.5 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
