import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, TrendingUp, Box, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { MethodChart, WeeklyChart } from '@/components/charts/performance-charts';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats/dashboard'],
  });

  const { data: operations = [] } = useQuery({
    queryKey: ['/api/operations'],
  });

  if (isLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  const kpis = [
    {
      title: 'Machines Actives',
      value: stats?.activeMachines || 0,
      icon: Truck,
      change: '+8.2%',
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Rendement Moyen',
      value: `${stats?.avgYield || 0}`,
      unit: 'm/h',
      icon: TrendingUp,
      change: '+12.4%',
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Volume Décapé',
      value: stats?.volume || 0,
      unit: 'm³',
      icon: Box,
      change: '+5.7%',
      trend: 'up',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Disponibilité',
      value: `${stats?.availability || 0}`,
      unit: '%',
      icon: Clock,
      change: '-2.1%',
      trend: 'down',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {kpi.value}
                      {kpi.unit && <span className="text-lg text-gray-500 ml-1">{kpi.unit}</span>}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${kpi.color} h-6 w-6`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                    {kpi.change}
                  </span>
                  <span className="text-gray-500 ml-2">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendement par Méthode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <MethodChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution Hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <WeeklyChart />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Status Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>État des Machines</CardTitle>
            <Badge variant="outline">Temps réel</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Méthode</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">État</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rendement</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Disponibilité</th>
                </tr>
              </thead>
              <tbody>
                {operations.slice(0, 5).map((operation: any) => (
                  <tr key={operation.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Truck className="text-gray-600 h-4 w-4" />
                        </div>
                        <span className="font-medium text-gray-900">{operation.ficheId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{operation.method}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={operation.machineStatus === 'marche' ? 'default' : 'secondary'}
                        className={operation.machineStatus === 'marche' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {operation.machineStatus === 'marche' ? 'En marche' : 'À l\'arrêt'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-900">
                        {operation.workingHours && operation.volumeBlasted ? 
                          Math.round((operation.volumeBlasted / operation.workingHours) * 10) / 10 : 0
                        } m/h
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(Math.random() * 40 + 60)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
