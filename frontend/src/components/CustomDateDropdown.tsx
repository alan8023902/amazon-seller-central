import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CustomDateDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CustomDateDropdown: React.FC<CustomDateDropdownProps> = ({
  value = 'custom',
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dateOptions = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

    return [
      { label: `Today - ${fmt(today)}`, value: 'today' },
      { label: `Yesterday - ${fmt(yesterday)}`, value: 'yesterday' },
      { label: `Week to date - ${fmt(today)}`, value: 'week' },
      { label: `Month to date - ${fmt(today)}`, value: 'month' },
      { label: `Year to date - ${fmt(today)}`, value: 'year' },
      { label: 'Custom', value: 'custom' }
    ];
  }, []);

  const selected = dateOptions.find(opt => opt.value === value) || dateOptions[5];

  // ✅ Seller Central：默认显示就是 Custom（更贴近真实）
  const displayText = value === 'custom' ? 'Custom' : selected.label;

  const handleOptionClick = (v: string) => {
    onChange?.(v);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between cursor-pointer"
        style={{
          width: '288px',
          minWidth: '288px',
          height: '29px',
          fontSize: '11px',
          padding: '0 8px',
          borderRadius: '3px',
          border: '1px solid #a6a6a6',
          borderTopColor: '#949494',
          background: '#ffffff',
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          boxShadow: '0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.07) inset',
          outline: 'none',
          color: '#0f1111'
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.background = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.background = '#ffffff';
        }}
      >
        <span className="truncate pr-2">{displayText}</span>
        {isOpen ? <ChevronUp size={14} className="flex-shrink-0" /> : <ChevronDown size={14} className="flex-shrink-0" />}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 bg-white border border-[#888] shadow-lg mt-1 w-[288px] min-w-[288px]">
          {dateOptions.map((option) => {
            const isSelected = option.value === value;
            return (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`px-3 py-1 text-[11px] cursor-pointer whitespace-nowrap ${isSelected ? '' : 'hover:bg-gray-100'}`}
              style={{
                backgroundColor: isSelected ? '#619087' : '#ffffff',
                color: isSelected ? '#ffffff' : '#0f1111'
              }}
            >
              {option.label}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDateDropdown;
