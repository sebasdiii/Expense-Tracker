import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Expense } from '../lib/supabase';

interface StatisticsProps {
  expenses: Expense[];
}

export function Statistics({ expenses }: StatisticsProps) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const average = expenses.length > 0 ? total / expenses.length : 0;
  const highest = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;
  const count = expenses.length;

  const getPreviousPeriodTotal = () => {
    if (expenses.length === 0) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      const month = expDate.getMonth();
      const year = expDate.getFullYear();

      if (currentMonth === 0) {
        return month === 11 && year === currentYear - 1;
      }
      return month === currentMonth - 1 && year === currentYear;
    });

    return previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const previousTotal = getPreviousPeriodTotal();
  const trend = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  const stats = [
    {
      label: 'Total Spent',
      value: `$${total.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Average',
      value: `$${average.toFixed(2)}`,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Highest',
      value: `$${highest.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Transactions',
      value: count.toString(),
      icon: trend >= 0 ? TrendingUp : TrendingDown,
      color: trend >= 0 ? 'text-red-600' : 'text-green-600',
      bgColor: trend >= 0 ? 'bg-red-50' : 'bg-green-50',
      subtitle: trend !== 0 ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}% vs last period` : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                {stat.subtitle && (
                  <p className={`text-xs mt-1 font-medium ${stat.color}`}>{stat.subtitle}</p>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={stat.color} size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
