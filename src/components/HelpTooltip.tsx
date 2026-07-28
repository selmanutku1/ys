import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string | React.ReactNode;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-gray-400 hover:text-[#00AB41] transition-colors focus:outline-none"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 p-3 mt-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-xl shadow-lg left-1/2 -translate-x-1/2 top-full">
          {content}
          <div className="absolute w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 -top-1.5 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}
