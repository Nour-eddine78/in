import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Table } from 'lucide-react';

interface ExportButtonsProps {
  data: any[];
  title: string;
  type: 'operations' | 'performance' | 'safety' | 'progress';
}

export function ExportButtons({ data, title, type }: ExportButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const { toast } = useToast();

  const handleExport = () => {
    // Simulate export process
    toast({
      title: 'Export en cours',
      description: `Génération du rapport ${exportFormat.toUpperCase()}...`,
    });

    setTimeout(() => {
      toast({
        title: 'Export terminé',
        description: `Le rapport ${title} a été téléchargé avec succès`,
      });
      setIsDialogOpen(false);
    }, 2000);
  };

  const getExportIcon = () => {
    switch (exportFormat) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'excel': return <Table className="h-4 w-4" />;
      case 'csv': return <Download className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les Données</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="format">Format d'export</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF - Rapport complet</SelectItem>
                <SelectItem value="excel">Excel - Données tabulaires</SelectItem>
                <SelectItem value="csv">CSV - Données brutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="period">Période</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input type="date" placeholder="Date début" />
              <Input type="date" placeholder="Date fin" />
            </div>
          </div>

          {exportFormat === 'pdf' && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="charts" 
                checked={includeCharts}
                onCheckedChange={setIncludeCharts}
              />
              <Label htmlFor="charts" className="text-sm">
                Inclure les graphiques et visuels
              </Label>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              {getExportIcon()}
              <span className="font-medium">
                {data.length} éléments seront exportés
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Le rapport inclura les données de la période sélectionnée
            </p>
          </div>

          <Button onClick={handleExport} className="w-full bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Générer l'export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}