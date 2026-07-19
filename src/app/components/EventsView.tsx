import { useState, useEffect } from "react";
import {
  Plus, Search, Calendar, Clock, Users, Globe,
  Edit, Trash2, ChevronDown, X, Check,
  Video, Mic, BookOpen, MapPin, ExternalLink, Zap
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { adminApi } from "../api";

/* ─── Types ─── */
type EventType = "webinar" | "workshop" | "live-session" | "bootcamp";
type EventStatus = "upcoming" | "live" | "completed" | "cancelled";

interface Event {
  id: string;
  title: string;
  type: EventType;
  skill: string;
  date: string;
  time: string;
  duration: string;
  host: string;
  hostTitle: string;
  hostAvatar: string;
  capacity: number;
  registered: number;
  status: EventStatus;
  description: string;
  platform: string;
  location: string;
  coverImage: string;
}

/* ─── Constants ─── */
const EVENT_TYPES = [
  { value: "webinar" as EventType,      label: "Webinar",       icon: Video,     color: "#7B2CBF", gradient: "from-[#7B2CBF] to-[#C77DFF]" },
  { value: "workshop" as EventType,     label: "Workshop",      icon: BookOpen,  color: "#22C55E", gradient: "from-[#22C55E] to-[#4ADE80]" },
  { value: "live-session" as EventType, label: "Live Session",  icon: Mic,       color: "#F97316", gradient: "from-[#F97316] to-[#FB923C]" },
  { value: "bootcamp" as EventType,     label: "Bootcamp",      icon: Zap,       color: "#3B82F6", gradient: "from-[#3B82F6] to-[#60A5FA]" },
];

const PLATFORMS = ["Zoom", "Google Meet", "Microsoft Teams", "YouTube Live", "Twitter Spaces", "Physical Venue"];

const COVER_IMAGES: Record<EventType, string> = {
  webinar:       "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=400&fit=crop",
  workshop:      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop",
  "live-session":"https://images.unsplash.com/photo-1675716921224-e087a0cca69a?w=800&h=400&fit=crop",
  bootcamp:      "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?w=800&h=400&fit=crop",
};

const HOST_AVATARS = [
  "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1602009786436-96b827675d32?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1616805765352-beedbad46b2a?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1588178454780-441fa5b99fa5?w=100&h=100&fit=crop&crop=face",
];

const STATUS_BADGE: Record<EventStatus, { label: string; cls: string }> = {
  upcoming:  { label: "Upcoming",  cls: "bg-white/20 text-white backdrop-blur-sm" },
  live:      { label: "🔴 Live",   cls: "bg-[#22C55E]/90 text-white backdrop-blur-sm" },
  completed: { label: "Completed", cls: "bg-black/40 text-white/80 backdrop-blur-sm" },
  cancelled: { label: "Cancelled", cls: "bg-[#EF4444]/80 text-white backdrop-blur-sm" },
};

const INITIAL_EVENTS: Event[] = [];

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
function fmtDur(mins: string) {
  const m = parseInt(mins);
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;
  return `${m}m`;
}

/* ─── Event Form Modal ─── */
interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (e: Omit<Event, "id" | "registered" | "status">) => void;
  editing?: Event | null;
}

type FormState = Omit<Event, "id" | "registered" | "status">;
const emptyForm: FormState = {
  title: "", type: "webinar", skill: "", date: "", time: "",
  duration: "60", host: "", hostTitle: "", hostAvatar: HOST_AVATARS[0],
  capacity: 100, description: "", platform: "Zoom", location: "Online",
  coverImage: COVER_IMAGES.webinar,
};

function EventModal({ open, onClose, onSave, editing }: EventModalProps) {
  const [form, setForm] = useState<FormState>(editing ? { ...editing } : emptyForm);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  // Fetch skills dynamically
  const [skillsList, setSkillsList] = useState<string[]>([]);
  useEffect(() => {
    if (open) {
      adminApi.getSkills()
        .then((data: any) => {
          const names = (Array.isArray(data) ? data : []).map((s: any) => s.name as string);
          setSkillsList(names);
        })
        .catch(() => setSkillsList([]));
    }
  }, [open]);

  const handleTypeChange = (type: EventType) => {
    set("type", type);
    set("coverImage", COVER_IMAGES[type]);
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time || !form.skill || !form.host) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onSave(form);
    setSaving(false);
    onClose();
    if (!editing) setForm(emptyForm);
  };

  const isValid = form.title && form.date && form.time && form.skill && form.host;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">
            {editing ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Schedule a webinar, workshop, or live session for your learners.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Cover preview */}
          <div className="relative h-28 rounded-xl overflow-hidden">
            <img src={form.coverImage || COVER_IMAGES[form.type]} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-3">
              <span className="text-white text-xs font-medium opacity-80">Event cover preview</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Event Title <span className="text-[#EF4444]">*</span></Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Product Design Masterclass"
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Event Type <span className="text-[#EF4444]">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map(t => {
                const Icon = t.icon;
                const sel = form.type === t.value;
                return (
                  <button key={t.value} onClick={() => handleTypeChange(t.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      sel ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030]" : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/40"
                    }`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: t.color }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${sel ? "text-[#7B2CBF] dark:text-[#C77DFF]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}>
                      {t.label}
                    </span>
                    {sel && <Check className="w-4 h-4 text-[#7B2CBF] ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skill */}
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Related Skill <span className="text-[#EF4444]">*</span></Label>
            <div className="relative">
              <select value={form.skill} onChange={e => set("skill", e.target.value)}
                className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]">
                <option value="">Select a skill...</option>
                {skillsList.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Date <span className="text-[#EF4444]">*</span></Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Time <span className="text-[#EF4444]">*</span></Label>
              <Input type="time" value={form.time} onChange={e => set("time", e.target.value)}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>
          </div>

          {/* Duration + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Duration (mins)</Label>
              <Input type="number" min="15" value={form.duration} onChange={e => set("duration", e.target.value)}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Capacity</Label>
              <Input type="number" min="1" value={form.capacity} onChange={e => set("capacity", parseInt(e.target.value) || 100)}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>
          </div>

          {/* Host */}
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Host / Speaker <span className="text-[#EF4444]">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.host} onChange={e => set("host", e.target.value)} placeholder="Full name"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
              <Input value={form.hostTitle} onChange={e => set("hostTitle", e.target.value)} placeholder="Title / Role"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>
            {/* Avatar picker */}
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2">Host photo</p>
              <div className="flex gap-2">
                {HOST_AVATARS.map((av, i) => (
                  <button key={i} onClick={() => set("hostAvatar", av)}
                    className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all ${form.hostAvatar === av ? "ring-[#7B2CBF] scale-110" : "ring-transparent hover:ring-[#C77DFF]"}`}>
                    <img src={av} alt="avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Platform + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Platform</Label>
              <div className="relative">
                <select value={form.platform} onChange={e => set("platform", e.target.value)}
                  className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]">
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Location</Label>
              <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Online / City"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Description</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="What will learners gain? Include agenda, prerequisites, and key takeaways..."
              rows={3} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid || saving} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            {saving ? "Saving..." : editing ? "Save Changes" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Event Card ─── */
interface EventCardProps {
  event: Event;
  onEdit: (e: Event) => void;
  onDelete: (id: string) => void;
}

function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const typeInfo = EVENT_TYPES.find(t => t.value === event.type)!;
  const TypeIcon = typeInfo.icon;
  const pct = Math.min(Math.round((event.registered / event.capacity) * 100), 100);
  const isFull = event.registered >= event.capacity;
  const statusInfo = STATUS_BADGE[event.status];

  return (
    <Card className="overflow-hidden border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] hover:shadow-xl dark:hover:shadow-[#2D2040]/60 transition-all duration-300 group flex flex-col">
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top-right action buttons — show on hover */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(event)}
            className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center transition-colors">
            <Edit className="w-3.5 h-3.5 text-white" />
          </button>
          <button onClick={() => onDelete(event.id)}
            className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-red-500/60 flex items-center justify-center transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Top-left type badge */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <TypeIcon className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">{typeInfo.label}</span>
          </div>
        </div>

        {/* Bottom-left: status + date */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
          <div className="flex items-center gap-1 text-white/90 text-xs">
            <Calendar className="w-3 h-3" />
            <span>{fmtDate(event.date)}</span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Skill badge */}
        <Badge className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] border-0 text-xs w-fit mb-2">
          {event.skill}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] leading-snug mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] line-clamp-2 mb-4 flex-1">
            {event.description}
          </p>
        )}

        {/* Meta details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <Clock className="w-3.5 h-3.5 text-[#7B2CBF] shrink-0" />
            <span>{fmtTime(event.time)} · {fmtDur(event.duration)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <Globe className="w-3.5 h-3.5 text-[#7B2CBF] shrink-0" />
            <span>{event.platform} · {event.location}</span>
          </div>
        </div>

        {/* Host row */}
        <div className="flex items-center gap-2.5 mb-4 p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#0D0914] border border-[#ECECEC] dark:border-[#2D2040]">
          <img
            src={event.hostAvatar}
            alt={event.host}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7B2CBF]/30"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] truncate">{event.host}</p>
            {event.hostTitle && <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{event.hostTitle}</p>}
          </div>
          <MapPin className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-auto" />
        </div>

        {/* Registration */}
        <div className="border-t border-[#ECECEC] dark:border-[#2D2040] pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              <Users className="w-3.5 h-3.5" />
              <span><span className="font-medium text-[#111827] dark:text-[#F9FAFB]">{event.registered.toLocaleString()}</span> / {event.capacity.toLocaleString()} registered</span>
            </div>
            <span className={`text-xs font-semibold ${isFull ? "text-[#EF4444]" : "text-[#7B2CBF]"}`}>
              {isFull ? "FULL" : `${pct}%`}
            </span>
          </div>
          <div className="w-full bg-[#F3F4F6] dark:bg-[#1F2937] rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: isFull ? "#EF4444" : `linear-gradient(90deg, ${typeInfo.color}, ${typeInfo.color}cc)` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Main View ─── */
export default function EventsView() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | EventStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | EventType>("all");
  const [search, setSearch] = useState("");

  const filtered = events.filter(e => {
    if (filter !== "all" && e.status !== filter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.skill.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = [
    { label: "Total Events",   value: events.length },
    { label: "Upcoming",       value: events.filter(e => e.status === "upcoming").length },
    { label: "Live Now",       value: events.filter(e => e.status === "live").length },
    { label: "Total Seats",    value: events.reduce((s, e) => s + e.capacity, 0) },
    { label: "Registered",     value: events.reduce((s, e) => s + e.registered, 0) },
  ];

  const handleCreate = (data: Omit<Event, "id" | "registered" | "status">) =>
    setEvents(prev => [{ ...data, id: Date.now().toString(), registered: 0, status: "upcoming" }, ...prev]);

  const handleEdit = (data: Omit<Event, "id" | "registered" | "status">) => {
    if (!editingEvent) return;
    setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...data } : e));
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => { setEvents(prev => prev.filter(e => e.id !== id)); setDeleteTarget(null); };

  const openEdit = (e: Event) => { setEditingEvent(e); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingEvent(null); };

  return (
    <div className="space-y-6">
      {/* Modals */}
      <EventModal open={modalOpen} onClose={closeModal} onSave={editingEvent ? handleEdit : handleCreate} editing={editingEvent} />
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[380px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">Delete Event</DialogTitle>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">This will permanently remove the event and all registration data.</p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">Cancel</Button>
            <Button onClick={() => deleteTarget && handleDelete(deleteTarget)} className="bg-[#EF4444] hover:bg-[#DC2626] text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{s.label}</p>
            <p className="text-2xl font-semibold text-[#7B2CBF] dark:text-[#C77DFF] mt-0.5">{s.value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">All Events</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Webinars, workshops, and live sessions for your learners</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] placeholder:text-[#6B7280]" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "upcoming", "live", "completed", "cancelled"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f ? "bg-[#7B2CBF] text-white" : "bg-white dark:bg-[#160D20] border border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
              }`}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as "all" | EventType)}
            className="appearance-none pl-3 pr-8 py-1.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#160D20] text-[#111827] dark:text-[#F9FAFB] text-xs focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]">
            <option value="all">All Types</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none" />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-16 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="flex flex-col items-center text-center">
            <Calendar className="w-14 h-14 text-[#C77DFF] mb-4" />
            <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB] mb-2">No events found</h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">
              {search || filter !== "all" || typeFilter !== "all" ? "Try adjusting your filters." : "Create your first event to get started."}
            </p>
            <Button onClick={() => setModalOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} onEdit={openEdit} onDelete={id => setDeleteTarget(id)} />
          ))}
        </div>
      )}
    </div>
  );
}
