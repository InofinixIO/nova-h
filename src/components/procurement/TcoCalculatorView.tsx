import React, { useState } from 'react';
import { RFPItem, RFPQuote, RFPTCOCalculation } from '../../types';
import { calculateTCO } from '../../utils/procurementStorage';
import { 
  Calculator, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  ShieldCheck, 
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface TcoCalculatorViewProps {
  rfp: RFPItem;
  quotes: RFPQuote[];
}

export const TcoCalculatorView: React.FC<TcoCalculatorViewProps> = ({
  rfp,
  quotes
}) => {
  const [periodYears, setPeriodYears] = useState<5 | 10>(5);

  if (quotes.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 text-xs">No quotation data available to compute Total Cost of Ownership.</p>
      </div>
    );
  }

  const tcoCalculations = quotes.map(q => calculateTCO(q, periodYears));

  // Find lowest TCO
  let lowestTco = Infinity;
  let lowestTcoVendor = '';
  tcoCalculations.forEach(calc => {
    if (calc.totalLifecycleCost < lowestTco) {
      lowestTco = calc.totalLifecycleCost;
      lowestTcoVendor = calc.vendorName;
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900">
              Total Cost of Ownership (TCO) Lifecycle Simulator
            </h3>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-bold text-[11px] rounded-full">
              BRS Section 9: Capex + 5/10-Yr Opex
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates initial machine capital cost vs maintenance contracts, high-value replacement parts and consumables.
          </p>
        </div>

        {/* Time horizon toggle (5 vs 10 Years) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Horizon:</span>
          <div className="flex rounded-xl bg-slate-200 p-1 text-xs">
            <button
              onClick={() => setPeriodYears(5)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                periodYears === 5 ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5-Year Model
            </button>
            <button
              onClick={() => setPeriodYears(10)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                periodYears === 10 ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10-Year Model
            </button>
          </div>
        </div>
      </div>

      {/* No False Precision Banner (TCO-FR-03) */}
      <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-black">No False Precision Notice (TCO-FR-03):</strong>
          <span>
            {' '}Where critical lifecycle parameters (such as tube replacement or uncommitted CMC inflation) are unstated in vendor documents, they are flagged below. Never assume unquoted operating expenses are zero.
          </span>
        </div>
      </div>

      {/* TCO Breakdown Cards */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {tcoCalculations.map((calc) => {
          const isLowest = calc.totalLifecycleCost === lowestTco;
          const capexPercent = Math.round((calc.acquisitionLanded / calc.totalLifecycleCost) * 100);
          const opexPercent = 100 - capexPercent;

          return (
            <div
              key={calc.quoteId}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                isLowest
                  ? 'border-purple-500 bg-purple-50/20 ring-2 ring-purple-500/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">{periodYears}-Year Lifecycle</span>
                  {isLowest && (
                    <span className="text-[10px] font-black bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-300">
                      Lowest Total TCO
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-slate-900 truncate">{calc.vendorName}</h4>
                
                {/* Total TCO Big Metric */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-500 block font-semibold">Total Lifecycle Cost:</span>
                  <div className="text-2xl font-black text-purple-900 font-mono">
                    ₹{(calc.totalLifecycleCost / 10000000).toFixed(2)} Cr
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (₹{calc.totalLifecycleCost.toLocaleString('en-IN')})
                  </span>
                </div>

                {/* Capex vs Opex Visual Split Bar (TCO-FR-04) */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] font-bold mb-1.5">
                    <span className="text-blue-700">Capex: {capexPercent}%</span>
                    <span className="text-purple-700">Opex ({periodYears}y): {opexPercent}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div style={{ width: `${capexPercent}%` }} className="bg-blue-600 h-full" />
                    <div style={{ width: `${opexPercent}%` }} className="bg-purple-600 h-full" />
                  </div>
                </div>

                {/* Granular Breakdown */}
                <div className="mt-4 space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between pt-1.5">
                    <span className="text-slate-600">Machine Landed Capex:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{(calc.acquisitionLanded / 100000).toFixed(2)} L
                    </span>
                  </div>

                  <div className="flex justify-between pt-1.5">
                    <span className="text-slate-600">Site Prep &amp; Auxiliaries:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{(calc.sitePrepMEP / 100000).toFixed(2)} L
                    </span>
                  </div>

                  <div className="flex justify-between pt-1.5">
                    <span className="text-slate-600">Post-Warranty CMC ({periodYears}y total):</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{(calc.postWarrantyMaintenanceTotal / 100000).toFixed(2)} L
                    </span>
                  </div>

                  <div className="flex justify-between pt-1.5">
                    <span className="text-slate-600">Replacement Parts Est.:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{(calc.estimatedSparesTotal / 100000).toFixed(2)} L
                    </span>
                  </div>

                  <div className="flex justify-between pt-1.5">
                    <span className="text-slate-600">Consumables &amp; Supplies:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{(calc.estimatedConsumablesTotal / 100000).toFixed(2)} L
                    </span>
                  </div>
                </div>

                {/* Missing Data Warnings (TCO-FR-03) */}
                {calc.missingDataWarnings && calc.missingDataWarnings.length > 0 && (
                  <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-amber-900">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Incomplete Parameters:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {calc.missingDataWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Calculated per standard workload</span>
                <span className="font-mono font-bold text-slate-700">4,500 scans/yr</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
