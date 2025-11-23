import React, { useState } from 'react';
import { GeneratedDocs, BMCData } from '../types';
import { BMCGrid } from './BMCGrid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResultsViewProps {
  docs: GeneratedDocs;
  onReset: () => void;
}

type Tab = 'note' | 'bmc' | 'onepage' | 'strategic' | 'gtm' | 'marketing' | 'ops' | 'hr' | 'finance';

export const ResultsView: React.FC<ResultsViewProps> = ({ docs, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('note');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const TabButton: React.FC<{ id: Tab; label: string }> = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
        activeTab === id
          ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );

  const MarkdownView: React.FC<{ title: string, content: string }> = ({ title, content }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <button
          onClick={() => handleCopy(content)}
          className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium transition-colors"
        >
          {copySuccess || 'Copy Text'}
        </button>
      </div>
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm prose prose-rose max-w-none overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'note':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Summary Note (အကျဉ်းချုပ် မှတ်စု)</h3>
              <button
                onClick={() => handleCopy(docs.summaryNote)}
                className="text-sm bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                {copySuccess || 'Copy Note'}
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[300px] whitespace-pre-wrap leading-relaxed text-slate-700">
              {docs.summaryNote}
            </div>
          </div>
        );
      case 'bmc':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Business Model Canvas</h3>
            {docs.bmc ? <BMCGrid data={docs.bmc} /> : <p>No data available</p>}
          </div>
        );
      case 'onepage':
        return <MarkdownView title="One Page Business Plan (စာမျက်နှာတစ်မျက်နှာ လုပ်ငန်းအစီအစဉ်)" content={docs.onePagePlan} />;
      case 'strategic':
        return <MarkdownView title="Strategic Plan (မဟာဗျူဟာ စီမံကိန်း)" content={docs.strategicPlan} />;
      case 'gtm':
        return <MarkdownView title="Go-To-Market Strategy (ဈေးကွက်ဝင်ရောက်ရေး မဟာဗျူဟာ)" content={docs.gtmStrategy} />;
      case 'marketing':
        return <MarkdownView title="1-Page Marketing Plan (ဈေးကွက်အစီအစဉ်)" content={docs.marketingPlan} />;
      case 'ops':
        return <MarkdownView title="Operational Plan (လုပ်ငန်းလည်ပတ်မှု အစီအစဉ်)" content={docs.opsPlan} />;
      case 'hr':
        return <MarkdownView title="HR Plan (လူ့စွမ်းအားအရင်းအမြစ် စီမံခန့်ခွဲမှု)" content={docs.hrPlan} />;
      case 'finance':
        return <MarkdownView title="Financial Plan & Projections (ဘဏ္ဍာရေးအစီအစဉ်)" content={docs.financialPlan} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex overflow-x-auto border-b border-slate-200 mb-6 pb-1 scrollbar-hide">
        <TabButton id="note" label="Summary Note" />
        <TabButton id="bmc" label="BMC" />
        <TabButton id="onepage" label="One Page Plan" />
        <TabButton id="strategic" label="Strategic Plan" />
        <TabButton id="gtm" label="GTM Strategy" />
        <TabButton id="marketing" label="Marketing Plan" />
        <TabButton id="ops" label="Ops Plan" />
        <TabButton id="hr" label="HR Plan" />
        <TabButton id="finance" label="Financials" />
      </div>
      <div className="flex-grow animate-in fade-in duration-300">
        {renderContent()}
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center">
        <button
          onClick={onReset}
          className="text-slate-500 hover:text-rose-600 font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Start New Interview (အသစ်ပြန်စမည်)
        </button>
      </div>
    </div>
  );
};