import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  UserIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Service {
  id: number;
  name: string;
  color: string;
}

interface SalaryGrid {
  id: number;
  level: number;
  echelon: number;
  hourlyRate: number;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  services: Service[];
  salaryGrids: SalaryGrid[];
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  services,
  salaryGrids
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mainServiceId: '',
    contractType: '',
    weeklyHours: '',
    salaryGridId: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validation simple
      if (!formData.firstName || !formData.lastName || !formData.mainServiceId || 
          !formData.contractType || !formData.weeklyHours || !formData.salaryGridId) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Log des données avant envoi
      const payload = {
        ...formData,
        mainServiceId: parseInt(formData.mainServiceId),
        salaryGridId: parseInt(formData.salaryGridId),
        weeklyHours: formData.weeklyHours
      };
      
      console.log('🔍 Données envoyées:', payload);
      console.log('🔍 Grilles disponibles:', salaryGrids);
      console.log('🔍 Services disponibles:', services);

      // Appel API pour créer l'employé
      const response = await fetch('/api/v1/rh/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('🔍 Réponse API:', response.status, response.statusText);
      
      if (response.ok) {
        setFormData({
          firstName: '',
          lastName: '',
          mainServiceId: '',
          contractType: '',
          weeklyHours: '',
          salaryGridId: '',
          isActive: true
        });
        onSuccess();
        onClose();
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'employé');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      mainServiceId: '',
      contractType: '',
      weeklyHours: '',
      salaryGridId: '',
      isActive: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card variant="elevated" className="relative">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-hotaly-primary rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Nouvel employé</h2>
                  <p className="text-sm text-gray-600">Ajouter un nouvel employé au système</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    placeholder="Prénom de l'employé"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    placeholder="Nom de l'employé"
                    required
                  />
                </div>
              </div>

              {/* Service principal et type de contrat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service principal *
                  </label>
                  <select
                    name="mainServiceId"
                    value={formData.mainServiceId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat *
                  </label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="SAISONNIER">Saisonnier</option>
                    <option value="MI_TEMPS">Mi-temps</option>
                    <option value="EXTRA">Extra</option>
                  </select>
                </div>
              </div>

              {/* Heures hebdomadaires et grille salariale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures hebdomadaires *
                  </label>
                  <select
                    name="weeklyHours"
                    value={formData.weeklyHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner les heures</option>
                    <option value="H35">35h (Temps plein standard)</option>
                    <option value="H39">39h (Temps plein étendu)</option>
                    <option value="H35_MODULABLE">35h modulable</option>
                    <option value="H39_MODULABLE">39h modulable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grille salariale *
                  </label>
                  <select
                    name="salaryGridId"
                    value={formData.salaryGridId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner une grille</option>
                    {salaryGrids.map((grid) => (
                      <option key={grid.id} value={grid.id}>
                        Niveau {grid.level} - Échelon {grid.echelon} ({grid.hourlyRate}€/h)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Statut actif */}
              <div className="flex items-center space-x-3">
                <input
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Employé actif
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Création...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4" />
                      <span>Créer l'employé</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEmployeeModal;
