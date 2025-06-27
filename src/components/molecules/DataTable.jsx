import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const DataTable = ({ 
  columns, 
  data, 
  onSort,
  onRowClick,
  actions,
  className = '' 
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (!onSort) return;
    
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    
    setSortField(field);
    setSortDirection(direction);
    onSort(field, direction);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 py-3 text-left text-sm font-medium text-surface-700
                  ${column.sortable ? 'cursor-pointer select-none hover:bg-surface-50' : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <ApperIcon 
                      name={getSortIcon(column.key)} 
                      size={14} 
                      className={sortField === column.key ? 'text-primary-600' : 'text-surface-400'} 
                    />
                  )}
                </div>
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-right text-sm font-medium text-surface-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <motion.tr
              key={row.Id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                border-b border-surface-100 hover:bg-surface-50 transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-surface-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant="ghost"
                        size="sm"
                        icon={action.icon}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className="text-surface-600 hover:text-surface-900"
                      />
                    ))}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;