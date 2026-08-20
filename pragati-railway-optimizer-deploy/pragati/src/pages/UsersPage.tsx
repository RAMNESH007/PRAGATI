import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types';
import { 
  UserPlus, 
  MapPin
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('OPERATOR');
  const [newZone, setNewZone] = useState('Northern Railway');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) return;

    const newUser: User = {
      id: 'user-' + Date.now(),
      username: newUsername.toLowerCase(),
      name: newName,
      email: newEmail || `${newUsername}@railnet.gov.in`,
      role: newRole,
      assignedZone: newRole === 'OPERATOR' ? newZone : undefined,
      status: 'ACTIVE',
      lastLogin: 'Never'
    };

    setUsersList(prev => [...prev, newUser]);
    setShowAddModal(false);
    setNewUsername('');
    setNewName('');
    setNewEmail('');
  };

  const toggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              User & Role Management
            </h1>
            <span className="bg-[#063B7A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Admin Scoped
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Provision dispatch operators, configure zonal scopes & manage cryptographic permissions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#063B7A] hover:bg-[#052B5F] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4 text-orange-400" />
          <span>Provision New Controller</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <th className="py-3 px-3">Operator Name</th>
                <th className="py-3 px-3">Username & Email</th>
                <th className="py-3 px-2 text-center">Role</th>
                <th className="py-3 px-3">Assigned Zone Scope</th>
                <th className="py-3 px-3">Last Active Login</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u: User) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-[#063B7A] block">{u.username}</span>
                    <span className="text-[11px] text-slate-500">{u.email}</span>
                  </td>

                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-orange-100 text-[#F45100]' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {u.assignedZone ? (
                      <span className="font-bold text-slate-800 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{u.assignedZone}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">All 17 Zones (Global Admin)</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {u.lastLogin}
                  </td>

                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        u.status === 'ACTIVE' 
                          ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-slate-900">Provision Traffic Controller</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. ramesh_nr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh@nr.railnet.gov.in"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="OPERATOR">Zone Operator</option>
                    <option value="ADMIN">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Zone Scope</label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    disabled={newRole === 'ADMIN'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold disabled:opacity-50"
                  >
                    <option value="Northern Railway">Northern Railway</option>
                    <option value="Western Railway">Western Railway</option>
                    <option value="Eastern Railway">Eastern Railway</option>
                    <option value="Southern Railway">Southern Railway</option>
                    <option value="Central Railway">Central Railway</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#063B7A] hover:bg-[#052B5F] text-white rounded-xl font-bold shadow-sm"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
