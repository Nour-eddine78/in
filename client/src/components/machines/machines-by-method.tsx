import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Settings, Mountain } from 'lucide-react';

interface Machine {
  id: number;
  name: string;
  type: string;
  specifications: any;
  isActive: boolean;
}

export function MachinesByMethod() {
  const { data: machines = [], isLoading } = useQuery<Machine[]>({
    queryKey: ['/api/machines'],
  });

  if (isLoading) {
    return <div className="p-4">Chargement des machines...</div>;
  }

  // Grouper les machines par méthode
  const machinesByMethod = machines.reduce((acc: Record<string, Machine[]>, machine) => {
    if (!acc[machine.type]) {
      acc[machine.type] = [];
    }
    acc[machine.type].push(machine);
    return acc;
  }, {});

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'poussage': return <Mountain className="h-5 w-5 text-green-600" />;
      case 'casement': return <Settings className="h-5 w-5 text-blue-600" />;
      case 'transport': return <Truck className="h-5 w-5 text-amber-600" />;
      default: return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'poussage': return 'border-green-200 bg-green-50';
      case 'casement': return 'border-blue-200 bg-blue-50';
      case 'transport': return 'border-amber-200 bg-amber-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'poussage': return 'Poussage';
      case 'casement': return 'Casement';
      case 'transport': return 'Transport';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Liste Dynamique des Machines</h2>
        <p className="text-gray-600">Machines disponibles par méthode de décapage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(machinesByMethod).map(([method, methodMachines]) => (
          <Card key={method} className={`border-2 ${getMethodColor(method)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                {getMethodIcon(method)}
                <span>{getMethodTitle(method)}</span>
                <Badge variant="secondary" className="ml-auto">
                  {methodMachines.length} machine{methodMachines.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {methodMachines.map((machine) => (
                  <div 
                    key={machine.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{machine.name}</span>
                        <Badge 
                          variant={machine.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {machine.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      {machine.specifications && (
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex flex-wrap gap-2">
                            {machine.specifications.power && (
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {machine.specifications.power}
                              </span>
                            )}
                            {machine.specifications.manufacturer && (
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {machine.specifications.manufacturer}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif des Machines par Méthode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Méthode</th>
                  <th className="text-left py-2 font-medium">Machines Disponibles</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(machinesByMethod).map(([method, methodMachines]) => (
                  <tr key={method} className="border-b">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(method)}
                        <span className="font-medium">{getMethodTitle(method)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {methodMachines.map((machine, index) => (
                          <span key={machine.id}>
                            <span className="font-medium">{machine.name}</span>
                            {index < methodMachines.length - 1 && ', '}
                          </span>
                        ))}
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