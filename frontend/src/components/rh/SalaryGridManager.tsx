import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface SalaryGrid {
  id: number;
  level: number;
  echelon: number;
  hourlyRate: number;
  daysOff?: number;
  vacationDays?: number;
}

interface SalaryGridManagerProps {
  onGridsChange: (grids: SalaryGrid[]) => void;
}

const SalaryGridManager: React.FC<SalaryGridManagerProps> = ({ onGridsChange }) => {
  const [salaryGrids, setSalaryGrids] = useState<SalaryGrid[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGrid, setEditingGrid] = useState<SalaryGrid | null>(null);
  const [formData, setFormData] = useState({
    level: '',
    echelon: '',
    hourlyRate: '',
    daysOff: '25',
    vacationDays: '5'
  });

  useEffect(() => {
    loadSalaryGrids();
  }, []);

  const loadSalaryGrids = async () => {
    try {
      const response = await fetch('/api/v1/rh/salary-grid');
      if (response.ok) {
        const grids = await response.json();
        setSalaryGrids(grids);
        onGridsChange(grids);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des grilles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const gridData = {
        level: parseInt(formData.level),
        echelon: parseInt(formData.echelon),
        hourlyRate: parseFloat(formData.hourlyRate),
        daysOff: parseInt(formData.daysOff),
        vacationDays: parseInt(formData.vacationDays)
      };

      if (editingGrid) {
        // Mise à jour
        const response = await fetch(`/api/v1/rh/salary-grid/${editingGrid.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gridData)
        });
        if (response.ok) {
          setSalaryGrids(prev => prev.map(g => g.id === editingGrid.id ? { ...g, ...gridData } : g));
          setEditingGrid(null);
        }
      } else {
        // Création
        const response = await fetch('/api/v1/rh/salary-grid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gridData)
        });
        if (response.ok) {
          const newGrid = await response.json();
          setSalaryGrids(prev => [...prev, newGrid]);
        }
      }

      resetForm();
      loadSalaryGrids();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la grille salariale');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette grille salariale ?')) {
      try {
        const response = await fetch(`/api/v1/rh/salary-grid/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setSalaryGrids(prev => prev.filter(g => g.id !== id));
          loadSalaryGrids();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleEdit = (grid: SalaryGrid) => {
    setEditingGrid(grid);
    setFormData({
      level: grid.level.toString(),
      echelon: grid.echelon.toString(),
      hourlyRate: grid.hourlyRate.toString(),
      daysOff: (grid.daysOff || 25).toString(),
      vacationDays: (grid.vacationDays || 5).toString()
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      level: '',
      echelon: '',
      hourlyRate: '',
      daysOff: '25',
      vacationDays: '5'
    });
    setIsAdding(false);
    setEditingGrid(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Grilles Salariales</h3>
        <Button
          onClick={() => setIsAdding(true)}
          variant="primary"
          size="sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvelle grille
        </Button>
      </div>

      {/* Formulaire d'ajout/édition */}
      {isAdding && (
        <Card variant="outlined">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau *
                </label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Échelon *
                </label>
                <input
                  type="number"
                  name="echelon"
                  value={formData.echelon}
                  onChange={(e) => setFormData(prev => ({ ...prev, echelon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux horaire (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                  placeholder="12.50"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jours de congés
                </label>
                <input
                  type="number"
                  name="daysOff"
                  value={formData.daysOff}
                  onChange={(e) => setFormData(prev => ({ ...prev, daysOff: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jours de vacances
                </label>
                <input
                  type="number"
                  name="vacationDays"
                  value={formData.vacationDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, vacationDays: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotaly-primary"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {editingGrid ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des grilles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salaryGrids.map((grid) => (
          <Card key={grid.id} variant="elevated">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CurrencyEuroIcon className="w-5 h-5 text-hotaly-primary" />
                  <h4 className="font-medium text-gray-900">
                    Niveau {grid.level} - Échelon {grid.echelon}
                  </h4>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(grid)}
                    className="p-1 text-gray-400 hover:text-hotaly-primary"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(grid.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux horaire:</span>
                  <span className="font-medium">{grid.hourlyRate}€/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Congés:</span>
                  <span className="font-medium">{grid.daysOff || 25} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vacances:</span>
                  <span className="font-medium">{grid.vacationDays || 5} jours</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SalaryGridManager;
