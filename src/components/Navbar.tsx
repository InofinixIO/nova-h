import React, { useState, useEffect } from 'react';
import { Menu, X, GitBranch, ShieldCheck, ChevronRight, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'signup', role?: UserRole) => void;
  onOpenCicd: () => void;
  onOpenToolkit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenCicd, onOpenToolkit }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
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
        {/* Brand Logo matching wireframe */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0 select-none"
          id="nova-brand-logo"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-xs group-hover:shadow-md transition-all shrink-0">
            N
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">NOVA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </div>
            <p className="text-[9px] xl:text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5 hidden sm:block whitespace-nowrap">
              Network for Owners, Vendors & Advisors
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 shrink-0" id="desktop-nav">
          <button
            onClick={() => scrollToSection('three-groups')}
            className="text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            For Owners
          </button>
          <button
            onClick={() => scrollToSection('three-groups')}
            className="text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            For Vendors
          </button>
          <button
            onClick={() => scrollToSection('three-groups')}
            className="text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            For Advisors
          </button>
          <button
            onClick={() => scrollToSection('toolkit-section')}
            className="text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Toolkit
          </button>
          <button
            onClick={() => scrollToSection('how-it-works-section')}
            className="text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('directory-section')}
            className="text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Directory
          </button>
          <button
            onClick={() => scrollToSection('what-is-nova')}
            className="text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            About
          </button>
        </nav>

        {/* Action Buttons: Sign In and Sign Up */}
        <div className="hidden md:flex items-center gap-2 xl:gap-3 shrink-0">
          <button
            id="signin-header-btn"
            onClick={() => onOpenAuth('signin')}
            className="px-3.5 py-1.5 text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Sign In
          </button>

          <button
            id="signup-header-btn"
            onClick={() => onOpenAuth('signup')}
            className="px-4 py-1.5 text-xs xl:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Sign Up</span>
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenCicd}
            className="p-2 text-slate-600 hover:text-blue-600"
            title="CI/CD Status"
          >
            <GitBranch className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => scrollToSection('three-groups')}
              className="px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              For Owners
            </button>
            <button
              onClick={() => scrollToSection('three-groups')}
              className="px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              For Vendors
            </button>
            <button
              onClick={() => scrollToSection('three-groups')}
              className="px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              For Advisors
            </button>
            <button
              onClick={() => scrollToSection('toolkit-section')}
              className="px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Owners Toolkit
            </button>
            <button
              onClick={() => scrollToSection('how-it-works-section')}
              className="px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('directory-section')}
              className="px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Directory
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('signin'); }}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 text-center hover:bg-slate-50 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold text-white bg-blue-600 text-center hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
