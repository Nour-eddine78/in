import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PerformanceEvolutionChart } from '@/components/charts/performance-charts';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Performance() {
  const performanceData = [
    {
      rank: 1,
      machine: 'D11-001',
      availability: 92.4,
      yield: 284,
      mtbf: 156,
      score: 8.7,
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      rank: 2,
      machine: 'Transwine-02',
      availability: 78.1,
      yield: 198,
      mtbf: 124,
      score: 7.2,
      icon: Medal,
      color: 'text-gray-600'
    },
    {
      rank: 3,
      machine: 'PH1',
      availability: 85.6,
      yield: 167,
      mtbf: 98,
      score: 6.9,
      icon: Award,
      color: 'text-amber-600'
    }
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-400';
      case 2: return 'bg-gray-400';
      case 3: return 'bg-amber-600';
      default: return 'bg-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 7) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Performance Ranking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Classement des Performances</CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-blue-600 text-white">
                Machines
              </Button>
              <Button size="sm" variant="outline">
                Opérateurs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rang</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Disponibilité</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rendement</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">MTBF</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Score</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <tr key={item.rank} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 ${getRankColor(item.rank)} rounded-full flex items-center justify-center mr-2`}>
                            <span className="text-white text-xs font-bold">{item.rank}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{item.machine}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-medium">{item.availability}%</span>
                          <Progress value={item.availability} className="w-16" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{item.yield} m/h</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{item.mtbf}h</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${getScoreColor(item.score)}`}>
                          {item.score}/10
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Performances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <PerformanceEvolutionChart />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Analyse des Pannes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Hydraulique', count: 35, color: 'bg-red-500' },
                { type: 'Moteur', count: 25, color: 'bg-amber-500' },
                { type: 'Électrique', count: 20, color: 'bg-blue-500' },
                { type: 'Mécanique', count: 20, color: 'bg-green-500' }
              ].map((breakdown) => (
                <div key={breakdown.type} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${breakdown.color} rounded`}></div>
                  <span className="text-sm font-medium text-gray-900 flex-1">{breakdown.type}</span>
                  <Badge variant="outline">{breakdown.count}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
