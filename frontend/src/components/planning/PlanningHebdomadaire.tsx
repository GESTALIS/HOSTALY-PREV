import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';

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
  polyvalentServices: Array<{
    service: {
      id: number;
      name: string;
      color?: string;
    };
  }>;
}

interface Service {
  id: number;
  name: string;
  type: string;
  color: string;
  isActive: boolean;
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
  type?: 'WORK' | 'REST' | 'LEAVE'; // Type de jour
  employee?: Employee;
  service?: Service;
}

interface WeeklyPlanning {
  weekStart: string;
  slots: PlanningSlot[];
  totalHours: { [employeeId: number]: number };
}

interface PlanningHebdomadaireProps {
  employees: Employee[];
  services: Service[];
  planning: WeeklyPlanning | null;
  onPlanningChange: (planning: WeeklyPlanning) => void;
  season: 'HAUTE' | 'BASSE';
}

const PlanningHebdomadaire: React.FC<PlanningHebdomadaireProps> = ({
  employees,
  services,
  planning,
  onPlanningChange,
  season
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<PlanningSlot | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [slotType, setSlotType] = useState<'WORK' | 'REST' | 'LEAVE'>('WORK');
  const [newSlot, setNewSlot] = useState<Partial<PlanningSlot>>({
    startTime: '08:00',
    endTime: '17:00',
    breakTime: 60,
    type: 'WORK'
  });
  const [filterService, setFilterService] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const getWeekDates = (weekStart: Date) => {
    const dates = [];
    const start = new Date(weekStart);
    start.setDate(start.getDate() - start.getDay() + 1); // Lundi
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  const getSlotsForDay = (date: Date) => {
    if (!planning) return [];
    const dateStr = date.toISOString().split('T')[0];
    return planning.slots.filter(slot => slot.date === dateStr);
  };

  const getEmployeeHours = (employeeId: number): number => {
    if (!planning) return 0;
    return planning.totalHours[employeeId] || 0;
  };

  const getWeeklyHoursFromEnum = (weeklyHours: string): number => {
    const mapping: { [key: string]: number } = {
      'H35': 35,
      'H39': 39,
      'H35_MODULABLE': 35,
      'H39_MODULABLE': 39
    };
    return mapping[weeklyHours] || 35;
  };

  const getEmployeeStatus = (employeeId: number) => {
    const hours = getEmployeeHours(employeeId);
    const employee = employees.find(e => e.id === employeeId);
    const weeklyHours = employee ? getWeeklyHoursFromEnum(employee.weeklyHours) : 35;
    
    if (hours >= weeklyHours) {
      return { status: 'complete', color: 'green', text: `${hours}h / ${weeklyHours}h`, weeklyHours };
    } else if (hours >= weeklyHours * 0.8) {
      return { status: 'almost', color: 'yellow', text: `${hours}h / ${weeklyHours}h`, weeklyHours };
    } else {
      return { status: 'low', color: 'red', text: `${hours}h / ${weeklyHours}h`, weeklyHours };
    }
  };

  const calculateSlotHours = (startTime: string, endTime: string, breakTime: number): number => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, diffHours - (breakTime / 60));
  };

  const addSlot = () => {
    if (!planning || !newSlot.employeeId || !newSlot.date) return;
    
    // Si c'est un congé ou repos, pas besoin de service/heures
    if (slotType === 'LEAVE' || slotType === 'REST') {
      const slot: PlanningSlot = {
        id: `slot-${Date.now()}`,
        employeeId: newSlot.employeeId,
        serviceId: 0, // Pas de service pour congé/repos
        date: newSlot.date,
        startTime: '',
        endTime: '',
        breakTime: 0,
        isConfirmed: true,
        type: slotType
      };

      const updatedSlots = [...planning.slots, slot];
      const updatedPlanning: WeeklyPlanning = {
        ...planning,
        slots: updatedSlots,
        totalHours: planning.totalHours // Pas de changement d'heures
      };

      onPlanningChange(updatedPlanning);
      setIsAddingSlot(false);
      setNewSlot({ startTime: '08:00', endTime: '17:00', breakTime: 60, type: 'WORK' });
      setSlotType('WORK');
      return;
    }

    // Pour un jour de travail normal
    if (!newSlot.serviceId) return;

    const hours = calculateSlotHours(newSlot.startTime || '08:00', newSlot.endTime || '17:00', newSlot.breakTime || 60);
    
    const slot: PlanningSlot = {
      id: `slot-${Date.now()}`,
      employeeId: newSlot.employeeId,
      serviceId: newSlot.serviceId,
      date: newSlot.date,
      startTime: newSlot.startTime || '08:00',
      endTime: newSlot.endTime || '17:00',
      breakTime: newSlot.breakTime || 60,
      isConfirmed: false,
      type: 'WORK'
    };

    const updatedSlots = [...planning.slots, slot];
    const updatedTotalHours = { ...planning.totalHours };
    updatedTotalHours[newSlot.employeeId] = (updatedTotalHours[newSlot.employeeId] || 0) + hours;

    const updatedPlanning: WeeklyPlanning = {
      ...planning,
      slots: updatedSlots,
      totalHours: updatedTotalHours
    };

    onPlanningChange(updatedPlanning);
    setIsAddingSlot(false);
    setNewSlot({
      startTime: '08:00',
      endTime: '17:00',
      breakTime: 60
    });
  };

  const removeSlot = (slotId: string) => {
    if (!planning) return;

    const slot = planning.slots.find(s => s.id === slotId);
    if (!slot) return;

    const hours = calculateSlotHours(slot.startTime, slot.endTime, slot.breakTime);
    const updatedSlots = planning.slots.filter(s => s.id !== slotId);
    const updatedTotalHours = { ...planning.totalHours };
    updatedTotalHours[slot.employeeId] = Math.max(0, (updatedTotalHours[slot.employeeId] || 0) - hours);

    const updatedPlanning: WeeklyPlanning = {
      ...planning,
      slots: updatedSlots,
      totalHours: updatedTotalHours
    };

    onPlanningChange(updatedPlanning);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getServiceColor = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.color || '#eca08e';
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Inconnu';
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Inconnu';
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <Card variant="elevated">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigateWeek('prev')}
                variant="secondary"
                size="sm"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold text-gray-900">
                Semaine du {weekDates[0].toLocaleDateString('fr-FR')} au {weekDates[6].toLocaleDateString('fr-FR')}
              </h3>
              <Button
                onClick={() => navigateWeek('next')}
                variant="secondary"
                size="sm"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                season === 'HAUTE' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {season === 'HAUTE' ? 'Haute Saison' : 'Basse Saison'}
              </div>
              <Button
                onClick={() => setIsAddingSlot(true)}
                variant="primary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Ajouter un shift</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Planning Grid */}
      <Card variant="elevated">
        <div className="p-4">
          <div className="grid grid-cols-8 gap-2">
            {/* Header */}
            <div className="font-medium text-gray-700 text-center py-2">Heure</div>
            {daysOfWeek.map((day, index) => (
              <div key={day} className="font-medium text-gray-700 text-center py-2">
                <div>{day}</div>
                <div className="text-sm text-gray-500">
                  {weekDates[index].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map(timeSlot => (
              <React.Fragment key={timeSlot}>
                <div className="text-sm text-gray-600 text-center py-1 border-t border-gray-100">
                  {timeSlot}
                </div>
                {daysOfWeek.map((_, dayIndex) => {
                  const date = weekDates[dayIndex];
                  const daySlots = getSlotsForDay(date);
                  const slotAtTime = daySlots.find(slot => {
                    const slotStart = new Date(`2000-01-01T${slot.startTime}:00`);
                    const slotEnd = new Date(`2000-01-01T${slot.endTime}:00`);
                    const currentTime = new Date(`2000-01-01T${timeSlot}:00`);
                    return currentTime >= slotStart && currentTime < slotEnd;
                  });

                  return (
                    <div
                      key={`${dayIndex}-${timeSlot}`}
                      className="min-h-[40px] border-t border-gray-100 relative"
                    >
                      {slotAtTime && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`absolute inset-1 rounded-md text-xs p-1 cursor-pointer hover:opacity-80 ${
                            slotAtTime.type === 'LEAVE' ? 'bg-orange-400 border-2 border-orange-600' :
                            slotAtTime.type === 'REST' ? 'bg-blue-400 border-2 border-blue-600' :
                            ''
                          }`}
                          style={slotAtTime.type === 'WORK' ? { backgroundColor: getServiceColor(slotAtTime.serviceId) } : {}}
                          onClick={() => setSelectedSlot(slotAtTime)}
                        >
                          {slotAtTime.type === 'LEAVE' ? (
                            <div className="text-white font-bold text-center py-2">
                              CONGÉ
                            </div>
                          ) : slotAtTime.type === 'REST' ? (
                            <div className="text-white font-bold text-center py-2">
                              REPOS
                            </div>
                          ) : (
                            <>
                              <div className="text-white font-medium truncate">
                                {getEmployeeName(slotAtTime.employeeId)}
                              </div>
                              <div className="text-white/80 text-xs truncate">
                                {getServiceName(slotAtTime.serviceId)}
                              </div>
                              <div className="text-white/80 text-xs">
                                {slotAtTime.startTime}-{slotAtTime.endTime}
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      {/* Liste des employés avec heures */}
      <Card variant="elevated">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">État des employés</h3>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-hotaly-primary"
              />
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-hotaly-primary"
              >
                <option value="ALL">Tous les services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-hotaly-primary"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="complete">Complet</option>
                <option value="almost">Presque</option>
                <option value="low">Insuffisant</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contrat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heures Contrat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heures Planifiées
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Polyvalence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Congés Payés
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees
                  .filter(emp => {
                    const matchSearch = searchTerm === '' || 
                      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchService = filterService === 'ALL' || emp.mainService.id.toString() === filterService;
                    const status = getEmployeeStatus(emp.id);
                    const matchStatus = filterStatus === 'ALL' || status.status === filterStatus;
                    return matchSearch && matchService && matchStatus;
                  })
                  .map(employee => {
                    const status = getEmployeeStatus(employee.id);
                    const hours = getEmployeeHours(employee.id);
                    const weeklyHours = getWeeklyHoursFromEnum(employee.weeklyHours);
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${employee.mainService.color}20`,
                              color: employee.mainService.color
                            }}
                          >
                            {employee.mainService.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {employee.contractType}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {employee.weeklyHours.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {hours}h / {weeklyHours}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {weeklyHours - hours > 0 ? `${(weeklyHours - hours).toFixed(1)}h restantes` : 'Complet'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${
                            status.color === 'green' ? 'bg-green-100 text-green-800' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {hours >= weeklyHours ? (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                <span>Complet</span>
                              </>
                            ) : hours >= weeklyHours * 0.8 ? (
                              <>
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <span>Presque</span>
                              </>
                            ) : (
                              <>
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <span>Insuffisant</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {employee.polyvalentServices.length > 0 ? (
                            <span className="text-blue-600 font-medium">
                              {employee.polyvalentServices.length} service(s)
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">0j</span> / 30j
                          </div>
                          <div className="text-xs text-gray-500">
                            30j restants
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {employees.filter(emp => {
            const matchSearch = searchTerm === '' || 
              `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchService = filterService === 'ALL' || emp.mainService.id.toString() === filterService;
            const status = getEmployeeStatus(emp.id);
            const matchStatus = filterStatus === 'ALL' || status.status === filterStatus;
            return matchSearch && matchService && matchStatus;
          }).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun employé ne correspond aux filtres
            </div>
          )}
        </div>
      </Card>

      {/* Modal d'ajout de shift */}
      {isAddingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter au planning</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de jour</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSlotType('WORK')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      slotType === 'WORK'
                        ? 'border-hotaly-primary bg-hotaly-primary text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Travail
                  </button>
                  <button
                    onClick={() => setSlotType('REST')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      slotType === 'REST'
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Repos
                  </button>
                  <button
                    onClick={() => setSlotType('LEAVE')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      slotType === 'LEAVE'
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Congé
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                <select
                  value={newSlot.employeeId || ''}
                  onChange={(e) => setNewSlot({ ...newSlot, employeeId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.mainService.name}
                    </option>
                  ))}
                </select>
              </div>

              {slotType === 'WORK' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={newSlot.serviceId || ''}
                    onChange={(e) => setNewSlot({ ...newSlot, serviceId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                  >
                    <option value="">Sélectionner un service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  value={newSlot.date || ''}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                >
                  <option value="">Sélectionner un jour</option>
                  {weekDates.map((date, index) => (
                    <option key={index} value={date.toISOString().split('T')[0]}>
                      {daysOfWeek[index]} {date.toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>

              {slotType === 'WORK' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pause (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={newSlot.breakTime}
                      onChange={(e) => setNewSlot({ ...newSlot, breakTime: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                    />
                  </div>
                </>
              )}

              {slotType === 'LEAVE' && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ Ce jour sera marqué comme Congé Payé et ne comptera pas dans les heures travaillées.
                  </p>
                </div>
              )}

              {slotType === 'REST' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Ce jour sera marqué comme Repos hebdomadaire.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => setIsAddingSlot(false)}
                variant="secondary"
              >
                Annuler
              </Button>
              <Button
                onClick={addSlot}
                variant="primary"
                disabled={!newSlot.employeeId || !newSlot.serviceId || !newSlot.date}
              >
                Ajouter
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de détail du slot */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail du shift</h3>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">Employé:</span> {getEmployeeName(selectedSlot.employeeId)}
              </div>
              <div>
                <span className="font-medium">Service:</span> {getServiceName(selectedSlot.serviceId)}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(selectedSlot.date).toLocaleDateString('fr-FR')}
              </div>
              <div>
                <span className="font-medium">Horaires:</span> {selectedSlot.startTime} - {selectedSlot.endTime}
              </div>
              <div>
                <span className="font-medium">Pause:</span> {selectedSlot.breakTime} minutes
              </div>
              <div>
                <span className="font-medium">Heures travaillées:</span> {calculateSlotHours(selectedSlot.startTime, selectedSlot.endTime, selectedSlot.breakTime).toFixed(1)}h
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => setSelectedSlot(null)}
                variant="secondary"
              >
                Fermer
              </Button>
              <Button
                onClick={() => {
                  removeSlot(selectedSlot.id);
                  setSelectedSlot(null);
                }}
                variant="danger"
                className="flex items-center space-x-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Supprimer</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlanningHebdomadaire;

