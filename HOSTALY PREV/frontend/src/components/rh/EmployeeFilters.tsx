import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface EmployeeFiltersProps {
  onFiltersChange: (filters: EmployeeFilters) => void;
  services: Array<{ id: string; name: string; color: string }>;
}

export interface EmployeeFilters {
  search: string;
  serviceId: string;
  contractType: string;
  status: string;
  polyvalence: string;
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({ onFiltersChange, services }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    serviceId: '',
    contractType: '',
    status: '',
    polyvalence: ''
  });

  const contractTypes = [
    { value: '', label: 'Tous les contrats' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Interim', label: 'Intérim' },
    { value: 'Stage', label: 'Stage' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];

  const polyvalenceOptions = [
    { value: '', label: 'Toutes les polyvalences' },
    { value: 'yes', label: 'Polyvalent' },
    { value: 'no', label: 'Non polyvalent' }
  ];

  const handleFilterChange = (key: keyof EmployeeFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      serviceId: '',
      contractType: '',
      status: '',
      polyvalence: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card className="mb-6">
      <div className="p-4">
        {/* Header des filtres */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-hotaly-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 text-xs font-medium bg-hotaly-secondary text-white rounded-full">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>{isExpanded ? 'Réduire' : 'Étendre'}</span>
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>

        {/* Barre de recherche principale */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un employé (nom, prénom, service)..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-hotaly-primary focus:border-hotaly-primary sm:text-sm"
          />
        </div>

        {/* Filtres étendus */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtre par service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service
                  </label>
                  <select
                    value={filters.serviceId}
                    onChange={(e) => handleFilterChange('serviceId', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-hotaly-primary focus:border-hotaly-primary sm:text-sm"
                  >
                    <option value="">Tous les services</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre par type de contrat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat
                  </label>
                  <select
                    value={filters.contractType}
                    onChange={(e) => handleFilterChange('contractType', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-hotaly-primary focus:border-hotaly-primary sm:text-sm"
                  >
                    {contractTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre par statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-hotaly-primary focus:border-hotaly-primary sm:text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre par polyvalence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Polyvalence
                  </label>
                  <select
                    value={filters.polyvalence}
                    onChange={(e) => handleFilterChange('polyvalence', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-hotaly-primary focus:border-hotaly-primary sm:text-sm"
                  >
                    {polyvalenceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions des filtres */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  Appliquer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default EmployeeFilters;
