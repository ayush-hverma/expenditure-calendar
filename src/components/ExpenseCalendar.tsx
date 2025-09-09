import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExpensesForDate, getTotalForDate, getExpensesForMonth } from '@/utils/storage';
import { AddExpenseDialog } from './AddExpenseDialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

interface ExpenseCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<Date | null>(null);
  const [expenses, setExpenses] = useState<Record<string, number>>({});

  // Check if current month is September for birthday theme
  const isSeptember = currentMonth.getMonth() === 8; // September is month 8 (0-indexed)

  useEffect(() => {
    // Load expenses for current month
    const monthExpenses = getExpensesForMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const dailyTotals: Record<string, number> = {};
    
    monthExpenses.forEach(expense => {
      const dateKey = expense.date;
      dailyTotals[dateKey] = getTotalForDate(dateKey);
    });
    
    setExpenses(dailyTotals);
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  const handleAddExpense = (date: Date) => {
    setSelectedDateForAdd(date);
    setShowAddExpense(true);
  };

  const handleExpenseAdded = () => {
    // Refresh expenses
    const monthExpenses = getExpensesForMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const dailyTotals: Record<string, number> = {};
    
    monthExpenses.forEach(expense => {
      const dateKey = expense.date;
      dailyTotals[dateKey] = getTotalForDate(dateKey);
    });
    
    setExpenses(dailyTotals);
    setShowAddExpense(false);
  };

  return (
    <div className={`w-full ${isSeptember ? 'birthday-theme' : ''}`}>
      <Card className={`calendar ${isSeptember ? 'bg-birthday-gradient border-birthday-accent/30' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {format(currentMonth, 'MMMM yyyy')}
            {isSeptember && (
              <span className="text-sm bg-birthday-accent/20 px-2 py-1 rounded-full">
                🎂 Manya's Birthday Month!
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="glass" 
              size="sm" 
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="glass" 
              size="sm" 
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const hasExpenses = expenses[dateStr] > 0;
              const total = expenses[dateStr] || 0;
              const isCurrentDay = isToday(date);
              const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

              return (
                <div
                  key={dateStr}
                  className={`
                    calendar-day min-h-[80px] p-2 cursor-pointer border rounded-lg
                    ${hasExpenses ? 'has-expenses' : 'border-border/30 hover:border-primary/50'}
                    ${isCurrentDay ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${isSelected ? 'bg-primary/10 border-primary' : ''}
                    ${!isSameMonth(date, currentMonth) ? 'opacity-30' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isCurrentDay ? 'text-primary font-bold' : ''}`}>
                        {format(date, 'd')}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddExpense(date);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {hasExpenses && (
                      <div className="mt-1 text-xs text-primary font-semibold">
                        ₹{total.toFixed(0)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showAddExpense && selectedDateForAdd && (
        <AddExpenseDialog
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          selectedDate={selectedDateForAdd}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </div>
  );
};