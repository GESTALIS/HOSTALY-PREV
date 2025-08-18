import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  mainService: {
    id: string;
    name: string;
    color: string;
  };
  contractType: string;
  weeklyHours: number;
  salaryLevel: string;
  annualLeave: number;
  isPolyvalent: boolean;
  isActive: boolean;
}

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onView: (employee: Employee) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedIds: string[];
}

type SortField = 'firstName' | 'lastName' | 'mainService' | 'contractType' | 'weeklyHours' | 'isActive';
type SortDirection = 'asc' | 'desc';

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEdit,
  onDelete,
  onView,
  onSelectionChange,
  selectedIds
}) => {
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(employees.map(emp => emp.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, employeeId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== employeeId));
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Gestion spéciale pour les objets imbriqués
    if (sortField === 'mainService') {
      aValue = a.mainService.name;
      bValue = b.mainService.name;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4 text-hotaly-primary" />
      : <ChevronDownIcon className="h-4 w-4 text-hotaly-primary" />;
  };

  const formatContractType = (type: string) => {
    const types: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'Interim': 'Intérim',
      'Stage': 'Stage'
    };
    return types[type] || type;
  };

  if (employees.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <EyeIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
          <p className="text-gray-500">
            Aucun employé ne correspond aux critères de recherche ou aux filtres appliqués.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox de sélection multiple */}
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === employees.length && employees.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-hotaly-primary focus:ring-hotaly-primary border-gray-300 rounded"
                />
              </th>

              {/* En-têtes de colonnes avec tri */}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('lastName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Nom</span>
                  {getSortIcon('lastName')}
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Prénom</span>
                  {getSortIcon('firstName')}
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('mainService')}
              >
                <div className="flex items-center space-x-1">
                  <span>Service principal</span>
                  {getSortIcon('mainService')}
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('contractType')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type de contrat</span>
                  {getSortIcon('contractType')}
                </div>
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('weeklyHours')}
              >
                <div className="flex items-center space-x-1">
                  <span>H/semaine</span>
                  {getSortIcon('weeklyHours')}
                </div>
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {sortedEmployees.map((employee, index) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  {/* Checkbox de sélection */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(employee.id)}
                      onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                      className="h-4 w-4 text-hotaly-primary focus:ring-hotaly-primary border-gray-300 rounded"
                    />
                  </td>

                  {/* Nom */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.lastName}
                    </div>
                  </td>

                  {/* Prénom */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.firstName}
                    </div>
                  </td>

                  {/* Service principal */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: employee.mainService.color }}
                      />
                      <span className="text-sm text-gray-900">
                        {employee.mainService.name}
                      </span>
                    </div>
                  </td>

                  {/* Type de contrat */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {formatContractType(employee.contractType)}
                    </span>
                  </td>

                  {/* Heures par semaine */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.weeklyHours}h
                  </td>

                  {/* Statut */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(employee)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(employee)}
                        className="text-hotaly-primary hover:text-hotaly-primary-dark"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(employee)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default EmployeeTable;
