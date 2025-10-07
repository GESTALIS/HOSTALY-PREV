import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface EmployeeActionsProps {
  onAddEmployee: () => void;
  onImportExcel: (file: File) => void;
  onExportExcel: () => void;
  onBulkDelete: () => void;
  selectedCount: number;
  totalCount: number;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({
  onAddEmployee,
  onImportExcel,
  onExportExcel,
  onBulkDelete,
  selectedCount,
  totalCount
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImporting(true);
      onImportExcel(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsImporting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Informations et bouton d'ajout */}
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gestion des Employés
              </h3>
              <p className="text-sm text-gray-600">
                {totalCount} employé{totalCount > 1 ? 's' : ''} au total
                {selectedCount > 0 && ` • ${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Bouton d'ajout principal */}
          <Button
            variant="primary"
            size="lg"
            onClick={onAddEmployee}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Ajouter un employé</span>
          </Button>
        </div>

        {/* Actions secondaires */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            {/* Import Excel */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                disabled={isImporting}
                className="flex items-center space-x-2"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                <span>{isImporting ? 'Import...' : 'Importer Excel'}</span>
              </Button>
            </div>

            {/* Export Excel */}
            <Button
              variant="outline"
              size="sm"
              onClick={onExportExcel}
              className="flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Exporter Excel</span>
            </Button>

            {/* Suppression en masse */}
            {selectedCount > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={onBulkDelete}
                className="flex items-center space-x-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Supprimer ({selectedCount})</span>
              </Button>
            )}
          </div>

          {/* Informations sur l'import/export */}
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <DocumentArrowUpIcon className="h-3 w-3" />
                <span>Import : .xlsx, .xls (max 5MB)</span>
              </div>
              <div className="flex items-center space-x-1">
                <DocumentArrowDownIcon className="h-3 w-3" />
                <span>Export : Tous les employés avec filtres appliqués</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeActions;
