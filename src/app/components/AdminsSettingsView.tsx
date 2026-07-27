import { useState, useEffect } from "react";
import { ChevronRight, UserCog, UserPlus, Trash2, X, Loader2, Pencil, AlertTriangle } from "lucide-react";
import { adminApi, adminAuthApi, AdminUser } from "../api";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function AdminsSettingsView() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", full_name: "", role: "admin" });
  const [editForm, setEditForm] = useState({ full_name: "", email: "", role: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await adminApi.getAdmins();
        setAdmins(data);
      } catch {
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.full_name) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await adminAuthApi.register(newAdmin);
      setAdmins(prev => [...prev, created]);
      setShowAddModal(false);
      setNewAdmin({ email: "", password: "", full_name: "", role: "admin" });
    } catch (err: any) {
      setError(err.message || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditForm({ full_name: admin.full_name, email: admin.email, role: admin.role });
    setError(null);
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin || !editForm.full_name || !editForm.email) {
      setError("Name and email are required");
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      setError("Please enter a valid email address");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await adminApi.updateAdmin(selectedAdmin.admin_id, {
        full_name: editForm.full_name,
        email: editForm.email,
        role: editForm.role,
      });
      setAdmins(prev => prev.map(a => a.admin_id === selectedAdmin.admin_id ? updated : a));
      setShowEditModal(false);
      setSelectedAdmin(null);
    } catch (err: any) {
      setError(err.message || "Failed to update admin");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    setSaving(true);
    try {
      await adminApi.deleteAdmin(selectedAdmin.admin_id);
      setAdmins(prev => prev.filter(a => a.admin_id !== selectedAdmin.admin_id));
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete admin");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "super_admin") {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
          Super Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]">
        Admin
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB]">Admin Accounts</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Users with access to this admin dashboard.</p>
          </div>
          <Button onClick={() => { setError(null); setShowAddModal(true); }} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#7B2CBF] animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280] dark:text-[#9CA3AF]">
            <UserCog className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No admins found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map(admin => (
              <div
                key={admin.admin_id}
                className="flex items-center justify-between p-4 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {admin.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB]">{admin.full_name}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(admin.role)}
                  <button
                    onClick={() => openEditModal(admin)}
                    className="p-2 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] hover:text-[#7B2CBF] transition-colors"
                    title="Edit admin"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {admin.role !== "super_admin" && (
                    <button
                      onClick={() => openDeleteModal(admin)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                      title="Delete admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Admin Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl border border-[#ECECEC] dark:border-[#2D2040] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-[#ECECEC] dark:border-[#2D2040]">
                <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB]">Add New Admin</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Full Name</Label>
                  <Input
                    value={newAdmin.full_name}
                    onChange={e => setNewAdmin(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="John Doe"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Email</Label>
                  <Input
                    type="email"
                    value={newAdmin.email}
                    onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@finishi.org"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Password</Label>
                  <Input
                    type="password"
                    value={newAdmin.password}
                    onChange={e => setNewAdmin(p => ({ ...p, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Role</Label>
                  <div className="relative">
                    <select
                      value={newAdmin.role}
                      onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value }))}
                      className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none rotate-90" />
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Super admins can manage other admins and access all settings.</p>
                </div>

                {error && (
                  <p className="text-sm text-[#EF4444] bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-[#ECECEC] dark:border-[#2D2040]">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-[#ECECEC] dark:border-[#2D2040]">
                  Cancel
                </Button>
                <Button onClick={handleCreateAdmin} disabled={saving} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><UserPlus className="w-4 h-4 mr-2" /> Create Admin</>}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl border border-[#ECECEC] dark:border-[#2D2040] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-[#ECECEC] dark:border-[#2D2040]">
                <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB]">Edit Admin</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Avatar and email display */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1030]">
                  <div className="w-12 h-12 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold">
                      {selectedAdmin.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">{selectedAdmin.full_name}</p>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{selectedAdmin.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Full Name</Label>
                  <Input
                    value={editForm.full_name}
                    onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="John Doe"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Email</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@finishi.org"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Role</Label>
                  <div className="relative">
                    <select
                      value={editForm.role}
                      onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                      className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                      disabled={selectedAdmin.role === "super_admin"}
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none rotate-90" />
                  </div>
                  {selectedAdmin.role === "super_admin" && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Super admin role cannot be changed.</p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-[#EF4444] bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-[#ECECEC] dark:border-[#2D2040]">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="border-[#ECECEC] dark:border-[#2D2040]">
                  Cancel
                </Button>
                <Button onClick={handleUpdateAdmin} disabled={saving} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl border border-[#ECECEC] dark:border-[#2D2040] w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-[#EF4444]" />
                </div>
                <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB] mb-2">Delete Admin</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                  Are you sure you want to delete this admin?
                </p>
                <div className="flex items-center justify-center gap-2 py-3 px-4 mt-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1030]">
                  <div className="w-8 h-8 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {selectedAdmin.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB]">{selectedAdmin.full_name}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{selectedAdmin.email}</p>
                  </div>
                </div>
                <p className="text-xs text-[#EF4444] mt-3">This action cannot be undone.</p>
              </div>

              <div className="flex items-center gap-3 p-4 border-t border-[#ECECEC] dark:border-[#2D2040]">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1 border-[#ECECEC] dark:border-[#2D2040]">
                  Cancel
                </Button>
                <Button onClick={handleDeleteAdmin} disabled={saving} className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
