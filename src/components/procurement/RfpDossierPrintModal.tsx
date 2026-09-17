import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Building2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  EyeOff, 
  FileText, 
  Mail, 
  Phone,
  Sparkles
} from 'lucide-react';
import { RFPItem } from '../../types';

interface RfpDossierPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfp: RFPItem;
}

export const RfpDossierPrintModal: React.FC<RfpDossierPrintModalProps> = ({
  isOpen,
  onClose,
  rfp
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:m-0 print:rounded-none">
        
        {/* Modal Toolbar (hidden during print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-black tracking-tight">Offline RFP Export &amp; Circulation Dossier</h3>
              <p className="text-[11px] text-slate-300">
                BRS RFP-FR-09 &amp; PUB-FR-05: Ready for WhatsApp, Email and offline bidding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 text-slate-800 space-y-6 print:p-6 print:overflow-visible">
          
          {/* Document Header with NOVA-H & Macula Healthcare Branding */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  NOVA<span className="text-blue-600">-H</span>
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 border-l border-slate-300">
                  Hospital Procurement Network
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                In Technical Association with Macula Healthcare Advisory
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                {rfp.rfpNumber}
              </span>
              <div className="text-[11px] text-slate-400 mt-1">
                Date: {rfp.publicationDate}
              </div>
            </div>
          </div>

          {/* Title & Classification */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {rfp.category} RFP
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-2 leading-tight">
              {rfp.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {rfp.isIdentityMasked ? rfp.maskedHospitalTitle : rfp.hospitalName}
                </span>
                {rfp.isIdentityMasked && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Protected Identity
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{rfp.locationCity}, {rfp.locationState}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Quote Deadline: <strong>{rfp.revisedClosingDate || rfp.quoteClosingDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary & Opportunity Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Project Overview &amp; Clinical Background
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {rfp.summary}
            </p>
          </div>

          {/* Section 2: Scope of Work */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              2. Scope of Work &amp; Turnkey Deliverables
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-1">
              {rfp.scopeOfWork.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>

          {/* Section 3: Technical Specifications Schedule */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              3. Structured Technical Specifications Schedule
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-1/4">Parameter</th>
                  <th className="p-2.5 w-1/2">Hospital Specification Required</th>
                  <th className="p-2.5 w-1/4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rfp.requirements.map((req) => (
                  <tr key={req.id}>
                    <td className="p-2.5 font-bold text-slate-900">{req.parameter}</td>
                    <td className="p-2.5 text-slate-700">{req.hospitalSpecification}</td>
                    <td className="p-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.isMandatory ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.isMandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Commercial & Submission Guidelines */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              4. Commercial Breakdown &amp; Quotation Submission Instructions
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p>
                Bidders are requested to submit formal quotations with clear separation of:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                <li>Machine Base Price, applicable GST %, Transit Freight, Uncrating and Rigging</li>
                <li>Turnkey site preparation, lead-shielding certification and AERB compliance</li>
                <li>Comprehensive Warranty period (minimum 2 years requested) and scan-second limits</li>
                <li>Comprehensive Maintenance Contract (CMC) annual pricing for Years 3 through 10</li>
              </ul>
              
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-semibold text-slate-600 gap-2">
                <span>
                  Online Submission Portal: <strong className="text-blue-700 font-mono">nova-h.network/rfp/{rfp.rfpNumber}</strong>
                </span>
                <span>
                  Offline Submission Desk: <strong className="text-slate-800">bids@nova-h.network</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            NOVA-H RFP Management System • Confidential &amp; Proprietary • Generated automatically for authorized circulation
          </div>

        </div>
      </div>
    </div>
  );
};
