import React, { useState } from 'react';
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

import { UserRole, DirectoryItem, ProjectRequirement, PaymentTransaction, AuthUser } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Current logged in user (null = Guest / Anonymous preview)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('nova_h_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Modal states
  const [toolkitModalOpen, setToolkitModalOpen] = useState(false);
  const [toolkitStageIndex, setToolkitStageIndex] = useState(0);

  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<DirectoryItem | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authRole, setAuthRole] = useState<UserRole>('owner');

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
    }, 4000);
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
        // Tell us what you need
        setRequirementModalOpen(true);
        break;
      case 2:
      case 3:
        // Discover / Understand
        document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 4:
        // Connect
        document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 5:
        // Move project forward (Toolkit)
        handleOpenToolkit(0);
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
    showToast(`Welcome ${user.name}! Logged in as ${user.role.toUpperCase()}. Full directory details unlocked!`);
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

  const scrollToDirectory = () => {
    document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sticky Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenCicd={() => setCicdModalOpen(true)}
        onOpenToolkit={() => handleOpenToolkit(0)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Layout matching Wireframe Sections 1 to 10 */}
      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <HeroSection
          onExplore={scrollToDirectory}
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
          onSelectVendor={(v) => setSelectedVendor(v)}
          onPostRequirement={() => setRequirementModalOpen(true)}
          onOpenPamphletQr={() => {
            document.getElementById('pamphlet-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          autoDetectTrigger={autoDetectTrigger}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
        />

        {/* 6.5 PAMPHLET & QR SECTION */}
        <PamphletSection
          onSimulateScan={() => {
            setAutoDetectTrigger(Date.now());
            showToast('Simulating mobile pamphlet QR scan: Detecting location & filtering vendors only...');
            scrollToDirectory();
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
      </main>

      {/* 10. FOOTER */}
      <Footer
        onOpenAuth={handleOpenAuth}
        onOpenToolkit={() => handleOpenToolkit(0)}
        onOpenCicd={() => setCicdModalOpen(true)}
        onOpenPamphletQr={() => {
          document.getElementById('pamphlet-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
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

      <AiConsultantModal
        isOpen={aiConsultantOpen}
        onClose={() => setAiConsultantOpen(false)}
        onExploreDirectory={() => {
          setAiConsultantOpen(false);
          scrollToDirectory();
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
