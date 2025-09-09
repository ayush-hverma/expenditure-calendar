import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Download, TrendingUp } from 'lucide-react';
import { AddExpenseDialog } from './AddExpenseDialog';
import { SetBudgetDialog } from './SetBudgetDialog';
import { format } from 'date-fns';
import { getExpensesForDate, loadExpenses } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

interface QuickActionsProps {
  selectedDate: Date;
  onExpenseAdded: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ selectedDate, onExpenseAdded }) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false);

  const todayExpenses = getExpensesForDate(format(selectedDate, 'yyyy-MM-dd'));
  const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleExportData = () => {
    const expenses = loadExpenses();
    
    if (expenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expenses to export yet!",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Date', 'Amount', 'Category', 'Description'].join(','),
      ...expenses.map(exp => [
        exp.date,
        exp.amount,
        exp.category,
        `"${exp.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manya-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "💖 Export Complete!",
      description: "Your expense data has been downloaded as CSV",
    });
  };

  const quickExpenseCategories = [
    { category: 'food', label: '🍽️ Food', amount: 200 },
    { category: 'travel', label: '✈️ Travel', amount: 100 },
    { category: 'shopping', label: '🛍️ Shopping', amount: 500 },
  ];

  return (
    <div className="space-y-4">
      {/* Today's Summary */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Today - {format(selectedDate, 'MMM d')}</span>
            <Badge variant={todayTotal > 0 ? "default" : "secondary"}>
              ₹{todayTotal.toFixed(0)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {todayExpenses.length > 0 ? (
            <div className="space-y-2">
              {todayExpenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{expense.description}</span>
                  <span className="font-medium">₹{expense.amount}</span>
                </div>
              ))}
              {todayExpenses.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{todayExpenses.length - 3} more expenses
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No expenses today</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setShowAddExpense(true)}
            variant="gradient"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          
          <Button 
            onClick={() => setShowSetBudget(true)}
            variant="glass"
            className="w-full"
          >
            <Target className="h-4 w-4 mr-2" />
            Set Budget
          </Button>
          
          <Button 
            onClick={handleExportData}
            variant="glass"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Quick Expense Buttons */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Add</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickExpenseCategories.map((item) => (
            <Button
              key={item.category}
              variant="glass"
              className="w-full justify-between text-sm"
              onClick={() => {
                // Quick add functionality could be implemented here
                setShowAddExpense(true);
              }}
            >
              <span>{item.label}</span>
              <span>₹{item.amount}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showAddExpense && (
        <AddExpenseDialog
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          selectedDate={selectedDate}
          onExpenseAdded={() => {
            onExpenseAdded();
            setShowAddExpense(false);
          }}
        />
      )}

      {showSetBudget && (
        <SetBudgetDialog
          isOpen={showSetBudget}
          onClose={() => setShowSetBudget(false)}
          onBudgetSet={() => {
            setShowSetBudget(false);
            onExpenseAdded(); // Refresh data
          }}
        />
      )}
    </div>
  );
};