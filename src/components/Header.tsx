import { useAuth } from '../contexts/AuthContext';
import { Search, Bell, User } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10" id="app-header">
      <div className="relative w-96" id="header-search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Search for books, authors, ISBN..." 
          className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-6" id="header-actions">
        <button className="text-zinc-500 hover:text-zinc-900 transition-colors relative" id="header-notifications">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-zinc-200"></div>

        <div className="flex items-center gap-3" id="user-profile-summary">
          <div className="text-right">
            <p className="text-sm font-semibold text-zinc-900 leading-none">{user?.displayName}</p>
            <p className="text-xs text-zinc-500 capitalize mt-1">{user?.role}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200" id="user-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="rounded-full" />
            ) : (
              <User size={20} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
