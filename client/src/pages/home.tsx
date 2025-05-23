import { MachinesByMethod } from '@/components/machines/machines-by-method';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Settings, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { user } = useAuth();

  // Droits utilisateur selon les spécifications
  const userRights = {
    admin: {
      title: "Administrateur",
      description: "Accès complet à l'application, gestion totale des données et utilisateurs, configuration système.",
      canManage: true,
      canEdit: true,
      canExport: true,
      canView: true
    },
    supervisor: {
      title: "Superviseur", 
      description: "Lecture seule sur tous les modules sauf gestion et configuration. Peut exporter les rapports.",
      canManage: false,
      canEdit: false,
      canExport: true,
      canView: true
    }
  };

  const currentUserRights = user ? userRights[user.role as keyof typeof userRights] : null;

  return (
    <div className="space-y-8">
      {/* Profil utilisateur et droits */}
      {user && currentUserRights && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Profil Utilisateur</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informations</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rôle:</span>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {currentUserRights.title}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Équipe:</span>
                    <span className="font-medium">{user.team || 'Non assigné'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Droits Associés</h3>
                <p className="text-sm text-gray-600 mb-3">{currentUserRights.description}</p>
                <div className="flex flex-wrap gap-2">
                  {currentUserRights.canView && <Badge variant="outline">👁️ Consultation</Badge>}
                  {currentUserRights.canExport && <Badge variant="outline">📄 Export</Badge>}
                  {currentUserRights.canEdit && <Badge variant="outline">✏️ Modification</Badge>}
                  {currentUserRights.canManage && <Badge variant="outline">⚙️ Gestion</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste dynamique des machines */}
      <MachinesByMethod />

      {/* Documentation et accès selon les droits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documentation et Accès</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center p-4 h-auto justify-start hover:bg-gray-50"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="text-red-600 h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manuel Opérations</p>
                <p className="text-sm text-gray-600">Procédures de décapage</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center p-4 h-auto justify-start hover:bg-gray-50"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="text-green-600 h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Consignes HSE</p>
                <p className="text-sm text-gray-600">Sécurité et environnement</p>
              </div>
            </Button>

            {currentUserRights?.canManage && (
              <Button
                variant="outline"
                className="flex items-center p-4 h-auto justify-start hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="text-blue-600 h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Configuration</p>
                  <p className="text-sm text-gray-600">Accès administrateur</p>
                </div>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
