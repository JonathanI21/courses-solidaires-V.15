import React from 'react';
import { 
  UserCheck, 
  ClipboardList, 
  QrCode, 
  Shield
} from 'lucide-react';

interface SocialWorkerPastillesProps {
  onSelectService: (service: string) => void;
  selectedService: string | null;
}

const SocialWorkerPastilles: React.FC<SocialWorkerPastillesProps> = ({ onSelectService, selectedService }) => {
  const services = [
    {
      id: 'beneficiary-info',
      title: 'Informations Bénéficiaires',
      subtitle: 'Fiches complètes et validation',
      icon: UserCheck,
      gradient: 'from-blue-400 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      hoverBorder: 'hover:border-blue-400',
      textColor: 'text-blue-800'
    },
    {
      id: 'requests',
      title: 'Demandes',
      subtitle: 'Gestion des demandes',
      icon: ClipboardList,
      gradient: 'from-blue-400 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      hoverBorder: 'hover:border-blue-400',
      textColor: 'text-blue-800'
    },
    {
      id: 'qr-codes',
      title: 'QR Codes 72h',
      subtitle: 'Géolocalisation requise',
      icon: QrCode,
      gradient: 'from-blue-400 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      hoverBorder: 'hover:border-blue-400',
      textColor: 'text-blue-800'
    },
    {
      id: 'security',
      title: 'Sécurité & Conformité',
      subtitle: 'RGPD + Chiffrement',
      icon: Shield,
      gradient: 'from-blue-400 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      hoverBorder: 'hover:border-blue-400',
      textColor: 'text-blue-800'
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
            <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.gradient} shadow-lg mb-4 group-hover:shadow-xl transition-shadow`}>
                <Icon size={28} className="text-white" />
              </div>
              
              <div>
                <h3 className={`text-lg font-bold text-gray-900 mb-1 group-hover:${service.textColor} transition-colors`}>
                  {service.title}
                </h3>
                <p className="text-sm font-medium text-blue-600">
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

export default SocialWorkerPastilles;