import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  value = "", 
  onChange, 
  placeholder = "Select date",
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value);
  const [error, setError] = useState<string>('');

  // Update selected date when value prop changes
  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  // Initialize current month based on selected date or current date
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const validateDate = (dateStr: string): boolean => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    
    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(month) || isNaN(day) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Check if date is valid (handles leap years, month boundaries)
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return false;
    }
    
    // Check min/max date constraints
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    
    return true;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handleDateClick = (day: number) => {
    const newDate = `${currentMonth.getMonth() + 1}/${day}/${currentMonth.getFullYear()}`;
    
    if (validateDate(newDate)) {
      setSelectedDate(newDate);
      onChange?.(newDate);
      setError('');
      setIsOpen(false);
    } else {
      setError('Invalid date selected');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSelectedDate(newValue);
    
    if (newValue && !validateDate(newValue)) {
      setError('Invalid date format (MM/DD/YYYY)');
    } else {
      setError('');
      onChange?.(newValue);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    // Disable future dates (after today)
    if (date > today) return true;
    
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    const parts = selectedDate.split('/');
    if (parts.length !== 3) return false;
    
    const selectedDay = parseInt(parts[1]);
    const selectedMonth = parseInt(parts[0]) - 1;
    const selectedYear = parseInt(parts[2]);
    
    return day === selectedDay && 
           currentMonth.getMonth() === selectedMonth && 
           currentMonth.getFullYear() === selectedYear;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      <div 
        className={cn(
          "flex items-center border bg-white h-[29px] px-2 cursor-pointer w-[140px] min-w-[140px]",
          error ? "border-red-500" : "border-[#a6a6a6] border-t-[#949494] rounded-[3px] shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec]"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={12} className="text-[#0F1111] mr-1 flex-shrink-0" />
        <input 
          type="text" 
          className="border-none outline-none flex-1 text-[13px] text-[#0F1111] cursor-pointer bg-transparent"
          value={selectedDate}
          onChange={handleInputChange}
          placeholder={placeholder}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {error && (
        <div className="absolute top-full left-0 text-red-500 text-xs mt-1 z-40">
          {error}
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 z-50 bg-white border border-[#888] shadow-lg mt-1 w-64 rounded-md">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-medium text-xs">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {daysOfWeek.map(day => (
              <div key={day} className="p-1 text-center text-[10px] font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 p-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square p-0.5">
                {day && (
                  <button
                    onClick={() => handleDateClick(day)}
                    disabled={isDateDisabled(day)}
                    className={cn(
                      "w-full h-full flex items-center justify-center text-[10px] rounded transition-colors",
                      isDateSelected(day) 
                        ? "bg-[#008296] text-white hover:bg-[#007185]" 
                        : "hover:bg-gray-100",
                      isDateDisabled(day) && "text-gray-300 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;