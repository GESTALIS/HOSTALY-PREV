import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CogIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../lib/api';

interface RHConfig {
  generalRules: {
    minDaysOffPerWeek: number;
    mandatoryBreakPerDay: number;
    maxConsecutiveWorkingDays: number;
    minRestBetweenShifts: number;
    minShiftDuration: number;
    maxShiftDuration: number;
  };
  timeRules: {
    minWeeklyHours: number;
    maxWeeklyHours: number;
    overtimeThreshold: number;
    overtimeRate: number;
  };
  leaveRules: {
    annualLeaveDays: number;
    sickLeaveDays: number;
    maternityLeaveDays: number;
    paternityLeaveDays: number;
    emergencyLeaveDays: number;
  };
  housekeeping: {
    totalRooms: number;
    roomTypes: Array<{
      type: string;
      count: number;
      cleaningTime: number;
    }>;
    totalCleaningTime: number;
    staffRequired: number;
  };
  seasonality: {
    currentSeason: string;
    highSeasonPeriods: Array<{
      name: string;
      start: string;
      end: string;
    }>;
  };
}

const RHConfiguration: React.FC = () => {
  const [config, setConfig] = useState<RHConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/rh/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      await api.put('/rh/config', config);
      alert('Configuration sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof RHConfig, field: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
  };

  const updateHousekeepingRoom = (index: number, field: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      housekeeping: {
        ...prev!.housekeeping,
        roomTypes: prev!.housekeeping.roomTypes.map((room, i) => 
          i === index ? { ...room, [field]: value } : room
        )
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotaly-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600">Impossible de charger la configuration RH</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'Règles générales', icon: CogIcon },
    { id: 'time', name: 'Règles de temps', icon: ClockIcon },
    { id: 'leave', name: 'Règles de congés', icon: CalendarIcon },
    { id: 'housekeeping', name: 'Housekeeping', icon: HomeIcon },
    { id: 'seasonality', name: 'Saisonnalité', icon: UserGroupIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuration RH</h2>
          <p className="text-gray-600">Paramétrez les règles et configurations générales</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={saving}
        >
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Sauvegarder
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-hotaly-primary text-hotaly-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'general' && (
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <CogIcon className="h-5 w-5" />
                <span>Règles générales</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jours de repos minimum par semaine
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={config.generalRules.minDaysOffPerWeek}
                    onChange={(e) => updateConfig('generalRules', 'minDaysOffPerWeek', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pause obligatoire par jour (minutes)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="120"
                    value={config.generalRules.mandatoryBreakPerDay}
                    onChange={(e) => updateConfig('generalRules', 'mandatoryBreakPerDay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jours de travail consécutifs maximum
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="7"
                    value={config.generalRules.maxConsecutiveWorkingDays}
                    onChange={(e) => updateConfig('generalRules', 'maxConsecutiveWorkingDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repos minimum entre shifts (heures)
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="16"
                    value={config.generalRules.minRestBetweenShifts}
                    onChange={(e) => updateConfig('generalRules', 'minRestBetweenShifts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée minimum d'un shift (heures)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={config.generalRules.minShiftDuration}
                    onChange={(e) => updateConfig('generalRules', 'minShiftDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée maximum d'un shift (heures)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="12"
                    value={config.generalRules.maxShiftDuration}
                    onChange={(e) => updateConfig('generalRules', 'maxShiftDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'time' && (
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <ClockIcon className="h-5 w-5" />
                <span>Règles de temps</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures hebdomadaires minimum
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="35"
                    value={config.timeRules.minWeeklyHours}
                    onChange={(e) => updateConfig('timeRules', 'minWeeklyHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures hebdomadaires maximum
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="60"
                    value={config.timeRules.maxWeeklyHours}
                    onChange={(e) => updateConfig('timeRules', 'maxWeeklyHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil d'heures supplémentaires (heures)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="40"
                    value={config.timeRules.overtimeThreshold}
                    onChange={(e) => updateConfig('timeRules', 'overtimeThreshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux de majoration heures sup (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    step="0.05"
                    value={config.timeRules.overtimeRate}
                    onChange={(e) => updateConfig('timeRules', 'overtimeRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'leave' && (
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Règles de congés</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Congés payés annuels (jours)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="35"
                    value={config.leaveRules.annualLeaveDays}
                    onChange={(e) => updateConfig('leaveRules', 'annualLeaveDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Congés maladie (jours)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="50"
                    value={config.leaveRules.sickLeaveDays}
                    onChange={(e) => updateConfig('leaveRules', 'sickLeaveDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Congé maternité (jours)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="150"
                    value={config.leaveRules.maternityLeaveDays}
                    onChange={(e) => updateConfig('leaveRules', 'maternityLeaveDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Congé paternité (jours)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="30"
                    value={config.leaveRules.paternityLeaveDays}
                    onChange={(e) => updateConfig('leaveRules', 'paternityLeaveDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Congés d'urgence (jours)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={config.leaveRules.emergencyLeaveDays}
                    onChange={(e) => updateConfig('leaveRules', 'emergencyLeaveDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'housekeeping' && (
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <HomeIcon className="h-5 w-5" />
                <span>Configuration Housekeeping</span>
              </h3>
              
              <div className="space-y-6">
                {/* Résumé */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Résumé</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total chambres:</span>
                      <span className="font-medium ml-1">{config.housekeeping.totalRooms}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Temps total:</span>
                      <span className="font-medium ml-1">{config.housekeeping.totalCleaningTime} min</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Heures:</span>
                      <span className="font-medium ml-1">{Math.round(config.housekeeping.totalCleaningTime / 60)}h</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Personnel requis:</span>
                      <span className="font-medium ml-1">{config.housekeeping.staffRequired}</span>
                    </div>
                  </div>
                </div>

                {/* Types de chambres */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Types de chambres</h4>
                  <div className="space-y-4">
                    {config.housekeeping.roomTypes.map((room, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type de chambre
                          </label>
                          <input
                            type="text"
                            value={room.type}
                            onChange={(e) => updateHousekeepingRoom(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de chambres
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={room.count}
                            onChange={(e) => updateHousekeepingRoom(index, 'count', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temps de nettoyage (minutes)
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="120"
                            value={room.cleaningTime}
                            onChange={(e) => updateHousekeepingRoom(index, 'cleaningTime', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personnel requis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personnel requis (personnes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.housekeeping.staffRequired}
                    onChange={(e) => updateConfig('housekeeping', 'staffRequired', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'seasonality' && (
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5" />
                <span>Saisonnalité Guyane</span>
              </h3>
              
              <div className="space-y-6">
                {/* Saison actuelle */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Saison actuelle</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      config.seasonality.currentSeason === 'HAUTE' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium text-green-800">
                      {config.seasonality.currentSeason === 'HAUTE' ? 'Haute saison' : 'Basse saison'}
                    </span>
                  </div>
                </div>

                {/* Périodes de haute saison */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Périodes de haute saison (vacances scolaires)</h4>
                  <div className="space-y-3">
                    {config.seasonality.highSeasonPeriods.map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <h5 className="font-medium text-orange-900">{period.name}</h5>
                          <p className="text-sm text-orange-700">
                            {new Date(period.start).toLocaleDateString('fr-FR')} - {new Date(period.end).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note explicative */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Note</h4>
                  <p className="text-sm text-blue-700">
                    Les périodes de haute saison correspondent aux vacances scolaires de Guyane. 
                    Ces dates sont utilisées pour déterminer automatiquement la saisonnalité des services.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default RHConfiguration;
