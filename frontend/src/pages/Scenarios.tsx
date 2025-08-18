import React from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, PlayIcon, PauseIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Scenarios: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header du module */}
      <div className="bg-gradient-to-r from-hotaly-tertiary to-hotaly-tertiary-dark rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <DocumentTextIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Module Scénarios</h1>
            <p className="text-hotaly-neutral-light">Planification & Simulations</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Scénario Optimiste */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <PlayIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scénario Optimiste</h3>
            <p className="text-gray-600 text-sm">Croissance forte</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-green-600">+15%</span>
              <span className="text-gray-500 text-sm"> vs base</span>
            </div>
          </div>
        </Card>

        {/* Carte Scénario Base */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scénario Base</h3>
            <p className="text-gray-600 text-sm">Tendance actuelle</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-blue-600">0%</span>
              <span className="text-gray-500 text-sm"> référence</span>
            </div>
          </div>
        </Card>

        {/* Carte Scénario Pessimiste */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <PauseIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scénario Pessimiste</h3>
            <p className="text-gray-600 text-sm">Risque de baisse</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-red-600">-10%</span>
              <span className="text-gray-500 text-sm"> vs base</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Message de développement */}
      <Card className="bg-gradient-to-r from-hotaly-neutral to-hotaly-neutral-light">
        <div className="text-center p-8">
          <div className="mx-auto w-16 h-16 bg-hotaly-tertiary/20 rounded-full flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-8 w-8 text-hotaly-tertiary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Module en Développement</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Le module Scénarios est actuellement en cours de développement. 
            Il permettra de créer et comparer différents scénarios de planification 
            pour optimiser la performance de votre établissement.
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

export default Scenarios;


