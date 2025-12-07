import { useMemo } from 'react';

interface ChartData {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: ChartData[];
}

export function DonutChart({ data }: DonutChartProps) {
  const { paths, total } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    if (total === 0) {
      return { paths: [], total: 0 };
    }

    let cumulativePercent = 0;
    const paths = data.map((item) => {
      const percentage = (item.amount / total) * 100;
      const startAngle = (cumulativePercent / 100) * 360;
      const endAngle = ((cumulativePercent + percentage) / 100) * 360;
      cumulativePercent += percentage;

      const path = describeArc(50, 50, 40, 30, startAngle, endAngle);

      return {
        path,
        color: item.color,
        category: item.category,
        amount: item.amount,
        percentage,
      };
    });

    return { paths, total };
  }, [data]);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center mx-auto">
            <div className="text-center">
              <p className="text-gray-400 text-sm">No expenses yet</p>
              <p className="text-2xl font-bold text-gray-300 mt-2">$0.00</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {paths.map((item, index) => (
            <path
              key={index}
              d={item.path}
              fill={item.color}
              className="transition-opacity hover:opacity-80 cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-800">${total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate">{item.category}</p>
              <p className="text-xs text-gray-400">
                ${item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(x, y, outerRadius, endAngle);
  const outerEnd = polarToCartesian(x, y, outerRadius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M',
    outerStart.x,
    outerStart.y,
    'A',
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    outerEnd.x,
    outerEnd.y,
    'L',
    innerEnd.x,
    innerEnd.y,
    'A',
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    innerStart.x,
    innerStart.y,
    'Z',
  ].join(' ');

  return d;
}
