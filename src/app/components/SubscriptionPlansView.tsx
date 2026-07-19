import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Check, X, Loader2, Star,
  GripVertical, Eye, EyeOff, Crown, Sparkles, DollarSign
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { adminApi } from "../api";
import ErrorDialog from "./modals/ErrorDialog";

// ── Types ───────────────────────────────────────────────────────────────────

interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tier: number;
  is_active: boolean;
  is_default: boolean;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  trial_days: number;
  features: string[];
  limits: Record<string, unknown>;
  badge_text: string | null;
  highlight: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type PlanFormData = Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>;

const EMPTY_PLAN: PlanFormData = {
  slug: "",
  name: "",
  description: "",
  tier: 0,
  is_active: true,
  is_default: false,
  price_monthly: 0,
  price_yearly: 0,
  currency: "USD",
  trial_days: 0,
  features: [],
  limits: {},
  badge_text: null,
  highlight: false,
  sort_order: 0,
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function SubscriptionPlansView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSubscriptionPlans();
      const parsed = (Array.isArray(data) ? data : []).map((p: any) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features) : []),
        limits: typeof p.limits === 'string' ? JSON.parse(p.limits) : (p.limits ?? {}),
      }));
      setPlans(parsed);
    } catch (err: any) {
      console.error("Failed to load plans:", err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: PlanFormData) => {
    setSaving(true);
    try {
      await adminApi.createSubscriptionPlan(formData as any);
      setIsCreating(false);
      await loadPlans();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, formData: Partial<PlanFormData>) => {
    setSaving(true);
    try {
      // Strip read-only fields that the API's strict schema rejects
      const { id: _id, slug: _slug, created_at, updated_at, ...updateData } = formData as any;
      await adminApi.updateSubscriptionPlan(id, updateData);
      setEditingPlan(null);
      await loadPlans();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteSubscriptionPlan(id);
      setDeleteConfirm(null);
      await loadPlans();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#7B2CBF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErrorDialog open={!!errorMsg} onClose={() => setErrorMsg(null)} message={errorMsg ?? ""} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">Subscription Plans</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            Configure pricing, features, trials, and plan visibility.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Plans list */}
      <div className="space-y-4">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={() => setEditingPlan(plan)}
            onDelete={() => setDeleteConfirm(plan.id)}
            isDeleting={deleteConfirm === plan.id}
            onConfirmDelete={() => handleDelete(plan.id)}
            onCancelDelete={() => setDeleteConfirm(null)}
          />
        ))}
      </div>

      {plans.length === 0 && !isCreating && (
        <Card className="p-8 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] text-center">
          <DollarSign className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            No subscription plans yet. Create your first plan to get started.
          </p>
        </Card>
      )}

      {/* Create/Edit modal */}
      {(isCreating || editingPlan) && (
        <PlanFormModal
          plan={editingPlan}
          saving={saving}
          onSave={(data) => {
            if (editingPlan) {
              handleUpdate(editingPlan.id, data);
            } else {
              handleCreate(data as PlanFormData);
            }
          }}
          onClose={() => { setEditingPlan(null); setIsCreating(false); }}
        />
      )}
    </div>
  );
}

// ── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({
  plan, onEdit, onDelete, isDeleting, onConfirmDelete, onCancelDelete,
}: {
  plan: SubscriptionPlan;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const tierIcons = [Sparkles, Star, Crown];
  const TierIcon = tierIcons[Math.min(plan.tier, 2)] ?? Star;

  return (
    <Card className={`border transition-all ${
      plan.is_active
        ? plan.highlight ? "border-[#7B2CBF]/40 dark:border-[#7B2CBF]/30" : "border-[#ECECEC] dark:border-[#2D2040]"
        : "border-[#ECECEC]/50 dark:border-[#2D2040]/50 opacity-60"
    } bg-white dark:bg-[#160D20]`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Plan icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              plan.highlight ? "bg-[#7B2CBF]" : "bg-[#F6EEFF] dark:bg-[#1E1030]"
            }`}>
              <TierIcon className={`w-5 h-5 ${plan.highlight ? "text-white" : "text-[#7B2CBF]"}`} />
            </div>

            {/* Plan info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{plan.name}</h3>
                <code className="text-xs text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#1A1030] px-1.5 py-0.5 rounded">{plan.slug}</code>
                {plan.is_default && (
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Default</Badge>
                )}
                {plan.badge_text && (
                  <Badge className="text-xs bg-[#F6EEFF] text-[#7B2CBF] dark:bg-[#1E1030] dark:text-[#C77DFF]">{plan.badge_text}</Badge>
                )}
                {!plan.is_active && (
                  <Badge className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Inactive</Badge>
                )}
              </div>
              {plan.description && (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">{plan.description}</p>
              )}

              {/* Pricing row */}
              <div className="flex items-center gap-4 mt-2.5">
                <span className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">
                  {formatPrice(plan.price_monthly, plan.currency)}
                  <span className="text-xs font-normal text-[#9CA3AF]">/mo</span>
                </span>
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  {formatPrice(plan.price_yearly, plan.currency)}/yr
                </span>
                {plan.trial_days > 0 && (
                  <span className="text-xs text-[#7B2CBF] dark:text-[#C77DFF] font-medium">
                    {plan.trial_days}-day trial
                  </span>
                )}
              </div>

              {/* Features */}
              {plan.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-[#1A1030] text-[#6B7280] dark:text-[#9CA3AF]">
                      {f}
                    </span>
                  ))}
                  {plan.features.length > 4 && (
                    <span className="text-xs text-[#9CA3AF]">+{plan.features.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 ml-4">
            {isDeleting ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-500 mr-1">Delete?</span>
                <button onClick={onConfirmDelete} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={onCancelDelete} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onEdit}
                  className="p-2 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] hover:text-[#7B2CBF] transition-colors"
                  title="Edit plan"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#6B7280] hover:text-red-500 transition-colors"
                  title="Delete plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Plan Form Modal ─────────────────────────────────────────────────────────

function PlanFormModal({
  plan, saving, onSave, onClose,
}: {
  plan: SubscriptionPlan | null;
  saving: boolean;
  onSave: (data: Partial<PlanFormData>) => void;
  onClose: () => void;
}) {
  const isEditing = !!plan;
  const [form, setForm] = useState<PlanFormData>(plan ? { ...plan } : { ...EMPTY_PLAN });
  const [featureInput, setFeatureInput] = useState("");

  const update = (field: keyof PlanFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    update("features", [...form.features, featureInput.trim()]);
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    update("features", form.features.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!form.name || (!isEditing && !form.slug)) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl border border-[#ECECEC] dark:border-[#2D2040] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">
            {isEditing ? `Edit Plan: ${plan.name}` : "Create New Plan"}
          </h3>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            {isEditing ? "Update plan details. Changes affect new subscribers immediately." : "Define a new subscription tier for your platform."}
          </p>

          <div className="mt-6 space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Plan Name</Label>
                <Input
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder="e.g., Pro"
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Slug (identifier)</Label>
                <Input
                  value={form.slug}
                  onChange={e => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g., pro"
                  disabled={isEditing}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] font-mono"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Description</Label>
                <Input
                  value={form.description ?? ""}
                  onChange={e => update("description", e.target.value || null)}
                  placeholder="Short description for the pricing page"
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="p-4 rounded-lg bg-[#FAFAFC] dark:bg-[#0D0914] border border-[#ECECEC] dark:border-[#2D2040]">
              <h4 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Pricing</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#6B7280] dark:text-[#9CA3AF] text-xs">Monthly (smallest unit)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.price_monthly}
                    onChange={e => update("price_monthly", parseInt(e.target.value) || 0)}
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                  <p className="text-[10px] text-[#9CA3AF]">= {formatPrice(form.price_monthly, form.currency)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] dark:text-[#9CA3AF] text-xs">Yearly (smallest unit)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.price_yearly}
                    onChange={e => update("price_yearly", parseInt(e.target.value) || 0)}
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                  <p className="text-[10px] text-[#9CA3AF]">= {formatPrice(form.price_yearly, form.currency)}/yr</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] dark:text-[#9CA3AF] text-xs">Currency</Label>
                  <select
                    value={form.currency}
                    onChange={e => update("currency", e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                  >
                    <option value="USD">USD</option>
                    <option value="NGN">NGN</option>
                    <option value="GHS">GHS</option>
                    <option value="KES">KES</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trial & tier */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB] text-xs">Trial Days</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.trial_days}
                  onChange={e => update("trial_days", parseInt(e.target.value) || 0)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB] text-xs">Tier Level</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.tier}
                  onChange={e => update("tier", parseInt(e.target.value) || 0)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB] text-xs">Sort Order</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={e => update("sort_order", parseInt(e.target.value) || 0)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB] text-xs">Badge Text</Label>
                <Input
                  value={form.badge_text ?? ""}
                  onChange={e => update("badge_text", e.target.value || null)}
                  placeholder="e.g., Popular"
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              <ToggleButton label="Active" checked={form.is_active} onChange={v => update("is_active", v)} />
              <ToggleButton label="Default Plan" checked={form.is_default} onChange={v => update("is_default", v)} />
              <ToggleButton label="Highlighted" checked={form.highlight} onChange={v => update("highlight", v)} />
            </div>

            {/* Features */}
            <div className="space-y-3">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Features</Label>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  placeholder="Add a feature and press Enter"
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
                <Button variant="outline" onClick={addFeature} className="shrink-0 border-[#ECECEC] dark:border-[#2D2040]">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.features.length > 0 && (
                <div className="space-y-1.5">
                  {form.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#FAFAFC] dark:bg-[#0D0914] border border-[#ECECEC] dark:border-[#2D2040]">
                      <GripVertical className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span className="text-sm text-[#111827] dark:text-[#F9FAFB] flex-1">{feature}</span>
                      <button
                        onClick={() => removeFeature(i)}
                        className="p-1 rounded text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#ECECEC] dark:border-[#2D2040]">
            <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.name || (!isEditing && !form.slug)}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> {isEditing ? "Save Changes" : "Create Plan"}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared Components ───────────────────────────────────────────────────────

function ToggleButton({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
        checked
          ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF]"
          : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]"
      }`}
    >
      {checked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", NGN: "\u20A6", GHS: "GH\u20B5", KES: "KSh", EUR: "\u20AC", GBP: "\u00A3" };
  const symbol = symbols[currency.toUpperCase()] ?? currency + " ";
  const decimals = ["JPY", "KRW", "VND"].includes(currency.toUpperCase()) ? 0 : 2;
  const displayAmount = decimals > 0 ? (amount / 100).toFixed(decimals) : String(amount);
  return `${symbol}${Number(displayAmount).toLocaleString()}`;
}
