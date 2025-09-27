import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  ClockIcon,
  UserGroupIcon,
  CalculatorIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PlanningValidationModal from './PlanningValidationModal';
import api from '../../lib/api';

interface RoomType {
  type: string;
  count: number;
  cleaningTime: number; // en minutes
}

interface HousekeepingConfig {
  totalRooms: number;
  roomTypes: RoomType[];
  totalCleaningTime: number;
  staffRequired: number;
  workingHoursPerStaff: number; // 7 heures = 420 minutes
  safetyMargin: number; // marge de sécurité en %
  // Nouveaux paramètres RH réalistes
  weeklyHours: number; // heures par semaine (défaut: 35)
  restDaysPerWeek: number; // jours de repos par semaine (défaut: 2)
  annualLeaveDays: number; // jours de congés annuels (défaut: 30)
}

interface StaffCalculation {
  totalCleaningTime: number;
  workingHoursPerStaff: number;
  minimumStaff: number;
  recommendedStaff: number;
  withSafetyMargin: number;
  efficiency: number; // pourcentage
  // Nouveaux calculs RH réalistes
  actualWorkingDaysPerYear: number;
  actualWorkingHoursPerYear: number;
  dailyCleaningHours: number;
  realCapacityPerStaff: number;
}

const HousekeepingModule: React.FC = () => {
  const [config, setConfig] = useState<HousekeepingConfig>({
    totalRooms: 44,
    roomTypes: [
      { type: 'Suite', count: 2, cleaningTime: 45 },
      { type: 'Double', count: 30, cleaningTime: 25 },
      { type: 'Family', count: 12, cleaningTime: 35 }
    ],
    totalCleaningTime: 1260,
    staffRequired: 3,
    workingHoursPerStaff: 420, // 7 heures en minutes
    safetyMargin: 20, // 20% de marge de sécurité
    // Nouveaux paramètres RH réalistes
    weeklyHours: 35, // heures par semaine
    restDaysPerWeek: 2, // jours de repos par semaine
    annualLeaveDays: 30 // jours de congés annuels
  });

  const [calculation, setCalculation] = useState<StaffCalculation>({
    totalCleaningTime: 1260,
    workingHoursPerStaff: 420,
    minimumStaff: 3,
    recommendedStaff: 4,
    withSafetyMargin: 4,
    efficiency: 100,
    // Nouveaux calculs RH réalistes
    actualWorkingDaysPerYear: 0,
    actualWorkingHoursPerYear: 0,
    dailyCleaningHours: 0,
    realCapacityPerStaff: 0
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [activePlanningTab, setActivePlanningTab] = useState('proposed');
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [newRoomType, setNewRoomType] = useState({ type: '', count: 0, cleaningTime: 30 });
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

  useEffect(() => {
    calculateStaff();
  }, [config.roomTypes, config.workingHoursPerStaff, config.safetyMargin]);

  // Recalculer quand les roomTypes changent
  useEffect(() => {
    calculateStaff();
  }, [config.roomTypes]);

  const calculateStaff = () => {
    const totalCleaningTime = config.roomTypes.reduce((total, room) => {
      return total + (room.count * room.cleaningTime);
    }, 0);

    const totalRooms = config.roomTypes.reduce((total, room) => {
      return total + room.count;
    }, 0);

    // Calculs RH réalistes
    const daysPerYear = 365;
    const restDaysPerYear = config.restDaysPerWeek * 52; // 52 semaines
    const actualWorkingDaysPerYear = daysPerYear - restDaysPerYear - config.annualLeaveDays;
    const actualWorkingHoursPerYear = actualWorkingDaysPerYear * (config.weeklyHours / 5); // 5 jours de travail par semaine
    const dailyCleaningHours = totalCleaningTime / 60; // conversion minutes en heures
    const realCapacityPerStaff = actualWorkingHoursPerYear;

    // Calcul du personnel basé sur la capacité réelle
    const workingHoursPerStaff = config.workingHoursPerStaff / 60; // conversion en heures
    const minimumStaff = Math.ceil(dailyCleaningHours / (realCapacityPerStaff / 365)); // heures par jour / capacité par jour
    const safetyMargin = Math.ceil(minimumStaff * (config.safetyMargin / 100));
    const recommendedStaff = minimumStaff + safetyMargin;
    const efficiency = Math.round((dailyCleaningHours / (recommendedStaff * (realCapacityPerStaff / 365))) * 100);

    setCalculation({
      totalCleaningTime,
      workingHoursPerStaff,
      minimumStaff,
      recommendedStaff,
      withSafetyMargin: recommendedStaff,
      efficiency,
      // Nouveaux calculs RH réalistes
      actualWorkingDaysPerYear,
      actualWorkingHoursPerYear,
      dailyCleaningHours,
      realCapacityPerStaff
    });

    setConfig(prev => ({
      ...prev,
      totalRooms,
      totalCleaningTime,
      staffRequired: recommendedStaff
    }));
  };

  const updateRoomType = (index: number, field: keyof RoomType, value: string | number) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        roomTypes: prev.roomTypes.map((room, i) => 
          i === index ? { ...room, [field]: value } : room
        )
      };
      
      // Recalculer immédiatement
      const totalCleaningTime = newConfig.roomTypes.reduce((total, room) => {
        return total + (room.count * room.cleaningTime);
      }, 0);

      const totalRooms = newConfig.roomTypes.reduce((total, room) => {
        return total + room.count;
      }, 0);

      const workingHoursPerStaff = newConfig.workingHoursPerStaff;
      const minimumStaff = Math.ceil(totalCleaningTime / workingHoursPerStaff);
      const safetyMargin = Math.ceil(minimumStaff * (newConfig.safetyMargin / 100));
      const recommendedStaff = minimumStaff + safetyMargin;
      const efficiency = Math.round((totalCleaningTime / (recommendedStaff * workingHoursPerStaff)) * 100);

      setCalculation({
        totalCleaningTime,
        workingHoursPerStaff,
        minimumStaff,
        recommendedStaff,
        withSafetyMargin: recommendedStaff,
        efficiency
      });

      return {
        ...newConfig,
        totalRooms,
        totalCleaningTime,
        staffRequired: recommendedStaff
      };
    });
  };

  const addRoomType = () => {
    if (newRoomType.type && newRoomType.count > 0 && newRoomType.cleaningTime > 0) {
      setConfig(prev => {
        const newConfig = {
          ...prev,
          roomTypes: [...prev.roomTypes, newRoomType]
        };
        
        // Recalculer immédiatement
        const totalCleaningTime = newConfig.roomTypes.reduce((total, room) => {
          return total + (room.count * room.cleaningTime);
        }, 0);

        const totalRooms = newConfig.roomTypes.reduce((total, room) => {
          return total + room.count;
        }, 0);

        const workingHoursPerStaff = newConfig.workingHoursPerStaff;
        const minimumStaff = Math.ceil(totalCleaningTime / workingHoursPerStaff);
        const safetyMargin = Math.ceil(minimumStaff * (newConfig.safetyMargin / 100));
        const recommendedStaff = minimumStaff + safetyMargin;
        const efficiency = Math.round((totalCleaningTime / (recommendedStaff * workingHoursPerStaff)) * 100);

        setCalculation({
          totalCleaningTime,
          workingHoursPerStaff,
          minimumStaff,
          recommendedStaff,
          withSafetyMargin: recommendedStaff,
          efficiency
        });

        return {
          ...newConfig,
          totalRooms,
          totalCleaningTime,
          staffRequired: recommendedStaff
        };
      });
      setNewRoomType({ type: '', count: 0, cleaningTime: 30 });
    }
  };

  const removeRoomType = (index: number) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        roomTypes: prev.roomTypes.filter((_, i) => i !== index)
      };
      
      // Recalculer immédiatement
      const totalCleaningTime = newConfig.roomTypes.reduce((total, room) => {
        return total + (room.count * room.cleaningTime);
      }, 0);

      const totalRooms = newConfig.roomTypes.reduce((total, room) => {
        return total + room.count;
      }, 0);

      const workingHoursPerStaff = newConfig.workingHoursPerStaff;
      const minimumStaff = Math.ceil(totalCleaningTime / workingHoursPerStaff);
      const safetyMargin = Math.ceil(minimumStaff * (newConfig.safetyMargin / 100));
      const recommendedStaff = minimumStaff + safetyMargin;
      const efficiency = Math.round((totalCleaningTime / (recommendedStaff * workingHoursPerStaff)) * 100);

      setCalculation({
        totalCleaningTime,
        workingHoursPerStaff,
        minimumStaff,
        recommendedStaff,
        withSafetyMargin: recommendedStaff,
        efficiency
      });

      return {
        ...newConfig,
        totalRooms,
        totalCleaningTime,
        staffRequired: recommendedStaff
      };
    });
  };

  const updateConfig = (field: keyof HousekeepingConfig, value: number) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      
      // Recalculer immédiatement si c'est un paramètre qui affecte le calcul
      if (field === 'workingHoursPerStaff' || field === 'safetyMargin' || field === 'weeklyHours' || field === 'restDaysPerWeek' || field === 'annualLeaveDays') {
        const totalCleaningTime = newConfig.roomTypes.reduce((total, room) => {
          return total + (room.count * room.cleaningTime);
        }, 0);

        const totalRooms = newConfig.roomTypes.reduce((total, room) => {
          return total + room.count;
        }, 0);

        // Calculs RH réalistes
        const daysPerYear = 365;
        const restDaysPerYear = newConfig.restDaysPerWeek * 52;
        const actualWorkingDaysPerYear = daysPerYear - restDaysPerYear - newConfig.annualLeaveDays;
        const actualWorkingHoursPerYear = actualWorkingDaysPerYear * (newConfig.weeklyHours / 5);
        const dailyCleaningHours = totalCleaningTime / 60;
        const realCapacityPerStaff = actualWorkingHoursPerYear;

        const workingHoursPerStaff = newConfig.workingHoursPerStaff / 60;
        const minimumStaff = Math.ceil(dailyCleaningHours / (realCapacityPerStaff / 365));
        const safetyMargin = Math.ceil(minimumStaff * (newConfig.safetyMargin / 100));
        const recommendedStaff = minimumStaff + safetyMargin;
        const efficiency = Math.round((dailyCleaningHours / (recommendedStaff * (realCapacityPerStaff / 365))) * 100);

        setCalculation({
          totalCleaningTime,
          workingHoursPerStaff,
          minimumStaff,
          recommendedStaff,
          withSafetyMargin: recommendedStaff,
          efficiency,
          actualWorkingDaysPerYear,
          actualWorkingHoursPerYear,
          dailyCleaningHours,
          realCapacityPerStaff
        });

        return {
          ...newConfig,
          totalRooms,
          totalCleaningTime,
          staffRequired: recommendedStaff
        };
      }
      
      return newConfig;
    });
  };

  // Fonctions pour la validation
  const handleValidatePlanning = () => {
    // Simuler une recommandation pour démonstration
    const mockRecommendation = {
      type: 'sur-charge' as const,
      employee: {
        id: 1,
        name: 'Marie Dubois',
        currentHours: 35,
        projectedHours: 39
      },
      recommendation: {
        type: 'contract_change' as const,
        details: { targetHours: 39 }
      },
      impact: {
        coverage: 95,
        salaryImpact: 320,
        compliance: true
      }
    };
    
    setValidationData(mockRecommendation);
    setIsValidationModalOpen(true);
  };

  const handleValidationDecision = (decision: 'accept' | 'reject', details?: any) => {
    console.log('Décision de validation:', decision, details);
    // Ici, on enregistrerait la décision dans le journal
    setIsValidationModalOpen(false);
    setValidationData(null);
    
    // Afficher un message de confirmation
    alert(decision === 'accept' ? 'Recommandation validée' : 'Recommandation refusée');
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'rooms', name: 'Configuration chambres', icon: HomeIcon },
    { id: 'calculation', name: 'Calcul personnel', icon: CalculatorIcon },
    { id: 'planning', name: 'Planning', icon: ClockIcon },
    { id: 'settings', name: 'Paramètres', icon: CogIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Module Housekeeping</h2>
          <p className="text-gray-600">Gestion intelligente du personnel de nettoyage</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="flex items-center space-x-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Rapport</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-hotaly-primary text-hotaly-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Résumé principal */}
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>Résumé opérationnel</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{config.totalRooms}</div>
                    <div className="text-sm text-blue-700">Chambres totales</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{calculation.recommendedStaff}</div>
                    <div className="text-sm text-green-700">Personnel recommandé</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(calculation.totalCleaningTime / 60)}h</div>
                    <div className="text-sm text-orange-700">Temps total nettoyage</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{calculation.efficiency}%</div>
                    <div className="text-sm text-purple-700">Efficacité</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Répartition par type */}
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <HomeIcon className="h-5 w-5" />
                <span>Répartition par type</span>
              </h3>
              
              <div className="space-y-3">
                {config.roomTypes.map((room, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-hotaly-primary"></div>
                      <div>
                        <div className="font-medium text-gray-900">{room.type}</div>
                        <div className="text-sm text-gray-600">{room.count} chambres</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{room.cleaningTime} min</div>
                      <div className="text-sm text-gray-600">par chambre</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Calcul détaillé */}
          <Card variant="elevated" className="lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CalculatorIcon className="h-5 w-5" />
                <span>Calcul détaillé du personnel</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Temps total</h4>
                  <div className="text-2xl font-bold text-gray-900">{calculation.totalCleaningTime} min</div>
                  <div className="text-sm text-gray-600">= {Math.round(calculation.totalCleaningTime / 60)}h {calculation.totalCleaningTime % 60}min</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Personnel minimum</h4>
                  <div className="text-2xl font-bold text-gray-900">{calculation.minimumStaff}</div>
                  <div className="text-sm text-gray-600">personnes (7h/jour)</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Avec marge sécurité</h4>
                  <div className="text-2xl font-bold text-hotaly-primary">{calculation.recommendedStaff}</div>
                  <div className="text-sm text-gray-600">personnes (+{config.safetyMargin}%)</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Recommandation</span>
                </div>
                <p className="text-green-700 mt-2">
                  Pour une efficacité optimale avec une marge de sécurité de {config.safetyMargin}%, 
                  nous recommandons <strong>{calculation.recommendedStaff} employés</strong> pour le service Housekeeping.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'rooms' && (
        <Card variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <HomeIcon className="h-5 w-5" />
              <span>Configuration des chambres</span>
            </h3>
            
            <div className="space-y-6">
              {/* Liste des types de chambres */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Types de chambres existants</h4>
                <div className="space-y-3">
                  {config.roomTypes.map((room, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <input
                          type="text"
                          value={room.type}
                          onChange={(e) => updateRoomType(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={room.count}
                          onChange={(e) => updateRoomType(index, 'count', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temps nettoyage (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={room.cleaningTime}
                          onChange={(e) => updateRoomType(index, 'cleaningTime', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => removeRoomType(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ajouter un nouveau type */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Ajouter un nouveau type de chambre</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      value={newRoomType.type}
                      onChange={(e) => setNewRoomType(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="Ex: Junior Suite"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newRoomType.count}
                      onChange={(e) => setNewRoomType(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temps nettoyage (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newRoomType.cleaningTime}
                      onChange={(e) => setNewRoomType(prev => ({ ...prev, cleaningTime: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      variant="primary"
                      onClick={addRoomType}
                      className="flex items-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Ajouter</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'calculation' && (
        <div className="space-y-6">
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <CalculatorIcon className="h-5 w-5" />
                <span>Calcul intelligent du personnel</span>
              </h3>
              
              <div className="space-y-6">
                {/* Paramètres de calcul */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heures de travail par employé
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={Math.round(config.workingHoursPerStaff / 60)}
                        onChange={(e) => updateConfig('workingHoursPerStaff', (parseInt(e.target.value) || 7) * 60)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">heures</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      = {config.workingHoursPerStaff} minutes par jour
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marge de sécurité
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={config.safetyMargin}
                        onChange={(e) => updateConfig('safetyMargin', parseInt(e.target.value) || 20)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pour couvrir les absences et imprévus
                    </p>
                  </div>
                </div>

                {/* Résultats du calcul */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Résultats du calcul</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{calculation.totalCleaningTime}</div>
                      <div className="text-sm text-gray-600">Minutes totales</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{calculation.minimumStaff}</div>
                      <div className="text-sm text-gray-600">Personnel minimum</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{calculation.recommendedStaff}</div>
                      <div className="text-sm text-gray-600">Avec marge sécurité</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{calculation.efficiency}%</div>
                      <div className="text-sm text-gray-600">Efficacité</div>
                    </div>
                  </div>
                </div>

                {/* Formule de calcul */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Formule de calcul</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Temps total :</strong> {config.roomTypes.map(room => `${room.count} × ${room.cleaningTime} min`).join(' + ')} = {calculation.totalCleaningTime} min</p>
                    <p><strong>Personnel minimum :</strong> {calculation.totalCleaningTime} min ÷ {config.workingHoursPerStaff} min = {calculation.minimumStaff} personnes</p>
                    <p><strong>Avec marge :</strong> {calculation.minimumStaff} + ({calculation.minimumStaff} × {config.safetyMargin}%) = {calculation.recommendedStaff} personnes</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="space-y-6">
          {/* Sous-navigation Planning */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActivePlanningTab('proposed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activePlanningTab === 'proposed'
                    ? 'border-hotaly-primary text-hotaly-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Planning proposé
              </button>
              <button
                onClick={() => setActivePlanningTab('recommendations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activePlanningTab === 'recommendations'
                    ? 'border-hotaly-primary text-hotaly-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recommandations
              </button>
            </nav>
          </div>

          {/* Contenu Planning proposé */}
          {activePlanningTab === 'proposed' && (
            <Card variant="elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5" />
                  <span>Planning proposé - À valider</span>
                </h3>
                
                <div className="space-y-6">
                  {/* Résumé du planning */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Planning généré automatiquement</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Basé sur {config.totalRooms} chambres nécessitant {calculation.dailyCleaningHours.toFixed(1)}h de nettoyage par jour.
                      Personnel requis : {calculation.recommendedStaff} employés (7h/jour chacun).
                    </p>
                  </div>

                  {/* Tableau du planning */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employé
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lundi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mardi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mercredi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jeudi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendredi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Samedi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dimanche
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total/sem
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Exemple de données - à remplacer par les vraies données */}
                        {Array.from({ length: calculation.recommendedStaff }, (_, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Employé {index + 1}
                            </td>
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                              <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                  <span>7h</span>
                                </div>
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              35h
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Statut :</span> À valider
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary">
                        Modifier
                      </Button>
                      <Button variant="primary" onClick={handleValidatePlanning}>
                        Valider le planning
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Contenu Recommandations */}
          {activePlanningTab === 'recommendations' && (
            <Card variant="elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span>Recommandations d'ajustement</span>
                </h3>
                
                <div className="space-y-6">
                  {/* Exemple de recommandation pour démonstration */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                        <div>
                          <h4 className="font-medium text-orange-900">Sur-charge détectée</h4>
                          <p className="text-sm text-orange-700">Marie Dubois - 39h/semaine projetées</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        À valider
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Recommandation</label>
                        <p className="text-sm text-gray-900">Changement de contrat (39h)</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Impact salarial</label>
                        <p className="text-sm text-gray-900">+320€/mois</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Conformité</label>
                        <div className="flex items-center space-x-1">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Conforme</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          const mockRecommendation = {
                            type: 'sur-charge' as const,
                            employee: {
                              id: 1,
                              name: 'Marie Dubois',
                              currentHours: 35,
                              projectedHours: 39
                            },
                            recommendation: {
                              type: 'contract_change' as const,
                              details: { targetHours: 39 }
                            },
                            impact: {
                              coverage: 95,
                              salaryImpact: 320,
                              compliance: true
                            }
                          };
                          setValidationData(mockRecommendation);
                          setIsValidationModalOpen(true);
                        }}
                      >
                        Examiner
                      </Button>
                      <Button variant="secondary" size="sm">
                        Ignorer
                      </Button>
                    </div>
                  </div>

                  {/* Aucune autre recommandation */}
                  <div className="text-center py-8">
                    <CheckCircleIcon className="mx-auto h-8 w-8 text-green-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Aucune autre recommandation en attente
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <Card variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <CogIcon className="h-5 w-5" />
              <span>Paramètres avancés</span>
            </h3>
            
            <div className="space-y-6">
              {/* Paramètres RH réalistes */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-4 flex items-center space-x-2">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Paramètres RH réalistes</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heures de travail / semaine
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={config.weeklyHours}
                        onChange={(e) => updateConfig('weeklyHours', parseInt(e.target.value) || 35)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">heures</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Défaut: 35h (temps plein)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jours de repos / semaine
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={config.restDaysPerWeek}
                        onChange={(e) => updateConfig('restDaysPerWeek', parseInt(e.target.value) || 2)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">jours</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Défaut: 2 jours (week-end)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jours de congés annuels
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={config.annualLeaveDays}
                        onChange={(e) => updateConfig('annualLeaveDays', parseInt(e.target.value) || 30)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">jours</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Défaut: 30 jours (congés payés)
                    </p>
                  </div>
                </div>
              </div>

              {/* Résumé RH réaliste */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-medium text-green-900 mb-4 flex items-center space-x-2">
                  <CalculatorIcon className="h-5 w-5" />
                  <span>Résumé RH réaliste</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{calculation.actualWorkingDaysPerYear}</div>
                    <div className="text-sm text-gray-600">Jours travaillés/an</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(calculation.actualWorkingHoursPerYear)}h</div>
                    <div className="text-sm text-gray-600">Capacité réelle/an</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{calculation.dailyCleaningHours.toFixed(1)}h</div>
                    <div className="text-sm text-gray-600">Heures ménage/jour</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{calculation.recommendedStaff}</div>
                    <div className="text-sm text-gray-600">Personnel recommandé</div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Calcul détaillé</h5>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Jours travaillés/an :</strong> 365 - ({config.restDaysPerWeek} × 52) - {config.annualLeaveDays} = {calculation.actualWorkingDaysPerYear} jours</p>
                    <p><strong>Capacité réelle :</strong> {calculation.actualWorkingDaysPerYear} × ({config.weeklyHours} ÷ 5) = {Math.round(calculation.actualWorkingHoursPerYear)}h/an</p>
                    <p><strong>Personnel minimum :</strong> {calculation.dailyCleaningHours.toFixed(1)}h ÷ ({Math.round(calculation.actualWorkingHoursPerYear)} ÷ 365) = {calculation.minimumStaff} personnes</p>
                    <p><strong>Avec marge sécurité :</strong> {calculation.minimumStaff} + {Math.ceil(calculation.minimumStaff * (config.safetyMargin / 100))} = {calculation.recommendedStaff} personnes</p>
                  </div>
                </div>
              </div>

              {/* Paramètres d'écarts */}
              <div className="bg-orange-50 p-6 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-4 flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span>Paramètres de gestion des écarts</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fenêtre glissante
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={4}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">semaines</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Période d'analyse des écarts
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seuil sur-charge
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="35"
                        max="45"
                        value={37}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">h/sem</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      → Reco 39h ou recrutement
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seuil sous-charge
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="20"
                        max="35"
                        value={33}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">h/sem</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      → Reco mi-temps ou complément
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zéro heure sup
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                      />
                      <span className="text-sm text-gray-600">Activé</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Verrou dur - aucune heure sup
                    </p>
                  </div>
                </div>
              </div>

              {/* Options de contrat */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-4 flex items-center space-x-2">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Options de contrat disponibles</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cibles mi-temps
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[20, 24, 28, 32].map((hours) => (
                        <span key={hours} className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm">
                          {hours}h
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Options disponibles pour sous-charge
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plein temps étendu
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm">
                        39h
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Option pour sur-charge
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={true}
                      className="w-4 h-4 text-hotaly-primary border-gray-300 rounded focus:ring-hotaly-primary"
                    />
                    <span className="text-sm text-gray-700">Complément d'heures inter-services</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Permet d'affecter des heures dans d'autres services
                  </p>
                </div>
              </div>

              {/* Paramètres techniques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre total de chambres
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={config.totalRooms}
                    onChange={(e) => updateConfig('totalRooms', parseInt(e.target.value) || 44)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personnel actuellement assigné
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={config.staffRequired}
                    onChange={(e) => updateConfig('staffRequired', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Note importante</span>
                </div>
                <p className="text-yellow-700 mt-2">
                  Le calcul du personnel est automatiquement mis à jour lorsque vous modifiez les types de chambres 
                  ou les paramètres de temps. La marge de sécurité permet de couvrir les absences, 
                  les imprévus et les périodes de forte activité.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal de validation */}
      {isValidationModalOpen && validationData && (
        <PlanningValidationModal
          isOpen={isValidationModalOpen}
          onClose={() => setIsValidationModalOpen(false)}
          onValidate={handleValidationDecision}
          planningData={validationData}
        />
      )}
    </div>
  );
};

export default HousekeepingModule;
