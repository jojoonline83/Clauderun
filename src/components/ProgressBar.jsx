export default function ProgressBar({ value, max, color = 'orange', label, showValue = false }) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const colors = {
    orange: 'bg-gradient-to-r from-orange-400 to-orange-500',
    purple: 'bg-gradient-to-r from-purple-400 to-purple-500',
    green: 'bg-gradient-to-r from-green-400 to-green-500',
    blue: 'bg-gradient-to-r from-blue-400 to-blue-500',
    pink: 'bg-gradient-to-r from-pink-400 to-pink-500',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs font-bold text-gray-600">{label}</span>}
          {showValue && <span className="text-xs font-bold text-gray-500">{value}/{max}</span>}
        </div>
      )}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
