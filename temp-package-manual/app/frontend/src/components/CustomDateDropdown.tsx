import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';

interface CustomDateDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CustomDateDropdown: React.FC<CustomDateDropdownProps> = ({ 
  value = "custom", 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Generate current dates for display
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const dateOptions = [
    { label: `Today - ${formatDate(today)}`, value: "today" },
    { label: `Yesterday - ${formatDate(yesterday)}`, value: "yesterday" },
    { label: `Week to date - ${formatDate(today)}`, value: "week" },
    { label: `Month to date - ${formatDate(today)}`, value: "month" },
    { label: `Year to date - ${formatDate(today)}`, value: "year" },
    { label: "Custom", value: "custom" }
  ];

  const handleOptionClick = (option: typeof dateOptions[0]) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  const selectedOption = dateOptions.find(opt => opt.value === value) || dateOptions[5];

  return (
    <div className="relative">
      <div 
        className="flex items-center justify-between w-[288px] min-w-[288px] h-[29px] px-2 border border-[#a6a6a6] border-t-[#949494] rounded-[3px] bg-white cursor-pointer shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[13px] text-[#0F1111] truncate pr-2">{selectedOption.label}</span>
        {isOpen ? <ChevronUp size={14} className="flex-shrink-0" /> : <ChevronDown size={14} className="flex-shrink-0" />}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 bg-white border border-[#888] shadow-lg mt-1 w-[288px] min-w-[288px]">
          {dateOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={cn(
                "px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-100 whitespace-nowrap",
                option.value === "custom" && "border-t border-[#008296] bg-[#e6f7ff]"
              )}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDateDropdown;