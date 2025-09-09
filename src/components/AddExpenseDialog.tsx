import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addExpense, Expense } from '@/utils/storage';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onExpenseAdded: () => void;
}

const categories = [
  { value: 'food', label: '🍽️ Food & Dining', color: 'category-food' },
  { value: 'bills', label: '💡 Bills & Utilities', color: 'category-bills' },
  { value: 'travel', label: '✈️ Travel & Transport', color: 'category-travel' },
  { value: 'shopping', label: '🛍️ Shopping', color: 'category-shopping' },
  { value: 'entertainment', label: '🎬 Entertainment', color: 'category-entertainment' },
  { value: 'other', label: '📝 Other', color: 'category-other' },
];

export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onExpenseAdded
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('food');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const expense = addExpense({
        date: format(selectedDate, 'yyyy-MM-dd'),
        amount: Number(amount),
        category,
        description: description.trim() || `${categories.find(c => c.value === category)?.label} expense`,
      });

      toast({
        title: "💖 Expense Added!",
        description: `₹${amount} added for ${format(selectedDate, 'MMM d, yyyy')}`,
      });

      // Reset form
      setAmount('');
      setCategory('food');
      setDescription('');
      
      onExpenseAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Add Expense for {format(selectedDate, 'MMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={(value: Expense['category']) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a note about this expense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="glass"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};