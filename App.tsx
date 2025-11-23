import React, { useState, useEffect, useRef } from 'react';
import { Message, AppStep, GeneratedDocs } from './types';
import { 
  createInterviewChat, 
  generateSummaryNote, 
  generateBMC, 
  generateOnePagePlan, 
  generateFinancialPlan, 
  generateGTMStrategy,
  generateMarketingPlan,
  generateHRPlan,
  generateOpsPlan,
  generateStrategicPlan
} from './services/gemini';
import { ChatBubble } from './components/ChatBubble';
import { ResultsView } from './components/ResultsView';
import { Chat } from "@google/genai";

// Logo Component for Akyanpay
const AkyanpayLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-br from-[#d91c5c] to-[#ef4444] rounded-lg flex items-center justify-center text-white font-bold text-2xl pb-1 shadow-lg shadow-rose-200">
      a
    </div>
    <div className="flex flex-col">
      <h1 className="font-extrabold text-xl tracking-wider text-slate-800 leading-none">AKYANPAY</h1>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Ideas that work</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocs | null>(null);
  
  // Refs to hold chat session
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    setIsLoading(true);
    setStep(AppStep.INTERVIEW);
    try {
      chatSessionRef.current = createInterviewChat();
      const result = await chatSessionRef.current.sendMessage({ message: "မင်္ဂလာပါ (Start interview)" });
      if (result.text) {
         setMessages([{ role: 'model', text: result.text }]);
      }
    } catch (error) {
      console.error("Failed to start chat", error);
      setMessages([{ role: 'model', text: "စနစ်ချို့ယွင်းမှုရှိနေပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။ (System Error)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: input });
      const modelMsg: Message = { role: 'model', text: result.text || "..." };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "အမှားအယွင်းရှိပါသည်။ (Error occurred)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateDocuments = async () => {
    if (messages.length < 3) {
      alert("ကျေးဇူးပြု၍ အချက်အလက်ပြည့်စုံအောင် မေးခွန်းများကို အရင်ဖြေကြားပေးပါ။ (Please answer more questions first)");
      return;
    }
    setStep(AppStep.GENERATING);
    
    try {
      // Run generations in parallel for speed
      const [note, bmc, onepage, finance, strategic, gtm, marketing, ops, hr] = await Promise.all([
        generateSummaryNote(messages),
        generateBMC(messages),
        generateOnePagePlan(messages),
        generateFinancialPlan(messages),
        generateStrategicPlan(messages),
        generateGTMStrategy(messages),
        generateMarketingPlan(messages),
        generateOpsPlan(messages),
        generateHRPlan(messages)
      ]);

      setGeneratedDocs({
        summaryNote: note,
        bmc: bmc,
        onePagePlan: onepage,
        financialPlan: finance,
        strategicPlan: strategic,
        gtmStrategy: gtm,
        marketingPlan: marketing,
        opsPlan: ops,
        hrPlan: hr
      });
      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error("Generation failed", error);
      alert("စာရွက်စာတမ်းများ ပြင်ဆင်နေစဉ် အမှားရှိပါသည်။ (Generation Failed)");
      setStep(AppStep.INTERVIEW); // Go back to allow retry
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
           <AkyanpayLogo />
           {step === AppStep.INTERVIEW && (
             <button 
               onClick={generateDocuments}
               className="hidden md:block bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
             >
               ပြီးဆုံးပြီ (Finish & Generate)
             </button>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        
        {/* Intro Screen */}
        {step === AppStep.INTRO && (
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-300">
            <div className="space-y-4 max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                သင့်စီးပွားရေးအိပ်မက်ကို <br/>
                <span className="text-rose-600">AKYANPAY Business Planner</span> ဖြင့်<br/>
                လက်တွေ့ဖော်ဆောင်ပါ
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                ကျွန်ုပ်တို့၏ AI နှင့် စကားပြောဆိုပြီး သင့်စီးပွားရေးလုပ်ငန်းအတွက် လိုအပ်သော စာရွက်စာတမ်းများကို အချိန်တိုအတွင်း ရယူလိုက်ပါ။
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
              {['Business Model Canvas', 'One Page Plan', 'Financial Projections'].map((item) => (
                <div key={item} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-rose-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-medium text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={startInterview}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-rose-600 px-8 font-medium text-white transition-all duration-300 hover:bg-rose-700 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
            >
              <span className="mr-2">စတင်ဆွေးနွေးမည် (Start)</span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        )}

        {/* Interview Screen */}
        {step === AppStep.INTERVIEW && (
          <div className="flex flex-col h-full max-h-[calc(100vh-140px)]">
            <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-20">
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} message={msg} />
              ))}
              {isLoading && (
                 <div className="flex justify-start mb-4">
                   <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm flex items-center gap-2">
                     <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-slate-50 pt-4 pb-2">
               <div className="relative flex items-center gap-2">
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="အဖြေရွေးပါ (သို့) စာရိုက်ပါ..."
                   className="w-full bg-white border border-slate-300 text-slate-900 rounded-full px-6 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-12"
                   disabled={isLoading}
                 />
                 <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                     <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                   </svg>
                 </button>
               </div>
               
               <button 
                 onClick={generateDocuments}
                 className="md:hidden w-full mt-3 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-semibold shadow-sm"
               >
                 ပြီးဆုံးပြီ (Finish & Generate)
               </button>
            </div>
          </div>
        )}

        {/* Generating Screen */}
        {step === AppStep.GENERATING && (
          <div className="flex-grow flex flex-col items-center justify-center space-y-6 animate-in fade-in">
            <div className="relative w-24 h-24">
               <div className="absolute top-0 left-0 w-full h-full border-4 border-rose-200 rounded-full"></div>
               <div className="absolute top-0 left-0 w-full h-full border-4 border-rose-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800">စာရွက်စာတမ်းများ ပြုလုပ်နေပါသည်...</h3>
            <p className="text-slate-500 text-center max-w-xs">
              Akyanpay AI မှ သင့်လုပ်ငန်းအချက်အလက်များကို စိစစ်ပြီး Business Plan ရေးဆွဲနေပါသည်။
            </p>
          </div>
        )}

        {/* Results Screen */}
        {step === AppStep.RESULTS && generatedDocs && (
          <ResultsView 
            docs={generatedDocs} 
            onReset={() => {
              setStep(AppStep.INTRO);
              setMessages([]);
              setGeneratedDocs(null);
            }} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Akyanpay Business Planner. Ideas that work.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;