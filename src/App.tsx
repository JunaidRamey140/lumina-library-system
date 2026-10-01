import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BookExplorer } from './components/BookExplorer';
import { InventoryPanel } from './components/InventoryPanel';
import { MemberTransactions } from './components/MemberTransactions';
import { AdminUsersPanel } from './components/AdminUsersPanel';
import { Library, BookOpen, Clock, Users, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bookService } from './lib/bookService';
import { transactionService } from './lib/transactionService';
import { userService } from './lib/userService';

const Dashboard = () => {
  const { user } = useAuth();
  const isStaffView = user?.role === 'librarian' || user?.role === 'admin';
  const [stats, setStats] = useState({ books: 0, users: 0, transactions: 0 });

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        // firestore.rules only lets librarians/admins list the whole `users` and
        // `transactions` collections (see isLibrarian() checks). A plain 'member'
        // calling getAllUsers()/getAllTransactions() gets permission-denied, which
        // was silently breaking the dashboard for every non-staff account.
        const isStaff = user.role === 'librarian' || user.role === 'admin';

        if (isStaff) {
          const [books, users, transactions] = await Promise.all([
            bookService.getAllBooks(),
            userService.getAllUsers(),
            transactionService.getAllTransactions()
          ]);
          setStats({ books: books.length, users: users.length, transactions: transactions.length });
        } else {
          const [books, myTransactions] = await Promise.all([
            bookService.getAllBooks(),
            transactionService.getUserTransactions(user.uid)
          ]);
          setStats({ books: books.length, users: 0, transactions: myTransactions.length });
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    };
    loadStats();
  }, [user]);

  return (
    <div id="dashboard-page" className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Books" 
          value={stats.books.toString()} 
          icon={Library}
          color="bg-emerald-600" 
        />
        {isStaffView ? (
          <StatCard 
            label="Active Users" 
            value={stats.users.toString()} 
            icon={Users}
            color="bg-blue-600" 
          />
        ) : (
          <StatCard 
            label="Your Loans" 
            value={stats.transactions.toString()} 
            icon={BookOpen}
            color="bg-blue-600" 
          />
        )}
        <StatCard 
          label={isStaffView ? "Total Loans" : "Books in Library"} 
          value={isStaffView ? stats.transactions.toString() : stats.books.toString()} 
          icon={isStaffView ? BookOpen : Library}
          color="bg-emerald-600" 
        />
        <StatCard 
          label="Library Hours" 
          value="9AM-9PM" 
          icon={Clock}
          color="bg-zinc-950" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200" id="quick-links">
           <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center justify-between">
            Recommended for You
            <ArrowUpRight size={20} className="text-zinc-400" />
           </h2>
           <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100 group">
                  <div className="h-14 w-10 bg-zinc-100 rounded-lg flex-shrink-0 flex items-center justify-center text-zinc-300 group-hover:bg-emerald-50 group-hover:text-emerald-300 transition-colors">
                    <Library size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">Modern Software Architecture</h4>
                    <p className="text-xs text-zinc-500">Available in Computer Science Section</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-zinc-950 p-8 rounded-3xl text-white relative overflow-hidden" id="promo-banner">
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500 mb-4 inline-block">News & Events</span>
            <h2 className="text-3xl font-light leading-tight mb-6">Explore the new Digital Archive coming this Fall.</h2>
            <button className="px-6 py-3 bg-white text-zinc-950 rounded-2xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all">Learn More</button>
          </div>
          <Library className="absolute -bottom-10 -right-10 text-emerald-500/10 h-64 w-64 rotate-12" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-colors">
    <div className="relative z-10">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-3">{label}</p>
      <p className="text-4xl font-light text-zinc-900 tracking-tighter">{value}</p>
    </div>
    <div className={`absolute top-6 right-6 h-12 w-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function App() {
  const { user, loading, error, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white" id="loading-screen">
        <motion.div 
          animate={{ 
            scale: [1, 0.9, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-4">
            <Library className="text-emerald-600 h-12 w-12" />
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50" id="login-screen">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl border border-zinc-100 flex flex-col items-center">
          <div className="h-20 w-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-500/20">
            <Library size={40} />
          </div>
          
          <div className="text-center space-y-3 mb-10">
            <h1 className="text-4xl font-bold tracking-tighter text-zinc-900">Lumina Library</h1>
            <p className="text-zinc-500 text-lg font-light">Elegance in Knowledge Management.</p>
          </div>
          
          <button 
            id="google-login-btn"
            onClick={signIn}
            className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-zinc-950 text-white rounded-3xl font-bold hover:bg-zinc-800 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-6 w-6" />
            Sign in with Google
          </button>

          {error && (
            <p id="login-error" role="alert" className="mt-6 w-full px-5 py-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm">
              {error}
            </p>
          )}

          <div className="mt-12 flex items-center gap-8 opacity-20 grayscale">
             <Library size={24} />
             <div className="h-4 w-px bg-zinc-950"></div>
             <BookOpen size={24} />
             <div className="h-4 w-px bg-zinc-950"></div>
             <Users size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans" id="app-root">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative" id="main-content">
        <Header />
        
        <div className="flex-1 overflow-y-auto" id="page-content">
          <div className="max-w-7xl mx-auto p-12 pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="mb-12" id="page-header">
                   <div className="flex items-center gap-3 text-emerald-600 mb-2">
                     <span className="h-px w-8 bg-current opacity-30"></span>
                     <span className="text-[10px] uppercase font-black tracking-[0.3em]">Lumina Core</span>
                   </div>
                  <h1 className="text-5xl font-bold text-zinc-900 tracking-tightest capitalize">
                    {activeTab.replace('-', ' ')}
                  </h1>
                </div>

                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'browse' && <BookExplorer />}
                {activeTab === 'inventory' && <InventoryPanel />}
                {activeTab === 'my-books' && <MemberTransactions />}
                {activeTab === 'history' && <MemberTransactions />}
                {activeTab === 'members' && <AdminUsersPanel />}
                
                {['settings', 'notifications'].includes(activeTab) && (
                   <div className="h-[400px] flex flex-col items-center justify-center text-zinc-400 bg-zinc-100/50 rounded-[40px] border-2 border-dashed border-zinc-200">
                      <Settings className="mb-4 opacity-50" size={48} />
                      <p className="font-medium tracking-tight">The {activeTab} module is coming soon.</p>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Settings } from 'lucide-react';

