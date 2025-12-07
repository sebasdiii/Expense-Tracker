import { useEffect, useState, useMemo } from 'react';
import { Wallet } from 'lucide-react';
import { supabase, Expense, Category } from './lib/supabase';
import { DonutChart } from './components/DonutChart';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { DateFilter, DateRange } from './components/DateFilter';
import { Statistics } from './components/Statistics';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, categoriesData] = await Promise.all([
        supabase.from('expenses').select('*, categories(*)').order('date', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (expensesData.error) throw expensesData.error;
      if (categoriesData.error) throw categoriesData.error;

      setExpenses(expensesData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: {
    amount: number;
    category_id: string;
    description: string;
    date: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select('*, categories(*)')
        .single();

      if (error) throw error;

      if (data) {
        setExpenses([data, ...expenses]);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { error } = await supabase.from('expenses').update(updates).eq('id', id);

      if (error) throw error;

      setExpenses(
        expenses.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;

      setExpenses(expenses.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);

      switch (dateRange) {
        case 'week':
          return expenseDate >= startOfWeek;
        case 'month':
          return expenseDate >= startOfMonth;
        case 'year':
          return expenseDate >= startOfYear;
        case 'all':
        default:
          return true;
      }
    });
  }, [expenses, dateRange]);

  const chartData = useMemo(() => {
    const categoryTotals = new Map<string, { amount: number; color: string; name: string }>();

    filteredExpenses.forEach((expense) => {
      const category = categories.find((c) => c.id === expense.category_id);
      if (!category) return;

      const existing = categoryTotals.get(category.id);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        categoryTotals.set(category.id, {
          amount: expense.amount,
          color: category.color,
          name: category.name,
        });
      }
    });

    return Array.from(categoryTotals.values())
      .map((item) => ({
        category: item.name,
        amount: item.amount,
        color: item.color,
        percentage: 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Wallet className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
              <p className="text-gray-600">Manage your finances with ease</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <DateFilter selected={dateRange} onSelect={setDateRange} />
        </div>

        <div className="mb-6">
          <Statistics expenses={filteredExpenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <ExpenseForm categories={categories} onSubmit={handleAddExpense} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Expense Distribution</h2>
            <DonutChart data={chartData} />
          </div>
        </div>

        <ExpenseList
          expenses={filteredExpenses}
          categories={categories}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
      </div>
    </div>
  );
}

export default App;
