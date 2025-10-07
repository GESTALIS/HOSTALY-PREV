import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  HomeIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface HousekeepingExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  realData: {
    totalRooms: number;
    roomTypes: Array<{ type: string; count: number; cleaningTime: number }>;
    totalCleaningTime: number;
    dailyCleaningHours: number;
    employees: Array<{ name: string; weeklyHours: number; workingDays: number[]; startTime: string; endTime: string }>;
    annualLeaveDays: number;
    restDaysPerWeek: number;
    actualWorkingDaysPerYear: number;
    actualWorkingHoursPerYear: number;
  };
}

const HousekeepingExplanationModal: React.FC<HousekeepingExplanationModalProps> = ({
  isOpen,
  onClose,
  realData
}) => {
  if (!isOpen) return null;

  const getWorkingDaysText = (workingDays: number[]) => {
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return workingDays.map(day => dayNames[day - 1]).join(', ');
  };

  const getRestDaysText = (workingDays: number[]) => {
    const allDays = [1, 2, 3, 4, 5, 6, 7];
    const restDays = allDays.filter(day => !workingDays.includes(day));
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return restDays.map(day => dayNames[day - 1]).join(', ');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <InformationCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Explication du calcul Housekeeping
                </h2>
                <p className="text-sm text-gray-600">
                  Comment le planning est construit avec les données réelles
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Introduction */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Principe fondamental</span>
              </div>
              <p className="text-blue-700 text-sm">
                Le planning du Housekeeping se base directement sur le besoin réel en chambres à nettoyer, 
                et non sur le nombre d'employées disponibles. Le système calcule d'abord la charge de travail, 
                puis détermine le nombre d'employées nécessaires.
              </p>
            </div>

            {/* 1. Paramètres pris en compte */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <HomeIcon className="h-5 w-5" />
                <span>1. Paramètres pris en compte</span>
              </h3>
              
              <div className="space-y-4">
                {/* Configuration des chambres */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Configuration des chambres</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total des chambres</label>
                      <p className="text-lg font-bold text-gray-900">{realData.totalRooms} chambres</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Temps total de nettoyage</label>
                      <p className="text-lg font-bold text-gray-900">{realData.totalCleaningTime} min/jour</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Détail par type de chambre</label>
                    <div className="space-y-2">
                      {realData.roomTypes.map((room, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm text-gray-900">{room.count} {room.type}</span>
                          <span className="text-sm font-medium text-gray-900">{room.cleaningTime} min/chambre</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Paramètres RH */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Paramètres RH</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Durée de travail</label>
                      <p className="text-sm text-gray-900">7 heures par jour, 35 heures par semaine</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Congés annuels</label>
                      <p className="text-sm text-gray-900">{realData.annualLeaveDays} jours par an</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jours de repos</label>
                      <p className="text-sm text-gray-900">{realData.restDaysPerWeek} jours par semaine</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jours travaillés par an</label>
                      <p className="text-sm text-gray-900">{realData.actualWorkingDaysPerYear} jours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Calcul du besoin */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>2. Calcul du besoin</span>
              </h3>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Charge totale par jour</label>
                    <p className="text-lg font-bold text-orange-600">{realData.dailyCleaningHours.toFixed(1)} heures</p>
                    <p className="text-xs text-gray-600">
                      = {realData.totalCleaningTime} minutes ÷ 60 = {realData.dailyCleaningHours.toFixed(1)}h
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre d'employées nécessaires</label>
                    <p className="text-lg font-bold text-orange-600">{Math.ceil(realData.dailyCleaningHours / 7)} employées</p>
                    <p className="text-xs text-gray-600">
                      = {realData.dailyCleaningHours.toFixed(1)}h ÷ 7h/employée = {Math.ceil(realData.dailyCleaningHours / 7)} employées
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Répartition des employées */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5" />
                <span>3. Répartition des employées</span>
              </h3>
              
              <div className="space-y-4">
                {realData.employees.map((employee, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">{employee.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Horaires</label>
                        <p className="text-sm text-gray-900">{employee.startTime} - {employee.endTime}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Heures par semaine</label>
                        <p className="text-sm text-gray-900">{employee.weeklyHours}h</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Jours de travail</label>
                        <p className="text-sm text-gray-900">{getWorkingDaysText(employee.workingDays)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Jours de repos</label>
                        <p className="text-sm text-gray-900">{getRestDaysText(employee.workingDays)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Vision annuelle */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>4. Vision annuelle</span>
              </h3>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacité annuelle par employée</label>
                    <p className="text-lg font-bold text-purple-600">{Math.round(realData.actualWorkingHoursPerYear)}h/an</p>
                    <p className="text-xs text-gray-600">
                      = {realData.actualWorkingDaysPerYear} jours × (35h ÷ 5 jours) = {Math.round(realData.actualWorkingHoursPerYear)}h
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Besoin annuel total</label>
                    <p className="text-lg font-bold text-purple-600">{Math.round(realData.dailyCleaningHours * 365)}h/an</p>
                    <p className="text-xs text-gray-600">
                      = {realData.dailyCleaningHours.toFixed(1)}h/jour × 365 jours = {Math.round(realData.dailyCleaningHours * 365)}h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Transparence */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <InformationCircleIcon className="h-5 w-5" />
                <span>5. Transparence</span>
              </h3>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-700 text-sm mb-3">
                  Chaque recommandation ou alerte est justifiée avec le détail du calcul. 
                  Le système détecte automatiquement les écarts et propose des solutions concrètes.
                </p>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    <strong>Exemple de recommandation :</strong> "Déficit de couverture détecté. 
                    L'équipe actuelle ne peut couvrir que {Math.round(realData.employees.length * realData.actualWorkingHoursPerYear)}h/an 
                    alors que le besoin est de {Math.round(realData.dailyCleaningHours * 365)}h/an."
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <strong>Solution proposée :</strong> "Recruter {Math.ceil((realData.dailyCleaningHours * 365 - realData.employees.length * realData.actualWorkingHoursPerYear) / realData.actualWorkingHoursPerYear)} employé(s) supplémentaire(s)."
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
            <Button variant="primary" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HousekeepingExplanationModal;
