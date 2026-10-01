import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  HardHat, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  FileText, 
  Server, 
  MessageSquare, 
  Layers, 
  BookOpen, 
  Search, 
  Mail, 
  Plus, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  Compass,
  ArrowRight,
  Briefcase,
  Users
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { ThemeToggle } from '../ThemeToggle';
import { getStoredEnquiries } from '../../utils/enquiriesStorage';
import { getStoredRequirements } from '../../utils/requirementsStorage';
import { isFeatureEnabled } from '../../utils/featureFlags';

export interface DashboardNavItem {
  id: string;
  slug?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  description?: string;
}

export interface DashboardNavSection {
  title?: string;
  items: DashboardNavItem[];
}

interface DashboardShellProps {
  currentUser: AuthUser;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  roleNavItems: DashboardNavItem[];
  breadcrumbs?: { label: string; onClick?: () => void }[];
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  onNavigate: (slug: any) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  roleNavItems,
  breadcrumbs,
  primaryAction,
  secondaryAction,
  onNavigate,
  onLogout,
  children
}) => {
  // Desktop persistent collapse state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('novah_dashboard_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Notifications drawer / popover state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Real-time inquiries & requirements for notification badges
  const [enquiries, setEnquiries] = useState(() => getStoredEnquiries());
  const [requirements, setRequirements] = useState(() => getStoredRequirements());

  useEffect(() => {
    try {
      localStorage.setItem('novah_dashboard_sidebar_collapsed', String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isNotificationsOpen]);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole: UserRole = currentUser.role;

  // Calculate unread / action count
  const unreadEnquiriesCount = enquiries.filter(enq => {
    if (userRole === 'admin') return enq.status === 'new';
    if (userRole === 'vendor') {
      return (enq.targetRole === 'vendor' || enq.targetEmail === currentUser.email) && enq.status === 'new';
    }
    if (userRole === 'advisor') {
      return (enq.targetRole === 'advisor' || enq.targetEmail === currentUser.email) && enq.status === 'new';
    }
    return (enq.targetRole === 'owner' || enq.targetEmail === currentUser.email) && enq.status === 'new';
  }).length;

  const roleMeta = (() => {
    switch (userRole) {
      case 'admin':
        return {
          roleName: 'System Administrator',
          roleBadge: 'Super Admin',
          badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          accentColor: 'text-purple-600 dark:text-purple-400',
          activeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold border-l-4 border-purple-600',
          icon: ShieldCheck
        };
      case 'vendor':
        return {
          roleName: 'Healthcare Vendor & Supplier',
          roleBadge: 'Verified Vendor',
          badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          accentColor: 'text-indigo-600 dark:text-indigo-400',
          activeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold border-l-4 border-indigo-600',
          icon: HardHat
        };
      case 'advisor':
        return {
          roleName: 'Empanelled Healthcare Advisor',
          roleBadge: 'Hospital Specialist',
          badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          accentColor: 'text-sky-600 dark:text-sky-400',
          activeBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold border-l-4 border-sky-600',
          icon: UserCheck
        };
      case 'owner':
      default:
        return {
          roleName: 'Hospital Promoter & Trustee',
          roleBadge: 'Hospital Owner',
          badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          accentColor: 'text-blue-600 dark:text-blue-400',
          activeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-blue-600',
          icon: Building2
        };
    }
  })();

  const RoleIcon = roleMeta.icon;

  // Workspace Ecosystem Tools (dynamically filtered by features.json)
  const allEcosystemTools = [
    {
      id: 'rfp',
      featureKey: 'procurement_hub',
      label: 'RFP & Procurement Hub',
      slug: 'rfp',
      icon: FileText,
      description: 'Vendor RFQs & Turnkey Bids'
    },
    {
      id: 'architecture',
      featureKey: 'architecture',
      label: 'Architecture & Cost Specs',
      slug: 'architecture',
      icon: Server,
      description: 'DOCX Export & Cloud Blueprint'
    },
    {
      id: 'whatsapp-flow',
      featureKey: 'whatsapp_flow',
      label: 'WhatsApp Bot Flow',
      slug: 'whatsapp-flow',
      icon: MessageSquare,
      description: 'Interactive Dialog Canvas'
    },
    {
      id: 'mjml-builder',
      featureKey: 'mjml_studio',
      label: 'MJML Email Studio',
      slug: 'mjml-builder',
      icon: Mail,
      description: 'Responsive HTML Mailers'
    },
    {
      id: 'toolkit',
      featureKey: 'toolkit',
      label: '15-Stage Toolkit',
      slug: 'toolkit',
      icon: BookOpen,
      description: 'Hospital Project Roadmap'
    },
    {
      id: 'compare',
      featureKey: 'comparison_matrix',
      label: 'Compare Vendors',
      slug: 'compare',
      icon: Layers,
      description: 'Side-by-side Matrix'
    },
    {
      id: 'directory',
      featureKey: 'directory_search',
      label: 'Network Directory',
      slug: 'directory',
      icon: Search,
      description: 'Search Vendors & Advisors'
    }
  ];

  const ecosystemTools = allEcosystemTools.filter(
    tool => !tool.featureKey || isFeatureEnabled(tool.featureKey as any)
  );

  const handleNavClick = (item: DashboardNavItem) => {
    onTabChange(item.id);
    if (item.slug) {
      onNavigate(item.slug as any);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleToolClick = (slug: string) => {
    onNavigate(slug);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="h-screen h-dvh w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Persistent Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 z-40 lg:z-30 h-full shrink-0 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out select-none ${
          isMobileOpen 
            ? 'left-0 w-72 shadow-2xl' 
            : '-left-full lg:left-0'
        } ${
          !isMobileOpen && (isCollapsed ? 'lg:w-[72px]' : 'lg:w-64')
        }`}
      >
        {/* Top Header / Profile Lockup */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
          <div 
            onClick={() => onNavigate('')}
            className="flex items-center gap-3 overflow-hidden cursor-pointer group"
            title="Return to NOVA-H Public Portal"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
              userRole === 'admin' ? 'bg-purple-600' :
              userRole === 'vendor' ? 'bg-indigo-600' :
              userRole === 'advisor' ? 'bg-sky-600' : 'bg-blue-600'
            }`}>
              <RoleIcon className="w-5 h-5" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                    NOVA-H Workspace
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {roleMeta.roleBadge}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-6 scrollbar-thin">
          {/* Section 1: Role Primary Workspace Views */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-2.5 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace Views
              </div>
            )}
            <nav className="space-y-1">
              {roleNavItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                        isActive
                          ? roleMeta.activeBg
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                      }`}
                    >
                      <ItemIcon className={`w-4 h-4 shrink-0 ${isActive ? roleMeta.accentColor : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                      
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate flex-1">
                          {item.label}
                        </span>
                      )}

                      {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums font-bold shrink-0 ${
                          item.badgeColor || (isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Collapsed Desktop Tooltip */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 z-50 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.2 bg-blue-500 text-white text-[10px] font-mono tabular-nums rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Section 2: Workspace Ecosystem Tools */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-2.5 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace Tools
              </div>
            )}
            <nav className="space-y-1">
              {ecosystemTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <div key={tool.id} className="relative group">
                    <button
                      onClick={() => handleToolClick(tool.slug)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
                    >
                      <ToolIcon className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                      
                      {(!isCollapsed || isMobileOpen) && (
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{tool.label}</div>
                        </div>
                      )}
                    </button>

                    {/* Collapsed Desktop Tooltip */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 z-50 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity flex flex-col">
                        <span>{tool.label}</span>
                        <span className="text-[10px] text-slate-400">{tool.description}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Account & Utilities */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0 space-y-2 bg-slate-50/50 dark:bg-slate-900/40">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <ThemeToggle size="sm" showMenu={false} />
              </div>

              <button
                onClick={onLogout}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <ThemeToggle size="sm" showMenu={false} />

              <button
                onClick={onLogout}
                title="Sign Out"
                className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Full-Width Content Canvas */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* Top Workspace Header Bar (Permanently pinned at top) */}
        <header className="shrink-0 sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-colors">
          {/* Left: Mobile Drawer Trigger + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-hidden">
              <span 
                onClick={() => onNavigate('')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
              >
                NOVA-H
              </span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span 
                onClick={() => onNavigate(userRole === 'admin' ? 'admin' : 'dashboard')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
              >
                {userRole === 'admin' ? 'Admin Console' : 'User Workspace'}
              </span>
              {breadcrumbs && breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span 
                    onClick={crumb.onClick}
                    className={`truncate ${crumb.onClick ? 'hover:text-slate-900 dark:hover:text-white cursor-pointer font-medium' : 'text-slate-800 dark:text-slate-200 font-bold'}`}
                  >
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: Quick Actions + Notification Bell */}
          <div className="flex items-center gap-2.5 shrink-0">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700"
              >
                {secondaryAction.icon && React.createElement(secondaryAction.icon, { className: 'w-3.5 h-3.5' })}
                <span>{secondaryAction.label}</span>
              </button>
            )}

            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
              >
                {primaryAction.icon && React.createElement(primaryAction.icon, { className: 'w-3.5 h-3.5' })}
                <span>{primaryAction.label}</span>
              </button>
            )}

            {/* Notification Bell with Badge & Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Notifications & Activity"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadEnquiriesCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Workspace Notifications</span>
                      {unreadEnquiriesCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                          {unreadEnquiriesCount} New
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {enquiries.slice(0, 4).map((enq) => (
                      <div 
                        key={enq.id}
                        onClick={() => {
                          onTabChange('received_enquiries');
                          setIsNotificationsOpen(false);
                        }}
                        className="py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{enq.senderName}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{enq.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 font-medium">{enq.subject}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{enq.hospitalName || enq.senderCompany}</span>
                          {enq.status === 'new' && (
                            <span className="text-amber-500 font-bold">• Action Required</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {enquiries.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No recent notifications
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onTabChange('received_enquiries');
                        setIsNotificationsOpen(false);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>View All Inquiries</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Viewport Content Area: Full Width, Independently Scrollable Body */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};
