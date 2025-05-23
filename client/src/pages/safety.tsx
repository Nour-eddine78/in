import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Shield, ClipboardCheck, HardHat, AlertTriangle } from 'lucide-react';

export default function Safety() {
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incidents = [] } = useQuery({
    queryKey: ['/api/safety/incidents'],
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['/api/safety/audits'],
  });

  const createIncident = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/safety/incidents', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/incidents'] });
      setIsIncidentDialogOpen(false);
      toast({
        title: 'Incident déclaré',
        description: 'L\'incident a été enregistré avec succès',
      });
    },
  });

  const handleSubmitIncident = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createIncident.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      severity: formData.get('severity'),
      status: 'open',
      location: formData.get('location'),
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* HSE Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestion HSE</CardTitle>
            <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Déclarer un Incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Déclaration d'Incident</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitIncident} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre de l'incident</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="severity">Gravité</Label>
                    <Select name="severity" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la gravité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Mineur</SelectItem>
                        <SelectItem value="major">Majeur</SelectItem>
                        <SelectItem value="critical">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Input id="location" name="location" placeholder="Zone, panneau..." />
                  </div>
                  <Button type="submit" disabled={createIncident.isPending} className="w-full">
                    {createIncident.isPending ? 'Enregistrement...' : 'Déclarer l\'incident'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Safety KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="text-white h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-green-600">127</p>
              <p className="text-sm text-gray-600">Jours sans incident</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardCheck className="text-white h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{audits.length}</p>
              <p className="text-sm text-gray-600">Audits réalisés</p>
            </div>
            
            <div className="text-center p-6 bg-amber-50 rounded-lg">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <HardHat className="text-white h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-amber-600">8</p>
              <p className="text-sm text-gray-600">Formations ce mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incidents Récents</CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun incident déclaré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.slice(0, 5).map((incident: any) => (
                  <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity === 'minor' ? 'Mineur' : 
                         incident.severity === 'major' ? 'Majeur' : 'Critique'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(incident.reportedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{incident.title}</p>
                    <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status === 'open' ? 'Ouvert' :
                         incident.status === 'in_progress' ? 'En cours' : 'Résolu'}
                      </Badge>
                      {incident.location && (
                        <span className="text-xs text-gray-500">{incident.location}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistiques Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{incidents.length}</p>
                  <p className="text-sm text-gray-600">Total incidents</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-green-600">
                    {incidents.filter((i: any) => i.status === 'resolved').length}
                  </p>
                  <p className="text-sm text-gray-600">Incidents résolus</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Répartition par gravité</h4>
                {['minor', 'major', 'critical'].map((severity) => {
                  const count = incidents.filter((i: any) => i.severity === severity).length;
                  const percentage = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
                  return (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {severity === 'minor' ? 'Mineur' : 
                         severity === 'major' ? 'Majeur' : 'Critique'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              severity === 'minor' ? 'bg-yellow-500' :
                              severity === 'major' ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
