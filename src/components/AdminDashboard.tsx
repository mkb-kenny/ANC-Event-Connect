import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../services/firebase';
import { collection, query, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError
} from 'firebase/auth';
import { Download, LogOut, Loader2, Table, FileSpreadsheet, Lock, Mail, Key, UserPlus, AlertCircle, Edit2, Trash2, X, Save } from 'lucide-react';

interface Registration {
  id: string;
  studentName: string;
  contactNumber: string;
  program: string;
  uwlIdNo: string;
  interested?: string; // Optional now
  informAdvance: string | boolean; // Can be string (old) or boolean (new)
  createdAt: Timestamp;
}

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [fetching, setFetching] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  // Removed statusFilter since 'interested' is removed from form

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showSetupButton, setShowSetupButton] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Registration>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchRegistrations();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchRegistrations = async () => {
    setFetching(true);
    try {
      const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Registration[];
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      alert("Failed to fetch data. Check console for details.");
    } finally {
      setFetching(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      const authError = error as AuthError;
      console.error("Google login failed:", authError);
      if (authError.code === 'auth/operation-not-allowed') {
        setLoginError(`Google Sign-In is disabled for project "${auth.app.options.projectId}". Enable it in Firebase Console > Authentication > Sign-in method.`);
      } else {
        setLoginError("Google login failed: " + authError.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    setShowSetupButton(false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
      console.error("Login failed:", authError);
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        setLoginError("Login failed. If this is your first time, you must create the admin account.");
        setShowSetupButton(true);
      } else if (authError.code === 'auth/operation-not-allowed') {
        setLoginError(`Email/Password login is disabled for project "${auth.app.options.projectId}". Please check this specific project in Firebase Console.`);
      } else if (authError.code === 'auth/configuration-not-found') {
        setLoginError("Authentication not set up. Go to Firebase Console > Authentication, click 'Get Started', and enable Email/Password.");
      } else {
        setLoginError(authError.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const createDefaultAdmin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      // Attempt to create the requested admin user
      await createUserWithEmailAndPassword(auth, 'admin@ancedu.com', 'Anc@321$');
      alert("Admin account created successfully! You are now logged in.");
    } catch (error) {
      const authError = error as AuthError;
      console.error("Create admin failed:", authError);
      if (authError.code === 'auth/email-already-in-use') {
        setLoginError("Account already exists. Please log in.");
        // Optional: Auto-fill for convenience
        setEmail('admin@ancedu.com');
        setPassword('Anc@321$');
      } else if (authError.code === 'auth/operation-not-allowed') {
        setLoginError(`Email/Password login is disabled for project "${auth.app.options.projectId}". Please check this specific project in Firebase Console.`);
      } else if (authError.code === 'auth/configuration-not-found') {
        setLoginError("Authentication not set up. Go to Firebase Console > Authentication, click 'Get Started', and enable Email/Password.");
      } else {
        setLoginError("Failed to create admin: " + authError.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRegistrations([]);
    setEmail('');
    setPassword('');
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = ['Student Name', 'Contact Number', 'Program', 'UWL ID No', 'Interested', 'Inform Advance', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...registrations.map(row => {
        const informAdvanceVal = typeof row.informAdvance === 'boolean'
          ? (row.informAdvance ? 'Agree' : 'Disagree')
          : row.informAdvance;

        const interestedVal = row.interested || 'Yes';

        return [
          `"${row.studentName}"`,
          `"${row.contactNumber}"`,
          `"${row.program}"`,
          `"${row.uwlIdNo}"`,
          `"${interestedVal}"`,
          `"${informAdvanceVal}"`,
          `"${row.createdAt?.toDate().toLocaleString()}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `student_event_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditStart = (reg: Registration) => {
    setEditingId(reg.id);
    setEditForm({ ...reg });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditSave = async () => {
    if (!editingId) return;

    try {
      const regRef = doc(db, 'registrations', editingId);
      // Remove id and createdAt before updating to prevent trying to overwrite timestamp
      const { id, createdAt, ...updateData } = editForm as Registration;
      await updateDoc(regRef, updateData);

      // Update local state
      setRegistrations(prev => prev.map(reg => reg.id === editingId ? { ...reg, ...updateData } : reg));
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update registration.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the registration for ${name}?`)) {
      try {
        await deleteDoc(doc(db, 'registrations', id));
        setRegistrations(prev => prev.filter(reg => reg.id !== id));
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete registration.");
      }
    }
  };

  const uniquePrograms = ['All', ...new Set(registrations.map(r => r.program))];

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.uwlIdNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.contactNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram = programFilter === 'All' || reg.program === programFilter;

    return matchesSearch && matchesProgram;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-8 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/10 transform rotate-3">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Admin Access</h2>
          <p className="text-slate-500 text-sm font-medium">Sign in to manage registrations</p>
          <p className="text-slate-400 text-[10px] mt-1 font-mono">Project: {auth?.app?.options?.projectId || 'Unknown'}</p>
        </div>

        {loginError && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex flex-col gap-2 text-red-600 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{loginError}</p>
            </div>
            {showSetupButton && (
              <button
                onClick={createDefaultAdmin}
                className="mt-2 bg-white/50 hover:bg-white text-red-700 text-xs py-2 px-3 rounded-xl transition-colors w-full text-center font-bold border border-red-200 shadow-sm"
              >
                Create Admin Account Now
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white hover:border-blue-300 shadow-sm"
                placeholder="admin@ancedu.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white hover:border-blue-300 shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 mt-2"
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            Back to Event Page
          </button>

          {/* Setup Button */}
          <button
            onClick={createDefaultAdmin}
            className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
            title="Create Default Admin Account"
          >
            <UserPlus className="w-3 h-3" />
            Setup Admin
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto p-4 md:p-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-1">Dashboard</h2>
          <p className="text-slate-500 font-medium">Welcome, {user.email || user.displayName}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportToCSV}
            disabled={registrations.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleLogout}
            className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <button
            onClick={onBack}
            className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Back
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name, ID, or Contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="relative">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
          >
            {uniquePrograms.map(prog => (
              <option key={prog} value={prog}>{prog === 'All' ? 'All Programs' : prog}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-slate-900">
            <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-8 py-5">Student Name</th>
                <th className="px-8 py-5">Program</th>
                <th className="px-8 py-5">UWL ID</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Interested</th>
                <th className="px-8 py-5 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fetching ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Loading data...</p>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-500 font-medium">
                    No registrations found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  editingId === reg.id ? (
                    <tr key={reg.id} className="bg-blue-50/50">
                      <td className="px-8 py-4">
                        <input
                          type="text"
                          value={editForm.studentName || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <select
                          value={editForm.program || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, program: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm"
                        >
                          <option value="MBA">MBA</option>
                          <option value="Top Up">Top Up</option>
                          <option value="MSc">MSc</option>
                          <option value="LLM">LLM</option>
                          <option value="L7">L7</option>
                        </select>
                      </td>
                      <td className="px-8 py-4">
                        <input
                          type="text"
                          value={editForm.uwlIdNo || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, uwlIdNo: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input
                          type="text"
                          value={editForm.contactNumber || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <select
                          value={editForm.interested || 'Yes'}
                          onChange={e => setEditForm(prev => ({ ...prev, interested: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm"
                        >
                          <option value="Yes">Yes</option>
                          <option value="NO">NO</option>
                        </select>
                      </td>
                      <td className="px-8 py-4 text-right space-x-2">
                        <button onClick={handleEditSave} className="text-green-600 hover:text-green-800 p-1">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={handleEditCancel} className="text-slate-400 hover:text-red-600 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={reg.id} className="hover:bg-white/80 transition-colors group">
                      <td className="px-8 py-5 font-semibold text-slate-900">{reg.studentName}</td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {reg.program}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 font-mono">{reg.uwlIdNo}</td>
                      <td className="px-8 py-5 text-sm text-slate-600">{reg.contactNumber}</td>
                      <td className="px-8 py-5 text-sm text-slate-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${(reg.interested || 'Yes') === 'Yes' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                          {reg.interested || 'Yes'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditStart(reg)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(reg.id, reg.studentName)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-6">
          {fetching ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Loading data...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">
              No registrations found matching your filters.
            </div>
          ) : (
            filteredRegistrations.map((reg) => (
              editingId === reg.id ? (
                <div key={reg.id} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                      <input type="text" value={editForm.studentName || ''} onChange={e => setEditForm(prev => ({ ...prev, studentName: e.target.value }))} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Program</label>
                        <select value={editForm.program || ''} onChange={e => setEditForm(prev => ({ ...prev, program: e.target.value }))} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm mt-1">
                          <option value="MBA">MBA</option>
                          <option value="Top Up">Top Up</option>
                          <option value="MSc">MSc</option>
                          <option value="LLM">LLM</option>
                          <option value="L7">L7</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Interested</label>
                        <select value={editForm.interested || 'Yes'} onChange={e => setEditForm(prev => ({ ...prev, interested: e.target.value }))} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm mt-1">
                          <option value="Yes">Yes</option>
                          <option value="NO">NO</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">UWL ID</label>
                        <input type="text" value={editForm.uwlIdNo || ''} onChange={e => setEditForm(prev => ({ ...prev, uwlIdNo: e.target.value }))} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Contact</label>
                        <input type="text" value={editForm.contactNumber || ''} onChange={e => setEditForm(prev => ({ ...prev, contactNumber: e.target.value }))} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-blue-100">
                    <button onClick={handleEditCancel} className="flex items-center gap-1 text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleEditSave} className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div key={reg.id} className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{reg.studentName}</h3>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {reg.program}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${(reg.interested || 'Yes') === 'Yes' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                        {reg.interested || 'Yes'}
                      </span>
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditStart(reg)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(reg.id, reg.studentName)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-bold">UWL ID</p>
                      <p className="text-slate-900 font-mono font-medium">{reg.uwlIdNo}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Contact</p>
                      <p className="text-slate-900 font-medium">{reg.contactNumber}</p>
                    </div>
                  </div>
                </div>
              )
            ))
          )}
        </div>

        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-500 flex justify-between items-center">
          <span>Showing {filteredRegistrations.length} of {registrations.length} Registrations</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Synced with Firestore
          </span>
        </div>
      </div>
    </motion.div>
  );
}
