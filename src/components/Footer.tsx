import React from 'react';
import { Linkedin, Twitter, Youtube, ExternalLink, GitBranch, QrCode } from 'lucide-react';

interface FooterProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenToolkit: () => void;
  onOpenCicd: () => void;
  onOpenPamphletQr?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onOpenToolkit, onOpenCicd, onOpenPamphletQr }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="nova-footer" className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links & Branding matching wireframe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xl tracking-wider shadow-sm">
                N
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white">NOVA</span>
                <p className="text-xs font-medium text-slate-400">
                  Network for Owners, Vendors & Advisors
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Connecting hospital owners, equipment suppliers, and healthcare advisors to plan better, connect faster, and build stronger hospitals.
            </p>

            <div className="pt-2">
              <a
                href="https://www.nova-h.in"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>www.nova-h.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Version control & CI/CD status button in footer */}
            <div className="pt-2">
              <button
                onClick={onOpenCicd}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 cursor-pointer transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                <span>Automated CI/CD Pipeline</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </button>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-slate-200 uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => scrollTo('three-groups')} className="hover:text-white transition-colors cursor-pointer">
                  For Owners
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('three-groups')} className="hover:text-white transition-colors cursor-pointer">
                  For Vendors
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('three-groups')} className="hover:text-white transition-colors cursor-pointer">
                  For Advisors
                </button>
              </li>
              <li>
                <button onClick={onOpenToolkit} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <span>Hospital Owners Toolkit</span>
                  <span className="text-[10px] text-blue-400 font-mono">(15 Stages)</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('how-it-works-section')} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('what-is-nova')} className="hover:text-white transition-colors cursor-pointer">
                  About NOVA
                </button>
              </li>
              {onOpenPamphletQr && (
                <li>
                  <button 
                    onClick={onOpenPamphletQr} 
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-blue-400 font-semibold"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>Printable Pamphlet & QR Code</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Support & Legal */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-slate-200 uppercase mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); alert("Contact: support@nova-h.in | +91 22 4982 1100"); }} className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("NOVA Privacy Policy: We respect healthcare data privacy and do not sell promoter contact information."); }} className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert("NOVA Terms of Use: Community guidelines for hospital promoters, verified vendors, and consultants."); }} className="hover:text-white transition-colors">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#disclaimer" onClick={(e) => { e.preventDefault(); scrollTo('disclaimer-box'); }} className="hover:text-white transition-colors">
                  Disclaimer
                </a>
              </li>
              <li>
                <a href="#faqs" onClick={(e) => { e.preventDefault(); scrollTo('what-is-nova'); }} className="hover:text-white transition-colors">
                  Platform FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Stay Connected */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-slate-200 uppercase mb-4">
              Stay Connected
            </h4>
            <div className="flex items-center gap-3 mb-6">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Healthcare Ecosystem Bulletin</p>
              <p className="text-slate-400">Quarterly updates on hospital capex, NABH norms, and technology trends.</p>
            </div>
          </div>

        </div>

        {/* Disclaimer Box from wireframe & OCR */}
        <div id="disclaimer-box" className="py-6 border-b border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
          <p>
            <strong className="text-slate-300">Disclaimer:</strong> Listings are not endorsements. NOVA does not guarantee or take responsibility for the products, services, or claims made by listed businesses.
          </p>
          <p className="text-slate-500">
            NOVA is a professional networking and resource platform. Listings on the platform should not be interpreted as an endorsement, certification, or guarantee of any listed professional, organisation, product, or service. Hospital promoters are advised to perform independent technical and financial due diligence.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2024 NOVA. All rights reserved. <span className="text-slate-400">www.nova-h.in</span></p>
          <p>Plan Better. Connect Faster. Build Stronger.</p>
        </div>

      </div>
    </footer>
  );
};
