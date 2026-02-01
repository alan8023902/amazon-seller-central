import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const year = parseInt(parts[2]);
        if (!isNaN(month) && !isNaN(year)) {
          setCurrentMonth(new Date(year, month));
        }
      }
    }
  }, [selectedDate]);

  const monthNames = useMemo(() => ([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]), []);

  const daysOfWeek = useMemo(() => (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]), []);

  const validateDate = (dateStr: string): boolean => {
    setError('');
    if (!dateStr) return true;

    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      setError('Invalid date format');
      return false;
    }

    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(month) || isNaN(day) || isNaN(year)) {
      setError('Invalid date');
      return false;
    }
    if (month < 1 || month > 12) {
      setError('Invalid month');
      return false;
    }
    if (day < 1 || day > 31) {
      setError('Invalid day');
      return false;
    }
    if (year < 1900 || year > 2100) {
      setError('Invalid year');
      return false;
    }

    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1) {
      setError('Invalid date');
      return false;
    }

    if (minDate && date < minDate) {
      setError('Date too early');
      return false;
    }
    if (maxDate && date > maxDate) {
      setError('Date too late');
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSelectedDate(newValue);
    if (validateDate(newValue)) {
      onChange?.(newValue);
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleDayClick = (day: number) => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
    
    // 如果选择的日期在今天之后，不允许选择
    if (selectedDate > today) {
      return;
    }
    
    const formatted = `${month}/${day}/${year}`;

    if (!validateDate(formatted)) return;

    setSelectedDate(formatted);
    onChange?.(formatted);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const dayCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) dayCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) dayCells.push(d);

  return (
    <div className="relative">
      {/* ✅ Seller Central：分体控件（左日历按钮 + 右白底输入） - 调小高度 */}
      <div className={cn("flex items-center h-[25px] w-[140px] min-w-[140px] max-w-[140px]")}>
        <div
          className={cn(
            "w-[32px] h-[25px] flex items-center justify-center cursor-pointer",
            "border border-[#a6a6a6] border-t-[#949494] border-r-0 rounded-l-[3px]",
            "shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec]",
            error && "border-red-500 border-r-0"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* ✅ 修复日历图标 - 黑色鲜艳，调小点的大小 */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black">
            {/* 日历主体 */}
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8"/>
            {/* 顶部加粗线条 */}
            <rect x="3" y="4" width="18" height="3" rx="2" ry="2" fill="currentColor"/>
            {/* 左侧挂钩 */}
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2.2"/>
            {/* 右侧挂钩 */}
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2.2"/>
            {/* 分割线 */}
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.2"/>
            {/* 6个日期点 - 2行3列，调小尺寸 */}
            <circle cx="8" cy="13" r="1.0" fill="currentColor"/>
            <circle cx="12" cy="13" r="1.0" fill="currentColor"/>
            <circle cx="16" cy="13" r="1.0" fill="currentColor"/>
            <circle cx="8" cy="17" r="1.0" fill="currentColor"/>
            <circle cx="12" cy="17" r="1.0" fill="currentColor"/>
            <circle cx="16" cy="17" r="1.0" fill="currentColor"/>
          </svg>
        </div>

        <input
          type="text"
          className={cn(
            "h-[25px] w-[108px] px-2 text-[11px] text-[#0F1111] outline-none", /* ✅ 调整字体大小 */
            "border border-[#a6a6a6] border-t-[#949494] rounded-r-[3px]",
            "shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset]",
            error && "border-red-500"
          )}
          style={{ backgroundColor: '#ffffff' }} // ✅ 强制白色背景
          value={selectedDate}
          onChange={handleInputChange}
          placeholder={placeholder}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        />
      </div>

      {error && (
        <div className="absolute top-full left-0 text-red-500 text-xs mt-1 z-40">{error}</div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 z-50 bg-white border border-[#888] shadow-lg mt-1 w-[240px] rounded-md">
          <div className="flex items-center justify-between p-1 border-b border-gray-200 bg-gray-50 rounded-t-md">
            <button className="p-1 hover:bg-gray-200 rounded transition-colors" onClick={prevMonth} type="button">
              <ChevronLeft size={14} />
            </button>
            <div className="font-medium text-[10px]">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button className="p-1 hover:bg-gray-200 rounded transition-colors" onClick={nextMonth} type="button">
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {daysOfWeek.map(d => (
              <div key={d} className="text-center text-[9px] py-1 font-medium text-gray-600">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 p-1 gap-1">
            {dayCells.map((day, idx) => {
              if (!day) return <div key={idx} className="h-6" />;

              const selectedDateStr = `${currentMonth.getMonth() + 1}/${day}/${currentMonth.getFullYear()}`;
              const isSelected = selectedDate === selectedDateStr;
              
              // 检查是否是未来日期
              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const today = new Date();
              today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
              const isFutureDate = cellDate > today;
              
              return (
                <button
                  key={idx}
                  className={cn(
                    "h-6 w-6 text-[10px] rounded",
                    isFutureDate 
                      ? "text-gray-500 bg-gray-200 cursor-not-allowed" // ✅ 未来日期深灰色背景和文字
                      : "hover:bg-gray-100 cursor-pointer", // 可选择日期
                    isSelected && !isFutureDate && "bg-[#008296] text-white hover:bg-[#007185]"
                  )}
                  onClick={() => handleDayClick(day)}
                  type="button"
                  disabled={isFutureDate}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
