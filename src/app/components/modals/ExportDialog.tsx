import { useState } from "react";
import { X, Download, FileText, Table, CheckSquare, Square } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  totalLessons: number;
}

const FIELDS = [
  { key: "title", label: "Lesson Title" },
  { key: "skill", label: "Skill Category" },
  { key: "description", label: "Description" },
  { key: "duration", label: "Duration" },
  { key: "created", label: "Created Date" },
  { key: "status", label: "Status" },
  { key: "views", label: "Views" },
];

export default function ExportDialog({ open, onClose, totalLessons }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "pdf" | "xlsx">("csv");
  const [dateRange, setDateRange] = useState("all");
  const [selectedFields, setSelectedFields] = useState<string[]>(FIELDS.map(f => f.key));
  const [isExporting, setIsExporting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const toggleField = (key: string) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleAll = () => {
    setSelectedFields(prev => prev.length === FIELDS.length ? [] : FIELDS.map(f => f.key));
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 1500);
    }, 1800);
  };

  const estimatedRows = dateRange === "all" ? totalLessons : dateRange === "7d" ? Math.min(3, totalLessons) : Math.min(6, totalLessons);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-md border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECECEC] dark:border-[#2D2040]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center">
              <Download className="w-5 h-5 text-[#7B2CBF] dark:text-[#C77DFF]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Export Lessons</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Download your content library</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Format */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "csv", label: "CSV", icon: Table, desc: "Spreadsheet" },
                { id: "pdf", label: "PDF", icon: FileText, desc: "Document" },
                { id: "xlsx", label: "Excel", icon: Table, desc: "Workbook" },
              ] as const).map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                      format === f.id
                        ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030]"
                        : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#C77DFF]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${format === f.id ? "text-[#7B2CBF]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`} />
                    <span className={`text-sm font-medium ${format === f.id ? "text-[#7B2CBF]" : "text-[#374151] dark:text-[#D1D5DB]"}`}>{f.label}</span>
                    <span className="text-xs text-[#9CA3AF]">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "all", label: "All Time" },
                { id: "30d", label: "Last 30 Days" },
                { id: "7d", label: "Last 7 Days" },
                { id: "custom", label: "Custom Range" },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setDateRange(r.id)}
                  className={`py-2 px-3 text-sm rounded-lg border-2 transition-colors font-medium ${
                    dateRange === r.id
                      ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Include Fields</Label>
              <button onClick={toggleAll} className="text-xs text-[#7B2CBF] hover:underline">
                {selectedFields.length === FIELDS.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {FIELDS.map(f => (
                <label key={f.key} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] cursor-pointer">
                  <button onClick={() => toggleField(f.key)} className="shrink-0">
                    {selectedFields.includes(f.key)
                      ? <CheckSquare className="w-4 h-4 text-[#7B2CBF]" />
                      : <Square className="w-4 h-4 text-[#D1D5DB] dark:text-[#4B5563]" />
                    }
                  </button>
                  <span className="text-xs text-[#374151] dark:text-[#D1D5DB]">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Exporting <strong className="text-[#111827] dark:text-[#F9FAFB]">{estimatedRows}</strong> lessons · <strong className="text-[#111827] dark:text-[#F9FAFB]">{selectedFields.length}</strong> fields
            </span>
            <span className="text-xs uppercase font-semibold text-[#7B2CBF]">.{format}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white min-w-[120px]"
          >
            {done ? "✓ Exported!" : isExporting ? "Exporting..." : (
              <><Download className="w-4 h-4 mr-2" /> Export</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
