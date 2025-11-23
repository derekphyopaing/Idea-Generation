import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
          isUser 
            ? 'bg-rose-600 text-white rounded-tr-none' 
            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
        }`}
      >
        <div className="text-sm leading-relaxed">
          {/* Render markdown with specific styles for lists to support the new "Options" format */}
          <ReactMarkdown 
            components={{
              p: ({node, ...props}) => <p className={`mb-2 last:mb-0 ${isUser ? 'text-white' : 'text-slate-800'}`} {...props} />,
              ul: ({node, ...props}) => <ul className={`list-disc list-outside ml-5 mb-3 space-y-1 ${isUser ? 'text-white' : 'text-slate-800'}`} {...props} />,
              ol: ({node, ...props}) => <ol className={`list-decimal list-outside ml-5 mb-3 space-y-1 ${isUser ? 'text-white' : 'text-slate-800'}`} {...props} />,
              li: ({node, ...props}) => <li className={`${isUser ? 'text-white' : 'text-slate-800'}`} {...props} />,
              strong: ({node, ...props}) => <strong className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`} {...props} />,
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};