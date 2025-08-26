import React from 'react';
import { 
  ShoppingCart, 
  Camera, 
  Heart, 
  Car, 
  TrendingUp,
  Gift,
  Zap
} from 'lucide-react';

interface HouseholdPastillesProps {
  onSelectService: (service: string) => void;
  selectedService: string | null;
}

const HouseholdPastilles: React.FC<HouseholdPastillesProps> = ({ onSelectService, selectedService }) => {
  const services = [
    {
      id: 'shopping-list',
      title: 'Préparer ma liste de courses pour le magasin',
      subtitle: 'Base Yuka + Comparateur',
      icon: ShoppingCart,
      gradient: 'from-emerald-400 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      hoverBorder: 'hover:border-emerald-400',
      textColor: 'text-emerald-800'
    },
    {
      id: 'scanner',
      title: 'Faire mes achats en magasin',
      subtitle: 'Scanner + Guide courses',
      icon: Camera,
      gradient: 'from-emerald-400 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      hoverBorder: 'hover:border-emerald-400',
      textColor: 'text-emerald-800'
    },
    {
      id: 'donations',
      title: 'Mes Dons Solidaires & Reçus Fiscaux',
      subtitle: 'Dons + Déductions + PDF automatiques',
      icon: Heart,
      gradient: 'from-emerald-400 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      hoverBorder: 'hover:border-emerald-400',
      textColor: 'text-emerald-800'
    },
    {
      id: 'price-comparison',
      title: 'Comparateur Prix',
      subtitle: 'Multi-enseignes temps réel',
      icon: TrendingUp,
      gradient: 'from-emerald-400 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      hoverBorder: 'hover:border-emerald-400',
      textColor: 'text-emerald-800'
    },
    {
      id: 'transport-services',
      title: 'Services de transport : Covoiturage et livraison',
      subtitle: '15€+0.60€/km | 25€+0.60€/km',
      icon: Car,
      gradient: 'from-emerald-400 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      hoverBorder: 'hover:border-emerald-400',
      textColor: 'text-emerald-800'
    },
    {
      id: 'promotions',
      title: 'Catalogue des promotions par magasin',
      subtitle: 'Catalogues enseignes',
      icon: Gift,
      gradient: 'from-emerald-400 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      hoverBorder: 'hover:border-emerald-400',
      textColor: 'text-emerald-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            {/* Gradient background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon avec gradient */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.gradient} shadow-lg mb-4 group-hover:shadow-xl transition-shadow`}>
                <Icon size={28} className="text-white" />
              </div>
              
              {/* Title & Subtitle */}
              <div>
                <h3 className={`text-lg font-bold text-gray-900 mb-1 group-hover:${service.textColor} transition-colors`}>
                  {service.title}
                </h3>
                <p className="text-sm font-medium text-emerald-600">
                  {service.subtitle}
                </p>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r ${service.gradient} opacity-10 rounded-full transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-300`}></div>
          </button>
        );
      })}
    </div>
  );
};

export default HouseholdPastilles;