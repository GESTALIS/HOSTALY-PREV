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
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PlanningValidationModal from './PlanningValidationModal';
import HousekeepingExplanationModal from './HousekeepingExplanationModal';
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

interface EmployeeSchedule {
  id: number;
  name: string;
  weeklyHours: number;
  workingDays: number[]; // [1,2,3,4,5] pour lundi-vendredi
  startTime: string; // "10:00"
  endTime: string; // "17:00"
  breakDuration: number; // 60 minutes
  isActive: boolean;
}

interface WeeklySchedule {
  employeeId: number;
  employeeName: string;
  monday: { start: string; end: string; working: boolean };
  tuesday: { start: string; end: string; working: boolean };
  wednesday: { start: string; end: string; working: boolean };
  thursday: { start: string; end: string; working: boolean };
  friday: { start: string; end: string; working: boolean };
  saturday: { start: string; end: string; working: boolean };
  sunday: { start: string; end: string; working: boolean };
  totalWeeklyHours: number;
}

interface PlanningScenario {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  weekRef: string; // ex. "2025-W40"
  type: 'propose' | 'propose_modifie';
  payload: WeeklySchedule[]; // deep copy
  breakDuration: number;
  totals: { 
    byEmployee: Record<string, number>; 
    weekTotal: number;
    deltaVsOriginal?: number;
  };
}

interface AnnualPlanning {
  employeeId: number;
  employeeName: string;
  totalAnnualHours: number;
  targetAnnualHours: number;
  deficitOrSurplus: number;
  workingDaysPerYear: number;
  leaveDaysUsed: number;
  leaveDaysRemaining: number;
  monthlyBreakdown: {
    month: string;
    hours: number;
    workingDays: number;
    leaveDays: number;
  }[];
}

interface RealRecommendation {
  type: 'deficit' | 'surplus' | 'leave_balance' | 'coverage_gap';
  employeeId: number;
  employeeName: string;
  currentHours: number;
  targetHours: number;
  deficit: number;
  recommendation: string;
  impact: {
    financial: number;
    coverage: number;
    compliance: boolean;
  };
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
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  
  // Nouveau système de planning unifié
  const [planningStatus, setPlanningStatus] = useState<'readonly' | 'editing' | 'applied'>('readonly');
  const [activePlanning, setActivePlanning] = useState<WeeklySchedule[]>([]);
  const [originalPlanning, setOriginalPlanning] = useState<WeeklySchedule[]>([]);
  const [breakDuration, setBreakDuration] = useState(30); // en minutes
  
  // Scénarios et modales
  const [scenarios, setScenarios] = useState<PlanningScenario[]>([]);
  const [showSaveScenarioModal, setShowSaveScenarioModal] = useState(false);
  const [showScenarioHistoryModal, setShowScenarioHistoryModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  
  // Données des employés Housekeeping avec jours de repos décalés
  const [employees, setEmployees] = useState<EmployeeSchedule[]>([
    {
      id: 1,
      name: 'Marie Dubois',
      weeklyHours: 35,
      workingDays: [1, 2, 3, 4, 5], // Lundi à Vendredi
      startTime: '10:00',
      endTime: '17:00',
      breakDuration: 60,
      isActive: true
    },
    {
      id: 2,
      name: 'Sophie Martin',
      weeklyHours: 35,
      workingDays: [1, 2, 3, 4, 6], // Lundi à Jeudi + Samedi
      startTime: '10:30',
      endTime: '17:30',
      breakDuration: 60,
      isActive: true
    },
    {
      id: 3,
      name: 'Claire Bernard',
      weeklyHours: 35,
      workingDays: [2, 3, 4, 5, 7], // Mardi à Vendredi + Dimanche
      startTime: '11:00',
      endTime: '18:00',
      breakDuration: 60,
      isActive: true
    }
  ]);
  
  const [annualPlannings, setAnnualPlannings] = useState<AnnualPlanning[]>([]);
  const [realRecommendations, setRealRecommendations] = useState<RealRecommendation[]>([]);

  useEffect(() => {
    calculateStaff();
  }, [config.roomTypes, config.workingHoursPerStaff, config.safetyMargin]);

  // Recalculer quand les roomTypes changent
  useEffect(() => {
    calculateStaff();
  }, [config.roomTypes]);

  // Générer les plannings hebdomadaires et annuels
  useEffect(() => {
    generateWeeklySchedules();
    generateAnnualPlannings();
  }, [employees, breakDuration]);

  // Initialiser le planning actif avec le planning proposé
  useEffect(() => {
    if (activePlanning.length === 0 && originalPlanning.length > 0) {
      setActivePlanning([...originalPlanning]);
    }
  }, [originalPlanning]);

  // Recalculer les recommandations quand le planning actif change
  useEffect(() => {
    generateRealRecommendations();
  }, [activePlanning, employees, breakDuration]);

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

      // Calculer les paramètres RH
      const actualWorkingDaysPerYear = 365 - (newConfig.restDaysPerWeek * 52) - newConfig.annualLeaveDays;
      const actualWorkingHoursPerYear = actualWorkingDaysPerYear * (newConfig.weeklyHours / 5);
      const dailyCleaningHours = totalCleaningTime / 60;
      const realCapacityPerStaff = actualWorkingHoursPerYear;

      const workingHoursPerStaff = newConfig.workingHoursPerStaff / 60; // conversion en heures
      const minimumStaff = Math.ceil(dailyCleaningHours / (realCapacityPerStaff / 365)); // heures par jour / capacité par jour
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

        // Calculer les paramètres RH
        const actualWorkingDaysPerYear = 365 - (newConfig.restDaysPerWeek * 52) - newConfig.annualLeaveDays;
        const actualWorkingHoursPerYear = actualWorkingDaysPerYear * (newConfig.weeklyHours / 5);
        const dailyCleaningHours = totalCleaningTime / 60;
        const realCapacityPerStaff = actualWorkingHoursPerYear;

        const workingHoursPerStaff = newConfig.workingHoursPerStaff / 60; // conversion en heures
        const minimumStaff = Math.ceil(dailyCleaningHours / (realCapacityPerStaff / 365)); // heures par jour / capacité par jour
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

      // Calculer les paramètres RH
      const actualWorkingDaysPerYear = 365 - (newConfig.restDaysPerWeek * 52) - newConfig.annualLeaveDays;
      const actualWorkingHoursPerYear = actualWorkingDaysPerYear * (newConfig.weeklyHours / 5);
      const dailyCleaningHours = totalCleaningTime / 60;
      const realCapacityPerStaff = actualWorkingHoursPerYear;

      const workingHoursPerStaff = newConfig.workingHoursPerStaff / 60; // conversion en heures
      const minimumStaff = Math.ceil(dailyCleaningHours / (realCapacityPerStaff / 365)); // heures par jour / capacité par jour
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

  // Générer les plannings hebdomadaires en respectant les jours de repos
  const generateWeeklySchedules = () => {
    const schedules: WeeklySchedule[] = employees.map(employee => {
      const schedule: WeeklySchedule = {
        employeeId: employee.id,
        employeeName: employee.name,
        monday: { start: '', end: '', working: false },
        tuesday: { start: '', end: '', working: false },
        wednesday: { start: '', end: '', working: false },
        thursday: { start: '', end: '', working: false },
        friday: { start: '', end: '', working: false },
        saturday: { start: '', end: '', working: false },
        sunday: { start: '', end: '', working: false },
        totalWeeklyHours: 0
      };

      // Calculer les heures par jour de travail (en excluant la pause)
      const workingDaysCount = employee.workingDays.length;
      const dailyWorkingHours = (employee.weeklyHours * 60 - (breakDuration * workingDaysCount)) / (workingDaysCount * 60);
      
      // Convertir en heures et minutes
      const hours = Math.floor(dailyWorkingHours);
      const minutes = Math.round((dailyWorkingHours - hours) * 60);
      
      // Calculer l'heure de fin (temps de travail + pause)
      const startTime = new Date(`2000-01-01T${employee.startTime}:00`);
      const endTime = new Date(startTime.getTime() + (hours * 60 + minutes + breakDuration) * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      // Remplir les jours de travail
      employee.workingDays.forEach(day => {
        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayName = dayNames[day - 1] as keyof WeeklySchedule;
        
        if (dayName && typeof schedule[dayName] === 'object') {
          (schedule[dayName] as any).start = employee.startTime;
          (schedule[dayName] as any).end = endTimeString;
          (schedule[dayName] as any).working = true;
        }
      });

      // Calculer le total réel (heures travaillées - pauses)
      const realTotalHours = workingDaysCount * dailyWorkingHours;
      schedule.totalWeeklyHours = Math.round(realTotalHours);
      return schedule;
    });

    setOriginalPlanning(schedules);
    if (activePlanning.length === 0) {
      setActivePlanning([...schedules]);
    }
  };

  // Générer le planning annuel avec gestion des congés
  const generateAnnualPlannings = () => {
    const plannings: AnnualPlanning[] = employees.map(employee => {
      const workingDaysPerYear = 365 - (config.restDaysPerWeek * 52) - config.annualLeaveDays;
      const targetAnnualHours = workingDaysPerYear * (employee.weeklyHours / 5);
      const totalAnnualHours = workingDaysPerYear * (employee.weeklyHours / 5);
      
      // Simulation de congés pris (exemple)
      const leaveDaysUsed = Math.floor(config.annualLeaveDays * 0.7); // 70% des congés pris
      const leaveDaysRemaining = config.annualLeaveDays - leaveDaysUsed;
      
      // Répartition mensuelle
      const monthlyBreakdown = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ].map(month => ({
        month,
        hours: Math.round(totalAnnualHours / 12),
        workingDays: Math.round(workingDaysPerYear / 12),
        leaveDays: Math.round(leaveDaysUsed / 12)
      }));

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        totalAnnualHours,
        targetAnnualHours,
        deficitOrSurplus: 0, // Pas de déficit avec le planning actuel
        workingDaysPerYear,
        leaveDaysUsed,
        leaveDaysRemaining,
        monthlyBreakdown
      };
    });

    setAnnualPlannings(plannings);
  };

  // Générer des recommandations réalistes basées sur le planning actif
  const generateRealRecommendations = () => {
    const recommendations: RealRecommendation[] = [];
    
    // Vérifier la couverture des chambres
    const totalCleaningHours = calculation.dailyCleaningHours * 365;
    const totalStaffHours = activePlanning.reduce((total, schedule) => total + (schedule.totalWeeklyHours * 52), 0);
    
    if (totalStaffHours < totalCleaningHours) {
      const deficit = totalCleaningHours - totalStaffHours;
      recommendations.push({
        type: 'coverage_gap',
        employeeId: 0,
        employeeName: 'Équipe Housekeeping',
        currentHours: totalStaffHours,
        targetHours: totalCleaningHours,
        deficit: deficit,
        recommendation: `Déficit de ${Math.round(deficit)}h/an. Recruter ${Math.ceil(deficit / (35 * 52))} employé(s) supplémentaire(s).`,
        impact: {
          financial: Math.ceil(deficit / (35 * 52)) * 2000 * 12, // Estimation
          coverage: Math.round((totalStaffHours / totalCleaningHours) * 100),
          compliance: false
        }
      });
    }

    // Vérifier l'équilibre des jours de repos
    const weekendWorkers = employees.filter(emp => emp.workingDays.includes(6) || emp.workingDays.includes(7));
    if (weekendWorkers.length === 0) {
      recommendations.push({
        type: 'coverage_gap',
        employeeId: 0,
        employeeName: 'Couverture week-end',
        currentHours: 0,
        targetHours: calculation.dailyCleaningHours * 2, // Samedi + Dimanche
        deficit: calculation.dailyCleaningHours * 2,
        recommendation: 'Aucune couverture le week-end. Réorganiser les plannings pour couvrir samedi et dimanche.',
        impact: {
          financial: 0,
          coverage: 0,
          compliance: false
        }
      });
    }

    setRealRecommendations(recommendations);
  };

  // Fonctions pour le planning personnalisé
  const handleCustomScheduleChange = (employeeId: number, day: string, field: 'start' | 'end' | 'working', value: string | boolean) => {
    setCustomSchedules(prev => prev.map(schedule => {
      if (schedule.employeeId === employeeId) {
        const updatedSchedule = { ...schedule };
        (updatedSchedule[day as keyof WeeklySchedule] as any)[field] = value;
        
        // Si on coche "working" et qu'il n'y a pas d'heures, initialiser avec des heures par défaut
        if (field === 'working' && value === true) {
          const daySchedule = updatedSchedule[day as keyof WeeklySchedule] as { start: string; end: string; working: boolean };
          if (!daySchedule.start || !daySchedule.end) {
            // Trouver l'employé pour récupérer ses heures par défaut
            const employee = employees.find(emp => emp.id === employeeId);
            if (employee) {
              // Calculer les heures par jour de travail (en excluant la pause)
              const workingDaysCount = employee.workingDays.length;
              const dailyWorkingHours = (employee.weeklyHours * 60 - (breakDuration * workingDaysCount)) / (workingDaysCount * 60);
              
              // Convertir en heures et minutes
              const hours = Math.floor(dailyWorkingHours);
              const minutes = Math.round((dailyWorkingHours - hours) * 60);
              
              // Calculer l'heure de fin (temps de travail + pause)
              const startTime = new Date(`2000-01-01T${employee.startTime}:00`);
              const endTime = new Date(startTime.getTime() + (hours * 60 + minutes + breakDuration) * 60000);
              const endTimeString = endTime.toTimeString().slice(0, 5);
              
              (updatedSchedule[day as keyof WeeklySchedule] as any).start = employee.startTime;
              (updatedSchedule[day as keyof WeeklySchedule] as any).end = endTimeString;
            }
          }
        }
        
        // Recalculer le total hebdomadaire
        const workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let totalHours = 0;
        
        workingDays.forEach(dayName => {
          const daySchedule = updatedSchedule[dayName as keyof WeeklySchedule] as { start: string; end: string; working: boolean };
          if (daySchedule.working && daySchedule.start && daySchedule.end) {
            const startTime = new Date(`2000-01-01T${daySchedule.start}:00`);
            const endTime = new Date(`2000-01-01T${daySchedule.end}:00`);
            const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            // Soustraire la pause
            const workingHours = hours - (breakDuration / 60);
            totalHours += Math.max(0, workingHours);
          }
        });
        
        updatedSchedule.totalWeeklyHours = Math.round(totalHours);
        return updatedSchedule;
      }
      return schedule;
    }));
  };


  // Actions du planning unifié
  const startEditing = () => {
    setPlanningStatus('editing');
  };

  const resetToOriginal = () => {
    setActivePlanning([...originalPlanning]);
    setPlanningStatus('readonly');
  };

  const applyToAnnualPlanning = () => {
    // Mettre à jour le planning annuel avec le planning actif
    const updatedAnnualPlannings = annualPlannings.map(annual => {
      const activeSchedule = activePlanning.find(s => s.employeeId === annual.employeeId);
      if (activeSchedule) {
        return {
          ...annual,
          totalAnnualHours: activeSchedule.totalWeeklyHours * 52
        };
      }
      return annual;
    });
    setAnnualPlannings(updatedAnnualPlannings);
    setPlanningStatus('applied');
    alert('Planning appliqué au planning annuel avec succès !');
  };

  // Mettre à jour le planning actif
  const handlePlanningChange = (employeeId: number, day: string, field: 'start' | 'end' | 'working', value: string | boolean) => {
    setActivePlanning(prev => prev.map(schedule => {
      if (schedule.employeeId === employeeId) {
        const updatedSchedule = { ...schedule };
        (updatedSchedule[day as keyof WeeklySchedule] as any)[field] = value;
        
        // Recalculer le total hebdomadaire
        const workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let totalHours = 0;
        
        workingDays.forEach(dayName => {
          const daySchedule = updatedSchedule[dayName as keyof WeeklySchedule] as { start: string; end: string; working: boolean };
          if (daySchedule.working && daySchedule.start && daySchedule.end) {
            const startTime = new Date(`2000-01-01T${daySchedule.start}:00`);
            const endTime = new Date(`2000-01-01T${daySchedule.end}:00`);
            const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            const workingHours = hours - (breakDuration / 60);
            totalHours += Math.max(0, workingHours);
          }
        });
        
        updatedSchedule.totalWeeklyHours = Math.round(totalHours);
        return updatedSchedule;
      }
      return schedule;
    }));
  };

  // Sauvegarder un scénario
  const saveScenario = () => {
    if (!newScenarioName.trim()) {
      alert('Veuillez entrer un nom pour le scénario');
      return;
    }

    // Calculer les totaux
    const byEmployee: Record<string, number> = {};
    let weekTotal = 0;
    
    activePlanning.forEach(schedule => {
      byEmployee[schedule.employeeName] = schedule.totalWeeklyHours;
      weekTotal += schedule.totalWeeklyHours;
    });

    // Calculer le delta vs original
    const originalTotal = originalPlanning.reduce((sum, s) => sum + s.totalWeeklyHours, 0);
    const deltaVsOriginal = weekTotal - originalTotal;

    const newScenario: PlanningScenario = {
      id: `scenario-${Date.now()}`,
      name: newScenarioName,
      description: newScenarioDescription,
      createdAt: new Date().toISOString(),
      weekRef: `2025-W${Math.ceil(new Date().getDate() / 7)}`,
      type: planningStatus === 'readonly' ? 'propose' : 'propose_modifie',
      payload: JSON.parse(JSON.stringify(activePlanning)), // deep copy
      breakDuration,
      totals: {
        byEmployee,
        weekTotal,
        deltaVsOriginal
      }
    };

    setScenarios([newScenario, ...scenarios]);
    setShowSaveScenarioModal(false);
    setNewScenarioName('');
    setNewScenarioDescription('');
    alert(`Scénario "${newScenarioName}" sauvegardé avec succès !`);
  };

  // Restaurer un scénario
  const restoreScenario = (scenario: PlanningScenario) => {
    setActivePlanning(JSON.parse(JSON.stringify(scenario.payload)));
    setBreakDuration(scenario.breakDuration);
    setPlanningStatus(scenario.type === 'propose' ? 'readonly' : 'editing');
    setShowScenarioHistoryModal(false);
    alert(`Scénario "${scenario.name}" restauré !`);
  };

  // Supprimer un scénario
  const deleteScenario = (scenarioId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce scénario ?')) {
      setScenarios(scenarios.filter(s => s.id !== scenarioId));
    }
  };

  // Dupliquer un scénario
  const duplicateScenario = (scenario: PlanningScenario) => {
    const duplicated: PlanningScenario = {
      ...scenario,
      id: `scenario-${Date.now()}`,
      name: `${scenario.name} (copie)`,
      createdAt: new Date().toISOString(),
      payload: JSON.parse(JSON.stringify(scenario.payload))
    };
    setScenarios([duplicated, ...scenarios]);
    alert(`Scénario dupliqué : "${duplicated.name}"`);
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'rooms', name: 'Configuration chambres', icon: HomeIcon },
    { id: 'calculation', name: 'Calcul personnel', icon: CalculatorIcon },
    { id: 'planning', name: 'Planning', icon: ClockIcon },
    { id: 'annual', name: 'Planning annuel', icon: ChartBarIcon },
    { id: 'settings', name: 'Paramètres', icon: CogIcon }
  ];

  const planningTabs = [
    { id: 'proposed', name: 'Planning proposé' },
    { id: 'recommendations', name: 'Recommandations' }
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
            onClick={() => setIsExplanationModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <InformationCircleIcon className="h-4 w-4" />
            <span>? Explication du calcul</span>
          </Button>
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
            <nav className="-mb-px flex justify-between">
              <div className="flex space-x-8">
                {planningTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePlanningTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activePlanningTab === tab.id
                        ? 'border-hotaly-primary text-hotaly-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSaveScenarioModal(true)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-hotaly-primary rounded-lg hover:bg-hotaly-primary-dark flex items-center space-x-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Sauvegarder scénario</span>
                </button>
                <button
                  onClick={() => setShowScenarioHistoryModal(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Historique ({scenarios.length})
                </button>
              </div>
            </nav>
          </div>

          {/* Contenu Planning proposé */}
          {activePlanningTab === 'proposed' && (
            <Card variant="elevated">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5" />
                    <span>Planning proposé</span>
                    {planningStatus === 'editing' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Mode édition
                      </span>
                    )}
                    {planningStatus === 'applied' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Appliqué
                      </span>
                    )}
                  </h3>
                  <div className="flex space-x-2">
                    {planningStatus === 'readonly' && (
                      <Button variant="primary" onClick={startEditing}>
                        Modifier
                      </Button>
                    )}
                    {planningStatus === 'editing' && (
                      <>
                        <Button variant="secondary" onClick={resetToOriginal}>
                          Réinitialiser
                        </Button>
                        <Button variant="primary" onClick={applyToAnnualPlanning}>
                          Appliquer au planning annuel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Résumé du planning */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Planning généré automatiquement</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Basé sur {config.totalRooms} chambres nécessitant {calculation.dailyCleaningHours.toFixed(1)}h de nettoyage par jour.
                      Personnel requis : {calculation.recommendedStaff} employés avec décalage des arrivées (10h, 10h30, 11h).
                      Respect des 2 jours de repos par semaine et des 30 jours de congés annuels.
                    </p>
                  </div>

                  {/* Tableau du planning simplifié */}
                  <div className="space-y-4">
                    {activePlanning.map((schedule) => (
                      <div key={schedule.employeeId} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{schedule.employeeName}</h3>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {schedule.totalWeeklyHours}h travaillées
                            </div>
                            <div className="text-xs text-gray-500">
                              + {breakDuration * (
                                (schedule.monday.working ? 1 : 0) + 
                                (schedule.tuesday.working ? 1 : 0) + 
                                (schedule.wednesday.working ? 1 : 0) + 
                                (schedule.thursday.working ? 1 : 0) + 
                                (schedule.friday.working ? 1 : 0) + 
                                (schedule.saturday.working ? 1 : 0) + 
                                (schedule.sunday.working ? 1 : 0)
                              )}min de pauses
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {[
                            { day: 'monday', label: 'Lundi' },
                            { day: 'tuesday', label: 'Mardi' },
                            { day: 'wednesday', label: 'Mercredi' },
                            { day: 'thursday', label: 'Jeudi' },
                            { day: 'friday', label: 'Vendredi' },
                            { day: 'saturday', label: 'Samedi' },
                            { day: 'sunday', label: 'Dimanche' }
                          ].map(({ day, label }) => {
                            const daySchedule = schedule[day as keyof WeeklySchedule] as { start: string; end: string; working: boolean };
                            const totalMinutes = daySchedule.working ? 
                              (new Date(`2000-01-01T${daySchedule.end}:00`).getTime() - new Date(`2000-01-01T${daySchedule.start}:00`).getTime()) / (1000 * 60) : 0;
                            const workingMinutes = Math.max(0, totalMinutes - breakDuration);
                            const workingHours = Math.floor(workingMinutes / 60);
                            const workingMins = Math.round(workingMinutes % 60);
                            
                            return (
                              <div key={day} className={`p-3 rounded-lg border-2 ${
                                daySchedule.working ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                              }`}>
                                <div className="text-xs font-medium text-gray-600 mb-2">{label}</div>
                                {daySchedule.working ? (
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {daySchedule.start} - {daySchedule.end}
                                    </div>
                                    <div className="text-xs text-green-600">
                                      {workingHours}h{workingMins > 0 ? workingMins : ''} travaillées
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Pause: {breakDuration}min
                                    </div>
                                    {planningStatus === 'editing' && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            checked={daySchedule.working}
                                            onChange={(e) => handlePlanningChange(schedule.employeeId, day, 'working', e.target.checked)}
                                            className="w-3 h-3 text-hotaly-primary border-gray-300 rounded"
                                          />
                                          <span className="text-xs text-gray-600">Travail</span>
                                        </div>
                                        {daySchedule.working && (
                                          <div className="flex space-x-1">
                                            <input
                                              type="time"
                                              value={daySchedule.start}
                                              onChange={(e) => handlePlanningChange(schedule.employeeId, day, 'start', e.target.value)}
                                              className="w-16 px-1 py-1 text-xs border border-gray-300 rounded"
                                            />
                                            <input
                                              type="time"
                                              value={daySchedule.end}
                                              onChange={(e) => handlePlanningChange(schedule.employeeId, day, 'end', e.target.value)}
                                              className="w-16 px-1 py-1 text-xs border border-gray-300 rounded"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-500">Repos</div>
                                    {planningStatus === 'editing' && (
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={daySchedule.working}
                                          onChange={(e) => handlePlanningChange(schedule.employeeId, day, 'working', e.target.checked)}
                                          className="w-3 h-3 text-hotaly-primary border-gray-300 rounded"
                                        />
                                        <span className="text-xs text-gray-600">Travail</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Configuration des pauses */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Durée de pause par jour :</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(Number(e.target.value))}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-hotaly-primary focus:border-hotaly-primary"
                        >
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>1h</option>
                          <option value={90}>1h30</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      La pause est automatiquement déduite du temps de travail quotidien pour tous les employés.
                    </p>
                  </div>

                  {/* Configuration durée de pause */}
                  {planningStatus === 'editing' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée de la pause
                      </label>
                      <select
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 heure</option>
                        <option value={90}>1h30</option>
                      </select>
                    </div>
                  )}
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
                  {/* Recommandations réalistes */}
                  {realRecommendations.map((rec, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      rec.type === 'coverage_gap' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <ExclamationTriangleIcon className={`h-6 w-6 ${
                            rec.type === 'coverage_gap' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <div>
                            <h4 className={`font-medium ${
                              rec.type === 'coverage_gap' ? 'text-red-900' : 'text-orange-900'
                            }`}>
                              {rec.type === 'coverage_gap' ? 'Déficit de couverture' : 'Écart détecté'}
                            </h4>
                            <p className={`text-sm ${
                              rec.type === 'coverage_gap' ? 'text-red-700' : 'text-orange-700'
                            }`}>
                              {rec.employeeName}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.type === 'coverage_gap' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          Critique
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Recommandation</label>
                          <p className="text-sm text-gray-900">{rec.recommendation}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Impact financier</label>
                          <p className="text-sm text-gray-900">
                            {rec.impact.financial > 0 ? `+${rec.impact.financial}€/an` : 'Aucun coût supplémentaire'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Couverture</label>
                          <div className="flex items-center space-x-1">
                            <span className={`text-sm font-medium ${
                              rec.impact.coverage >= 90 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {rec.impact.coverage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => {
                            const mockRecommendation = {
                              type: rec.type === 'coverage_gap' ? 'sous-charge' : 'sur-charge',
                              employee: {
                                id: rec.employeeId,
                                name: rec.employeeName,
                                currentHours: rec.currentHours,
                                projectedHours: rec.targetHours
                              },
                              recommendation: {
                                type: rec.type === 'coverage_gap' ? 'recruitment' : 'contract_change',
                                details: { targetHours: rec.targetHours }
                              },
                              impact: {
                                coverage: rec.impact.coverage,
                                salaryImpact: rec.impact.financial / 12,
                                compliance: rec.impact.compliance
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
                  ))}

                  {/* Aucune recommandation si tout va bien */}
                  {realRecommendations.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="mx-auto h-8 w-8 text-green-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Aucune recommandation en attente - Planning optimal
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'annual' && (
        <div className="space-y-6">
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>Planning annuel - Suivi des quotas</span>
              </h3>
              
              <div className="space-y-6">
                {annualPlannings.map((planning) => (
                  <div key={planning.employeeId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{planning.employeeName}</h4>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{planning.totalAnnualHours}h</div>
                          <div className="text-xs text-gray-600">Heures annuelles</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{planning.workingDaysPerYear}</div>
                          <div className="text-xs text-gray-600">Jours travaillés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{planning.leaveDaysRemaining}</div>
                          <div className="text-xs text-gray-600">Congés restants</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Répartition mensuelle */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {planning.monthlyBreakdown.map((month, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-sm font-medium text-gray-900">{month.month}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            <div>{month.hours}h</div>
                            <div>{month.workingDays}j travaillés</div>
                            <div>{month.leaveDays}j congés</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Résumé global */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Résumé de l'équipe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total heures équipe</label>
                      <p className="text-lg font-bold text-blue-600">
                        {annualPlannings.reduce((total, p) => total + p.totalAnnualHours, 0)}h/an
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Besoin total chambres</label>
                      <p className="text-lg font-bold text-green-600">
                        {Math.round(calculation.dailyCleaningHours * 365)}h/an
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Écart</label>
                      <p className={`text-lg font-bold ${
                        annualPlannings.reduce((total, p) => total + p.totalAnnualHours, 0) >= 
                        Math.round(calculation.dailyCleaningHours * 365) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {annualPlannings.reduce((total, p) => total + p.totalAnnualHours, 0) - 
                         Math.round(calculation.dailyCleaningHours * 365)}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
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
                        defaultValue={4}
                        readOnly
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
                        defaultValue={37}
                        readOnly
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
                        defaultValue={33}
                        readOnly
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
                        defaultChecked={true}
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
                      defaultChecked={true}
                      readOnly
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

      {/* Modal d'explication */}
      {isExplanationModalOpen && (
        <HousekeepingExplanationModal
          isOpen={isExplanationModalOpen}
          onClose={() => setIsExplanationModalOpen(false)}
          realData={{
            totalRooms: config.totalRooms,
            roomTypes: config.roomTypes,
            totalCleaningTime: calculation.totalCleaningTime,
            dailyCleaningHours: calculation.dailyCleaningHours,
            employees: employees.map(emp => ({
              name: emp.name,
              weeklyHours: emp.weeklyHours,
              workingDays: emp.workingDays,
              startTime: emp.startTime,
              endTime: emp.endTime
            })),
            annualLeaveDays: config.annualLeaveDays,
            restDaysPerWeek: config.restDaysPerWeek,
            actualWorkingDaysPerYear: calculation.actualWorkingDaysPerYear,
            actualWorkingHoursPerYear: calculation.actualWorkingHoursPerYear
          }}
        />
      )}

      {/* Modal de sauvegarde de scénario */}
      {showSaveScenarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sauvegarder le scénario actuel
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du scénario *
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  placeholder="Ex: Planning été 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnelle)
                </label>
                <textarea
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary focus:border-transparent"
                  placeholder="Ex: Planning optimisé pour la période de haute saison"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Type :</strong> {planningStatus === 'readonly' ? 'Planning proposé' : 'Planning modifié'}
                  <br />
                  <strong>Pause :</strong> {breakDuration} min
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSaveScenarioModal(false);
                  setNewScenarioName('');
                  setNewScenarioDescription('');
                }}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={saveScenario}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'historique des scénarios */}
      {showScenarioHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Historique des scénarios ({scenarios.length})
              </h3>
              <Button
                variant="secondary"
                onClick={() => setShowScenarioHistoryModal(false)}
              >
                Fermer
              </Button>
            </div>

            {scenarios.length === 0 ? (
              <div className="text-center py-12">
                <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun scénario sauvegardé</p>
                <p className="text-sm text-gray-400 mt-2">
                  Créez un planning et cliquez sur "Sauvegarder scénario" pour l'enregistrer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            scenario.type === 'propose_modifie' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {scenario.type === 'propose_modifie' ? 'Modifié' : 'Proposé'}
                          </span>
                        </div>
                        {scenario.description && (
                          <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Créé le {new Date(scenario.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span>•</span>
                          <span>Pause: {scenario.breakDuration} min</span>
                          <span>•</span>
                          <span>
                            {scenario.totals.weekTotal}h totales/semaine
                            {scenario.totals.deltaVsOriginal && scenario.totals.deltaVsOriginal !== 0 && (
                              <span className={`ml-1 ${scenario.totals.deltaVsOriginal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({scenario.totals.deltaVsOriginal > 0 ? '+' : ''}{scenario.totals.deltaVsOriginal}h)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => restoreScenario(scenario)}
                        >
                          Restaurer
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => duplicateScenario(scenario)}
                        >
                          Dupliquer
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => deleteScenario(scenario.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingModule;
