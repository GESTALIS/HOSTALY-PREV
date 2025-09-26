import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Card from '../ui/Card';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  flexibilityType: string;
  minWeeklyHours?: number;
  maxWeeklyHours?: number;
  preferredShifts?: string[];
  weeklyHours?: number;
}

interface FlexibilityAlertsProps {
  employees: Employee[];
  currentWeekHours?: { [employeeId: number]: number };
}

const FlexibilityAlerts: React.FC<FlexibilityAlertsProps> = ({ 
  employees, 
  currentWeekHours = {} 
}) => {
  
  const getAlerts = () => {
    const alerts = [];

    employees.forEach(employee => {
      const currentHours = currentWeekHours[employee.id] || 0;
      
      // Alerte pour dépassement des heures max
      if (employee.flexibilityType === 'PART_TIME' && employee.maxWeeklyHours) {
        if (currentHours > employee.maxWeeklyHours) {
          alerts.push({
            type: 'error',
            icon: ExclamationTriangleIcon,
            title: 'Dépassement des heures max',
            message: `${employee.firstName} ${employee.lastName} dépasse ses heures max (${currentHours}h > ${employee.maxWeeklyHours}h)`,
            employee: employee
          });
        }
      }

      // Alerte pour heures insuffisantes
      if (employee.flexibilityType === 'PART_TIME' && employee.minWeeklyHours) {
        if (currentHours < employee.minWeeklyHours) {
          alerts.push({
            type: 'warning',
            icon: InformationCircleIcon,
            title: 'Heures insuffisantes',
            message: `${employee.firstName} ${employee.lastName} n'atteint pas ses heures min (${currentHours}h < ${employee.minWeeklyHours}h)`,
            employee: employee
          });
        }
      }

      // Alerte pour créneaux non couverts
      if (employee.preferredShifts && employee.preferredShifts.length > 0) {
        // Logique simplifiée - dans une vraie app, on vérifierait les plannings réels
        const uncoveredShifts = employee.preferredShifts.filter(shift => {
          // Ici on pourrait vérifier si le créneau est couvert dans le planning
          return Math.random() > 0.7; // Simulation pour la démo
        });

        if (uncoveredShifts.length > 0) {
          alerts.push({
            type: 'info',
            icon: InformationCircleIcon,
            title: 'Créneaux préférés non couverts',
            message: `${employee.firstName} ${employee.lastName} : ${uncoveredShifts.join(', ')}`,
            employee: employee
          });
        }
      }
    });

    return alerts;
  };

  const alerts = getAlerts();

  if (alerts.length === 0) {
    return (
      <Card variant="elevated" className="p-4">
        <div className="flex items-center space-x-3 text-green-600">
          <CheckCircleIcon className="w-6 h-6" />
          <div>
            <h3 className="font-medium">Aucune alerte de flexibilité</h3>
            <p className="text-sm text-gray-600">Tous les employés respectent leurs contraintes de flexibilité</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes de flexibilité</h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const IconComponent = alert.icon;
          const colorClasses = {
            error: 'text-red-600 bg-red-50 border-red-200',
            warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            info: 'text-blue-600 bg-blue-50 border-blue-200'
          };

          return (
            <div 
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${colorClasses[alert.type as keyof typeof colorClasses]}`}
            >
              <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium">{alert.title}</h4>
                <p className="text-sm mt-1">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default FlexibilityAlerts;
