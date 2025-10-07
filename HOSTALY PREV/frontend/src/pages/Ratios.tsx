import React from 'react';
import { motion } from 'framer-motion';
import { CogIcon, ChartPieIcon, CalculatorIcon, TrendingUpIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Ratios: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header du module */}
      <div className="bg-gradient-to-r from-hotaly-primary to-hotaly-primary-dark rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <CogIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Module Ratios</h1>
            <p className="text-hotaly-neutral-light">Indicateurs de Performance</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Ratio de Rentabilité */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-hotaly-secondary/20 rounded-full flex items-center justify-center mb-4">
              <ChartPieIcon className="h-6 w-6 text-hotaly-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rentabilité</h3>
            <p className="text-gray-600 text-sm">Marge bénéficiaire</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-hotaly-secondary">0%</span>
            </div>
          </div>
        </Card>

        {/* Carte Ratio de Liquidité */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-hotaly-accent/20 rounded-full flex items-center justify-center mb-4">
              <CalculatorIcon className="h-6 w-6 text-hotaly-accent" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Liquidité</h3>
            <p className="text-gray-600 text-sm">Capacité de paiement</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-hotaly-accent">0:1</span>
            </div>
          </div>
        </Card>

        {/* Carte Ratio d'Endettement */}
        <Card variant="elevated" className="hover:scale-105 transition-transform">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-hotaly-tertiary/20 rounded-full flex items-center justify-center mb-4">
              <TrendingUpIcon className="h-6 w-6 text-hotaly-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Endettement</h3>
            <p className="text-gray-600 text-sm">Niveau de dette</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-hotaly-tertiary">0%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Message de développement */}
      <Card className="bg-gradient-to-r from-hotaly-neutral to-hotaly-neutral-light">
        <div className="text-center p-8">
          <div className="mx-auto w-16 h-16 bg-hotaly-primary/20 rounded-full flex items-center justify-center mb-4">
            <CogIcon className="h-8 w-8 text-hotaly-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Module en Développement</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Le module Ratios est actuellement en cours de développement. 
            Il permettra d'analyser les indicateurs clés de performance financière 
            de votre établissement hôtelier.
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

export default Ratios;


