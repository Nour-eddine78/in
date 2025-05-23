import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Truck, Activity, Clock, AlertTriangle } from 'lucide-react';

export function MachineStatus() {
  const { data: machines = [] } = useQuery({
    queryKey: ['/api/machines'],
  });

  const { data: operations = [] } = useQuery({
    queryKey: ['/api/operations'],
  });

  const getMachineStatus = (machineId: number) => {
    const recentOps = operations.filter((op: any) => op.machineId === machineId);
    if (recentOps.length === 0) return { status: 'inactive', availability: 0 };
    
    const latestOp = recentOps[0];
    const availability = Math.random() * 40 + 60; // Simulation
    
    return {
      status: latestOp.machineStatus === 'marche' ? 'active' : 'inactive',
      availability: Math.round(availability)
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'poussage': return 'text-green-600';
      case 'casement': return 'text-blue-600';
      case 'transport': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          État des Machines en Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine: any) => {
            const machineStatus = getMachineStatus(machine.id);
            const statusText = machineStatus.status === 'active' ? 'En marche' : 'À l\'arrêt';
            
            return (
              <Card key={machine.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="text-blue-600 h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{machine.name}</p>
                        <p className={`text-xs capitalize ${getTypeColor(machine.type)}`}>
                          {machine.type}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(machineStatus.status)}>
                      {statusText}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Disponibilité</span>
                        <span className="font-medium">{machineStatus.availability}%</span>
                      </div>
                      <Progress value={machineStatus.availability} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          {Math.floor(Math.random() * 8 + 1)}h actif
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          {Math.floor(Math.random() * 3)} alertes
                        </span>
                      </div>
                    </div>

                    {machine.specifications && (
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <p>Puissance: {machine.specifications.power || 'N/A'}</p>
                        <p>Capacité: {machine.specifications.capacity || machine.specifications.reach || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}