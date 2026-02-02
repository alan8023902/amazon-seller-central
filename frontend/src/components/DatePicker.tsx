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

  const parseDateParts = (dateStr: string) => {
    if (!dateStr) return null;
    if (dateStr.includes('-')) {
      const [yearStr, monthStr, dayStr] = dateStr.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const day = parseInt(dayStr);
      if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
      return { year, month, day };
    }
    if (dateStr.includes('/')) {
      const [monthStr, dayStr, yearStr] = dateStr.split('/');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const day = parseInt(dayStr);
      if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
      return { year, month, day };
    }
    return null;
  };

  const formatISO = (year: number, month: number, day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const parseDateFromInput = (dateStr: string): Date | null => {
    setError('');
    if (!dateStr) return null;

    const parts = parseDateParts(dateStr);
    if (!parts) {
      setError('Invalid date format');
      return null;
    }

    const { year, month, day } = parts;
    if (month < 1 || month > 12) {
      setError('Invalid month');
      return null;
    }
    if (day < 1 || day > 31) {
      setError('Invalid day');
      return null;
    }
    if (year < 1900 || year > 2100) {
      setError('Invalid year');
      return null;
    }

    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1) {
      setError('Invalid date');
      return null;
    }

    if (minDate && date < minDate) {
      setError('Date too early');
      return null;
    }
    if (maxDate && date > maxDate) {
      setError('Date too late');
      return null;
    }

    return date;
  };

  useEffect(() => {
    if (selectedDate) {
      const parts = parseDateParts(selectedDate);
      if (parts) {
        const month = parts.month - 1;
        const year = parts.year;
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
    if (!dateStr) return true;
    return parseDateFromInput(dateStr) !== null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSelectedDate(newValue);
    const parsed = parseDateFromInput(newValue);
    if (parsed) {
      const formatted = formatISO(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
      setSelectedDate(formatted);
      onChange?.(formatted);
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
    today.setHours(23, 59, 59, 999); // 璁剧疆涓轰粖澶╃殑鏈€鍚庝竴鍒?
    
    // 濡傛灉閫夋嫨鐨勬棩鏈熷湪浠婂ぉ涔嬪悗锛屼笉鍏佽閫夋嫨
    if (selectedDate > today) {
      return;
    }
    
    const formatted = formatISO(year, month, day);

    if (!validateDate(formatted)) return;

    setSelectedDate(formatted);
    onChange?.(formatted);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const isFutureMonth = monthStart > todayEnd;

  const dayCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) dayCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) dayCells.push(d);

  return (
    <div className="relative">
      {/* 鉁?Seller Central锛氬垎浣撴帶浠讹紙宸︽棩鍘嗘寜閽?+ 鍙崇櫧搴曡緭鍏ワ級 - 璋冨皬楂樺害 */}
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
          {/* 鉁?淇鏃ュ巻鍥炬爣 - 榛戣壊椴滆壋锛岃皟灏忕偣鐨勫ぇ灏?*/}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black">
            {/* 鏃ュ巻涓讳綋 */}
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8"/>
            {/* 椤堕儴鍔犵矖绾挎潯 */}
            <rect x="3" y="4" width="18" height="3" rx="2" ry="2" fill="currentColor"/>
            {/* 宸︿晶鎸傞挬 */}
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2.2"/>
            {/* 鍙充晶鎸傞挬 */}
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2.2"/>
            {/* 鍒嗗壊绾?*/}
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.2"/>
            {/* 6涓棩鏈熺偣 - 2琛?鍒楋紝璋冨皬灏哄 */}
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
            "h-[25px] w-[108px] px-2 text-[11px] text-[#0F1111] outline-none", /* 鉁?璋冩暣瀛椾綋澶у皬 */
            "border border-[#a6a6a6] border-t-[#949494] rounded-r-[3px]",
            "shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset]",
            error && "border-red-500"
          )}
          style={{ backgroundColor: '#ffffff' }} // 鉁?寮哄埗鐧借壊鑳屾櫙
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

          <div className="grid grid-cols-7 p-1 gap-0 auto-rows-[24px]">
            {dayCells.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={idx}
                    className={cn("h-full w-full", isFutureMonth && "bg-gray-200 rounded-none")}
                  />
                );
              }

              const selectedDateStr = formatISO(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                day
              );
              const isSelected = selectedDate === selectedDateStr;
              
              // 妫€鏌ユ槸鍚︽槸鏈潵鏃ユ湡
              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isFutureDate = cellDate > todayEnd;
              
              return (
                <button
                  key={idx}
                  className={cn(
                    "h-full w-full text-[10px] flex items-center justify-center",
                    isFutureDate 
                      ? "text-gray-500 bg-gray-200 cursor-not-allowed rounded-none" // 鉁?鏈潵鏃ユ湡娣辩伆鑹茶儗鏅拰鏂囧瓧
                      : "hover:bg-gray-100 cursor-pointer rounded", // 鍙€夋嫨鏃ユ湡
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

