import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OperationForm } from '@/components/forms/operation-form';
import { Edit, Copy } from 'lucide-react';

export default function Operations() {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['/api/operations'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'marche': return 'bg-green-100 text-green-800';
      case 'arret': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'poussage': return 'text-green-600';
      case 'casement': return 'text-blue-600';
      case 'transport': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Operation Form */}
      <div className="lg:w-1/2">
        <OperationForm />
      </div>

      {/* Recent Operations */}
      <div className="lg:w-1/2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Interventions Récentes</CardTitle>
              <Button variant="outline" size="sm">Voir tout</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : operations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune opération enregistrée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {operations.slice(0, 5).map((operation: any) => (
                  <div key={operation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-blue-600">{operation.ficheId}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(operation.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Machine:</span>
                        <span className="ml-1 font-medium">ID #{operation.machineId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Méthode:</span>
                        <span className={`ml-1 font-medium capitalize ${getMethodColor(operation.method)}`}>
                          {operation.method}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Zone:</span>
                        <span className="ml-1 font-medium">
                          {operation.panneau}/{operation.tranche}/{operation.niveau}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Volume:</span>
                        <span className="ml-1 font-medium">{operation.volumeBlasted || 0} m³</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(operation.machineStatus)}>
                        {operation.machineStatus === 'marche' ? 'En marche' : 'À l\'arrêt'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques du Jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{operations.length}</p>
                <p className="text-sm text-gray-600">Interventions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {operations.reduce((sum: number, op: any) => sum + (op.volumeBlasted || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">m³ décapés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
