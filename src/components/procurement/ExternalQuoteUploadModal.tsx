import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Check, 
  MessageSquare, 
  Mail, 
  FileSpreadsheet, 
  ShieldAlert,
  ChevronRight,
  Eye
} from 'lucide-react';
import { RFPItem, RFPQuote, QuoteCommercials, QuoteTechnicalSpec } from '../../types';

interface ExternalQuoteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfp: RFPItem;
  onSaveQuote: (quote: RFPQuote) => void;
  currentQuotes: RFPQuote[];
}

export const ExternalQuoteUploadModal: React.FC<ExternalQuoteUploadModalProps> = ({
  isOpen,
  onClose,
  rfp,
  onSaveQuote,
  currentQuotes
}) => {
  const [sourceChannel, setSourceChannel] = useState<'whatsapp' | 'email' | 'hard_copy' | 'other'>('whatsapp');
  const [vendorName, setVendorName] = useState('Canon Medical Systems India');
  const [vendorContact, setVendorContact] = useState('sales.medical@in.canon');
  const [fileName, setFileName] = useState<string>('Canon_Aquilion_Lighting_32_Commercial_Quote.pdf');
  const [fileAttached, setFileAttached] = useState(true);

  // Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedDone, setExtractedDone] = useState(true); // pre-populated with realistic AI extraction

  // Extracted Fields for Human Verification Gate
  const [basePrice, setBasePrice] = useState<number>(13800000);
  const [gstPercent, setGstPercent] = useState<number>(12);
  const [freight, setFreight] = useState<number>(300000);
  const [installation, setInstallation] = useState<number>(200000);
  const [sitePrep, setSitePrep] = useState<number>(180000);
  const [accessories, setAccessories] = useState<number>(450000);
  const [warrantyYears, setWarrantyYears] = useState<number>(2);
  const [cmcPercent, setCmcPercent] = useState<number>(5.8);
  const [deliveryWeeks, setDeliveryWeeks] = useState<number>(7);
  const [paymentTerms, setPaymentTerms] = useState<string>('20% advance, 70% upon delivery dispatch, 10% on handover');

  // Warnings / Discrepancies detected by AI
  const [flaggedMissingFields, setFlaggedMissingFields] = useState<string[]>([
    'Quotation document did not explicitly specify X-ray tube warranty limit',
    'Dual-head injector is quoted separately as an optional extra item'
  ]);
  const [humanVerified, setHumanVerified] = useState<boolean>(false);

  if (!isOpen) return null;

  // Landed calculation
  const gstAmount = Math.round((basePrice * gstPercent) / 100);
  const netLandedCost = basePrice + gstAmount + freight + installation + sitePrep + accessories;

  // Duplicate vendor check (EXT-FR-08)
  const isPotentialDuplicate = currentQuotes.some(
    q => q.vendorName.toLowerCase().includes(vendorName.toLowerCase()) || 
         vendorName.toLowerCase().includes(q.vendorName.toLowerCase())
  );

  const handleSimulateExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setExtractedDone(true);
      setHumanVerified(false);
    }, 900);
  };

  const handleConfirmAndInclude = () => {
    if (!humanVerified) {
      alert('Please complete the Human Verification Gate checkbox to verify extracted figures before comparison inclusion.');
      return;
    }

    const technicalSpecs: QuoteTechnicalSpec[] = rfp.requirements.map((req) => ({
      reqId: req.id,
      parameter: req.parameter,
      offeredValue: `Canon Aquilion equivalent matching ${req.hospitalSpecification}`,
      compliance: 'compliant',
      notes: 'Verified from uploaded technical datasheet pages 4-6'
    }));

    const newQuote: RFPQuote = {
      id: `quote-${Date.now()}`,
      rfpId: rfp.id,
      vendorId: `v-${vendorName.toLowerCase().replace(/\s+/g, '-')}`,
      vendorName,
      vendorCompany: `${vendorName} Corporation`,
      contactEmail: vendorContact,
      isExternal: true,
      externalSource: sourceChannel,
      officialDocumentName: fileName,
      submissionDate: new Date().toISOString(),
      quoteValidityDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      version: 1,
      status: 'verified',
      commercials: {
        basePrice,
        gstRatePercent: gstPercent,
        gstAmount,
        freightAmount: freight,
        installationAmount: installation,
        sitePrepAmount: sitePrep,
        accessoriesAmount: accessories,
        netLandedCost,
        paymentTerms,
        deliveryWeeks,
        warrantyYears,
        cmcAnnualPercent: cmcPercent,
        cmcAnnualAmount: Math.round((basePrice * cmcPercent) / 100),
        trainingIncluded: true
      },
      technicalSpecs,
      deviationsAndExclusions: [
        'Civil works, room lead lining to be done by customer as per AERB survey.'
      ],
      statutoryCertifications: ['AERB Approved', 'CE Certified', 'ISO 13485'],
      aiExtraction: {
        isExtracted: true,
        confidenceScore: 92,
        humanVerified: true,
        verifiedBy: 'Hospital Procurement Lead',
        verifiedAt: new Date().toISOString(),
        missingRequiredFields: flaggedMissingFields,
        flaggedDiscrepancies: flaggedMissingFields,
        rawSnippets: {
          baseQuote: `INR ${(basePrice / 100000).toFixed(2)} Lakhs + GST 12%`,
          delivery: `${deliveryWeeks} Weeks from firm PO`,
          warranty: `${warrantyYears} Years Manufacturer Warranty`
        }
      }
    };

    onSaveQuote(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                Upload External Quote &amp; AI Data Extraction
              </h2>
              <p className="text-[11px] text-slate-300">
                BRS Stage 06 &amp; 07: Ingest offline PDF / WhatsApp / Email quotes into the unified comparison matrix
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">

          {/* Section 1: Source Channel & Vendor Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              1. Source Channel &amp; Vendor Identity
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare },
                { key: 'email' as const, label: 'Direct Email', icon: Mail },
                { key: 'hard_copy' as const, label: 'Paper / Scan', icon: FileText },
                { key: 'other' as const, label: 'Excel / Other', icon: FileSpreadsheet }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSourceChannel(s.key)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      sourceChannel === s.key
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor / OEM Name *</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor Contact (Email / Phone)</label>
                <input
                  type="text"
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            {isPotentialDuplicate && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Duplicate check: A quote from "{vendorName}" already exists for this RFP. Submitting will record this as Version 2.</span>
              </div>
            )}
          </div>

          {/* Section 2: Upload File & Trigger Extraction */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              2. Upload Quotation Document (PDF / Excel / Image)
            </h3>

            <div className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50/60 flex flex-col items-center justify-center text-center transition-colors">
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <div className="font-bold text-slate-800 text-xs">{fileName}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Attached via {sourceChannel.toUpperCase()} • 3.4 MB • Official OEM Letterhead
              </p>

              <button
                type="button"
                onClick={handleSimulateExtraction}
                disabled={isExtracting}
                className="mt-3 px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExtracting ? 'AI Extracting Commercial Fields...' : 'Re-Run AI Document Extraction'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Human Verification Gate (EXT-FR-04) */}
          {extractedDone && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>3. Human Verification Gate (AI Extracted Data)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verify and correct extracted values. AI confidence score: <strong>92%</strong>
                  </p>
                </div>

                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-full border border-purple-200">
                  AI Model: Gemini Flash OCR
                </span>
              </div>

              {/* Detected Omissions / Warnings */}
              {flaggedMissingFields.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>AI Flags &amp; Missing Fields Detected (Requires Verification):</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-800 text-[11px] space-y-1 pl-1">
                    {flaggedMissingFields.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Editable Extracted Commercials */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block">Extracted Commercial Parameters</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Base Equipment Price (₹)</label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GST Rate (%)</label>
                    <input
                      type="number"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Freight &amp; Transit (₹)</label>
                    <input
                      type="number"
                      value={freight}
                      onChange={(e) => setFreight(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Installation &amp; Commissioning (₹)</label>
                    <input
                      type="number"
                      value={installation}
                      onChange={(e) => setInstallation(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Comprehensive Warranty</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={warrantyYears}
                        onChange={(e) => setWarrantyYears(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                      <span className="text-slate-500 font-semibold text-xs">Years</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Annual CMC %</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={cmcPercent}
                        onChange={(e) => setCmcPercent(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                      <span className="text-slate-500 font-semibold text-xs">% / Yr</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Landed Result */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Calculated Net Landed Cost:</span>
                  <span className="text-base font-black text-emerald-700">
                    ₹{netLandedCost.toLocaleString('en-IN')} (approx. ₹{(netLandedCost / 10000000).toFixed(2)} Cr)
                  </span>
                </div>
              </div>

              {/* Human Verification Gate Checkbox */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="human-verify-gate"
                  checked={humanVerified}
                  onChange={(e) => setHumanVerified(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="human-verify-gate" className="text-xs text-slate-800 cursor-pointer leading-snug">
                  <strong className="block text-blue-950 font-black">
                    Human Verification Gate (Mandatory per BRS Section 7)
                  </strong>
                  I confirm that I have reviewed the candidate values extracted by AI against the attached quotation PDF and verified commercial accuracy.
                </label>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmAndInclude}
              disabled={!humanVerified}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black cursor-pointer shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Verify &amp; Add to Comparison Matrix</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
