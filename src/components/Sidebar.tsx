import React from 'react';
import { 
  Library, 
  BookOpen, 
  Users, 
  Settings, 
  Bell, 
  LogOut, 
  History,
  LayoutDashboard,
  Search,
  BookMarked
} from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { motion } from 'motion/react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  role: UserRole[];
  id: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', role: ['member', 'librarian', 'admin'], id: 'dashboard' },
  { icon: Search, label: 'Browse Books', role: ['member', 'librarian', 'admin'], id: 'browse' },
  { icon: BookMarked, label: 'My Books', role: ['member'], id: 'my-books' },
  { icon: History, label: 'History', role: ['member'], id: 'history' },
  { icon: BookOpen, label: 'Manage Inventory', role: ['librarian', 'admin'], id: 'inventory' },
  { icon: Users, label: 'Members', role: ['librarian', 'admin'], id: 'members' },
  { icon: Settings, label: 'System Settings', role: ['admin'], id: 'settings' },
  { icon: Bell, label: 'Notifications', role: ['member', 'librarian', 'admin'], id: 'notifications' },
];

export function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const filteredItems = sidebarItems.filter(item => item.role.includes(user.role));

  return (
    <div className="w-64 bg-zinc-950 text-zinc-400 h-screen flex flex-col border-r border-zinc-800" id="sidebar">
      <div className="p-6 flex items-center gap-3 text-white border-bottom border-zinc-800" id="sidebar-logo">
        <Library className="text-emerald-500" />
        <span className="font-bold text-lg tracking-tight">Lumina Library</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-emerald-500' : 'group-hover:text-zinc-200'} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800" id="sidebar-footer">
        <button 
          id="logout-btn"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors text-zinc-500"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
