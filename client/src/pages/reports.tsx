import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExportButtons } from '@/components/reports/export-buttons';
import { AdvancedFilters } from '@/components/filters/advanced-filters';
import { PerformanceEvolutionChart, MethodChart } from '@/components/charts/performance-charts';
import { FileText, BarChart3, Calendar, TrendingUp } from 'lucide-react';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<'operations' | 'performance' | 'safety' | 'progress'>('operations');
  const [filters, setFilters] = useState({});

  const { data: operations = [] } = useQuery({
    queryKey: ['/api/operations'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats/dashboard'],
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['/api/safety/incidents'],
  });

  const reportTypes = [
    {
      id: 'operations',
      title: 'Rapports d\'Opérations',
      description: 'Interventions, machines et rendements',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      data: operations
    },
    {
      id: 'performance',
      title: 'Rapports de Performance',
      description: 'Disponibilité et analyses techniques',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      data: operations
    },
    {
      id: 'safety',
      title: 'Rapports HSE',
      description: 'Incidents et audits sécurité',
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      data: incidents
    },
    {
      id: 'progress',
      title: 'Rapports d\'Avancement',
      description: 'Progression par zones et panneaux',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      data: []
    }
  ];

  const currentReport = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Centre de Rapports OCP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReport === report.id;
              return (
                <Button
                  key={report.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                    isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedReport(report.id as any)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 ${isSelected ? 'bg-white/20' : report.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : report.color}`} />
                    </div>
                    <Badge variant={isSelected ? "secondary" : "outline"}>
                      {report.data.length}
                    </Badge>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{report.title}</p>
                    <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                      {report.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <AdvancedFilters 
        type={selectedReport}
        onFiltersChange={setFilters}
      />

      {/* Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Aperçu du Rapport - {currentReport?.title}</CardTitle>
                <ExportButtons 
                  data={currentReport?.data || []}
                  title={currentReport?.title || ''}
                  type={selectedReport}
                />
              </div>
            </CardHeader>
            <CardContent>
              {selectedReport === 'operations' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{operations.length}</p>
                      <p className="text-sm text-gray-600">Interventions</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {operations.reduce((sum: number, op: any) => sum + (op.volumeBlasted || 0), 0)}
                      </p>
                      <p className="text-sm text-gray-600">m³ décapés</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">
                        {operations.reduce((sum: number, op: any) => sum + (op.workingHours || 0), 0).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Heures totales</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <MethodChart />
                  </div>
                </div>
              )}

              {selectedReport === 'performance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{stats?.availability || 0}%</p>
                      <p className="text-sm text-gray-600">Disponibilité moyenne</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats?.avgYield || 0}</p>
                      <p className="text-sm text-gray-600">Rendement moyen (m/h)</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <PerformanceEvolutionChart />
                  </div>
                </div>
              )}

              {selectedReport === 'safety' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">127</p>
                      <p className="text-sm text-gray-600">Jours sans incident</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{incidents.length}</p>
                      <p className="text-sm text-gray-600">Incidents déclarés</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {incidents.filter((i: any) => i.status === 'resolved').length}
                      </p>
                      <p className="text-sm text-gray-600">Incidents résolus</p>
                    </div>
                  </div>
                  {incidents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Incidents récents:</h4>
                      {incidents.slice(0, 3).map((incident: any) => (
                        <div key={incident.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{incident.title}</span>
                            <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {incident.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{incident.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedReport === 'progress' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">73%</p>
                      <p className="text-sm text-gray-600">Avancement global</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">8</p>
                      <p className="text-sm text-gray-600">Zones actives</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['P-45 / T-12', 'P-44 / T-11', 'P-43 / T-10'].map((zone, index) => (
                      <div key={zone} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{zone}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${[87, 56, 23][index]}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{[87, 56, 23][index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Résumé du Rapport</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Période analysée</p>
                <p className="text-sm text-blue-600">
                  {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Données incluses</p>
                <p className="text-sm text-green-600">
                  {currentReport?.data.length || 0} enregistrements
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-800">Format recommandé</p>
                <p className="text-sm text-amber-600">PDF avec graphiques</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Contenu du rapport:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Synthèse exécutive</li>
                  <li>• Indicateurs clés (KPI)</li>
                  <li>• Graphiques et tendances</li>
                  <li>• Données détaillées</li>
                  <li>• Recommandations</li>
                </ul>
              </div>

              <ExportButtons 
                data={currentReport?.data || []}
                title={currentReport?.title || ''}
                type={selectedReport}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}