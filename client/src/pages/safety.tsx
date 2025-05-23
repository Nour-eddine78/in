import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { AlertTriangle, Plus, Shield, Calendar, MapPin, Wrench, TrendingUp, Clock, Filter, Search, FileText, Bell, CheckCircle, Camera, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const incidentSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(10, 'Description trop courte'),
  severity: z.enum(['minor', 'major', 'critical']),
  location: z.string().min(3, 'Localisation requise'),
  machineId: z.number().optional(),
  zone: z.string().min(1, 'Zone requise'),
  niveau: z.string().min(1, 'Niveau requis'),
  operationStopped: z.boolean().default(false),
  zoneSecured: z.boolean().default(false),
  injuries: z.boolean().default(false),
  injuryDetails: z.string().optional(),
  correctiveActions: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

export default function Safety() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['/api/safety/incidents'],
  });

  const { data: machines = [] } = useQuery({
    queryKey: ['/api/machines'],
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['/api/safety/audits'],
  });

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      operationStopped: false,
      zoneSecured: false,
      injuries: false,
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      return apiRequest('/api/safety/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/incidents'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Incident déclaré",
        description: "L'incident a été enregistré avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'incident",
        variant: "destructive",
      });
    },
  });

  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/safety/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/incidents'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'incident a été modifié",
      });
    },
  });

  const onSubmit = (data: IncidentFormData) => {
    createIncidentMutation.mutate(data);
  };

  // Calculs pour le tableau de bord sécurité
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((inc: any) => inc.status === 'open').length;
  const criticalIncidents = incidents.filter((inc: any) => inc.severity === 'critical').length;
  const resolvedIncidents = incidents.filter((inc: any) => inc.status === 'resolved').length;
  
  // Calcul des jours sans incident critique
  const lastCriticalIncident = incidents
    .filter((inc: any) => inc.severity === 'critical')
    .sort((a: any, b: any) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())[0];
  
  const daysSinceLastCritical = lastCriticalIncident 
    ? Math.floor((Date.now() - new Date(lastCriticalIncident.reportedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  // Taux de sécurité basé sur les incidents résolus vs ouverts
  const safetyRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 100;
  
  // Taux de conformité HSE basé sur les audits
  const compliantAudits = audits.filter((audit: any) => audit.status === 'compliant').length;
  const hseComplianceRate = audits.length > 0 ? Math.round((compliantAudits / audits.length) * 100) : 95;

  // Filtrage des incidents
  const filteredIncidents = incidents.filter((incident: any) => {
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

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
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'major': return 'Élevé';
      case 'minor': return 'Faible';
      default: return severity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="p-6">Chargement des données de sécurité...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Sécurité</h1>
          <p className="text-gray-600">Gestion des incidents et conformité HSE</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Déclarer un Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Déclaration d'Incident de Sécurité</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Informations générales */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Informations Générales</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre de l'incident *</FormLabel>
                          <FormControl>
                            <Input placeholder="Description courte de l'incident" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description détaillée *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez l'incident en détail..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau de gravité *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la gravité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="minor">Faible</SelectItem>
                              <SelectItem value="major">Élevé</SelectItem>
                              <SelectItem value="critical">Critique</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Localisation */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Localisation</h3>
                    
                    <FormField
                      control={form.control}
                      name="zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la zone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="P1">Panneau P1</SelectItem>
                              <SelectItem value="P2">Panneau P2</SelectItem>
                              <SelectItem value="P3">Panneau P3</SelectItem>
                              <SelectItem value="P4">Panneau P4</SelectItem>
                              <SelectItem value="P5">Panneau P5</SelectItem>
                              <SelectItem value="atelier">Atelier de maintenance</SelectItem>
                              <SelectItem value="parking">Zone de parking</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="niveau"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le niveau" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="N1">Niveau N1</SelectItem>
                              <SelectItem value="N2">Niveau N2</SelectItem>
                              <SelectItem value="N3">Niveau N3</SelectItem>
                              <SelectItem value="N4">Niveau N4</SelectItem>
                              <SelectItem value="N5">Niveau N5</SelectItem>
                              <SelectItem value="surface">Surface</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localisation précise *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Près du convoyeur principal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="machineId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Machine concernée</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une machine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Aucune machine</SelectItem>
                              {machines.map((machine: any) => (
                                <SelectItem key={machine.id} value={machine.id.toString()}>
                                  {machine.name} ({machine.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Statuts et actions */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Statuts et Actions Immédiates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="operationStopped"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-2"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Arrêt de l'opération</FormLabel>
                            <p className="text-sm text-gray-600">Les opérations ont été arrêtées</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zoneSecured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-2"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Sécurisation de la zone</FormLabel>
                            <p className="text-sm text-gray-600">La zone a été sécurisée</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="injuries"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-2"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Blessures</FormLabel>
                            <p className="text-sm text-gray-600">Des blessures sont à signaler</p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('injuries') && (
                    <FormField
                      control={form.control}
                      name="injuryDetails"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Détails des blessures</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Noms des personnes blessées, type et gravité des blessures, heure..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Actions correctives */}
                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="correctiveActions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggestions d'actions correctives</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez les actions correctives suggérées pour éviter la répétition de cet incident..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pièces jointes */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Pièces Jointes</h3>
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1">
                      <Camera className="mr-2 h-4 w-4" />
                      Ajouter Photos
                    </Button>
                    <Button type="button" variant="outline" className="flex-1">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Ajouter Documents
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Formats acceptés: JPG, PNG, PDF, DOC. Taille max: 10MB par fichier.
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={createIncidentMutation.isPending}
                  >
                    {createIncidentMutation.isPending ? 'Création...' : 'Déclarer l\'Incident'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tableau de bord sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jours sans incident critique</p>
                <p className="text-2xl font-bold text-green-600">{daysSinceLastCritical}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de sécurité</p>
                <p className="text-2xl font-bold text-blue-600">{safetyRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conformité HSE</p>
                <p className="text-2xl font-bold text-purple-600">{hseComplianceRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Incidents ouverts</p>
                <p className="text-2xl font-bold text-orange-600">{openIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications et alertes */}
      {criticalIncidents > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">
                Alerte: {criticalIncidents} incident(s) critique(s) en cours nécessitent une attention immédiate
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Suivi des Incidents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un incident..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Gravité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes gravités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="major">Élevé</SelectItem>
                <SelectItem value="minor">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>

          {/* Tableau des incidents */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Gravité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Déclarant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident: any) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    {format(new Date(incident.reportedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {incident.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{incident.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {getSeverityLabel(incident.severity)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(incident.status)}>
                      {getStatusLabel(incident.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user?.name || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {incident.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateIncidentMutation.mutate({
                            id: incident.id,
                            status: 'in_progress'
                          })}
                        >
                          Prendre en charge
                        </Button>
                      )}
                      {incident.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateIncidentMutation.mutate({
                            id: incident.id,
                            status: 'resolved'
                          })}
                        >
                          Résoudre
                        </Button>
                      )}
                    </div>
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