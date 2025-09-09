import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target } from 'lucide-react';
import { getExpensesForMonth, getCategoryTotalsForMonth, getTotalForMonth, loadBudgets } from '@/utils/storage';
import { format } from 'date-fns';

interface ExpenseSummaryProps {
  selectedDate: Date;
  refreshTrigger: number;
}

const categoryLabels: Record<string, string> = {
  food: '🍽️ Food',
  bills: '💡 Bills',
  travel: '✈️ Travel',
  shopping: '🛍️ Shopping',
  entertainment: '🎬 Entertainment',
  other: '📝 Other',
};

const categoryColors: Record<string, string> = {
  food: 'bg-orange-100 text-orange-800 border-orange-200',
  bills: 'bg-blue-100 text-blue-800 border-blue-200',
  travel: 'bg-green-100 text-green-800 border-green-200',
  shopping: 'bg-purple-100 text-purple-800 border-purple-200',
  entertainment: 'bg-red-100 text-red-800 border-red-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ selectedDate, refreshTrigger }) => {
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [budgets, setBudgets] = useState<any[]>([]);
  const [previousMonthTotal, setPreviousMonthTotal] = useState(0);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const isSeptember = currentMonth === 8;

  useEffect(() => {
    const total = getTotalForMonth(currentYear, currentMonth);
    const categories = getCategoryTotalsForMonth(currentYear, currentMonth);
    const loadedBudgets = loadBudgets();
    
    // Get previous month total for comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevTotal = getTotalForMonth(prevYear, prevMonth);

    setMonthlyTotal(total);
    setCategoryTotals(categories);
    setBudgets(loadedBudgets);
    setPreviousMonthTotal(prevTotal);
  }, [selectedDate, currentMonth, currentYear, refreshTrigger]);

  const monthlyBudget = budgets.find(b => b.type === 'monthly')?.amount || 0;
  const budgetProgress = monthlyBudget > 0 ? (monthlyTotal / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetProgress > 100;
  
  const monthChange = previousMonthTotal > 0 ? ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;
  const isIncreased = monthChange > 0;

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className={`space-y-6 ${isSeptember ? 'birthday-theme' : ''}`}>
      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`glass-card ${isSeptember ? 'bg-birthday-gradient' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-primary">₹{monthlyTotal.toFixed(0)}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            {previousMonthTotal > 0 && (
              <div className="flex items-center mt-2 text-sm">
                {isIncreased ? (
                  <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-success mr-1" />
                )}
                <span className={isIncreased ? 'text-destructive' : 'text-success'}>
                  {Math.abs(monthChange).toFixed(1)}% from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`glass-card ${isSeptember ? 'bg-birthday-gradient' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Status</p>
                <p className="text-2xl font-bold">
                  {monthlyBudget > 0 ? `₹${(monthlyBudget - monthlyTotal).toFixed(0)}` : 'No Budget'}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            {monthlyBudget > 0 && (
              <div className="mt-2">
                <Progress value={Math.min(budgetProgress, 100)} className="h-2" />
                <p className={`text-sm mt-1 ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {budgetProgress.toFixed(1)}% of budget used
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`glass-card ${isSeptember ? 'bg-birthday-gradient' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(categoryTotals).length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Active this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={categoryColors[category] || categoryColors.other}>
                        {categoryLabels[category] || category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{amount.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* September Birthday Special */}
      {isSeptember && (
        <Card className="glass-card bg-birthday-gradient border-birthday-accent/30">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl">🎂</div>
              <h3 className="text-xl font-bold text-birthday-primary">Happy Birthday Month, Manya!</h3>
              <p className="text-birthday-secondary">
                September is extra special! Don't forget to budget for birthday celebrations! 🎉
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};