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
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import api from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
    };
  }>;
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
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter pour accéder aux données RH');
        setLoading(false);
        return;
      }

      // Test des endpoints avec logs détaillés
      console.log('🔍 Test de l\'endpoint /rh/employees...');
      const employeesRes = await api.get('/rh/employees');
      console.log('📊 Réponse employés:', employeesRes);
      console.log(' Structure employés:', employeesRes.data);
      
      console.log('🔍 Test de l\'endpoint /rh/services...');
      const servicesRes = await api.get('/rh/services');
      console.log('📊 Réponse services:', servicesRes);
      console.log(' Structure services:', servicesRes.data);
      
      // Vérification de la structure des données
      if (employeesRes.data && Array.isArray(employeesRes.data)) {
        console.log('✅ Employés: Array valide avec', employeesRes.data.length, 'éléments');
        if (employeesRes.data.length > 0) {
          console.log(' Premier employé:', employeesRes.data[0]);
          console.log('🔍 Structure mainService:', employeesRes.data[0].mainService);
          console.log('🔍 Structure salaryGrid:', employeesRes.data[0].salaryGrid);
          console.log('🔍 Structure polyvalentServices:', employeesRes.data[0].polyvalentServices);
        }
      } else {
        console.log('❌ Employés: Structure invalide:', typeof employeesRes.data);
      }
      
      if (servicesRes.data && Array.isArray(servicesRes.data)) {
        console.log('✅ Services: Array valide avec', servicesRes.data.length, 'éléments');
        if (servicesRes.data.length > 0) {
          console.log(' Premier service:', servicesRes.data[0]);
          console.log('🔍 Structure _count:', servicesRes.data[0]._count);
          console.log('🔍 Structure schedules:', servicesRes.data[0].schedules);
        }
      } else {
        console.log('❌ Services: Structure invalide:', typeof servicesRes.data);
      }
      
      setEmployees(employeesRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Message:', error.response?.data);
      console.error('❌ Headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError(`Erreur ${error.response?.status || 'inconnue'}: ${error.response?.data?.message || error.message}`);
      }
    } finally {
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
        <div className="mt-8 flex justify-center space-x-4">
          <Button variant="primary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvel employé
          </Button>
          <Button variant="secondary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau service
          </Button>
        </div>
      </motion.div>

      {/* Navigation des sections moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const IconComponent = section.icon;
            return (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(section.id as RHSection)}
                className={`group flex flex-col items-center p-6 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-hotaly-primary to-hotaly-primary-light text-white shadow-xl'
                    : 'text-gray-600 hover:text-hotaly-primary hover:bg-hotaly-primary/5'
                }`}
              >
                <IconComponent className={`h-10 w-10 mb-3 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-hotaly-primary'
                }`} />
                <span className="text-sm font-bold text-center mb-1">{section.name}</span>
                <span className={`text-xs text-center ${
                  isActive ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {section.description}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Search and Filters moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
      >
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher employés..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-hotaly-primary/20 focus:border-hotaly-primary transition-all duration-300 text-lg"
          />
        </div>
        <Button variant="outline" size="md">
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filtres avancés
        </Button>
      </motion.div>

      {/* Contenu des sections */}
      <AnimatePresence mode="wait">
        {activeSection === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Cards modernes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Employés', count: employees.length, color: 'hotaly-primary', icon: UsersIcon, trend: '+12%' },
                { title: 'Actifs', count: employees.filter(e => e.isActive).length, color: 'hotaly-secondary', icon: UserIcon, trend: '+5%' },
                { title: 'Services', count: services.length, color: 'hotaly-accent', icon: CogIcon, trend: '+8%' },
                { title: 'CDI', count: employees.filter(e => e.contractType === 'CDI').length, color: 'hotaly-tertiary', icon: StarIcon, trend: '+15%' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="text-center">
                    <div className="flex flex-col items-center">
                      <div className={`p-4 bg-${stat.color}/10 rounded-2xl mb-4`}>
                        <stat.icon className={`h-8 w-8 text-${stat.color}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stat.count}</p>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Graphiques et métriques modernes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card variant="gradient">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Répartition par service</h3>
                <div className="space-y-4">
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <div className="flex items-center">
                        <div 
                          className="h-4 w-4 rounded-full mr-3"
                          style={{ backgroundColor: service.color }}
                        ></div>
                        <span className="font-medium text-gray-700">{service.name}</span>
                      </div>
                      <span className="text-lg font-bold text-hotaly-primary">{service._count?.employees || 0}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="elevated">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Activité récente</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-700">Nouvel employé ajouté</span>
                    </div>
                    <span className="text-sm text-gray-500">Il y a 2h</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-700">Service mis à jour</span>
                    </div>
                    <span className="text-sm text-gray-500">Il y a 4h</span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeSection === 'employees' && (
          <motion.div
            key="employees"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Employés */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Employés', count: employees.length, color: 'hotaly-primary', icon: UsersIcon, trend: '+12%' },
                { title: 'Actifs', count: employees.filter(e => e.isActive).length, color: 'hotaly-secondary', icon: CheckCircleIcon, trend: '+5%' },
                { title: 'CDI', count: employees.filter(e => e.contractType === 'CDI').length, color: 'hotaly-accent', icon: BriefcaseIcon, trend: '+8%' },
                { title: 'Saisonniers', count: employees.filter(e => e.contractType === 'SAISONNIER').length, color: 'hotaly-tertiary', icon: ClockIcon, trend: '+15%' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="text-center">
                    <div className="flex flex-col items-center">
                      <div className={`p-4 bg-${stat.color}/10 rounded-2xl mb-4`}>
                        <stat.icon className={`h-8 w-8 text-${stat.color}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stat.count}</p>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Table Employés moderne */}
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Liste des employés</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Employé', 'Service principal', 'Contrat', 'Grille', 'Polyvalences', 'Statut', ''].map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee, index) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-hotaly-primary to-hotaly-primary-light flex items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900">
                                  {employee.firstName} {employee.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="h-4 w-4 rounded-full mr-2"
                                style={{ backgroundColor: employee.mainService.color }}
                              ></div>
                              <span className="text-sm font-medium text-gray-900">{employee.mainService.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{employee.contractType}</div>
                            <div className="text-sm text-gray-500">{employee.weeklyHours}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              N{employee.salaryGrid.level} E{employee.salaryGrid.echelon}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.salaryGrid.hourlyRate}€/h
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {employee.polyvalentServices.map((poly, polyIndex) => (
                                <span
                                  key={poly.service.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-hotaly-accent/20 text-hotaly-accent border border-hotaly-accent/30"
                                >
                                  {poly.service.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              employee.isActive
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {employee.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-gray-400 hover:text-hotaly-primary transition-colors">
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          Aucun employé trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeSection === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Total Services', count: services.length, color: 'hotaly-accent', icon: CogIcon, trend: '+8%' },
                { title: 'Actifs', count: services.filter(s => s.isActive).length, color: 'hotaly-secondary', icon: CheckCircleIcon, trend: '+12%' },
                { title: 'Types', count: new Set(services.map(s => s.type)).size, color: 'hotaly-primary', icon: BriefcaseIcon, trend: '+5%' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="text-center">
                    <div className="flex flex-col items-center">
                      <div className={`p-4 bg-${stat.color}/10 rounded-2xl mb-4`}>
                        <stat.icon className={`h-8 w-8 text-${stat.color}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stat.count}</p>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Grid Services moderne */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.length > 0 ? (
                services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="gradient" className="h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div 
                            className="h-5 w-5 rounded-full mr-3"
                            style={{ backgroundColor: service.color }}
                          ></div>
                          <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {service.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Type:</span> {service.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Employés:</span> {service._count?.employees || 0}
                        </p>
                      </div>

                      {/* Horaires */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Horaires d'ouverture</h4>
                        <div className="space-y-3">
                          {['HAUTE', 'BASSE'].map((season) => {
                            const seasonSchedules = service.schedules?.filter(s => s.season === season) || [];
                            return (
                              <div key={season} className="text-xs">
                                <span className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{season}:</span>
                                <div className="grid grid-cols-7 gap-1 mt-2">
                                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                                    const schedule = seasonSchedules.find(s => s.dayOfWeek === day);
                                    return (
                                      <div key={day} className="text-center">
                                        <div className="text-gray-500 text-xs font-medium">{getDayName(day)}</div>
                                        {schedule ? (
                                          <div className="text-xs text-gray-900 bg-white/50 rounded p-1">
                                            {formatTime(schedule.openTime)}-{formatTime(schedule.closeTime)}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-400">-</div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Aucun service trouvé
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === 'housekeeping' && (
          <motion.div
            key="housekeeping"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <Card variant="elevated" className="text-center py-16">
              <WrenchScrewdriverIcon className="mx-auto h-16 w-16 text-hotaly-tertiary mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Module Housekeeping</h3>
              <p className="text-gray-600 text-lg mb-6">Gestion complète de l'entretien et du nettoyage</p>
              <div className="flex justify-center space-x-4">
                <Button variant="primary" size="lg">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nouvelle tâche
                </Button>
                <Button variant="outline" size="lg">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Voir les statistiques
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeSection === 'planning' && (
          <motion.div
            key="planning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <Card variant="elevated" className="text-center py-16">
              <CalendarIcon className="mx-auto h-16 w-16 text-hotaly-primary mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Module Planning</h3>
              <p className="text-gray-600 text-lg mb-6">Planification intelligente des équipes et des plannings</p>
              <div className="flex justify-center space-x-4">
                <Button variant="primary" size="lg">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nouveau planning
                </Button>
                <Button variant="outline" size="lg">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Optimiser les équipes
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeSection === 'configuration' && (
          <motion.div
            key="configuration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <Card variant="elevated" className="text-center py-16">
              <ChartBarIcon className="mx-auto h-16 w-16 text-hotaly-secondary mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Module Configuration</h3>
              <p className="text-gray-600 text-lg mb-6">Paramètres et configuration du module RH</p>
              <div className="flex justify-center space-x-4">
                <Button variant="primary" size="lg">
                  <CogIcon className="h-5 w-5 mr-2" />
                  Paramètres RH
                </Button>
                <Button variant="outline" size="lg">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Exporter les données
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RH;


