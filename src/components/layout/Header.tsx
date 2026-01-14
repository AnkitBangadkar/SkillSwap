import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Compass,
  PlusCircle,
  Sparkles,
  MessageCircle,
  Calendar,
  User,
  LogOut,
  Bell,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Avatar, Button, Badge } from '../ui';
import { APP_CONFIG, ROUTES } from '../../lib/constants';

const navItems = [
  { label: 'Dashboard', href: ROUTES.dashboard, icon: Home },
  { label: 'Explore', href: ROUTES.explore, icon: Compass },
  { label: 'Create Listing', href: ROUTES.createListing, icon: PlusCircle },
  { label: 'Matches', href: ROUTES.matches, icon: Sparkles },
  { label: 'Messages', href: ROUTES.chats, icon: MessageCircle },
  { label: 'Bookings', href: ROUTES.bookings, icon: Calendar },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    sidebarOpen, 
    toggleSidebar, 
    unreadCount, 
    notifications,
    markAsRead,
    markAllAsRead,
    theme,
    toggleTheme,
  } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home);
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-default)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Link to={ROUTES.dashboard} className="flex items-center gap-2 group">
              <div className="h-8 w-8 bg-[var(--color-primary-600)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-[var(--text-primary)] hidden sm:block tracking-tight">
                {APP_CONFIG.name}
              </span>
            </Link>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-100)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-highlight)] rounded-full transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-highlight)] rounded-full transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-[var(--color-error)] text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-surface)] rounded-2xl shadow-xl border border-[var(--border-default)] py-1 overflow-hidden z-50 ring-1 ring-black/5">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface-highlight)]">
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={cn(
                            "px-4 py-3 border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-highlight)] cursor-pointer transition-colors",
                            !notification.read && "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20"
                          )}
                          onClick={() => {
                            markAsRead(notification.id);
                            setShowNotifications(false);
                            if (notification.link) navigate(notification.link);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--text-primary)]">{notification.title}</p>
                              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-0.5">{notification.message}</p>
                              <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                                {formatDate(notification.createdAt.toDate())}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-[var(--color-primary-500)] mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            {user && (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--bg-surface-highlight)] transition-colors border border-transparent hover:border-[var(--border-default)]">
                  <Avatar
                    src={user.photoURL}
                    name={user.name}
                    size="sm"
                  />
                  <span className="hidden md:block text-sm font-medium text-[var(--text-primary)] pr-2">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-surface)] rounded-2xl shadow-xl border border-[var(--border-default)] py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ring-1 ring-black/5">
                  <Link
                    to={ROUTES.profile}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-highlight)]"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-primary-50)]/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {sidebarOpen && (
        <div className="lg:hidden border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={toggleSidebar}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                    isActive
                      ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-100)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
