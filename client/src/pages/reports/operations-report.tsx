import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Clock, Truck, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OperationsReport() {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['/api/operations'],
  });

  const { data: machines = [] } = useQuery({
    queryKey: ['/api/machines'],
  });

  if (isLoading) {
    return <div className="p-6">Chargement des données d'opérations...</div>;
  }

  const totalOperations = operations.length;
  const totalHours = operations.reduce((sum: number, op: any) => sum + (op.workingHours || 0), 0);
  const totalVolume = operations.reduce((sum: number, op: any) => sum + (op.volumeBlasted || 0), 0);
  const avgYield = totalHours > 0 ? (totalVolume / totalHours).toFixed(2) : '0';

  const getMachineName = (machineId: number) => {
    const machine = machines.find((m: any) => m.id === machineId);
    return machine?.name || 'N/A';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'transport': return 'bg-amber-100 text-amber-800';
      case 'casement': return 'bg-blue-100 text-blue-800';
      case 'poussage': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapport des Opérations</h1>
        <p className="text-gray-600">Analyse détaillée des opérations de décapage</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opérations</p>
                <p className="text-2xl font-bold text-gray-900">{totalOperations}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heures Travaillées</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalVolume.toFixed(0)} m³</p>
              </div>
              <Truck className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rendement Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{avgYield} m³/h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des opérations */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Opérations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fiche ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Volume (m³)</TableHead>
                <TableHead>Rendement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation: any) => (
                <TableRow key={operation.id}>
                  <TableCell className="font-medium">{operation.ficheId}</TableCell>
                  <TableCell>
                    {format(new Date(operation.date), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getMethodColor(operation.method)}>
                      {operation.method}
                    </Badge>
                  </TableCell>
                  <TableCell>{getMachineName(operation.machineId)}</TableCell>
                  <TableCell>
                    {operation.panneau} - {operation.tranche} - {operation.niveau}
                  </TableCell>
                  <TableCell>
                    <Badge variant={operation.machineStatus === 'marche' ? 'default' : 'secondary'}>
                      {operation.machineStatus === 'marche' ? 'En marche' : 'À l\'arrêt'}
                    </Badge>
                  </TableCell>
                  <TableCell>{operation.workingHours?.toFixed(1) || '0'}h</TableCell>
                  <TableCell>{operation.volumeBlasted?.toFixed(0) || '0'}</TableCell>
                  <TableCell>
                    {operation.workingHours && operation.volumeBlasted 
                      ? (operation.volumeBlasted / operation.workingHours).toFixed(1)
                      : '0'} m³/h
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}