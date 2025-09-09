import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addBudget, Budget } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

interface SetBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetSet: () => void;
}

export const SetBudgetDialog: React.FC<SetBudgetDialogProps> = ({
  isOpen,
  onClose,
  onBudgetSet
}) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Budget['type']>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid budget amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const budget = addBudget({
        type,
        amount: Number(amount),
        startDate: new Date().toISOString().split('T')[0],
      });

      toast({
        title: "💖 Budget Set!",
        description: `₹${amount} ${type} budget has been set`,
      });

      // Reset form
      setAmount('');
      setType('monthly');
      
      onBudgetSet();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set budget. Please try again.",
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
            Set Your Budget
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget-amount" className="text-sm font-medium">
              Budget Amount (₹)
            </Label>
            <Input
              id="budget-amount"
              type="number"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
              min="0"
              step="100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-type" className="text-sm font-medium">
              Budget Period
            </Label>
            <Select value={type} onValueChange={(value: Budget['type']) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    Weekly Budget
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <span>🗓️</span>
                    Monthly Budget
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Setting a realistic budget helps you track your spending 
              and stay on top of your finances. You'll get notifications when you're close to your limit!
            </p>
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
              {isSubmitting ? 'Setting...' : 'Set Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};