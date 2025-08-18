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
  CalculatorIcon,
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
    { name: 'Charges', href: '/charges', icon: CalculatorIcon },
    { name: 'Résultats', href: '/resultats', icon: ChartBarIcon },
    { name: 'Scénarios', href: '/scenarios', icon: DocumentTextIcon },
    { name: 'Ratios', href: '/ratios', icon: CogIcon },
  ];

  // Navigation des sous-sections RH (visible uniquement sur /rh)
  const rhSubSections = [
    { name: 'Employés', href: '/rh/employees', icon: UsersIcon },
    { name: 'Services', href: '/rh/services', icon: CogIcon },
    { name: 'Housekeeping', href: '/rh/housekeeping', icon: CogIcon },
    { name: 'Planning', href: '/rh/planning', icon: CogIcon },
    { name: 'Configuration', href: '/rh/config', icon: CogIcon },
  ];

  const isRHModule = location.pathname.startsWith('/rh');
  const currentModule = mainModules.find(module => location.pathname.startsWith(module.href));

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

            {/* Navigation des modules principaux - Desktop */}
            <nav className="hidden md:flex space-x-1">
              {mainModules.map((item) => {
                const isActive = location.pathname === item.href || 
                               (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'text-hotaly-secondary bg-hotaly-secondary/10 border-b-2 border-hotaly-secondary'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`mr-2 h-5 w-5 ${
                      isActive ? 'text-hotaly-secondary' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

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

          {/* Barre de sous-navigation pour le module RH */}
          {isRHModule && (
            <div className="border-t border-gray-100 bg-gray-50">
              <div className="flex space-x-1 py-2">
                {rhSubSections.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive
                          ? 'text-hotaly-primary bg-white shadow-sm border border-gray-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
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

              {/* Navigation mobile */}
              <nav className="p-4 space-y-2">
                {mainModules.map((item) => {
                  const isActive = location.pathname === item.href || 
                                 (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? 'text-hotaly-secondary bg-hotaly-secondary/10'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="mr-3 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Sous-sections RH en mobile */}
                {isRHModule && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Sections RH
                    </h3>
                    {rhSubSections.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center px-6 py-2 text-sm font-medium rounded-md ${
                            isActive
                              ? 'text-hotaly-primary bg-hotaly-primary/10'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </nav>
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
