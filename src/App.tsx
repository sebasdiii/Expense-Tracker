import { useEffect, useState, useMemo } from 'react';
import { Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Expense, Category } from './lib/supabase';
import { DonutChart } from './components/DonutChart';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Statistics } from './components/Statistics';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const monthExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === currentMonth.getMonth() &&
        expDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  }, [expenses, currentMonth]);

  const chartData = useMemo(() => {
    const categoryTotals = new Map<string, { amount: number; color: string; name: string }>();

    monthExpenses.forEach((expense) => {
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
  }, [monthExpenses, categories]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

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
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Wallet className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
              <p className="text-gray-600">Track spending month by month</p>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800 min-w-48 text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mb-6">
          <Statistics expenses={monthExpenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <ExpenseForm categories={categories} onSubmit={handleAddExpense} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">This Month's Breakdown</h2>
            <DonutChart data={chartData} />
          </div>
        </div>

        <ExpenseList
          expenses={monthExpenses}
          categories={categories}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
      </div>
    </div>
  );
}

export default App;
