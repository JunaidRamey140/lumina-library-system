import { useState, useEffect } from 'react';
import { userService, UserProfile } from '../lib/userService';
import { UserRole } from '../contexts/AuthContext';
import { Shield, ShieldAlert, ShieldCheck, Mail, Calendar } from 'lucide-react';

export function AdminUsersPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await userService.updateUserRole(uid, newRole);
      loadUsers();
    }
  };

  return (
    <div className="space-y-6" id="admin-users-panel">
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Role</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 border border-zinc-200">
                      {u.displayName?.[0] || 'U'}
                    </div>
                    <span className="font-bold text-zinc-900">{u.displayName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500 flex items-center gap-2">
                  <Mail size={14} className="text-zinc-300" />
                  {u.email}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500 flex items-center gap-2">
                  <Calendar size={14} className="text-zinc-300" />
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' :
                    u.role === 'librarian' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {u.role === 'admin' && <ShieldAlert size={12} />}
                    {u.role === 'librarian' && <ShieldCheck size={12} />}
                    {u.role === 'member' && <Shield size={12} />}
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <select 
                      id={`role-select-${u.uid}`}
                      defaultValue=""
                      onChange={(e) => e.target.value && handleRoleChange(u.uid, e.target.value as UserRole)}
                      className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="" disabled>Change Role</option>
                      <option value="member">Member</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
