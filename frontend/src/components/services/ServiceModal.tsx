import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CogIcon,
  ClockIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface Service {
  id: number;
  name: string;
  type: string;
  color: string;
  isActive: boolean;
  schedules: Array<{
    id: number;
    season: 'BASSE' | 'HAUTE';
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isHoliday: boolean;
    isException: boolean;
  }>;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceToEdit?: Service | null;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  serviceToEdit = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'RESTAURANT',
    color: '#eca08e',
    isActive: true,
    seasonalityMode: 'SIMPLE' as 'SIMPLE' | 'DUAL'
  });

  const [schedules, setSchedules] = useState<Array<{
    season: 'BASSE' | 'HAUTE';
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isHoliday: boolean;
    isException: boolean;
  }>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' },
    { id: 7, name: 'Dimanche', short: 'Dim' }
  ];

  const serviceTypes = [
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'BAR', label: 'Bar' },
    { value: 'RECEPTION', label: 'Réception' },
    { value: 'HOUSEKEEPING', label: 'Housekeeping' },
    { value: 'TECHNIQUE', label: 'Technique' },
    { value: 'LOISIR', label: 'Loisir' },
    { value: 'CAISSE', label: 'Caisse' }
  ];

  const colors = [
    '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#F97316',
    '#EC4899', '#6B7280', '#06B6D4', '#84CC16', '#EF4444'
  ];

  // Initialiser les horaires par défaut
  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name,
        type: serviceToEdit.type,
        color: serviceToEdit.color,
        isActive: serviceToEdit.isActive,
        seasonalityMode: serviceToEdit.schedules.some(s => s.season === 'HAUTE') ? 'DUAL' : 'SIMPLE'
      });
      setSchedules(serviceToEdit.schedules);
    } else {
      // Horaires par défaut pour un nouveau service
      const defaultSchedules = daysOfWeek.map(day => ({
        season: 'BASSE' as 'BASSE' | 'HAUTE',
        dayOfWeek: day.id,
        openTime: '08:00',
        closeTime: '18:00',
        isHoliday: false,
        isException: false
      }));
      setSchedules(defaultSchedules);
    }
  }, [serviceToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleScheduleChange = (dayId: number, season: 'BASSE' | 'HAUTE', field: string, value: string | boolean) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.dayOfWeek === dayId && schedule.season === season) {
        return { ...schedule, [field]: value };
      }
      return schedule;
    }));
  };

  const addSchedule = (dayId: number, season: 'BASSE' | 'HAUTE') => {
    const newSchedule = {
      season,
      dayOfWeek: dayId,
      openTime: '08:00',
      closeTime: '18:00',
      isHoliday: false,
      isException: false
    };
    setSchedules(prev => [...prev, newSchedule]);
  };

  const removeSchedule = (dayId: number, season: 'BASSE' | 'HAUTE') => {
    setSchedules(prev => prev.filter(schedule => 
      !(schedule.dayOfWeek === dayId && schedule.season === season)
    ));
  };

  const copyDaySchedule = (fromDay: number, toDay: number, season: 'BASSE' | 'HAUTE') => {
    const sourceSchedule = schedules.find(s => s.dayOfWeek === fromDay && s.season === season);
    if (sourceSchedule) {
      setSchedules(prev => prev.map(schedule => {
        if (schedule.dayOfWeek === toDay && schedule.season === season) {
          return { ...sourceSchedule, dayOfWeek: toDay };
        }
        return schedule;
      }));
    }
  };

  const copyWeekSchedule = (fromSeason: 'BASSE' | 'HAUTE', toSeason: 'BASSE' | 'HAUTE') => {
    const sourceSchedules = schedules.filter(s => s.season === fromSeason);
    const newSchedules = sourceSchedules.map(s => ({ ...s, season: toSeason }));
    
    // Supprimer les anciens horaires de la saison de destination
    setSchedules(prev => prev.filter(s => s.season !== toSeason));
    
    // Ajouter les nouveaux horaires
    setSchedules(prev => [...prev, ...newSchedules]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = serviceToEdit 
        ? `/api/v1/rh/services/${serviceToEdit.id}`
        : '/api/v1/rh/services';
      
      const method = serviceToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          schedules: schedules
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        alert(serviceToEdit ? 'Service modifié avec succès' : 'Service créé avec succès');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde du service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'RESTAURANT',
      color: '#eca08e',
      isActive: true,
      seasonalityMode: 'SIMPLE'
    });
    setSchedules([]);
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-hotaly-primary/10 rounded-lg">
                <CogIcon className="h-6 w-6 text-hotaly-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {serviceToEdit ? 'Modifier le service' : 'Nouveau service'}
                </h2>
                <p className="text-sm text-gray-600">
                  {serviceToEdit ? 'Modifier les informations du service' : 'Créer un nouveau service'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-8">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du service *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    placeholder="Ex: Bar Hôtel"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de service *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    required
                  >
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <div className="flex space-x-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Service actif</span>
                  </label>
                </div>
              </div>

              {/* Saisonnalité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de saisonnalité
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="seasonalityMode"
                      value="SIMPLE"
                      checked={formData.seasonalityMode === 'SIMPLE'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-hotaly-primary border-gray-300 focus:ring-hotaly-primary"
                    />
                    <span className="text-sm text-gray-700">Simple (une seule grille)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="seasonalityMode"
                      value="DUAL"
                      checked={formData.seasonalityMode === 'DUAL'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-hotaly-primary border-gray-300 focus:ring-hotaly-primary"
                    />
                    <span className="text-sm text-gray-700">Dual (Basse/Haute saison)</span>
                  </label>
                </div>
              </div>

              {/* Grille horaires */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5" />
                    <span>Horaires d'ouverture</span>
                  </h3>
                  
                  {formData.seasonalityMode === 'DUAL' && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyWeekSchedule('BASSE', 'HAUTE')}
                      >
                        Copier Basse → Haute
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyWeekSchedule('HAUTE', 'BASSE')}
                      >
                        Copier Haute → Basse
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{day.name}</h4>
                        <div className="flex space-x-2">
                          {formData.seasonalityMode === 'DUAL' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyDaySchedule(1, day.id, 'BASSE')}
                            >
                              Copier Lundi
                            </Button>
                          )}
                        </div>
                      </div>

                      {formData.seasonalityMode === 'SIMPLE' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Ouverture
                            </label>
                            <input
                              type="time"
                              value={schedules.find(s => s.dayOfWeek === day.id && s.season === 'BASSE')?.openTime || '08:00'}
                              onChange={(e) => handleScheduleChange(day.id, 'BASSE', 'openTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Fermeture
                            </label>
                            <input
                              type="time"
                              value={schedules.find(s => s.dayOfWeek === day.id && s.season === 'BASSE')?.closeTime || '18:00'}
                              onChange={(e) => handleScheduleChange(day.id, 'BASSE', 'closeTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={schedules.find(s => s.dayOfWeek === day.id && s.season === 'BASSE')?.isHoliday || false}
                                onChange={(e) => handleScheduleChange(day.id, 'BASSE', 'isHoliday', e.target.checked)}
                                className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                              />
                              <span className="text-xs text-gray-600">Fermé</span>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Basse saison */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-900 mb-2">Basse saison</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Ouverture
                                </label>
                                <input
                                  type="time"
                                  value={schedules.find(s => s.dayOfWeek === day.id && s.season === 'BASSE')?.openTime || '08:00'}
                                  onChange={(e) => handleScheduleChange(day.id, 'BASSE', 'openTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Fermeture
                                </label>
                                <input
                                  type="time"
                                  value={schedules.find(s => s.dayOfWeek === day.id && s.season === 'BASSE')?.closeTime || '18:00'}
                                  onChange={(e) => handleScheduleChange(day.id, 'BASSE', 'closeTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={schedules.find(s => s.dayOfWeek === day.id && s.season === 'BASSE')?.isHoliday || false}
                                    onChange={(e) => handleScheduleChange(day.id, 'BASSE', 'isHoliday', e.target.checked)}
                                    className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                                  />
                                  <span className="text-xs text-gray-600">Fermé</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Haute saison */}
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <h5 className="text-sm font-medium text-orange-900 mb-2">Haute saison</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Ouverture
                                </label>
                                <input
                                  type="time"
                                  value={schedules.find(s => s.dayOfWeek === day.id && s.season === 'HAUTE')?.openTime || '08:00'}
                                  onChange={(e) => handleScheduleChange(day.id, 'HAUTE', 'openTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Fermeture
                                </label>
                                <input
                                  type="time"
                                  value={schedules.find(s => s.dayOfWeek === day.id && s.season === 'HAUTE')?.closeTime || '18:00'}
                                  onChange={(e) => handleScheduleChange(day.id, 'HAUTE', 'closeTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={schedules.find(s => s.dayOfWeek === day.id && s.season === 'HAUTE')?.isHoliday || false}
                                    onChange={(e) => handleScheduleChange(day.id, 'HAUTE', 'isHoliday', e.target.checked)}
                                    className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                                  />
                                  <span className="text-xs text-gray-600">Fermé</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
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
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sauvegarde...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CogIcon className="w-4 h-4" />
                    <span>{serviceToEdit ? 'Modifier le service' : 'Créer le service'}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServiceModal;
