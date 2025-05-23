import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Ban } from 'lucide-react';

export default function Users() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const createUser = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/users', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Utilisateur créé',
        description: 'L\'utilisateur a été créé avec succès',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de l\'utilisateur',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createUser.mutate({
      username: formData.get('username'),
      password: formData.get('password'),
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      team: formData.get('team'),
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'supervisor': return 'Superviseur';
      default: return role;
    }
  };

  // Only allow access for admin users
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestion des Utilisateurs</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un Utilisateur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitUser} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input id="username" name="username" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div>
                    <Label htmlFor="role">Rôle</Label>
                    <Select name="role" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="supervisor">Superviseur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="team">Équipe</Label>
                    <Input id="team" name="team" placeholder="Ex: Équipe A" />
                  </div>
                  <Button type="submit" disabled={createUser.isPending} className="w-full">
                    {createUser.isPending ? 'Création...' : 'Créer l\'utilisateur'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Équipe</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dernière Connexion</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Avatar className="w-8 h-8 mr-3">
                            <AvatarFallback className="bg-blue-600 text-white text-sm">
                              {user.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleName(user.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.team || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {user.lastLogin ? 
                          new Date(user.lastLogin).toLocaleDateString('fr-FR') : 
                          'Jamais'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Désactiver">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
