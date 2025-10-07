import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  UsersIcon, 
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Navigation des modules principaux
  const mainModules = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'RH', href: '/rh', icon: UsersIcon },
    { name: 'CA', href: '/ca', icon: CurrencyDollarIcon },
    { name: 'Charges', href: '/charges', icon: ChartBarIcon },
    { name: 'Résultats', href: '/resultats', icon: ChartBarIcon },
    { name: 'Scénarios', href: '/scenarios', icon: DocumentTextIcon },
    { name: 'Ratios', href: '/ratios', icon: CogIcon },
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe avec navigation des modules */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo HOTALY */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-hotaly-primary">HOTALY</h1>
              </div>
            </div>



            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profil utilisateur */}
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <UserCircleIcon className="h-8 w-8" />
                <span className="hidden sm:block text-sm font-medium">Admin</span>
              </button>

              {/* Menu mobile */}
              <button
                type="button"
                className="md:hidden p-2 text-gray-400 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>


        </div>
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu mobile */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
