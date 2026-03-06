import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../services/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { 
  signOut, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError
} from 'firebase/auth';
import { Download, LogOut, Loader2, Table, FileSpreadsheet, Lock, Mail, Key, UserPlus, AlertCircle, Trash2, Settings, Save, X } from 'lucide-react';
import { useEventSettings, EventSettings } from '../services/settingsService';
import { deleteDoc, doc } from 'firebase/firestore';

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
  const [activeTab, setActiveTab] = useState<'registrations' | 'settings'>('registrations');
  const { settings, updateSettings, loading: settingsLoading } = useEventSettings();
  const [editSettings, setEditSettings] = useState<EventSettings>(settings);

  useEffect(() => {
    if (!settingsLoading) {
      setEditSettings(settings);
    }
  }, [settings, settingsLoading]);
  
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
        setLoginError(`Email/Password login is disabled for project "${auth.app.options.projectId}". Please enable it in Firebase Console.`);
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
        setLoginError(`Email/Password login is disabled for project "${auth.app.options.projectId}". Please enable it in Firebase Console.`);
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

  const handleDeleteRegistration = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this registration?")) return;
    
    try {
      await deleteDoc(doc(db, 'registrations', id));
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting registration:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to delete registration: ${errorMessage}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(editSettings);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
    }
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

  const uniquePrograms = ['All', ...new Set(registrations.map(r => r.program).filter(Boolean))];

  const filteredRegistrations = registrations.filter(reg => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      (reg.studentName || '').toLowerCase().includes(search) ||
      (reg.uwlIdNo || '').toLowerCase().includes(search) ||
      (reg.contactNumber || '').toLowerCase().includes(search);
    
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
        className="w-full min-h-[calc(100vh-6rem)] p-8 bg-white/60 backdrop-blur-2xl border-b border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-md">
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
      </div>
    </motion.div>
  );
}

  if (activeTab === 'settings') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto p-4 md:p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Event Settings</h2>
          <button onClick={() => setActiveTab('registrations')} className="text-slate-500 hover:text-slate-900"><X /></button>
        </div>

        <form onSubmit={handleSaveSettings} className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-8 shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Title</label>
            <input 
              type="text" 
              value={editSettings.title}
              onChange={e => setEditSettings({...editSettings, title: e.target.value})}
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtitle</label>
            <input 
              type="text" 
              value={editSettings.subtitle}
              onChange={e => setEditSettings({...editSettings, subtitle: e.target.value})}
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
              <input 
                type="text" 
                value={editSettings.date}
                onChange={e => setEditSettings({...editSettings, date: e.target.value})}
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
              <input 
                type="text" 
                value={editSettings.location}
                onChange={e => setEditSettings({...editSettings, location: e.target.value})}
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terms & Conditions</label>
            <textarea 
              value={editSettings.terms}
              onChange={e => setEditSettings({...editSettings, terms: e.target.value})}
              rows={3}
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-[calc(100vh-6rem)] p-4 md:p-8 bg-white/60 backdrop-blur-2xl border-b border-white/50"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-1">Dashboard</h2>
          <p className="text-slate-500 font-medium">Welcome, {user.email || user.displayName}</p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab(activeTab === 'registrations' ? 'settings' : 'registrations')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
          >
            {activeTab === 'registrations' ? <Settings className="w-4 h-4" /> : <Table className="w-4 h-4" />}
            {activeTab === 'registrations' ? 'Event Settings' : 'View Registrations'}
          </button>
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

      <div className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fetching ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
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
                  <tr key={reg.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-8 py-5 font-semibold text-slate-900">{reg.studentName}</td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {reg.program}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-mono">{reg.uwlIdNo}</td>
                    <td className="px-8 py-5 text-sm text-slate-600">{reg.contactNumber}</td>
                    <td className="px-8 py-5 text-sm text-slate-600">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        (reg.interested || 'Yes') === 'Yes' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {reg.interested || 'Yes'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDeleteRegistration(reg.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
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
              <div key={reg.id} className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{reg.studentName}</h3>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {reg.program}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (reg.interested || 'Yes') === 'Yes' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {reg.interested || 'Yes'}
                  </span>
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
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => handleDeleteRegistration(reg.id)}
                    className="flex items-center gap-2 text-red-600 text-xs font-bold px-4 py-2 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Response
                  </button>
                </div>
              </div>
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
