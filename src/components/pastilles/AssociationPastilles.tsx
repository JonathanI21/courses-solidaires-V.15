import React from 'react';
import { 
  Scan, 
  QrCode, 
  Shield,
  BarChart3
} from 'lucide-react';

interface AssociationPastillesProps {
  onSelectService: (service: string) => void;
  selectedService: string | null;
}

const AssociationPastilles: React.FC<AssociationPastillesProps> = ({ onSelectService, selectedService }) => {
  const services = [
    {
      id: 'stock-management',
      title: 'Gestion du Stock',
      subtitle: 'Scanner entrées/sorties • Reçus fiscaux',
      icon: Scan,
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      hoverBorder: 'hover:border-purple-400',
      textColor: 'text-purple-800'
    },
    {
      id: 'qr-distribution',
      title: 'Distribution QR Géolocalisée',
      subtitle: 'Traçabilité complète • Historique',
      icon: QrCode,
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      hoverBorder: 'hover:border-purple-400',
      textColor: 'text-purple-800'
    },
    {
      id: 'fraud-detection',
      title: 'Sécurité Avancée',
      subtitle: 'Détection fraudes • Anomalies',
      icon: Shield,
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      hoverBorder: 'hover:border-purple-400',
      textColor: 'text-purple-800'
    },
    {
      id: 'alerts-analytics',
      title: 'Alertes et Analyse des Stocks',
      subtitle: 'Seuils critiques • Tendances • Prévisions IA • Demandes auto',
      icon: BarChart3,
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      hoverBorder: 'hover:border-purple-400',
      textColor: 'text-purple-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
      {services.map((service) => {
        const Icon = service.icon;
        const isSelected = selectedService === service.id;
        
        return (
          <button
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              isSelected 
                ? `bg-gradient-to-br ${service.bgGradient} border-2 ${service.borderColor} shadow-xl scale-105` 
                : `bg-white border-2 border-gray-200 ${service.hoverBorder} shadow-lg`
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.gradient} shadow-lg mb-4 group-hover:shadow-xl transition-shadow`}>
                <Icon size={28} className="text-white" />
              </div>
              
              <div>
                <h3 className={`text-lg font-bold text-gray-900 mb-1 group-hover:${service.textColor} transition-colors`}>
                  {service.title}
                </h3>
                <p className={`text-sm font-medium ${service.textColor.replace('text-', 'text-').replace('-800', '-600')}`}>
                  {service.subtitle}
                </p>
              </div>
            </div>
            
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r ${service.gradient} opacity-10 rounded-full transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-300`}></div>
          </button>
        );
      })}
    </div>
  );
};

export default AssociationPastilles;