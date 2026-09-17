import React, { useState } from 'react';
import { 
  RFPItem, 
  RFPQuote, 
  QuoteCommercials, 
  QuoteTechnicalSpec 
} from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  TrendingDown,
  Clock,
  FileSpreadsheet,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';

interface ComparisonMatrixViewProps {
  rfp: RFPItem;
  quotes: RFPQuote[];
  onOpenUploadModal?: () => void;
  onOpenClarification?: (quote: RFPQuote) => void;
  onSelectWinningQuote?: (quote: RFPQuote) => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  rfp,
  quotes,
  onOpenUploadModal,
  onOpenClarification,
  onSelectWinningQuote
}) => {
  const [activeTab, setActiveTab] = useState<'commercial' | 'technical' | 'lifecycle_scoring'>('commercial');
  const [selectedQuoteForAward, setSelectedQuoteForAward] = useState<string | null>(null);

  if (quotes.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-800">No Quotations Available for Comparison</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Quotations can be submitted online by registered vendors or uploaded directly by the hospital from WhatsApp or Email.
        </p>
        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Upload First External Quote
          </button>
        )}
      </div>
    );
  }

  // Calculate Best-in-Class Metrics
  let lowestLanded = Infinity;
  let lowestLandedQuoteId = '';
  let maxWarranty = 0;
  let maxWarrantyQuoteId = '';
  let minDelivery = Infinity;
  let minDeliveryQuoteId = '';

  quotes.forEach(q => {
    const landed = q.commercials.netLandedCost || q.commercials.basePrice;
    if (landed < lowestLanded) {
      lowestLanded = landed;
      lowestLandedQuoteId = q.id;
    }
    if ((q.commercials.warrantyYears || 0) > maxWarranty) {
      maxWarranty = q.commercials.warrantyYears || 0;
      maxWarrantyQuoteId = q.id;
    }
    if ((q.commercials.deliveryWeeks || Infinity) < minDelivery) {
      minDelivery = q.commercials.deliveryWeeks || Infinity;
      minDeliveryQuoteId = q.id;
    }
  });

  const handleExportCsv = () => {
    const headers = ['Parameter', ...quotes.map(q => `${q.vendorName} (${q.isExternal ? 'Offline Upload' : 'Online'})`)];
    const rows: string[][] = [
      ['Base Price (INR)', ...quotes.map(q => q.commercials.basePrice.toString())],
      ['GST Rate (%)', ...quotes.map(q => `${q.commercials.gstRatePercent}%`)],
      ['Net Landed Cost (INR)', ...quotes.map(q => (q.commercials.netLandedCost || 0).toString())],
      ['Warranty (Years)', ...quotes.map(q => `${q.commercials.warrantyYears || 0} Years`)],
      ['CMC Annual Rate (%)', ...quotes.map(q => `${q.commercials.cmcAnnualPercent || 0}%`)],
      ['Delivery Lead Time', ...quotes.map(q => `${q.commercials.deliveryWeeks || '-'} Weeks`)],
      ['Payment Terms', ...quotes.map(q => `"${q.commercials.paymentTerms || '-'}"`)]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${rfp.rfpNumber}_Commercial_Technical_Comparison.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      
      {/* Header with Navigation and Export */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900">
              Multi-Vendor Comparison Matrix
            </h3>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[11px] rounded-full">
              {quotes.length} Competing Offers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side normalized commercial and technical analysis (BRS Section 8: CMP-FR-01 to 06)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-Tabs */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs">
            <button
              onClick={() => setActiveTab('commercial')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'commercial' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Commercial
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'technical' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Technical Specs
            </button>
            <button
              onClick={() => setActiveTab('lifecycle_scoring')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'lifecycle_scoring' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scoring &amp; Summary
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            title="Download Comparison as CSV / Excel"
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Normalization & Scope Warning (CMP-FR-04) */}
      <div className="px-5 py-2.5 bg-amber-50/80 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>BRS Normalization Notice:</strong> Values compare total landed cost (Base + GST + Transit + Installation + Auxiliaries). Single vs Dual-head injector discrepancy in Siemens quote is flagged in clarification thread.
        </span>
      </div>

      {/* COMPARISON TABLES */}
      <div className="overflow-x-auto">
        
        {/* TAB 1: COMMERCIAL BREAKDOWN */}
        {activeTab === 'commercial' && (
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600">
                <th className="p-3.5 font-black w-1/4">Commercial Parameter</th>
                {quotes.map((q) => (
                  <th key={q.id} className="p-3.5 font-black text-slate-900 border-l border-slate-200">
                    <div className="flex flex-col">
                      <span className="text-sm font-black truncate">{q.vendorName}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          q.isExternal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {q.isExternal ? `Uploaded (${q.externalSource || 'offline'})` : 'NOVA-H Online'}
                        </span>
                        {q.id === lowestLandedQuoteId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Lowest Landed
                          </span>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 text-slate-700">
              
              {/* Landed Cost (Primary L1 Indicator) */}
              <tr className="bg-blue-50/50 font-bold">
                <td className="p-3.5 text-slate-900">
                  <div className="font-black text-xs flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                    <span>Net Landed Acquisition Cost</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">All-inclusive landed to site</span>
                </td>
                {quotes.map((q) => {
                  const isLowest = q.id === lowestLandedQuoteId;
                  const landed = q.commercials.netLandedCost || q.commercials.basePrice;
                  return (
                    <td key={q.id} className={`p-3.5 border-l border-slate-200 ${isLowest ? 'bg-emerald-50/70' : ''}`}>
                      <div className="text-base font-black text-slate-900 font-mono">
                        ₹{(landed / 10000000).toFixed(2)} Cr
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (₹{landed.toLocaleString('en-IN')})
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Base Price */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">Machine Base Price</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 font-mono">
                    ₹{(q.commercials.basePrice / 100000).toFixed(2)} Lakhs
                  </td>
                ))}
              </tr>

              {/* GST */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">GST / Tax Applicable</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 font-mono">
                    {q.commercials.gstRatePercent}% (₹{(q.commercials.gstAmount / 100000).toFixed(2)} L)
                  </td>
                ))}
              </tr>

              {/* Freight & Rigging */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">Freight, Insurance &amp; Safe Rigging</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 font-mono">
                    ₹{(q.commercials.freightAmount / 1000).toFixed(0)}k
                  </td>
                ))}
              </tr>

              {/* Installation */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">Installation &amp; Commissioning</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 font-mono">
                    ₹{(q.commercials.installationAmount / 1000).toFixed(0)}k
                  </td>
                ))}
              </tr>

              {/* Accessories & Auxiliaries */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">
                  <span>Accessories / Auxiliaries Included</span>
                  <span className="text-[10px] text-slate-400 block font-normal">(Online UPS, Injector, Lead Shielding)</span>
                </td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 font-mono">
                    ₹{(q.commercials.accessoriesAmount / 100000).toFixed(2)} L
                  </td>
                ))}
              </tr>

              {/* Warranty Period */}
              <tr className="bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-900">
                  Comprehensive Warranty
                </td>
                {quotes.map((q) => {
                  const isBest = q.id === maxWarrantyQuoteId;
                  return (
                    <td key={q.id} className={`p-3.5 border-l border-slate-200 ${isBest ? 'bg-blue-50/70 font-black text-blue-900' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{q.commercials.warrantyYears} Years</span>
                        {isBest && (
                          <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-bold">
                            Longest
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Post-Warranty CMC Rate */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">
                  Annual Post-Warranty CMC Rate
                </td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 font-mono">
                    {q.commercials.cmcAnnualPercent}% (approx. ₹{(q.commercials.cmcAnnualAmount / 100000).toFixed(2)} L/yr)
                  </td>
                ))}
              </tr>

              {/* Delivery Lead Time */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">Delivery Lead Time</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold">{q.commercials.deliveryWeeks} Weeks</span>
                      {q.id === minDeliveryQuoteId && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                          Fastest
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Payment Terms */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">Payment Milestones</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 text-[11px] leading-relaxed">
                    {q.commercials.paymentTerms}
                  </td>
                ))}
              </tr>

              {/* Uptime SLA */}
              <tr>
                <td className="p-3.5 font-semibold text-slate-800">Uptime Commitment SLA</td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 font-bold text-slate-800">
                    {q.commercials.uptimeCommitmentPercent || 98}% Uptime
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        )}

        {/* TAB 2: TECHNICAL SPECIFICATIONS (CMP-FR-03) */}
        {activeTab === 'technical' && (
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600">
                <th className="p-3.5 font-black w-1/3">RFP Hospital Specification</th>
                {quotes.map((q) => (
                  <th key={q.id} className="p-3.5 font-black text-slate-900 border-l border-slate-200">
                    <div className="text-sm font-black truncate">{q.vendorName}</div>
                    <span className="text-[10px] text-slate-500 font-normal">Offered Specification</span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 text-slate-700">
              {rfp.requirements.map((req) => (
                <tr key={req.id}>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{req.parameter}</div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{req.hospitalSpecification}</p>
                    <span className={`inline-block mt-1 text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                      req.isMandatory ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.isMandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </td>

                  {quotes.map((q) => {
                    const match = q.technicalSpecs.find(s => s.reqId === req.id || s.parameter === req.parameter);
                    const compliance = match?.compliance || 'compliant';
                    return (
                      <td key={q.id} className="p-3.5 border-l border-slate-200 align-top">
                        <div className="flex items-center gap-1.5 mb-1">
                          {compliance === 'compliant' ? (
                            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Compliant</span>
                            </span>
                          ) : compliance === 'deviation' || compliance === 'partial' ? (
                            <span className="flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Deviation</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              <span>Excluded</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                          {match?.offeredValue || 'Specification offered as per OEM standard catalog'}
                        </p>
                        {match?.notes && (
                          <p className="text-[10px] text-slate-500 italic mt-1">
                            Note: {match.notes}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Deviations & Exclusions */}
              <tr className="bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">
                  Deviations, Exclusions &amp; Customer Scope
                </td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200 align-top">
                    {q.deviationsAndExclusions && q.deviationsAndExclusions.length > 0 ? (
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                        {q.deviationsAndExclusions.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">None stated in bid document</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Statutory Certifications */}
              <tr>
                <td className="p-3.5 font-bold text-slate-900">
                  Statutory &amp; Quality Certifications
                </td>
                {quotes.map((q) => (
                  <td key={q.id} className="p-3.5 border-l border-slate-200">
                    <div className="flex flex-wrap gap-1">
                      {q.statutoryCertifications?.map((c, i) => (
                        <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        {/* TAB 3: LIFECYCLE & SUMMARY SCORING (CMP-FR-05) */}
        {activeTab === 'lifecycle_scoring' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quotes.map((q) => {
                const isL1 = q.id === lowestLandedQuoteId;
                const isMaxWarr = q.id === maxWarrantyQuoteId;
                const isMinDeliv = q.id === minDeliveryQuoteId;
                const landed = q.commercials.netLandedCost || q.commercials.basePrice;

                return (
                  <div 
                    key={q.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      selectedQuoteForAward === q.id 
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500">
                          {q.isExternal ? 'Offline Ingested' : 'Platform Online'}
                        </span>
                        {isL1 && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                            L1 Price
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-slate-900">{q.vendorName}</h4>
                      <div className="text-2xl font-black text-blue-700 font-mono mt-2">
                        ₹{(landed / 10000000).toFixed(2)} Cr
                      </div>
                      <p className="text-[11px] text-slate-500">Landed Total (Base + Taxes + Logistics)</p>

                      <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Warranty:</span>
                          <span className="font-bold text-slate-900">{q.commercials.warrantyYears} Years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Post-Warranty CMC:</span>
                          <span className="font-bold text-slate-900">{q.commercials.cmcAnnualPercent}% / yr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Delivery Lead Time:</span>
                          <span className="font-bold text-slate-900">{q.commercials.deliveryWeeks} Weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Uptime Commitment:</span>
                          <span className="font-bold text-emerald-700">{q.commercials.uptimeCommitmentPercent || 98}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col gap-2">
                      {onOpenClarification && (
                        <button
                          onClick={() => onOpenClarification(q)}
                          className="w-full py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          View Clarification Thread
                        </button>
                      )}

                      {onSelectWinningQuote && (
                        <button
                          onClick={() => onSelectWinningQuote(q)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Select for Shortlist / Award</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
