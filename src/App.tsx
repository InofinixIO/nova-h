import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhatIsNova } from './components/WhatIsNova';
import { ThreeUserGroups } from './components/ThreeUserGroups';
import { HowNovaWorks } from './components/HowNovaWorks';
import { HospitalToolkit } from './components/HospitalToolkit';
import { DirectorySearch } from './components/DirectorySearch';
import { WhyJoinNova } from './components/WhyJoinNova';
import { FutureFeatures } from './components/FutureFeatures';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { PamphletSection } from './components/PamphletSection';
import { MembershipPricingSection } from './components/MembershipPricingSection';

// Modals
import { ToolkitModal } from './components/ToolkitModal';
import { RequirementModal } from './components/RequirementModal';
import { VendorDetailModal } from './components/VendorDetailModal';
import { AuthModal } from './components/AuthModal';
import { AiConsultantModal } from './components/AiConsultantModal';
import { CicdModal } from './components/CicdModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDirectoryModal } from './components/AdminDirectoryModal';

// Dedicated Admin Components
import { AdminLoginForm } from './components/AdminLoginForm';
import { AdminConsoleView } from './components/AdminConsoleView';

import { UserRole, DirectoryItem, ProjectRequirement, PaymentTransaction, AuthUser } from './types';
import { getStoredDirectory, saveStoredDirectory } from './utils/directoryStorage';
import { RouteSlug, getSlugFromPath, navigateToSlug } from './utils/routes';
import { CheckCircle2, ArrowLeft, ShieldCheck, Sparkles, Building2, HardHat, UserCheck } from 'lucide-react';

export default function App() {
  // Routing state based on URL slug
  const [currentSlug, setCurrentSlug] = useState<RouteSlug>(() => getSlugFromPath());

  // Listen to popstate for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentSlug(getSlugFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (slug: RouteSlug) => {
    navigateToSlug(slug);
    setCurrentSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Current logged in user (null = Guest / Anonymous preview)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('nova_h_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Dynamic directory listings state loaded from local storage / seed defaults
  const [directoryItems, setDirectoryItems] = useState<DirectoryItem[]>(() => {
    return getStoredDirectory();
  });

  // Modal states
  const [toolkitModalOpen, setToolkitModalOpen] = useState(false);
  const [toolkitStageIndex, setToolkitStageIndex] = useState(0);

  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<DirectoryItem | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authRole, setAuthRole] = useState<UserRole>('owner');

  const [adminDirectoryOpen, setAdminDirectoryOpen] = useState(false);

  const [aiConsultantOpen, setAiConsultantOpen] = useState(false);
  const [cicdModalOpen, setCicdModalOpen] = useState(false);
  const [autoDetectTrigger, setAutoDetectTrigger] = useState<number>(0);

  // Checkout Modal states for PayU and Razorpay
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutRole, setCheckoutRole] = useState<UserRole>('vendor');
  const [checkoutPlanDetails, setCheckoutPlanDetails] = useState<{
    planId: string;
    title: string;
    amount: number;
    billingBasis: string;
    metadata?: any;
  } | null>(null);

  // Success Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup', role: UserRole = 'owner') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('nova_h_current_user');
    } catch (e) {}
    showToast('You have signed out. Directory is now in limited preview mode.');
  };

  const handleOpenToolkit = (stageIndex: number = 0) => {
    setToolkitStageIndex(stageIndex);
    setToolkitModalOpen(true);
  };

  const handleStepAction = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        setRequirementModalOpen(true);
        break;
      case 2:
      case 3:
      case 4:
        handleNavigate('directory');
        break;
      case 5:
        handleNavigate('toolkit');
        break;
      default:
        break;
    }
  };

  const handleRequirementSubmitted = (req: ProjectRequirement) => {
    showToast(`Project requirement for "${req.hospitalName}" (${req.location}) has been submitted to the NOVA network.`);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('nova_h_current_user', JSON.stringify(user));
    } catch (e) {}
    
    if (user.role === 'admin') {
      showToast(`Welcome Administrator ${user.name}! Administrative controls unlocked.`);
      handleNavigate('admin');
    } else {
      showToast(`Welcome ${user.name}! Logged in as ${user.role.toUpperCase()}. Full directory details unlocked!`);
    }
  };

  const handleInitiatePayment = (
    role: UserRole,
    planDetails: {
      planId: string;
      title: string;
      amount: number;
      billingBasis: string;
      metadata?: any;
    }
  ) => {
    setCheckoutRole(role);
    setCheckoutPlanDetails(planDetails);
    setCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = (tx: PaymentTransaction) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, isSubscribed: true };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('nova_h_current_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
    showToast(`Payment of ₹${tx.amount.toLocaleString('en-IN')} confirmed via ${tx.gateway.toUpperCase()}! Membership is now active.`);
  };

  // Helper for rendering specific page content based on currentSlug
  const renderPageContent = () => {
    switch (currentSlug) {
      case 'admin':
        // DEDICATED ADMIN CONSOLE ROUTE (/admin)
        if (currentUser && currentUser.role === 'admin') {
          return (
            <AdminConsoleView
              directoryItems={directoryItems}
              onUpdateDirectory={(updated) => setDirectoryItems(updated)}
              onNotify={(msg) => showToast(msg)}
              currentUser={currentUser}
              onLogout={handleLogout}
              onBackToHome={() => handleNavigate('')}
            />
          );
        }
        return (
          <div className="py-16 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrative Console Portal
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Restricted System Entry
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                Sign in with verified administrator credentials to inspect live listings, upload CSV sheets, or manage network partners.
              </p>
            </div>
            <AdminLoginForm
              onSuccess={handleAuthSuccess}
              onCancel={() => handleNavigate('')}
            />
          </div>
        );

      case 'owners':
        return (
          <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl">
              <div className="max-w-3xl">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Hospital Promoters &amp; Trust Founders
                </span>
                <h1 className="text-3xl sm:text-4xl font-black mt-4 mb-3 tracking-tight">
                  Hospital Owners Command &amp; Planning Hub
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Build and commission 50 to 500-bed healthcare institutions with verified vendors, vetted clinical planners, and step-by-step 15-stage guidance.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleOpenAuth('signup', 'owner')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Register as Hospital Owner (₹1,000/yr)
                  </button>
                  <button
                    onClick={() => handleOpenToolkit(0)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Explore Complete 15-Stage Toolkit
                  </button>
                  <button
                    onClick={() => setRequirementModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Post Project Requirement (RFQ)
                  </button>
                </div>
              </div>
            </div>
            <ThreeUserGroups
              onSelectRole={(role) => handleOpenAuth('signup', role)}
              onPostRequirement={() => setRequirementModalOpen(true)}
            />
            <HospitalToolkit onOpenFullToolkit={handleOpenToolkit} />
          </div>
        );

      case 'vendors':
        return (
          <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl">
              <div className="max-w-3xl">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Medical Devices, MEP, Furniture &amp; IT
                </span>
                <h1 className="text-3xl sm:text-4xl font-black mt-4 mb-3 tracking-tight">
                  Healthcare Vendor &amp; Supplier Network
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Showcase biomedical equipment, modular OT systems, and hospital infrastructure directly to active promoters, medical directors, and healthcare procurement teams.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleOpenAuth('signup', 'vendor')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    List Your Products &amp; Services
                  </button>
                  <button
                    onClick={() => handleNavigate('pricing')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    View Vendor Pricing Tiers
                  </button>
                </div>
              </div>
            </div>
            <DirectorySearch
              directoryItems={directoryItems.filter(i => i.role === 'vendor')}
              onSelectVendor={(v) => setSelectedVendor(v)}
              onPostRequirement={() => setRequirementModalOpen(true)}
              onOpenPamphletQr={() => handleNavigate('pamphlet')}
              autoDetectTrigger={autoDetectTrigger}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenAdminDirectory={() => handleNavigate('admin')}
            />
          </div>
        );

      case 'advisors':
        return (
          <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-sky-950 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl">
              <div className="max-w-3xl">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-sky-500/30 text-sky-200 border border-sky-400/30">
                  Clinical Planners, NABH Consultants &amp; Architects
                </span>
                <h1 className="text-3xl sm:text-4xl font-black mt-4 mb-3 tracking-tight">
                  Hospital Advisors &amp; Specialist Directory
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Join Macula Healthcare's execution partner pool. Advise hospital trustees on DPR formulation, AERB radiological layouts, NABH accreditations, and commissioning milestones.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleOpenAuth('signup', 'advisor')}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Join as Healthcare Advisor (₹1,000/yr)
                  </button>
                </div>
              </div>
            </div>
            <DirectorySearch
              directoryItems={directoryItems.filter(i => i.role === 'advisor')}
              onSelectVendor={(v) => setSelectedVendor(v)}
              onPostRequirement={() => setRequirementModalOpen(true)}
              onOpenPamphletQr={() => handleNavigate('pamphlet')}
              autoDetectTrigger={autoDetectTrigger}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenAdminDirectory={() => handleNavigate('admin')}
            />
          </div>
        );

      case 'toolkit':
        return (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <HospitalToolkit onOpenFullToolkit={handleOpenToolkit} />
          </div>
        );

      case 'how-it-works':
        return (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <HowNovaWorks onStepAction={handleStepAction} />
            <WhatIsNova />
          </div>
        );

      case 'pricing':
        return (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-3xl mx-auto mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Transparent Indian Healthcare Pricing
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                NOVA-H Annual Membership Plans
              </h1>
              <p className="text-slate-600 text-sm mt-2">
                Order-value indexed tiers for vendors, flat ₹1,000 project access for promoters and specialist advisors. Complete integration with Razorpay and PayU.
              </p>
            </div>
            <MembershipPricingSection onSelectPlanForPayment={handleInitiatePayment} />
          </div>
        );

      case 'directory':
        return (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <DirectorySearch
              directoryItems={directoryItems}
              onSelectVendor={(v) => setSelectedVendor(v)}
              onPostRequirement={() => setRequirementModalOpen(true)}
              onOpenPamphletQr={() => handleNavigate('pamphlet')}
              autoDetectTrigger={autoDetectTrigger}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenAdminDirectory={() => handleNavigate('admin')}
            />
          </div>
        );

      case 'about':
        return (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <WhatIsNova />
            <WhyJoinNova onSignUpRole={(role) => handleOpenAuth('signup', role)} />
            <FutureFeatures onOpenAiConsultant={() => setAiConsultantOpen(true)} />
          </div>
        );

      case 'pamphlet':
        return (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <PamphletSection
              onSimulateScan={() => {
                setAutoDetectTrigger(Date.now());
                showToast('Simulating mobile pamphlet QR scan: Detecting location & filtering vendors only...');
                handleNavigate('directory');
              }}
            />
          </div>
        );

      default:
        // Full Home Page Layout
        return (
          <>
            {/* 1. HERO SECTION */}
            <HeroSection
              onExplore={() => handleNavigate('directory')}
              onSignUp={(role) => handleOpenAuth('signup', role || 'owner')}
              onSelectRole={(role) => handleOpenAuth('signup', role)}
            />

            {/* 2. WHAT IS NOVA? */}
            <WhatIsNova />

            {/* 3. THREE USER GROUPS */}
            <ThreeUserGroups
              onSelectRole={(role) => handleOpenAuth('signup', role)}
              onPostRequirement={() => setRequirementModalOpen(true)}
            />

            {/* 4. HOW NOVA WORKS */}
            <HowNovaWorks
              onStepAction={handleStepAction}
            />

            {/* 5. HOSPITAL OWNERS TOOLKIT */}
            <HospitalToolkit
              onOpenFullToolkit={handleOpenToolkit}
            />

            {/* 6. LOCATION-BASED SEARCH / DIRECTORY */}
            <DirectorySearch
              directoryItems={directoryItems}
              onSelectVendor={(v) => setSelectedVendor(v)}
              onPostRequirement={() => setRequirementModalOpen(true)}
              onOpenPamphletQr={() => handleNavigate('pamphlet')}
              autoDetectTrigger={autoDetectTrigger}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenAdminDirectory={() => handleNavigate('admin')}
            />

            {/* 6.5 PAMPHLET & QR SECTION */}
            <PamphletSection
              onSimulateScan={() => {
                setAutoDetectTrigger(Date.now());
                showToast('Simulating mobile pamphlet QR scan: Detecting location & filtering vendors only...');
                handleNavigate('directory');
              }}
            />

            {/* 6.7 NOVA-H MEMBERSHIP & PRICING MODEL WITH PAYU & RAZORPAY */}
            <MembershipPricingSection
              onSelectPlanForPayment={handleInitiatePayment}
            />

            {/* 7. WHY JOIN NOVA? */}
            <WhyJoinNova
              onSignUpRole={(role) => handleOpenAuth('signup', role)}
            />

            {/* 8. COMING TO NOVA / FUTURE FEATURES */}
            <FutureFeatures
              onOpenAiConsultant={() => setAiConsultantOpen(true)}
            />

            {/* 9. FINAL CTA SECTION */}
            <FinalCTA
              onCreateOwner={() => handleOpenAuth('signup', 'owner')}
              onJoinVendorAdvisor={() => handleOpenAuth('signup', 'vendor')}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-fadeIn max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sticky Header with Dynamic URL Slugs */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenCicd={() => setCicdModalOpen(true)}
        onOpenToolkit={() => handleOpenToolkit(0)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAdminDirectory={() => handleNavigate('admin')}
        activeSlug={currentSlug}
        onNavigate={handleNavigate}
      />

      {/* Main Page Layout matching Route Slug */}
      <main className="flex-1 pt-16 sm:pt-20">
        {renderPageContent()}
      </main>

      {/* FOOTER */}
      <Footer
        onOpenAuth={handleOpenAuth}
        onOpenToolkit={() => handleOpenToolkit(0)}
        onOpenCicd={() => setCicdModalOpen(true)}
        onOpenPamphletQr={() => handleNavigate('pamphlet')}
        onNavigate={handleNavigate}
      />

      {/* MODALS */}
      <ToolkitModal
        isOpen={toolkitModalOpen}
        onClose={() => setToolkitModalOpen(false)}
        initialStageIndex={toolkitStageIndex}
      />

      <RequirementModal
        isOpen={requirementModalOpen}
        onClose={() => setRequirementModalOpen(false)}
        onSubmitSuccess={handleRequirementSubmitted}
      />

      <VendorDetailModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onPostRequirement={() => {
          setSelectedVendor(null);
          setRequirementModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
      />

      <AuthModal
        key={`auth-${authModalOpen}-${authMode}-${authRole}`}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
        onSuccess={handleAuthSuccess}
        onProceedToPayment={handleInitiatePayment}
      />

      {/* Legacy Admin Directory Modal retained as secondary fallback */}
      <AdminDirectoryModal
        isOpen={adminDirectoryOpen}
        onClose={() => setAdminDirectoryOpen(false)}
        directoryItems={directoryItems}
        onUpdateDirectory={(updated) => setDirectoryItems(updated)}
        onNotify={(msg) => showToast(msg)}
      />

      <AiConsultantModal
        isOpen={aiConsultantOpen}
        onClose={() => setAiConsultantOpen(false)}
        onExploreDirectory={() => {
          setAiConsultantOpen(false);
          handleNavigate('directory');
        }}
      />

      <CicdModal
        isOpen={cicdModalOpen}
        onClose={() => setCicdModalOpen(false)}
      />

      {/* RAZORPAY & PAYU CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        role={checkoutRole}
        planDetails={checkoutPlanDetails}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
