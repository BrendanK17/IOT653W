import { X } from 'lucide-react';
import { Button } from '../ui/button';
import type { TransportOption } from '../../types';
import { LeafletMap } from './LeafletMap';

interface MapOverlayProps {
  transport: TransportOption;
  onClose: () => void;
}

export function MapOverlay({ transport, onClose }: MapOverlayProps) {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Route Map - {transport.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Map Area - Full width */}
          <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
            <LeafletMap transport={transport} />
          </div>
        </div>
      </div>
    </div>
  );
}