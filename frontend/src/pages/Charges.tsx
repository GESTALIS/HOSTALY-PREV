import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, CogIcon, WrenchScrewdriverIcon, TruckIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Charges: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header du module */}
      <div className="bg-gradient-to-r from-hotaly-secondary to-hotaly-secondary-dark rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <ChartBarIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Module Charges</h1>
            <p className="text-hotaly-neutral-light">Gestion des Coûts & Dépenses</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Charges RH */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-hotaly-primary/20 rounded-full flex items-center justify-center mb-4">
              <CogIcon className="h-6 w-6 text-hotaly-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Charges RH</h3>
            <p className="text-gray-600 text-sm">Salaires & Charges sociales</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-hotaly-primary">€0</span>
              <span className="text-gray-500 text-sm">/mois</span>
            </div>
          </div>
        </Card>

        {/* Carte Charges Opérationnelles */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-hotaly-accent/20 rounded-full flex items-center justify-center mb-4">
              <WrenchScrewdriverIcon className="h-6 w-6 text-hotaly-accent" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Opérationnelles</h3>
            <p className="text-gray-600 text-sm">Maintenance & Équipements</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-hotaly-accent">€0</span>
              <span className="text-gray-500 text-sm">/mois</span>
            </div>
          </div>
        </Card>

        {/* Carte Charges Logistiques */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-hotaly-tertiary/20 rounded-full flex items-center justify-center mb-4">
              <TruckIcon className="h-6 w-6 text-hotaly-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Logistiques</h3>
            <p className="text-gray-600 text-sm">Fournitures & Transport</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-hotaly-tertiary">€0</span>
              <span className="text-gray-500 text-sm">/mois</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Message de développement */}
      <Card className="bg-gradient-to-r from-hotaly-neutral to-hotaly-neutral-light">
        <div className="text-center p-8">
          <div className="mx-auto w-16 h-16 bg-hotaly-secondary/20 rounded-full flex items-center justify-center mb-4">
            <ChartBarIcon className="h-8 w-8 text-hotaly-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Module en Développement</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Le module Charges est actuellement en cours de développement. 
            Il permettra de gérer tous les coûts de votre établissement : charges RH, 
            opérationnelles, logistiques et administratives.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="primary" size="lg">
              Documentation
            </Button>
            <Button variant="outline" size="lg">
              Roadmap
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Charges;


