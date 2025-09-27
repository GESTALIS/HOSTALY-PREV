import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyEuroIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface PlanningValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (decision: 'accept' | 'reject', details?: any) => void;
  planningData: {
    type: 'sur-charge' | 'sous-charge';
    employee: {
      id: number;
      name: string;
      currentHours: number;
      projectedHours: number;
    };
    recommendation: {
      type: 'contract_change' | 'recruitment' | 'part_time' | 'complement';
      details: any;
    };
    impact: {
      coverage: number;
      salaryImpact: number;
      compliance: boolean;
    };
  };
}

const PlanningValidationModal: React.FC<PlanningValidationModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  planningData
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const getRecommendationTitle = () => {
    switch (planningData.recommendation.type) {
      case 'contract_change':
        return 'Changement de contrat (39h)';
      case 'recruitment':
        return 'Recrutement supplémentaire';
      case 'part_time':
        return 'Passage en temps partiel';
      case 'complement':
        return 'Complément d\'heures inter-services';
      default:
        return 'Recommandation';
    }
  };

  const getRecommendationDescription = () => {
    switch (planningData.recommendation.type) {
      case 'contract_change':
        return `Passer le contrat de ${planningData.employee.name} de 35h à 39h/semaine pour couvrir la sur-charge.`;
      case 'recruitment':
        return `Recruter ${planningData.recommendation.details.etp} ETP supplémentaire pour équilibrer la charge de travail.`;
      case 'part_time':
        return `Passer ${planningData.employee.name} en temps partiel à ${planningData.recommendation.details.targetHours}h/semaine.`;
      case 'complement':
        return `Affecter ${planningData.recommendation.details.hours}h/semaine dans le service ${planningData.recommendation.details.service}.`;
      default:
        return '';
    }
  };

  const getImpactColor = () => {
    if (planningData.impact.compliance) return 'text-green-600';
    if (planningData.impact.salaryImpact > 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getImpactIcon = () => {
    if (planningData.impact.compliance) return CheckCircleIcon;
    if (planningData.impact.salaryImpact > 0) return ExclamationTriangleIcon;
    return ExclamationTriangleIcon;
  };

  const ImpactIcon = getImpactIcon();

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
              <div className={`p-2 rounded-lg ${
                planningData.type === 'sur-charge' ? 'bg-orange-100' : 'bg-blue-100'
              }`}>
                <ExclamationTriangleIcon className={`h-6 w-6 ${
                  planningData.type === 'sur-charge' ? 'text-orange-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Validation de recommandation
                </h2>
                <p className="text-sm text-gray-600">
                  {planningData.type === 'sur-charge' ? 'Sur-charge détectée' : 'Sous-charge détectée'}
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
          <div className="p-6 space-y-6">
            {/* Employee Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5" />
                <span>Informations employé</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-sm text-gray-900">{planningData.employee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heures actuelles</label>
                  <p className="text-sm text-gray-900">{planningData.employee.currentHours}h/semaine</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heures projetées</label>
                  <p className="text-sm text-gray-900">{planningData.employee.projectedHours}h/semaine</p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Recommandation</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-blue-900">{getRecommendationTitle()}</h4>
                  <p className="text-sm text-blue-700 mt-1">{getRecommendationDescription()}</p>
                </div>
                
                {/* Options */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="option"
                      value="accept"
                      checked={selectedOption === 'accept'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-4 h-4 text-hotaly-primary border-gray-300 focus:ring-hotaly-primary"
                    />
                    <span className="text-sm text-blue-900">Accepter la recommandation</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="option"
                      value="reject"
                      checked={selectedOption === 'reject'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-4 h-4 text-hotaly-primary border-gray-300 focus:ring-hotaly-primary"
                    />
                    <span className="text-sm text-blue-900">Refuser la recommandation</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
                <ImpactIcon className={`h-5 w-5 ${getImpactColor()}`} />
                <span>Analyse d'impact</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Couverture chambres</label>
                  <p className="text-sm text-gray-900">{planningData.impact.coverage}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Impact masse salariale</label>
                  <p className={`text-sm font-medium ${getImpactColor()}`}>
                    {planningData.impact.salaryImpact > 0 ? '+' : ''}{planningData.impact.salaryImpact}€/mois
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conformité RH</label>
                  <div className="flex items-center space-x-2">
                    <ImpactIcon className={`h-4 w-4 ${getImpactColor()}`} />
                    <span className={`text-sm font-medium ${getImpactColor()}`}>
                      {planningData.impact.compliance ? 'Conforme' : 'Non conforme'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Analyse détaillée</span>
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Avant</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Heures/semaine:</span>
                              <span>{planningData.employee.currentHours}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Couverture:</span>
                              <span>85%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Coût mensuel:</span>
                              <span>2 800€</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Après</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Heures/semaine:</span>
                              <span>{planningData.employee.projectedHours}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Couverture:</span>
                              <span>{planningData.impact.coverage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Coût mensuel:</span>
                              <span>{2800 + planningData.impact.salaryImpact}€</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Résumé des changements</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Respect des règles RH (repos, pause, congés)</li>
                          <li>• Aucune heure supplémentaire planifiée</li>
                          <li>• Couverture optimale des 44 chambres</li>
                          <li>• Impact financier maîtrisé</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Statut:</span> En attente de validation
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={() => onValidate(selectedOption as 'accept' | 'reject')}
                disabled={!selectedOption}
              >
                {selectedOption === 'accept' ? 'Valider' : 'Refuser'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanningValidationModal;
