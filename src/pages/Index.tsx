import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Heart, Sparkles } from 'lucide-react';
import { ExpenseCalendar } from '@/components/ExpenseCalendar';
import { ExpenseSummary } from '@/components/ExpenseSummary';

import floralPattern from '@/assets/floral-pattern.jpg';
import septemberBirthday from '@/assets/september-birthday.jpg';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isSeptember = selectedDate.getMonth() === 8;

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Images */}
      <div className="fixed inset-0 z-0">
        <img
          src={isSeptember ? septemberBirthday : floralPattern}
          alt="Floral Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-background" />
      </div>

      {/* Floating decorative elements */}
      <div className="fixed top-10 left-10 text-4xl floating opacity-20">🌸</div>
      <div className="fixed top-20 right-20 text-3xl floating opacity-30" style={{animationDelay: '1s'}}>🌺</div>
      <div className="fixed bottom-20 left-20 text-3xl floating opacity-25" style={{animationDelay: '2s'}}>🌷</div>
      <div className="fixed bottom-10 right-10 text-4xl floating opacity-20" style={{animationDelay: '0.5s'}}>🌻</div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/30 backdrop-blur-md border-b border-white/20 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    {isSeptember ? "🎂 Manya's Birthday" : "Manya's"} Expenditure Calendar
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isSeptember ? "Happy Birthday Month! 🎉" : "Track your expenses with love 💖"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">Stay Beautiful & Budget-Smart</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <ExpenseCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onExpenseAdded={handleExpenseAdded}
              key={refreshTrigger}
            />
            
            <ExpenseSummary 
              selectedDate={selectedDate}
              key={refreshTrigger}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/20 backdrop-blur-md border-t border-white/20 mt-12">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Made with 💖 for Manya • Keep tracking, keep sparkling! ✨
            </p>
            {isSeptember && (
              <p className="text-sm text-birthday-primary font-medium mt-2">
                🎂 Happy Birthday Month, Beautiful! Hope this helps with your birthday celebration planning! 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default Index;
