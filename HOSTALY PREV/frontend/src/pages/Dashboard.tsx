import React from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  CalculatorIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const modules = [
    {
      name: 'RH',
      description: 'Gestion des Ressources Humaines',
      href: '/rh',
      icon: UsersIcon,
      color: 'hotaly-primary',
      status: 'En développement',
      features: ['Employés', 'Services', 'Planning', 'Masse salariale']
    },
    {
      name: 'CA',
      description: 'Chiffre d\'Affaires & Revenus',
      href: '/ca',
      icon: CurrencyDollarIcon,
      color: 'hotaly-secondary',
      status: 'À venir',
      features: ['ADR', 'RevPAR', 'Occupation', 'Revenus']
    },
    {
      name: 'Charges',
      description: 'Gestion des Coûts & Dépenses',
      href: '/charges',
      icon: CalculatorIcon,
      color: 'hotaly-accent',
      status: 'À venir',
      features: ['Charges RH', 'Opérationnelles', 'Logistiques']
    },
    {
      name: 'Résultats',
      description: 'Analyse Financière & Performance',
      href: '/resultats',
      icon: ChartBarIcon,
      color: 'hotaly-tertiary',
      status: 'À venir',
      features: ['EBITDA', 'Marge nette', 'ROI', 'P&L']
    },
    {
      name: 'Scénarios',
      description: 'Planification & Simulations',
      href: '/scenarios',
      icon: DocumentTextIcon,
      color: 'hotaly-primary',
      status: 'À venir',
      features: ['Optimiste', 'Base', 'Pessimiste']
    },
    {
      name: 'Ratios',
      description: 'Indicateurs de Performance',
      href: '/ratios',
      icon: CogIcon,
      color: 'hotaly-secondary',
      status: 'À venir',
      features: ['Rentabilité', 'Liquidité', 'Endettement']
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header du Dashboard */}
      <div className="bg-gradient-to-r from-hotaly-primary via-hotaly-secondary to-hotaly-accent rounded-xl p-8 text-white">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
            <HomeIcon className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Bienvenue sur HOTALY PREV</h1>
          <p className="text-xl text-hotaly-neutral-light max-w-3xl mx-auto">
            Votre plateforme de planification hôtelière intelligente. 
            Gérez vos ressources, analysez vos performances et planifiez votre avenir.
          </p>
        </div>
      </div>

      {/* Vue d'ensemble des modules */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Modules Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="elevated" className="h-full hover:scale-105 transition-transform">
                <div className="p-6">
                  {/* Header du module */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${module.color}/20 rounded-lg flex items-center justify-center`}>
                      <module.icon className={`h-6 w-6 text-${module.color}`} />
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      module.status === 'En développement' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {module.status}
                    </span>
                  </div>

                  {/* Contenu du module */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{module.name}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>

                  {/* Fonctionnalités */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Fonctionnalités :</h4>
                    <ul className="space-y-1">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-hotaly-primary rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bouton d'accès */}
                  <Link to={module.href}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group"
                    >
                      Accéder au module
                      <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Aperçu Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-hotaly-primary mb-2">1</div>
            <div className="text-sm text-gray-600">Module actif</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-hotaly-secondary mb-2">5</div>
            <div className="text-sm text-gray-600">Modules à venir</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-hotaly-accent mb-2">100%</div>
            <div className="text-sm text-gray-600">Design moderne</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-hotaly-tertiary mb-2">24/7</div>
            <div className="text-sm text-gray-600">Disponibilité</div>
          </Card>
        </div>
      </div>

      {/* Call to action */}
      <Card className="bg-gradient-to-r from-hotaly-neutral to-hotaly-neutral-light text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Prêt à commencer ?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Explorez le module RH pour commencer à gérer vos ressources humaines, 
          ou découvrez les autres modules en cours de développement.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/rh">
            <Button variant="primary" size="lg">
              Commencer avec RH
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Voir la roadmap
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default Dashboard;


