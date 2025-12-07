import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Expense, Category } from '../lib/supabase';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, categories, onUpdate, onDelete }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      amount: expense.amount,
      category_id: expense.category_id,
      description: expense.description,
      date: expense.date,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-400">No expenses recorded yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {expenses.map((expense) => {
          const isEditing = editingId === expense.id;

          return (
            <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, amount: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Amount"
                    />
                  </div>
                  <div>
                    <select
                      value={editForm.category_id || ''}
                      onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white p-1 rounded transition-colors"
                    >
                      <Check size={16} className="mx-auto" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-1 rounded transition-colors"
                    >
                      <X size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(expense.category_id) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">
                        {expense.description || 'No description'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getCategoryName(expense.category_id)} •{' '}
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-gray-800 text-lg">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(expense)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this expense?')) {
                            onDelete(expense.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
