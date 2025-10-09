import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LightBulbIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CogIcon,
  InformationCircleIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../lib/api';

interface Recommendation {
  type: 'ECONOMY' | 'OPTIMIZATION' | 'ALERT' | 'RECRUITMENT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  serviceId: number;
  serviceName: string;
  potentialSavings?: number;
  impact: string;
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  constraints: string[];
  implementation: string;
  employees?: Array<{
    id: number;
    name: string;
    currentHours?: number;
    minHours?: number;
    maxHours?: number;
  }>;
}

interface PlanningAnalysis {
  currentSeason: string;
  currentDate: string;
  recommendations: Recommendation[];
  summary: {
    totalServices: number;
    totalEmployees: number;
    totalRecommendations: number;
    potentialSavings: number;
  };
}

interface ServiceAnalysis {
  service: {
    id: number;
    name: string;
    type: string;
  };
  season: string;
  employees: {
    total: number;
    active: number;
    polyvalent: number;
  };
  schedules: any[];
  analysis: {
    openingHours: { recommendations: Recommendation[] };
    polyvalence: { recommendations: Recommendation[] };
    workingHours: { recommendations: Recommendation[] };
    seasonal: { recommendations: Recommendation[] };
  };
}

const PlanningIntelligent: React.FC = () => {
  const [analysis, setAnalysis] = useState<PlanningAnalysis | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  useEffect(() => {
    loadPlanningAnalysis();
  }, []);

  const loadPlanningAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/planning/recommendations');
      setAnalysis(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'analyse:', error);
      // Données mock temporaires pour tester en local
      setAnalysis({
        currentSeason: 'BASSE',
        currentDate: new Date().toISOString(),
        recommendations: [
          {
            type: 'ECONOMY',
            priority: 'HIGH',
            title: 'Fermer plus tôt pendant la basse saison',
            description: 'Service Réception: fermer à 22:00 au lieu de 24:00 pendant la basse saison',
            serviceId: 1,
            serviceName: 'Réception',
            potentialSavings: 1200,
            impact: 'Réduction de 2h d\'ouverture = économie d\'1 poste',
            feasibility: 'HIGH',
            constraints: ['Respecter les 8h minimum d\'ouverture'],
            implementation: 'Modifier les horaires dans ServiceSchedule'
          },
          {
            type: 'ALERT',
            priority: 'MEDIUM',
            title: 'Employés sous-employés',
            description: '2 employés n\'atteignent pas le minimum de 20h/semaine',
            serviceId: 2,
            serviceName: 'Restauration',
            impact: 'Risque de démotivation et turnover',
            feasibility: 'MEDIUM',
            constraints: ['Besoin de plus d\'heures disponibles'],
            implementation: 'Augmenter les créneaux ou redistribuer les heures',
            employees: [
              { id: 1, name: 'Marie Dupont', currentHours: 15, minHours: 20 },
              { id: 2, name: 'Jean Martin', currentHours: 18, minHours: 20 }
            ]
          }
        ],
        summary: {
          totalServices: 3,
          totalEmployees: 12,
          totalRecommendations: 2,
          potentialSavings: 1200
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServiceAnalysis = async (serviceId: number) => {
    try {
      const response = await api.get(`/planning/analysis/${serviceId}`);
      setSelectedService(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'analyse du service:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ECONOMY': return <ArrowTrendingDownIcon className="h-5 w-5 text-green-500" />;
      case 'OPTIMIZATION': return <CogIcon className="h-5 w-5 text-blue-500" />;
      case 'ALERT': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'RECRUITMENT': return <UsersIcon className="h-5 w-5 text-purple-500" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ECONOMY': return 'bg-green-50 border-green-200 text-green-800';
      case 'OPTIMIZATION': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'ALERT': return 'bg-red-50 border-red-200 text-red-800';
      case 'RECRUITMENT': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'HIGH': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRecommendations = analysis?.recommendations.filter(rec => {
    const typeMatch = filter === 'ALL' || rec.type === filter;
    const priorityMatch = priorityFilter === 'ALL' || rec.priority === priorityFilter;
    return typeMatch && priorityMatch;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotaly-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadPlanningAnalysis} variant="primary">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <LightBulbIcon className="h-8 w-8 text-hotaly-primary" />
            <span>Planning Intelligent</span>
          </h2>
          <p className="text-gray-600">
            Recommandations basées sur l'analyse des données RH et la saisonnalité
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            analysis?.currentSeason === 'HAUTE' 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {analysis?.currentSeason === 'HAUTE' ? 'Haute Saison' : 'Basse Saison'}
          </div>
          <Button onClick={loadPlanningAnalysis} variant="secondary">
            Actualiser
          </Button>
        </div>
      </div>

      {/* Résumé */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="elevated">
            <div className="p-4 text-center">
              <ChartBarIcon className="h-8 w-8 text-hotaly-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysis.summary.totalServices}</div>
              <div className="text-sm text-gray-600">Services</div>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <UsersIcon className="h-8 w-8 text-hotaly-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysis.summary.totalEmployees}</div>
              <div className="text-sm text-gray-600">Employés</div>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <LightBulbIcon className="h-8 w-8 text-hotaly-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analysis.summary.totalRecommendations}</div>
              <div className="text-sm text-gray-600">Recommandations</div>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <CurrencyEuroIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {analysis.summary.potentialSavings.toFixed(0)}€
              </div>
              <div className="text-sm text-gray-600">Économies potentielles</div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card variant="elevated">
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
              >
                <option value="ALL">Tous</option>
                <option value="ECONOMY">Économies</option>
                <option value="OPTIMIZATION">Optimisations</option>
                <option value="ALERT">Alertes</option>
                <option value="RECRUITMENT">Recrutement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
              >
                <option value="ALL">Toutes</option>
                <option value="HIGH">Haute</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="LOW">Basse</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommandations */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={`${recommendation.serviceId}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className={`border-l-4 ${getTypeColor(recommendation.type).split(' ')[0]} ${getTypeColor(recommendation.type).split(' ')[1]}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getTypeIcon(recommendation.type)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recommendation.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeasibilityColor(recommendation.feasibility)}`}>
                          {recommendation.feasibility}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{recommendation.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Impact</h4>
                          <p className="text-sm text-gray-600">{recommendation.impact}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Implémentation</h4>
                          <p className="text-sm text-gray-600">{recommendation.implementation}</p>
                        </div>
                      </div>

                      {recommendation.potentialSavings && (
                        <div className="bg-green-50 p-3 rounded-lg mb-4">
                          <div className="flex items-center space-x-2">
                            <CurrencyEuroIcon className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">
                              Économie potentielle: {recommendation.potentialSavings.toFixed(0)}€/mois
                            </span>
                          </div>
                        </div>
                      )}

                      {recommendation.employees && recommendation.employees.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Employés concernés</h4>
                          <div className="space-y-1">
                            {recommendation.employees.map(emp => (
                              <div key={emp.id} className="text-sm text-gray-600">
                                {emp.name} {emp.currentHours && (
                                  <span className="text-gray-500">
                                    ({emp.currentHours}h/semaine)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {recommendation.constraints.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Contraintes</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {recommendation.constraints.map((constraint, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                                <span>{constraint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadServiceAnalysis(recommendation.serviceId)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Analyser
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRecommendations.length === 0 && (
          <Card variant="elevated">
            <div className="text-center py-8">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune recommandation</h3>
              <p className="text-gray-600">
                Aucune recommandation ne correspond aux filtres sélectionnés.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Analyse détaillée du service */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Analyse détaillée - {selectedService.service.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Employés</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div>Total: {selectedService.employees.total}</div>
                    <div>Actifs: {selectedService.employees.active}</div>
                    <div>Polyvalents: {selectedService.employees.polyvalent}</div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Saison</h4>
                  <div className="text-sm text-green-700">
                    {selectedService.season === 'HAUTE' ? 'Haute saison' : 'Basse saison'}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Recommandations</h4>
                  <div className="text-sm text-purple-700">
                    {selectedService.analysis.openingHours.recommendations.length + 
                     selectedService.analysis.polyvalence.recommendations.length +
                     selectedService.analysis.workingHours.recommendations.length +
                     selectedService.analysis.seasonal.recommendations.length} total
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default PlanningIntelligent;
