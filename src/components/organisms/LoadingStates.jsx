import { motion } from 'framer-motion';

export const SkeletonLoader = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-surface-200 rounded w-3/4"></div>
              <div className="h-4 bg-surface-200 rounded w-1/2"></div>
              <div className="h-4 bg-surface-200 rounded w-2/3"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-200">
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 bg-surface-200 rounded w-20 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-surface-100">
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 bg-surface-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-surface-200 rounded w-20"></div>
                <div className="w-8 h-8 bg-surface-200 rounded"></div>
              </div>
              <div className="h-8 bg-surface-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-surface-200 rounded w-24"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};