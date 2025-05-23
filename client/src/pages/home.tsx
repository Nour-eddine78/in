import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function Home() {
  const machines = [
    {
      name: 'Bulldozer D11',
      type: 'Poussage',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      description: 'Machine de poussage haute performance pour opérations de décapage intensives',
      specs: {
        'Puissance': '850 HP',
        'Capacité lame': '35 m³',
        'Méthode': 'Poussage'
      }
    },
    {
      name: 'Excavatrice 750011',
      type: 'Casement',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      description: 'Excavatrice hydraulique pour opérations de casement et extraction précise',
      specs: {
        'Puissance': '520 HP',
        'Portée max': '12.8 m',
        'Méthode': 'Casement'
      }
    },
    {
      name: 'Transwine',
      type: 'Transport',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      description: 'Camion de transport haute capacité pour évacuation des matériaux décapés',
      specs: {
        'Capacité': '220 tonnes',
        'Vitesse max': '65 km/h',
        'Méthode': 'Transport'
      }
    }
  ];

  const documents = [
    {
      title: 'Manuel Opérations',
      description: 'Procédures standard',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Consignes HSE',
      description: 'Sécurité et environnement',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Maintenance',
      description: 'Entretien préventif',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'Poussage': return 'text-green-600';
      case 'Casement': return 'text-blue-600';
      case 'Transport': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Machine Gallery */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Machines de Décapage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video">
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{machine.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{machine.description}</p>
                
                <div className="space-y-2 mb-4">
                  {Object.entries(machine.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className={`font-medium ${key === 'Méthode' ? getMethodColor(value) : 'text-gray-900'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Fiche Technique
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Documentation Library */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Technique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="flex items-center p-4 h-auto justify-start hover:bg-gray-50"
                >
                  <div className={`w-10 h-10 ${doc.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                    <Icon className={`${doc.color} h-5 w-5`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
