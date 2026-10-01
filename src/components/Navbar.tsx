import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShieldCheck, UserCheck, LogOut, Settings, LayoutDashboard, Mail, Server, ChevronDown } from 'lucide-react';
import { UserRole, AuthUser } from '../types';
import { RouteSlug } from '../utils/routes';
import { ThemeToggle } from './ThemeToggle';
import { isFeatureEnabled } from '../utils/featureFlags';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'signup', role?: UserRole) => void;
  onOpenCicd: () => void;
  onOpenToolkit: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenAdminDirectory?: () => void;
  activeSlug?: RouteSlug;
  onNavigate: (slug: RouteSlug) => void;
  comparedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  onOpenCicd, 
  onOpenToolkit,
  currentUser,
  onLogout,
  onOpenAdminDirectory,
  activeSlug = '',
  onNavigate,
  comparedCount = 0
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (slug: RouteSlug) => {
    setMobileMenuOpen(false);
    onNavigate(slug);
  };

  return (
    <header
      id="nova-header"
      style={{
        paddingTop: `calc(env(safe-area-inset-top, 0px) + ${scrolled ? '0.5rem' : '0.75rem'})`,
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 pb-2.5 sm:pb-3 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 xl:gap-6">
        {/* Brand Logo */}
        <a 
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('');
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0 select-none"
          id="nova-brand-logo"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-xs group-hover:shadow-md transition-all shrink-0">
            <div className="flex items-baseline translate-x-[2px]">
              N<span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-[2px]"></span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-none">NOVA-H</span>
            </div>
            <p className="text-[9px] xl:text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5 hidden sm:block whitespace-nowrap">
              Network for Owners, Vendors &amp; Advisors
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links with Slugs */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 shrink-0" id="desktop-nav">
          <button
            onClick={() => handleLinkClick('owners')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'owners' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            For Owners
          </button>
          <button
            onClick={() => handleLinkClick('vendors')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'vendors' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            For Vendors
          </button>
          <button
            onClick={() => handleLinkClick('advisors')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'advisors' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            For Advisors
          </button>
          <button
            onClick={() => handleLinkClick('toolkit')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'toolkit' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            Toolkit
          </button>
          <button
            onClick={() => handleLinkClick('how-it-works')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'how-it-works' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => handleLinkClick('pricing')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'pricing' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            Pricing &amp; Plans
          </button>
          <button
            onClick={() => handleLinkClick('directory')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'directory' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => handleLinkClick('about')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'about' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            About
          </button>
          {isFeatureEnabled('architecture') && (
            <button
              onClick={() => handleLinkClick('architecture')}
              className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeSlug === 'architecture' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-blue-500" />
              <span>Architecture &amp; Cost</span>
            </button>
          )}
        </nav>

        {/* Action Buttons: Sign In / Profile status & Theme Toggle */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {/* Dark / Light Mode Dropdown aligned to h-9 */}
          <div className="flex items-center">
            <ThemeToggle showMenu={true} size="md" />
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
  
              {/* Integrated User Profile Dropdown (h-9) */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`h-9 pl-2 pr-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer select-none shadow-xs group ${
                    userDropdownOpen
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                  }`}
                  aria-expanded={userDropdownOpen}
                  aria-label="User account menu"
                >
                  {/* Avatar Icon */}
                  <div className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs ${
                    currentUser.role === 'admin'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-700'
                      : currentUser.role === 'vendor'
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-700'
                      : currentUser.role === 'advisor'
                      ? 'bg-gradient-to-br from-sky-600 to-blue-700'
                      : 'bg-gradient-to-br from-blue-600 to-indigo-800'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name Label */}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[105px]">
                    {currentUser.name.split(' ')[0]}
                  </span>

                  {/* Role Tag */}
                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  }`}>
                    {currentUser.role}
                  </span>

                  {/* Chevron indicator */}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                  }`} />
                </button>

                {/* Popover Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
                    {/* Header info */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-1 border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm ${
                          currentUser.role === 'admin'
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-700'
                            : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                        }`}>
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {currentUser.email}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {currentUser.role}
                            </span>
                            {currentUser.company && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                · {currentUser.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick navigation links */}
                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLinkClick(currentUser.role === 'admin' ? 'admin' : 'dashboard');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        {currentUser.role === 'admin' ? (
                          <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        ) : (
                          <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                        <span className="flex-1">
                          {currentUser.role === 'admin' ? 'Open Admin Console' : 'Open Workspace Dashboard'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLinkClick('directory');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="flex-1">Network Directory</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenToolkit();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="flex-1">15-Stage Hospital Toolkit</span>
                      </button>
                    </div>

                    {/* Sign out separator & action */}
                    {onLogout && (
                      <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                id="signin-header-btn"
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>

              <button
                id="signup-header-btn"
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 text-xs xl:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Sign Up</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle & Mobile Theme Switcher */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeToggle showMenu={false} size="sm" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          style={{
            paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
          }}
          className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 space-y-3 shadow-lg animate-fadeIn max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          {currentUser && (
            <div className="p-3 bg-blue-50/60 dark:bg-slate-800/80 rounded-xl border border-blue-200/80 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'admin' ? 'bg-purple-700' : 'bg-blue-600'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className={`text-[10px] uppercase font-semibold ${
                    currentUser.role === 'admin' ? 'text-purple-700 dark:text-purple-400' : 'text-blue-700 dark:text-blue-400'
                  }`}>{currentUser.role} Account</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleLinkClick('admin')}
                    className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer"
                  >
                    Console
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            {currentUser && (
              currentUser.role === 'admin' ? (
                <button
                  onClick={() => handleLinkClick('admin')}
                  className={`px-3 py-2.5 text-left text-sm font-bold rounded-xl flex items-center gap-2 ${
                    activeSlug === 'admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300' : 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300'
                  }`}
                >
                  <Settings className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span>Admin Console Portal</span>
                </button>
              ) : (
                <button
                  onClick={() => handleLinkClick('dashboard')}
                  className={`px-3 py-2.5 text-left text-sm font-bold rounded-xl flex items-center gap-2 ${
                    activeSlug === 'dashboard' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Role Workspace Dashboard</span>
                </button>
              )
            )}
            <button
              onClick={() => handleLinkClick('owners')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'owners' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              For Owners
            </button>
            <button
              onClick={() => handleLinkClick('vendors')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'vendors' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              For Vendors
            </button>
            <button
              onClick={() => handleLinkClick('advisors')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'advisors' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              For Advisors
            </button>
            <button
              onClick={() => handleLinkClick('toolkit')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'toolkit' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Owners Toolkit
            </button>
            <button
              onClick={() => handleLinkClick('how-it-works')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'how-it-works' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => handleLinkClick('pricing')}
              className={`px-3 py-2 text-left text-sm font-bold rounded-md ${
                activeSlug === 'pricing' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' : 'text-blue-700 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Pricing &amp; Plans
            </button>
            <button
              onClick={() => handleLinkClick('directory')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'directory' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => handleLinkClick('about')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'about' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              About
            </button>
            {isFeatureEnabled('architecture') && (
              <button
                onClick={() => handleLinkClick('architecture')}
                className={`px-3 py-2 text-left text-sm font-semibold rounded-md flex items-center gap-2 ${
                  activeSlug === 'architecture' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Server className="w-4 h-4 text-blue-600" />
                <span>Backend Architecture &amp; Cost</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Appearance</span>
              <ThemeToggle showMenu={true} size="sm" />
            </div>

            {!currentUser && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('signin'); }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-600 text-center hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
