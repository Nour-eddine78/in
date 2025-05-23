import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const operationSchema = z.object({
  date: z.string(),
  method: z.enum(['transport', 'casement', 'poussage']),
  machineId: z.number(),
  poste: z.number().min(1).max(3),
  panneau: z.string().min(1, 'Panneau requis'),
  tranche: z.string().min(1, 'Tranche requise'),
  niveau: z.string().min(1, 'Niveau requis'),
  machineStatus: z.enum(['marche', 'arret']),
  workingHours: z.number().min(0).optional(),
  downtime: z.number().min(0).optional(),
  volumeBlasted: z.number().min(0).optional(),
  observations: z.string().optional(),
});

type OperationFormData = z.infer<typeof operationSchema>;

export function OperationForm() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      poste: 1,
      machineStatus: 'marche',
      workingHours: 0,
      downtime: 0,
      volumeBlasted: 0,
    },
  });

  // Fetch machines based on selected method
  const { data: machines = [] } = useQuery({
    queryKey: ['/api/machines', selectedMethod],
    enabled: !!selectedMethod,
  });

  const createOperation = useMutation({
    mutationFn: async (data: OperationFormData) => {
      const response = await apiRequest('POST', '/api/operations', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operations'] });
      toast({
        title: 'Succès',
        description: 'Opération enregistrée avec succès',
      });
      form.reset();
      setSelectedMethod('');
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'enregistrement',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: OperationFormData) => {
    createOperation.mutate(data);
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    form.setValue('method', method as any);
    form.setValue('machineId', 0); // Reset machine selection
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle Intervention</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ficheId">ID de la fiche</Label>
              <Input
                id="ficheId"
                value="Auto-généré"
                disabled
                className="bg-gray-50 font-mono text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date d'intervention</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="method">Méthode de décapage</Label>
            <Select onValueChange={handleMethodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="casement">Casement</SelectItem>
                <SelectItem value="poussage">Poussage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="machine">Machine</Label>
            <Select 
              onValueChange={(value) => form.setValue('machineId', parseInt(value))}
              disabled={!selectedMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedMethod ? "Sélectionner une machine" : "Sélectionner d'abord une méthode"} />
              </SelectTrigger>
              <SelectContent>
                {machines.map((machine: any) => (
                  <SelectItem key={machine.id} value={machine.id.toString()}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="poste">Poste</Label>
              <Select onValueChange={(value) => form.setValue('poste', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un poste" />
                </SelectTrigger>
                <SelectContent>
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
                {...form.register('panneau')}
              />
            </div>
            
            <div>
              <Label htmlFor="tranche">Tranche</Label>
              <Input
                id="tranche"
                placeholder="Ex: T-12"
                {...form.register('tranche')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="niveau">Niveau</Label>
              <Input
                id="niveau"
                placeholder="Ex: N-8"
                {...form.register('niveau')}
              />
            </div>
            
            <div>
              <Label htmlFor="machineStatus">État de la machine</Label>
              <Select onValueChange={(value) => form.setValue('machineStatus', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'état" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marche">En marche</SelectItem>
                  <SelectItem value="arret">À l'arrêt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workingHours">Heures de marche</Label>
              <Input
                id="workingHours"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...form.register('workingHours', { valueAsNumber: true })}
              />
            </div>
            
            <div>
              <Label htmlFor="downtime">Durée d'arrêt</Label>
              <Input
                id="downtime"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...form.register('downtime', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="volumeBlasted">Volume sauté (m³)</Label>
            <Input
              id="volumeBlasted"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register('volumeBlasted', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              rows={3}
              placeholder="Remarques et observations terrain..."
              {...form.register('observations')}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cloner une fiche
            </Button>
            
            <div className="flex space-x-3">
              <Button type="button" variant="outline">
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createOperation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createOperation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
