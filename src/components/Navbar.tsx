import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, UserCheck, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { UserRole, AuthUser } from '../types';
import { RouteSlug } from '../utils/routes';

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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2.5'
          : 'bg-white border-b border-slate-200 py-3'
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
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">NOVA-H</span>
            </div>
            <p className="text-[9px] xl:text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5 hidden sm:block whitespace-nowrap">
              Network for Owners, Vendors &amp; Advisors
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links with Slugs */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 shrink-0" id="desktop-nav">
          <button
            onClick={() => handleLinkClick('owners')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'owners' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            For Owners
          </button>
          <button
            onClick={() => handleLinkClick('vendors')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'vendors' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            For Vendors
          </button>
          <button
            onClick={() => handleLinkClick('advisors')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'advisors' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            For Advisors
          </button>
          <button
            onClick={() => handleLinkClick('toolkit')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'toolkit' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            Toolkit
          </button>
          <button
            onClick={() => handleLinkClick('how-it-works')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'how-it-works' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => handleLinkClick('pricing')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'pricing' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            Pricing &amp; Plans
          </button>
          <button
            onClick={() => handleLinkClick('directory')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'directory' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => handleLinkClick('about')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlug === 'about' ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            About
          </button>
        </nav>

        {/* Action Buttons: Sign In / Profile status & Dedicated Admin Slug */}
        <div className="hidden md:flex items-center gap-2 xl:gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={() => handleLinkClick('admin')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeSlug === 'admin'
                      ? 'bg-purple-700 text-white border-purple-800 shadow-sm'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
              ) : (
                <button
                  onClick={() => handleLinkClick('dashboard')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeSlug === 'dashboard'
                      ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
                  currentUser.role === 'admin' ? 'bg-purple-700' : 'bg-blue-600'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-900 block truncate max-w-[120px] leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold block leading-tight ${
                    currentUser.role === 'admin' ? 'text-purple-700' : 'text-blue-700'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign out of NOVA"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                id="signin-header-btn"
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
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

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-fadeIn">
          {currentUser && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'admin' ? 'bg-purple-700' : 'bg-blue-600'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className={`text-[10px] uppercase font-semibold ${
                    currentUser.role === 'admin' ? 'text-purple-700' : 'text-blue-700'
                  }`}>{currentUser.role} Account</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleLinkClick('admin')}
                    className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200 cursor-pointer"
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
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
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
                    activeSlug === 'admin' ? 'bg-purple-100 text-purple-900' : 'bg-purple-50 text-purple-800'
                  }`}
                >
                  <Settings className="w-4 h-4 text-purple-700" />
                  <span>Admin Console Portal</span>
                </button>
              ) : (
                <button
                  onClick={() => handleLinkClick('dashboard')}
                  className={`px-3 py-2.5 text-left text-sm font-bold rounded-xl flex items-center gap-2 ${
                    activeSlug === 'dashboard' ? 'bg-blue-100 text-blue-900' : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-700" />
                  <span>Role Workspace Dashboard</span>
                </button>
              )
            )}
            <button
              onClick={() => handleLinkClick('owners')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'owners' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              For Owners
            </button>
            <button
              onClick={() => handleLinkClick('vendors')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'vendors' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              For Vendors
            </button>
            <button
              onClick={() => handleLinkClick('advisors')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'advisors' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              For Advisors
            </button>
            <button
              onClick={() => handleLinkClick('toolkit')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'toolkit' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Owners Toolkit
            </button>
            <button
              onClick={() => handleLinkClick('how-it-works')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'how-it-works' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => handleLinkClick('pricing')}
              className={`px-3 py-2 text-left text-sm font-bold rounded-md ${
                activeSlug === 'pricing' ? 'bg-blue-100 text-blue-800' : 'text-blue-700 hover:bg-slate-50'
              }`}
            >
              Pricing &amp; Plans
            </button>
            <button
              onClick={() => handleLinkClick('directory')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'directory' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => handleLinkClick('about')}
              className={`px-3 py-2 text-left text-sm font-semibold rounded-md ${
                activeSlug === 'about' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              About
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            {!currentUser && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('signin'); }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 text-center hover:bg-slate-50 cursor-pointer"
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
