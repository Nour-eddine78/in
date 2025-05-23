import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher..."
              className="w-64 pl-10 pr-4"
            />
          </div>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
          </Button>
        </div>
      </div>
    </div>
  );
}
