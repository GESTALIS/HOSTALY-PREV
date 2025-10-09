import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CogIcon,
  LightBulbIcon,
  HandRaisedIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PlanningHebdomadaire from './PlanningHebdomadaire';
import GestionConges from './GestionConges';
import AlertesConformite from './AlertesConformite';
import api from '../../lib/api';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  contractType: string;
  weeklyHours: string;
  isActive: boolean;
  mainService: {
    id: number;
    name: string;
    color: string;
  };
  salaryGrid: {
    level: number;
    echelon: number;
    hourlyRate: number;
  };
  polyvalentServices: Array<{
    service: {
      id: number;
      name: string;
      color?: string;
    };
  }>;
  flexibilityType?: string;
  minWeeklyHours?: number;
  maxWeeklyHours?: number;
  preferredShifts?: string[];
}

interface Service {
  id: number;
  name: string;
  type: string;
  color: string;
  isActive: boolean;
  schedules?: any[];
  _count?: {
    employees: number;
  };
}

interface PlanningSlot {
  id: string;
  employeeId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  isConfirmed: boolean;
}

interface WeeklyPlanning {
  weekStart: string;
  slots: PlanningSlot[];
  totalHours: { [employeeId: number]: number };
  recommendations: any[];
}

type PlanningMode = 'recommendations' | 'manual' | 'leaves';
type ViewMode = 'week' | 'month';
type Season = 'HAUTE' | 'BASSE';

const PlanningManager: React.FC = () => {
  const [mode, setMode] = useState<PlanningMode>('recommendations');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [season, setSeason] = useState<Season>('BASSE');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [planning, setPlanning] = useState<WeeklyPlanning | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les employés et services
      const [employeesRes, servicesRes] = await Promise.all([
        api.get('/rh/employees'),
        api.get('/rh/services')
      ]);
      
      setEmployees(employeesRes.data);
      setServices(servicesRes.data);
      
      // Charger le planning de la semaine courante
      await loadWeeklyPlanning(selectedWeek);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les données de planning');
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyPlanning = async (weekStart: Date) => {
    try {
      // Pour l'instant, créer un planning vide
      // TODO: Appeler l'API de planning quand elle sera disponible
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const mockPlanning: WeeklyPlanning = {
        weekStart: weekStartStr,
        slots: [],
        totalHours: {},
        recommendations: []
      };
      
      setPlanning(mockPlanning);
    } catch (error) {
      console.error('Erreur lors du chargement du planning:', error);
    }
  };

  const generateRecommendations = async () => {
    try {
      // TODO: Appeler l'API de recommandations
      const mockRecommendations = [
        {
          type: 'OPTIMIZATION',
          title: 'Optimiser les horaires de Marie Dupont',
          description: 'Marie peut travailler 2h de plus sur Réception (il lui reste 5h cette semaine)',
          employeeId: 1,
          serviceId: 1,
          potentialSavings: 150,
          action: 'ADD_HOURS'
        },
        {
          type: 'ALERT',
          title: 'Jean Martin dépasse les 35h',
          description: 'Jean a déjà 38h cette semaine, réduire ses heures',
          employeeId: 2,
          serviceId: 2,
          action: 'REDUCE_HOURS'
        }
      ];
      
      if (planning) {
        setPlanning({
          ...planning,
          recommendations: mockRecommendations
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    }
  };

  const applyRecommendation = (recommendation: any) => {
    // TODO: Appliquer la recommandation au planning
    console.log('Appliquer recommandation:', recommendation);
  };

  const getEmployeeHours = (employeeId: number): number => {
    return planning?.totalHours[employeeId] || 0;
  };

  const getEmployeeStatus = (employeeId: number) => {
    const hours = getEmployeeHours(employeeId);
    const employee = employees.find(e => e.id === employeeId);
    const weeklyHours = employee?.weeklyHours === 'H35' ? 35 : 39;
    
    if (hours >= weeklyHours) {
      return { status: 'complete', color: 'green', text: `${hours}h (Complet)` };
    } else if (hours >= weeklyHours * 0.8) {
      return { status: 'almost', color: 'yellow', text: `${hours}h (Presque)` };
    } else {
      return { status: 'low', color: 'red', text: `${hours}h (Faible)` };
    }
  };

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
        <Button onClick={loadData} variant="primary">
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
            <CalendarIcon className="h-8 w-8 text-hotaly-primary" />
            <span>Planning Intelligent</span>
          </h2>
          <p className="text-gray-600">
            Gestion des plannings avec recommandations IA et mode manuel
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Saison:</span>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-hotaly-primary"
            >
              <option value="BASSE">Basse Saison</option>
              <option value="HAUTE">Haute Saison</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Vue:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-hotaly-primary"
            >
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <Card variant="elevated">
        <div className="p-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('recommendations')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                mode === 'recommendations'
                  ? 'bg-white text-hotaly-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LightBulbIcon className="h-5 w-5" />
              <span className="font-medium">Recommandations IA</span>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                mode === 'manual'
                  ? 'bg-white text-hotaly-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HandRaisedIcon className="h-5 w-5" />
              <span className="font-medium">Mode Manuel</span>
            </button>
            <button
              onClick={() => setMode('leaves')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                mode === 'leaves'
                  ? 'bg-white text-hotaly-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="font-medium">Congés Payés</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Alertes de conformité (toujours affichées) */}
      <AlertesConformite employees={employees} planning={planning} />

      {/* Mode Content */}
      <AnimatePresence mode="wait">
        {mode === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Actions */}
            <Card variant="elevated">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={generateRecommendations}
                      variant="primary"
                      className="flex items-center space-x-2"
                    >
                      <LightBulbIcon className="h-5 w-5" />
                      <span>Générer les recommandations</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => loadWeeklyPlanning(selectedWeek)}
                    >
                      Actualiser
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {planning?.recommendations.length || 0} recommandations disponibles
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommandations */}
            {planning?.recommendations.length > 0 && (
              <div className="space-y-4">
                {planning.recommendations.map((rec, index) => (
                  <Card key={index} variant="elevated" className="border-l-4 border-blue-500">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
                            <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {rec.type}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{rec.description}</p>
                          {rec.potentialSavings && (
                            <div className="text-sm text-green-600 font-medium">
                              Économie potentielle: {rec.potentialSavings}€
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => applyRecommendation(rec)}
                            variant="primary"
                            size="sm"
                          >
                            Appliquer
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Aucune recommandation */}
            {(!planning?.recommendations || planning.recommendations.length === 0) && (
              <Card variant="elevated">
                <div className="text-center py-8">
                  <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune recommandation</h3>
                  <p className="text-gray-600 mb-4">
                    Cliquez sur "Générer les recommandations" pour analyser le planning
                  </p>
                  <Button onClick={generateRecommendations} variant="primary">
                    Générer les recommandations
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {mode === 'manual' && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <PlanningHebdomadaire
              employees={employees}
              services={services}
              planning={planning}
              onPlanningChange={setPlanning}
              season={season}
            />
          </motion.div>
        )}

        {mode === 'leaves' && (
          <motion.div
            key="leaves"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <GestionConges
              employees={employees}
              onLeaveAdded={loadData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résumé des employés */}
      <Card variant="elevated">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État des employés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.slice(0, 6).map(employee => {
              const status = getEmployeeStatus(employee.id);
              return (
                <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status.color === 'green' ? 'bg-green-100 text-green-800' :
                      status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status.text}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Service: {employee.mainService.name}</div>
                    <div>Contrat: {employee.contractType}</div>
                    {employee.polyvalentServices.length > 0 && (
                      <div>Polyvalent: {employee.polyvalentServices.length} service(s)</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlanningManager;
