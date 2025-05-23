import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  type: 'operations' | 'performance' | 'safety' | 'progress';
}

export function AdvancedFilters({ onFiltersChange, type }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    method: '',
    machine: '',
    status: '',
    poste: '',
    panneau: '',
    severity: '',
    location: ''
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters
    const active = Object.entries(newFilters)
      .filter(([, val]) => val !== '')
      .map(([key]) => key);
    setActiveFilters(active);
    
    onFiltersChange(newFilters);
  };

  const clearFilter = (key: string) => {
    handleFilterChange(key, '');
  };

  const clearAllFilters = () => {
    const emptyFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as any);
    setFilters(emptyFilters);
    setActiveFilters([]);
    onFiltersChange(emptyFilters);
  };

  const getFilterLabel = (key: string) => {
    const labels: Record<string, string> = {
      dateStart: 'Date début',
      dateEnd: 'Date fin',
      method: 'Méthode',
      machine: 'Machine',
      status: 'Statut',
      poste: 'Poste',
      panneau: 'Panneau',
      severity: 'Gravité',
      location: 'Localisation'
    };
    return labels[key] || key;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filtres Avancés
          </CardTitle>
          {activeFilters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <RotateCcw className="mr-2 h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateStart">Date de début</Label>
            <Input
              id="dateStart"
              type="date"
              value={filters.dateStart}
              onChange={(e) => handleFilterChange('dateStart', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dateEnd">Date de fin</Label>
            <Input
              id="dateEnd"
              type="date"
              value={filters.dateEnd}
              onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
            />
          </div>
        </div>

        {/* Method and Machine */}
        {(type === 'operations' || type === 'performance') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Méthode de décapage</Label>
              <Select value={filters.method} onValueChange={(value) => handleFilterChange('method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les méthodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les méthodes</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="casement">Casement</SelectItem>
                  <SelectItem value="poussage">Poussage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="marche">En marche</SelectItem>
                  <SelectItem value="arret">À l'arrêt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Safety specific filters */}
        {type === 'safety' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="severity">Gravité</Label>
              <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les gravités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les gravités</SelectItem>
                  <SelectItem value="minor">Mineur</SelectItem>
                  <SelectItem value="major">Majeur</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                placeholder="Zone, panneau..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Zone filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="poste">Poste</Label>
            <Select value={filters.poste} onValueChange={(value) => handleFilterChange('poste', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les postes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les postes</SelectItem>
                <SelectItem value="1">Poste 1</SelectItem>
                <SelectItem value="2">Poste 2</SelectItem>
                <SelectItem value="3">Poste 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="panneau">Panneau</Label>
            <Input
              id="panneau"
              placeholder="Ex: P-45"
              value={filters.panneau}
              onChange={(e) => handleFilterChange('panneau', e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Filtres actifs:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map((filterKey) => (
                <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
                  {getFilterLabel(filterKey)}: {filters[filterKey as keyof typeof filters]}
                  <button
                    onClick={() => clearFilter(filterKey)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}