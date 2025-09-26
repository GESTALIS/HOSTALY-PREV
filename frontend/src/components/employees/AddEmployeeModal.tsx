import React, { useState, useEffect } from 'react';
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
  employeeToEdit?: Employee | null; // Nouveau prop pour l'édition
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  contractType: string;
  weeklyHours: string;
  isActive: boolean;
  mainService: Service;
  salaryGrid: {
    level: number;
    echelon: number;
    hourlyRate: number;
  };
  polyvalentServices: Array<{
    service: Service;
  }>;
  flexibilityType?: string;
  minWeeklyHours?: number;
  maxWeeklyHours?: number;
  preferredShifts?: string[];
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  services,
  salaryGrids,
  employeeToEdit = null
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mainServiceId: '',
    contractType: '',
    weeklyHours: '',
    salaryLevel: '',
    salaryEchelon: '',
    hourlyRate: '',
    polyvalentServiceIds: [],
    isActive: true,
    flexibilityType: 'STANDARD',
    minWeeklyHours: '',
    maxWeeklyHours: '',
    preferredShifts: []
  });

  // Mettre à jour le formData quand employeeToEdit change
  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        firstName: employeeToEdit.firstName || '',
        lastName: employeeToEdit.lastName || '',
        mainServiceId: employeeToEdit.mainService?.id?.toString() || '',
        contractType: employeeToEdit.contractType || '',
        weeklyHours: employeeToEdit.weeklyHours || '',
        salaryLevel: employeeToEdit.salaryGrid?.level?.toString() || '',
        salaryEchelon: employeeToEdit.salaryGrid?.echelon?.toString() || '',
        hourlyRate: employeeToEdit.salaryGrid?.hourlyRate?.toString() || '',
        polyvalentServiceIds: employeeToEdit.polyvalentServices?.map(ps => ps.service.id) || [],
        isActive: employeeToEdit.isActive ?? true,
        flexibilityType: employeeToEdit.flexibilityType || 'STANDARD',
        minWeeklyHours: employeeToEdit.minWeeklyHours?.toString() || '',
        maxWeeklyHours: employeeToEdit.maxWeeklyHours?.toString() || '',
        preferredShifts: employeeToEdit.preferredShifts || []
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel employé
      setFormData({
        firstName: '',
        lastName: '',
        mainServiceId: '',
        contractType: '',
        weeklyHours: '',
        salaryLevel: '',
        salaryEchelon: '',
        hourlyRate: '',
        polyvalentServiceIds: [],
        isActive: true,
        flexibilityType: 'STANDARD',
        minWeeklyHours: '',
        maxWeeklyHours: '',
        preferredShifts: []
      });
    }
  }, [employeeToEdit]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
      
      // Si le service principal change, retirer ce service des polyvalences
      if (name === 'mainServiceId' && value) {
        const newMainServiceId = parseInt(value);
        newData.polyvalentServiceIds = prev.polyvalentServiceIds.filter(id => id !== newMainServiceId);
      }
      
      return newData;
    });
  };

  const handlePolyvalentServiceChange = (serviceId: number, checked: boolean) => {
    // Empêcher la sélection du service principal
    if (serviceId === parseInt(formData.mainServiceId)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      polyvalentServiceIds: checked 
        ? [...prev.polyvalentServiceIds, serviceId]
        : prev.polyvalentServiceIds.filter(id => id !== serviceId)
    }));
  };

  const handlePreferredShiftChange = (shift: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredShifts: checked 
        ? [...prev.preferredShifts, shift]
        : prev.preferredShifts.filter(s => s !== shift)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validation simple
      if (!formData.firstName || !formData.lastName || !formData.mainServiceId || 
          !formData.contractType || !formData.weeklyHours || !formData.salaryLevel || 
          !formData.salaryEchelon || !formData.hourlyRate) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation des heures min/max pour PART_TIME
      if (formData.flexibilityType === 'PART_TIME') {
        const minHours = parseInt(formData.minWeeklyHours) || 0;
        const maxHours = parseInt(formData.maxWeeklyHours) || 0;
        
        if (minHours <= 0 || maxHours <= 0) {
          alert('Les heures min et max doivent être supérieures à 0 pour le mi-temps');
          return;
        }
        
        if (minHours >= maxHours) {
          alert('Les heures min doivent être inférieures aux heures max');
          return;
        }
        
        if (maxHours > 35) {
          alert('Les heures max ne peuvent pas dépasser 35h/semaine');
          return;
        }
      }

      // Log des données avant envoi
      const payload = {
        ...formData,
        mainServiceId: parseInt(formData.mainServiceId),
        salaryLevel: parseInt(formData.salaryLevel),
        salaryEchelon: parseInt(formData.salaryEchelon),
        hourlyRate: parseFloat(formData.hourlyRate),
        weeklyHours: formData.weeklyHours,
        polyvalentServiceIds: formData.polyvalentServiceIds,
        flexibilityType: formData.flexibilityType,
        minWeeklyHours: formData.minWeeklyHours ? parseInt(formData.minWeeklyHours) : null,
        maxWeeklyHours: formData.maxWeeklyHours ? parseInt(formData.maxWeeklyHours) : null,
        preferredShifts: formData.preferredShifts
      };
      
      console.log('🔍 Données envoyées:', payload);
      console.log('🔍 Grilles disponibles:', salaryGrids);
      console.log('🔍 Services disponibles:', services);

      // Appel API pour créer ou modifier l'employé
      const url = employeeToEdit ? `/api/v1/rh/employees/${employeeToEdit.id}` : '/api/v1/rh/employees';
      const method = employeeToEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
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
          salaryLevel: '',
          salaryEchelon: '',
          hourlyRate: '',
          polyvalentServiceIds: [],
          isActive: true
        });
        onSuccess();
        onClose();
        alert(employeeToEdit ? 'Employé modifié avec succès' : 'Employé créé avec succès');
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
      salaryLevel: '',
      salaryEchelon: '',
      hourlyRate: '',
      polyvalentServiceIds: [],
      isActive: true,
      flexibilityType: 'STANDARD',
      minWeeklyHours: '',
      maxWeeklyHours: '',
      preferredShifts: []
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
                  <h2 className="text-xl font-semibold text-gray-900">
                    {employeeToEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {employeeToEdit ? 'Modifier les informations de l\'employé' : 'Ajouter un nouvel employé au système'}
                  </p>
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
                    {[
                      { id: 1, name: "PDJ" },
                      { id: 2, name: "Réception" },
                      { id: 3, name: "Housekeeping" },
                      { id: 4, name: "Bar Snack" },
                      { id: 5, name: "Loisir" },
                      { id: 6, name: "Bar Hôtel" },
                      { id: 7, name: "Technique" },
                      { id: 8, name: "Loisir Outdoor (Piscine)" },
                      { id: 9, name: "Loisir Indoor" },
                      { id: 10, name: "Caisse" }
                    ].map((service) => (
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

              {/* Heures hebdomadaires */}
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

              {/* Grille salariale - Champs séparés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Grille salariale *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Niveau
                    </label>
                    <select
                      name="salaryLevel"
                      value={formData.salaryLevel || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      required
                    >
                      <option value="">Niveau</option>
                      <option value="1">Niveau 1</option>
                      <option value="2">Niveau 2</option>
                      <option value="3">Niveau 3</option>
                      <option value="4">Niveau 4</option>
                      <option value="5">Niveau 5</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Échelon
                    </label>
                    <select
                      name="salaryEchelon"
                      value={formData.salaryEchelon || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      required
                    >
                      <option value="">Échelon</option>
                      <option value="1">Échelon 1</option>
                      <option value="2">Échelon 2</option>
                      <option value="3">Échelon 3</option>
                      <option value="4">Échelon 4</option>
                      <option value="5">Échelon 5</option>
                  </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Taux horaire (€)
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      placeholder="15.50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Services polyvalents - Services spécifiques hôteliers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Services polyvalents
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 1, name: "PDJ", color: "#F59E0B" },
                    { id: 2, name: "Réception", color: "#3B82F6" },
                    { id: 3, name: "Housekeeping", color: "#10B981" },
                    { id: 4, name: "Bar Snack", color: "#8B5CF6" },
                    { id: 5, name: "Loisir", color: "#F97316" },
                    { id: 6, name: "Bar Hôtel", color: "#EC4899" },
                    { id: 7, name: "Technique", color: "#6B7280" },
                    { id: 8, name: "Loisir Outdoor (Piscine)", color: "#06B6D4" },
                    { id: 9, name: "Loisir Indoor", color: "#84CC16" },
                    { id: 10, name: "Caisse", color: "#EF4444" }
                  ].map((service) => {
                    // Vérifier si ce service est le service principal
                    const isMainService = service.id === parseInt(formData.mainServiceId);
                    
                    return (
                    <div key={service.id} className={`flex items-center space-x-2 p-2 rounded-lg border ${
                      isMainService 
                        ? 'bg-gray-100 border-gray-200 opacity-60' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}>
                      <input
                        type="checkbox"
                        id={`polyvalent-${service.id}`}
                        checked={formData.polyvalentServiceIds.includes(service.id)}
                        onChange={(e) => handlePolyvalentServiceChange(service.id, e.target.checked)}
                        disabled={isMainService}
                        className={`w-4 h-4 rounded focus:ring-hotaly-primary ${
                          isMainService 
                            ? 'text-gray-300 border-gray-300 cursor-not-allowed' 
                            : 'text-hotaly-primary border-gray-300'
                        }`}
                      />
                      <label 
                        htmlFor={`polyvalent-${service.id}`}
                        className={`text-sm font-medium cursor-pointer ${
                          isMainService 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              isMainService ? 'opacity-50' : ''
                            }`}
                            style={{ backgroundColor: service.color }}
                          />
                          <span className={isMainService ? 'line-through' : ''}>
                            {service.name}
                          </span>
                          {isMainService && (
                            <span className="text-xs text-gray-500 ml-1">
                              (Service principal)
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sélectionnez les services supplémentaires dans lesquels cet employé peut travailler
                </p>
              </div>

              {/* Flexibilité des horaires */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Flexibilité des horaires</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de flexibilité *
                  </label>
                  <select
                    name="flexibilityType"
                    value={formData.flexibilityType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    required
                  >
                    <option value="STANDARD">Standard (temps plein, heures fixes)</option>
                    <option value="PART_TIME">Mi-temps possible (heures réduites)</option>
                  </select>
                </div>

                {formData.flexibilityType === 'PART_TIME' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heures min/semaine
                      </label>
                      <input
                        name="minWeeklyHours"
                        value={formData.minWeeklyHours}
                        onChange={handleInputChange}
                        type="number"
                        min="0"
                        max="35"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                        placeholder="Ex: 20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heures max/semaine
                      </label>
                      <input
                        name="maxWeeklyHours"
                        value={formData.maxWeeklyHours}
                        onChange={handleInputChange}
                        type="number"
                        min="0"
                        max="35"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                        placeholder="Ex: 35"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Créneaux préférés
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'matin', label: 'Matin', icon: '🌅' },
                      { value: 'soir', label: 'Soir', icon: '🌆' },
                      { value: 'weekend', label: 'Week-end', icon: '📅' },
                      { value: 'nuit', label: 'Nuit', icon: '🌙' }
                    ].map(shift => (
                      <label key={shift.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferredShifts.includes(shift.value)}
                          onChange={(e) => handlePreferredShiftChange(shift.value, e.target.checked)}
                          className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                        />
                        <span className="text-sm">{shift.icon} {shift.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Indiquez les créneaux où cet employé préfère travailler
                  </p>
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
                      <span>{employeeToEdit ? 'Modifier l\'employé' : 'Créer l\'employé'}</span>
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
