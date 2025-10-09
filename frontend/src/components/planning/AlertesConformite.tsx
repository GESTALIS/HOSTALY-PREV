import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import api from '../../lib/api';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  contractType: string;
  weeklyHours: string;
  mainService: {
    name: string;
  };
}

interface Alert {
  type: 'HOURS_LOW' | 'HOURS_HIGH' | 'LEAVE_LOW' | 'LEAVE_URGENT' | 'COMPLIANT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  employeeId: number;
  employeeName: string;
  service: string;
  message: string;
  details: string;
  value?: number;
  threshold?: number;
}

interface AlertesConformiteProps {
  employees: Employee[];
  planning: any;
}

const AlertesConformite: React.FC<AlertesConformiteProps> = ({ employees, planning }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [leavesData, setLeavesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  useEffect(() => {
    generateAlerts();
  }, [employees, planning]);

  const generateAlerts = async () => {
    try {
      setLoading(true);
      const newAlerts: Alert[] = [];
      
      // Charger les données de congés
      try {
        const leavesResponse = await api.get(`/leaves/all?year=${new Date().getFullYear()}`);
        setLeavesData(leavesResponse.data);
        
        // Alertes congés payés
        leavesResponse.data.employees.forEach((emp: any) => {
          if (emp.status.level === 'danger') {
            newAlerts.push({
              type: 'LEAVE_URGENT',
              priority: 'HIGH',
              employeeId: emp.employeeId,
              employeeName: emp.employeeName,
              service: emp.service,
              message: `Congés payés insuffisants`,
              details: `${emp.totalDaysTaken}j pris / ${emp.legalDays}j - Il reste ${emp.remainingDays}j à prendre`,
              value: emp.totalDaysTaken,
              threshold: 20
            });
          } else if (emp.status.level === 'warning') {
            newAlerts.push({
              type: 'LEAVE_LOW',
              priority: 'MEDIUM',
              employeeId: emp.employeeId,
              employeeName: emp.employeeName,
              service: emp.service,
              message: `Congés à planifier`,
              details: `${emp.totalDaysTaken}j pris / ${emp.legalDays}j - ${emp.remainingDays}j restants`,
              value: emp.totalDaysTaken,
              threshold: 30
            });
          }
        });
      } catch (error) {
        console.log('Données de congés non disponibles');
      }
      
      // Alertes heures travaillées
      employees.forEach(emp => {
        const hours = planning?.totalHours?.[emp.id] || 0;
        const weeklyHours = emp.weeklyHours === 'H35' ? 35 : 39;
        
        if (hours < weeklyHours * 0.8) {
          newAlerts.push({
            type: 'HOURS_LOW',
            priority: 'MEDIUM',
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            service: emp.mainService.name,
            message: `Heures insuffisantes`,
            details: `${hours}h / ${weeklyHours}h - Il manque ${(weeklyHours - hours).toFixed(1)}h`,
            value: hours,
            threshold: weeklyHours
          });
        } else if (hours > weeklyHours) {
          newAlerts.push({
            type: 'HOURS_HIGH',
            priority: 'HIGH',
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            service: emp.mainService.name,
            message: `Heures supplémentaires`,
            details: `${hours}h / ${weeklyHours}h - ${(hours - weeklyHours).toFixed(1)}h supplémentaires`,
            value: hours,
            threshold: weeklyHours
          });
        } else if (hours >= weeklyHours * 0.95 && hours <= weeklyHours) {
          newAlerts.push({
            type: 'COMPLIANT',
            priority: 'LOW',
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            service: emp.mainService.name,
            message: `Conforme`,
            details: `${hours}h / ${weeklyHours}h - Heures conformes`,
            value: hours,
            threshold: weeklyHours
          });
        }
      });
      
      // Trier par priorité
      newAlerts.sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Erreur lors de la génération des alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'HOURS_HIGH':
      case 'LEAVE_URGENT':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'HOURS_LOW':
      case 'LEAVE_LOW':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'COMPLIANT':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'HOURS_HIGH':
      case 'LEAVE_URGENT':
        return 'bg-red-50 border-red-200';
      case 'HOURS_LOW':
      case 'LEAVE_LOW':
        return 'bg-yellow-50 border-yellow-200';
      case 'COMPLIANT':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredAlerts = filterPriority === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.priority === filterPriority);

  const alertCounts = {
    high: alerts.filter(a => a.priority === 'HIGH').length,
    medium: alerts.filter(a => a.priority === 'MEDIUM').length,
    low: alerts.filter(a => a.priority === 'LOW').length,
    total: alerts.length
  };

  if (loading) {
    return (
      <Card variant="elevated">
        <div className="p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-hotaly-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-hotaly-primary" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Alertes & Conformité Légale</h3>
              <p className="text-sm text-gray-600">
                {alertCounts.high} urgentes, {alertCounts.medium} moyennes, {alertCounts.low} conformes
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); setFilterPriority('ALL'); }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filterPriority === 'ALL' ? 'bg-hotaly-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Toutes ({alertCounts.total})
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setFilterPriority('HIGH'); }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filterPriority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                }`}
              >
                Urgentes ({alertCounts.high})
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setFilterPriority('MEDIUM'); }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filterPriority === 'MEDIUM' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                Moyennes ({alertCounts.medium})
              </button>
            </div>
            {expanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Alertes */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={`${alert.employeeId}-${alert.type}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 rounded-lg p-3 ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{alert.employeeName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">{alert.message}</p>
                      <p className="text-xs text-gray-600">{alert.details}</p>
                      <p className="text-xs text-gray-500 mt-1">Service: {alert.service}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Aucune alerte pour ce filtre
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default AlertesConformite;
