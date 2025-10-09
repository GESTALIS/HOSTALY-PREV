import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../lib/api';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  mainService: {
    name: string;
    color: string;
  };
}

interface PaidLeave {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  days: number;
  year: number;
  status: string;
  notes?: string;
}

interface LeaveSummary {
  employeeId: number;
  year: number;
  leaves: PaidLeave[];
  summary: {
    totalDaysTaken: number;
    legalDays: number;
    remainingDays: number;
    isCompliant: boolean;
    needsAlert: boolean;
    complianceMessage: string;
  };
}

interface GestionCongesProps {
  employees: Employee[];
  onLeaveAdded?: () => void;
}

const GestionConges: React.FC<GestionCongesProps> = ({ employees, onLeaveAdded }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary | null>(null);
  const [allLeavesSummary, setAllLeavesSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: 0,
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAllLeavesSummary();
  }, [currentYear]);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeLeaves(selectedEmployee);
    }
  }, [selectedEmployee, currentYear]);

  const loadAllLeavesSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leaves/all?year=${currentYear}`);
      setAllLeavesSummary(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des congés:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeLeaves = async (employeeId: number) => {
    try {
      const response = await api.get(`/leaves/employee/${employeeId}?year=${currentYear}`);
      setLeaveSummary(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des congés de l\'employé:', error);
    }
  };

  const addLeave = async () => {
    try {
      await api.post('/leaves', newLeave);
      setIsAddingLeave(false);
      setNewLeave({ employeeId: 0, startDate: '', endDate: '', notes: '' });
      loadAllLeavesSummary();
      if (selectedEmployee) {
        loadEmployeeLeaves(selectedEmployee);
      }
      if (onLeaveAdded) {
        onLeaveAdded();
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du congé:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout du congé');
    }
  };

  const deleteLeave = async (leaveId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce congé ?')) return;
    
    try {
      await api.delete(`/leaves/${leaveId}`);
      loadAllLeavesSummary();
      if (selectedEmployee) {
        loadEmployeeLeaves(selectedEmployee);
      }
      if (onLeaveAdded) {
        onLeaveAdded();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du congé:', error);
      alert('Erreur lors de la suppression du congé');
    }
  };

  const getStatusIcon = (status: any) => {
    if (status.level === 'complete' || status.level === 'good') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (status.level === 'warning') {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    } else if (status.level === 'danger') {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    return <CalendarIcon className="h-5 w-5 text-blue-500" />;
  };

  const getStatusColor = (status: any) => {
    if (status.level === 'complete' || status.level === 'good') {
      return 'bg-green-50 border-green-200 text-green-800';
    } else if (status.level === 'warning') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else if (status.level === 'danger') {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotaly-primary"></div>
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
            <span>Gestion des Congés Payés</span>
          </h2>
          <p className="text-gray-600">
            Suivi légal des congés payés (30 jours/an obligatoires)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button
            onClick={() => setIsAddingLeave(true)}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Ajouter un congé</span>
          </Button>
        </div>
      </div>

      {/* Résumé global */}
      {allLeavesSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="elevated">
            <div className="p-4 text-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {allLeavesSummary.globalCompliance.compliant}
              </div>
              <div className="text-sm text-gray-600">Employés conformes</div>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {allLeavesSummary.globalCompliance.nonCompliant}
              </div>
              <div className="text-sm text-gray-600">Employés à surveiller</div>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <UserIcon className="h-8 w-8 text-hotaly-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {allLeavesSummary.globalCompliance.total}
              </div>
              <div className="text-sm text-gray-600">Total employés</div>
            </div>
          </Card>
        </div>
      )}

      {/* Liste des employés avec état des congés */}
      <Card variant="elevated">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État des congés par employé</h3>
          <div className="space-y-3">
            {allLeavesSummary?.employees.map((emp: any) => (
              <motion.div
                key={emp.employeeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedEmployee === emp.employeeId ? 'border-hotaly-primary' : 'border-gray-200'
                } ${getStatusColor(emp.status)}`}
                onClick={() => setSelectedEmployee(emp.employeeId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(emp.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{emp.employeeName}</h4>
                      <p className="text-sm text-gray-600">{emp.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {emp.totalDaysTaken} / {emp.legalDays} jours
                    </div>
                    <div className="text-sm text-gray-600">
                      {emp.remainingDays} jours restants
                    </div>
                    <div className={`text-xs font-medium mt-1 ${
                      emp.status.level === 'complete' || emp.status.level === 'good' ? 'text-green-600' :
                      emp.status.level === 'warning' ? 'text-yellow-600' :
                      emp.status.level === 'danger' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {emp.status.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Détail des congés de l'employé sélectionné */}
      {selectedEmployee && leaveSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Détail des congés - {employees.find(e => e.id === selectedEmployee)?.firstName} {employees.find(e => e.id === selectedEmployee)?.lastName}
              </h3>
              
              {/* Message de conformité */}
              <div className={`p-4 rounded-lg mb-4 ${
                leaveSummary.summary.isCompliant ? 'bg-green-50' : 
                leaveSummary.summary.needsAlert ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <p className={`font-medium ${
                  leaveSummary.summary.isCompliant ? 'text-green-800' :
                  leaveSummary.summary.needsAlert ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {leaveSummary.summary.complianceMessage}
                </p>
              </div>

              {/* Liste des congés */}
              {leaveSummary.leaves.length > 0 ? (
                <div className="space-y-2">
                  {leaveSummary.leaves.map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {leave.days} jour{leave.days > 1 ? 's' : ''}
                          {leave.notes && ` - ${leave.notes}`}
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteLeave(leave.id)}
                        variant="danger"
                        size="sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun congé enregistré pour {currentYear}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Modal d'ajout de congé */}
      {isAddingLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un congé payé</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                <select
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                >
                  <option value={0}>Sélectionner un employé</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.mainService.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                <textarea
                  value={newLeave.notes}
                  onChange={(e) => setNewLeave({ ...newLeave, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                  placeholder="Ex: Congés d'été"
                />
              </div>

              {newLeave.startDate && newLeave.endDate && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Durée calculée:</span> {calculateWorkingDays(newLeave.startDate, newLeave.endDate)} jours ouvrés
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => setIsAddingLeave(false)}
                variant="secondary"
              >
                Annuler
              </Button>
              <Button
                onClick={addLeave}
                variant="primary"
                disabled={!newLeave.employeeId || !newLeave.startDate || !newLeave.endDate}
              >
                Ajouter
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Fonction utilitaire pour calculer les jours ouvrés
function calculateWorkingDays(startDateStr: string, endDateStr: string): number {
  let count = 0;
  const current = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Exclure samedi (6) et dimanche (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

export default GestionConges;
