import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  UserIcon, 
  CogIcon, 
  HomeIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  BriefcaseIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import api from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmployeeFilters from '../components/rh/EmployeeFilters';
import EmployeeActions from '../components/rh/EmployeeActions';
import EmployeeTable from '../components/rh/EmployeeTable';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import SalaryGridManager from '../components/rh/SalaryGridManager';
import FlexibilityAlerts from '../components/rh/FlexibilityAlerts';
import ServiceModal from '../components/services/ServiceModal';
import RHConfiguration from '../components/rh/RHConfiguration';

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
  flexibilityType?: string | undefined;
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
  schedules: Array<{
    season: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }>;
  _count: {
    employees: number;
  };
}

type RHSection = 'dashboard' | 'employees' | 'services' | 'housekeeping' | 'planning' | 'configuration';

const RH: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<RHSection>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeFilters, setEmployeeFilters] = useState({
    search: '',
    serviceId: '',
    contractType: '',
    status: '',
    polyvalence: ''
  });
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [salaryGrids, setSalaryGrids] = useState<Array<{
    id: number;
    level: number;
    echelon: number;
    hourlyRate: number;
  }>>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const sections = [
    { id: 'dashboard', name: 'Dashboard RH', icon: HomeIcon, color: 'hotaly-primary', description: 'Vue d\'ensemble' },
    { id: 'employees', name: 'Employés', icon: UsersIcon, color: 'hotaly-secondary', description: 'Gestion du personnel' },
    { id: 'services', name: 'Services', icon: CogIcon, color: 'hotaly-accent', description: 'Organisation des services' },
    { id: 'housekeeping', name: 'Housekeeping', icon: WrenchScrewdriverIcon, color: 'hotaly-tertiary', description: 'Entretien et nettoyage' },
    { id: 'planning', name: 'Planning', icon: CalendarIcon, color: 'hotaly-primary', description: 'Planification des équipes' },
    { id: 'configuration', name: 'Configuration', icon: ChartBarIcon, color: 'hotaly-secondary', description: 'Paramètres RH' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Test de l\'endpoint /rh/employees...');
      
      // Test sans authentification (développement)
      const [employeesResponse, servicesResponse, salaryGridsResponse] = await Promise.all([
        api.get('/rh/employees'),
        api.get('/rh/services'),
        api.get('/rh/salary-grid')
      ]);
      
      console.log('✅ Réponse employés:', employeesResponse.data);
      console.log('✅ Réponse services:', servicesResponse.data);
      console.log('✅ Réponse grilles salariales:', salaryGridsResponse.data);
      
      setEmployees(employeesResponse.data as Employee[]);
      setServices(servicesResponse.data);
      setSalaryGrids(salaryGridsResponse.data);
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Message:', error.response?.data);
      console.error('❌ Headers:', error.response?.headers);
      
      setError(`Erreur lors du chargement des données: ${error.message}`);
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonctions pour les composants avancés
  const handleEmployeeFiltersChange = (filters: any) => {
    setEmployeeFilters(filters);
    setSearchTerm(filters.search); // Synchroniser avec le filtre de recherche
  };

  const handleAddEmployee = () => {
    setIsAddEmployeeModalOpen(true);
  };

  const handleImportExcel = (file: File) => {
    console.log('Import Excel:', file.name);
    // Ici vous pouvez implémenter l'import Excel
  };

  const handleExportExcel = () => {
    console.log('Export Excel');
    // Ici vous pouvez implémenter l'export Excel
  };

  const handleBulkDelete = () => {
    console.log('Suppression en masse:', selectedEmployeeIds);
    // Ici vous pouvez implémenter la suppression en masse
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsAddEmployeeModalOpen(true); // Utiliser le même modal
  };

  const handleDeleteEmployee = async (employee: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${employee.firstName} ${employee.lastName} ?`)) {
      try {
        await api.delete(`/rh/employees/${employee.id}`);
        loadData(); // Recharger les données
        alert('Employé supprimé avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de l\'employé');
      }
    }
  };

  const handleAddService = () => {
    setSelectedService(null);
    setIsServiceModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (service: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?`)) {
      try {
        await api.delete(`/rh/services/${service.id}`);
        loadData(); // Recharger les données
        alert('Service supprimé avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression du service');
      }
    }
  };

  const handleServiceAdded = () => {
    loadData(); // Recharger les données
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEmployeeSelectionChange = (selectedIds: string[]) => {
    setSelectedEmployeeIds(selectedIds);
  };

  const handleEmployeeAdded = () => {
    loadData(); // Recharger les données
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="elevated" className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <CogIcon className="h-10 w-10 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h3>
        <p className="text-gray-600 mb-8 text-lg">{error}</p>
        <Button onClick={loadData} variant="primary" size="lg">
          <CogIcon className="h-5 w-5 mr-2" />
          Réessayer
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
                 <h1 className="text-5xl font-extrabold text-hotaly-primary mb-4 tracking-tight">
           Module RH
         </h1>
         <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
           Gestion complète et moderne des ressources humaines
         </p>
         
         {/* Navigation des sections */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="flex flex-wrap justify-center gap-4 mt-8"
         >
           {sections.map((section) => (
             <button
               key={section.id}
               onClick={() => setActiveSection(section.id as RHSection)}
               className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                 activeSection === section.id
                   ? 'bg-hotaly-primary text-white shadow-lg'
                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
               }`}
             >
               <section.icon className="w-5 h-5" />
               <span>{section.name}</span>
             </button>
           ))}
         </motion.div>
       </motion.div>

             

      {/* Contenu des sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Dashboard RH - Vue d'ensemble uniquement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-hotaly-primary mb-4">
                  Dashboard RH - Vue d'ensemble
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Statistiques et métriques clés du module Ressources Humaines
                </p>
              </motion.div>

              {/* Statistiques RH - Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card variant="elevated">
                  <div className="p-6 text-center">
                    <UsersIcon className="mx-auto h-8 w-8 text-hotaly-primary mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{employees.length}</div>
                    <div className="text-sm text-gray-600">Total employés</div>
                  </div>
                </Card>
                
                <Card variant="elevated">
                  <div className="p-6 text-center">
                    <CogIcon className="mx-auto h-8 w-8 text-hotaly-secondary mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{services.length}</div>
                    <div className="text-sm text-gray-600">Services actifs</div>
                  </div>
                </Card>
                
                <Card variant="elevated">
                  <div className="p-6 text-center">
                    <CheckCircleIcon className="mx-auto h-8 w-8 text-hotaly-accent mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {employees.filter(emp => emp.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Employés actifs</div>
                  </div>
                </Card>
                
                <Card variant="elevated">
                  <div className="p-6 text-center">
                    <StarIcon className="mx-auto h-8 w-8 text-hotaly-tertiary mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {employees.filter(emp => emp.polyvalentServices?.length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Polyvalents</div>
                  </div>
                </Card>
              </div>

              {/* Graphiques et métriques avancées */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Répartition par type de contrat */}
                <Card variant="elevated">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par contrat</h3>
                    <div className="space-y-3">
                      {['CDI', 'CDD', 'Interim', 'Stage'].map((contractType) => {
                        const count = employees.filter(emp => emp.contractType === contractType).length;
                        const percentage = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
                        return (
                          <div key={contractType} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{contractType}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-hotaly-primary h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Répartition par service */}
                <Card variant="elevated">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par service</h3>
                    <div className="space-y-3">
                      {services.slice(0, 5).map((service) => {
                        const count = service._count?.employees || 0;
                        return (
                          <div key={service.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: service.color }}
                              />
                              <span className="text-sm font-medium text-gray-700">{service.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">{count} employé{count > 1 ? 's' : ''}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Alertes de flexibilité */}
              <FlexibilityAlerts 
                employees={employees as any} 
                currentWeekHours={{}} // Dans une vraie app, on récupérerait les heures actuelles
              />

              {/* Actions rapides */}
              <Card variant="elevated">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      size="md" 
                      onClick={() => setActiveSection('employees')}
                      className="w-full"
                    >
                      <UsersIcon className="h-5 w-5 mr-2" />
                      Gérer les employés
                    </Button>
                    <Button 
                      variant="outline" 
                      size="md" 
                      onClick={() => setActiveSection('services')}
                      className="w-full"
                    >
                      <CogIcon className="h-5 w-5 mr-2" />
                      Gérer les services
                    </Button>
                    <Button 
                      variant="outline" 
                      size="md" 
                      onClick={() => setActiveSection('planning')}
                      className="w-full"
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Voir le planning
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'employees' && (
            <div className="space-y-6">
              {/* Composants avancés pour la gestion des employés */}
              <EmployeeActions
                onAddEmployee={handleAddEmployee}
                onImportExcel={handleImportExcel}
                onExportExcel={handleExportExcel}
                onBulkDelete={handleBulkDelete}
                selectedCount={selectedEmployeeIds.length}
                totalCount={employees.length}
              />
              
              <EmployeeFilters
                onFiltersChange={handleEmployeeFiltersChange}
                services={services.map(service => ({
                  id: service.id.toString(),
                  name: service.name,
                  color: service.color
                }))}
              />
              
              <EmployeeTable
                employees={employees.map(emp => ({
                  id: emp.id.toString(),
                  firstName: emp.firstName,
                  lastName: emp.lastName,
                  mainService: {
                    id: emp.mainService?.id.toString() || '',
                    name: emp.mainService?.name || '',
                    color: emp.mainService?.color || '#000000'
                  },
                  contractType: emp.contractType,
                  weeklyHours: parseInt(emp.weeklyHours) || 0,
                  salaryLevel: `${emp.salaryGrid?.level || 0}-${emp.salaryGrid?.echelon || 0}`,
                  annualLeave: 25, // Valeur par défaut
                  isPolyvalent: (emp.polyvalentServices?.length || 0) > 0,
                  isActive: emp.isActive
                }))}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
                onView={handleViewEmployee}
                onSelectionChange={handleEmployeeSelectionChange}
                selectedIds={selectedEmployeeIds}
              />
            </div>
          )}

          {activeSection === 'services' && (
            <div className="space-y-6">
              {/* Header avec bouton d'ajout */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des Services</h2>
                  <p className="text-gray-600">Organisez les services et leurs horaires d'ouverture</p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddService}
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Nouveau service</span>
                </Button>
              </div>

              {/* Liste des services */}
              <Card variant="elevated">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: service.color }}
                          />
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                        </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-1 text-gray-400 hover:text-hotaly-primary transition-colors"
                              title="Modifier"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteService(service)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Type:</span> {service.type}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Employés:</span> {service._count?.employees || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Statut:</span> 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              service.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {service.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          {service.schedules && service.schedules.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Horaires:</span> 
                              <span className="ml-1">
                                {service.schedules.some(s => s.season === 'HAUTE') ? 'Basse/Haute saison' : 'Simple'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {services.length === 0 && (
                    <div className="text-center py-12">
                      <CogIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service</h3>
                      <p className="text-gray-600 mb-4">Commencez par créer votre premier service</p>
                      <Button
                        variant="primary"
                        onClick={handleAddService}
                        className="flex items-center space-x-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        <span>Créer un service</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'housekeeping' && (
            <Card variant="elevated">
              <div className="p-6 text-center">
                <WrenchScrewdriverIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Housekeeping</h3>
                <p className="text-gray-600">Fonctionnalités en cours de développement</p>
              </div>
            </Card>
          )}

          {activeSection === 'planning' && (
            <Card variant="elevated">
              <div className="p-6 text-center">
                <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Planning</h3>
                <p className="text-gray-600">Fonctionnalités en cours de développement</p>
              </div>
            </Card>
          )}

          {activeSection === 'configuration' && (
            <div className="space-y-6">
              <RHConfiguration />
              <Card variant="elevated">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-hotaly-primary mb-6">Grilles Salariales</h2>
                  <SalaryGridManager onGridsChange={setSalaryGrids} />
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals intégrés directement */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => {
          setIsAddEmployeeModalOpen(false);
          setSelectedEmployee(null); // Réinitialiser l'employé sélectionné
        }}
        onSuccess={handleEmployeeAdded}
        services={services}
        salaryGrids={salaryGrids}
        employeeToEdit={selectedEmployee as any}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setSelectedService(null);
        }}
        onSuccess={handleServiceAdded}
        serviceToEdit={selectedService}
      />

      {/* Modal de visualisation intégré */}
      {isViewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Détails de l'employé</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Prénom:</label>
                  <p className="text-gray-700">{selectedEmployee.firstName}</p>
                </div>
                <div>
                  <label className="font-medium">Nom:</label>
                  <p className="text-gray-700">{selectedEmployee.lastName}</p>
                </div>
                <div>
                  <label className="font-medium">Service:</label>
                  <p className="text-gray-700">{selectedEmployee.mainService?.name}</p>
                </div>
                <div>
                  <label className="font-medium">Contrat:</label>
                  <p className="text-gray-700">{selectedEmployee.contractType}</p>
                </div>
                <div>
                  <label className="font-medium">Heures:</label>
                  <p className="text-gray-700">{selectedEmployee.weeklyHours}</p>
                </div>
                <div>
                  <label className="font-medium">Statut:</label>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedEmployee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedEmployee.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RH;


