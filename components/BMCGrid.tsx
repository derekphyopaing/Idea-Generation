import React from 'react';
import { BMCData } from '../types';

interface BMCGridProps {
  data: BMCData;
}

const Block: React.FC<{ title: string; items: string[]; className?: string }> = ({ title, items, className }) => (
  <div className={`bg-white border border-slate-200 p-4 flex flex-col h-full shadow-sm ${className}`}>
    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">{title}</h3>
    <ul className="list-disc list-inside space-y-1 text-sm text-slate-800 flex-grow">
      {items.map((item, idx) => (
        <li key={idx} className="leading-snug">{item}</li>
      ))}
    </ul>
  </div>
);

export const BMCGrid: React.FC<BMCGridProps> = ({ data }) => {
  if (!data) return <div className="text-center p-4">No data available</div>;

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop/Tablet Grid Layout */}
      <div className="min-w-[800px] grid grid-cols-5 grid-rows-3 gap-2 bg-slate-100 p-2 border rounded-lg">
        
        {/* Top Row: Left to Right */}
        <Block 
          title="Key Partners (မိတ်ဖက်များ)" 
          items={data.keyPartners} 
          className="col-span-1 row-span-2" 
        />
        
        <div className="col-span-1 row-span-2 flex flex-col gap-2">
           <Block title="Key Activities (အဓိကလုပ်ဆောင်ချက်များ)" items={data.keyActivities} className="h-1/2" />
           <Block title="Key Resources (အဓိကအရင်းအမြစ်များ)" items={data.keyResources} className="h-1/2" />
        </div>

        <Block 
          title="Value Propositions (တန်ဖိုးထားမှုများ)" 
          items={data.valuePropositions} 
          className="col-span-1 row-span-2" 
        />

        <div className="col-span-1 row-span-2 flex flex-col gap-2">
          <Block title="Customer Relationships (ဖောက်သည်ဆက်ဆံရေး)" items={data.customerRelationships} className="h-1/2" />
          <Block title="Channels (ဖြန့်ဖြူးရေးလမ်းကြောင်းများ)" items={data.channels} className="h-1/2" />
        </div>

        <Block 
          title="Customer Segments (ဖောက်သည်အမျိုးအစားများ)" 
          items={data.customerSegments} 
          className="col-span-1 row-span-2" 
        />

        {/* Bottom Row */}
        <Block 
          title="Cost Structure (ကုန်ကျစရိတ်ဖွဲ့စည်းပုံ)" 
          items={data.costStructure} 
          className="col-span-2.5 row-span-1" // Note: Tailwind grid doesn't support decimal spans directly, using col-span-2 for now and custom style usually needed for perfect BMC but CSS grid is flexible. Let's approximate.
        />
        
        {/* Hack for 50/50 split on bottom row in a 5 col grid: 
            The standard BMC is usually:
            P (1) - A/R (1) - V (1) - R/Ch (1) - S (1)
            Cost (2.5) - Rev (2.5)
            To achieve this in CSS Grid with 5 cols, we make the bottom row span across.
            Actually simpler: P(1), A(1), V(1), R(1), S(1).
            Row 3: Cost spans 2, Empty spacer?, Revenue spans 3? No.
            
            Let's just use col-span-2 and col-span-3 or flexbox for bottom.
        */}
        <div className="col-span-5 grid grid-cols-2 gap-2 h-full">
           <Block title="Cost Structure (ကုန်ကျစရိတ်ဖွဲ့စည်းပုံ)" items={data.costStructure} />
           <Block title="Revenue Streams (ဝင်ငွေရလမ်းများ)" items={data.revenueStreams} />
        </div>
      </div>
    </div>
  );
};
