import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressChart } from '@/components/charts/performance-charts';
import { Map } from 'lucide-react';

export default function ProgressPage() {
  const progressData = [
    { panneau: 'P-45', tranche: 'T-12', progress: 87, status: 'en_cours', color: 'bg-green-600' },
    { panneau: 'P-44', tranche: 'T-11', progress: 56, status: 'en_cours', color: 'bg-amber-600' },
    { panneau: 'P-43', tranche: 'T-10', progress: 23, status: 'planifie', color: 'bg-red-600' }
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_cours': return 'en cours';
      case 'planifie': return 'planifiée';
      case 'termine': return 'terminé';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi des Avancements par Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Interactive Map Placeholder */}
              <div className="bg-gray-100 rounded-lg p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Carte Interactive des Panneaux</p>
                  <p className="text-sm text-gray-500 mt-2">Visualisation en temps réel de l'avancement</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {progressData.map((item, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Panneau {item.panneau}</h4>
                      <span className="text-sm font-medium text-gray-900">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="mb-2" />
                    <p className="text-xs text-gray-500">
                      Tranche {item.tranche} {getStatusText(item.status)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progression par Méthode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ProgressChart />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Objectifs vs Réalisé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((week, index) => {
                const target = 100;
                const actual = [95, 108, 102, 87][index];
                return (
                  <div key={week} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{week}</span>
                      <span className="font-medium">{actual}% / {target}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={100} className="opacity-30" />
                      <Progress 
                        value={actual} 
                        className="absolute top-0 left-0" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
