import React from 'react';
import { 
  Heart, 
  Clock, 
  QrCode, 
  Shield,
  FileText,
  MessageCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface BeneficiaryPastillesProps {
  onSelectService: (service: string) => void;
  selectedService: string | null;
}

const BeneficiaryPastilles: React.FC<BeneficiaryPastillesProps> = ({ onSelectService, selectedService }) => {
  const services = [
    {
      id: 'new-request',
      title: 'Nouvelle Demande',
      subtitle: 'Anonyme et sécurisée',
      icon: Heart,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
    },
    {
      id: 'history',
      title: 'Historique Complet',
      subtitle: 'Suivi transparent',
      icon: Clock,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
    },
    {
      id: 'qr-codes',
      title: 'QR Codes 72h',
      subtitle: 'Retrait sécurisé',
      icon: QrCode,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
    },
    {
      id: 'profile',
      title: 'Profil Validé',
      subtitle: 'Code unique PDS-2024-156',
      icon: Shield,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
    },
    {
      id: 'documents',
      title: 'Mes Documents',
      subtitle: 'Gestion sécurisée',
      icon: FileText,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
    },
    {
      id: 'communication',
      title: 'Communication',
      subtitle: 'Accompagnement',
      icon: MessageCircle,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
    },
    {
      id: 'rights',
      title: 'Mes Droits',
      subtitle: 'Protection RGPD',
      icon: CheckCircle,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
    },
    {
      id: 'alerts',
      title: 'Mes Alertes',
      subtitle: 'Notifications importantes',
      icon: AlertTriangle,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      hoverBorder: 'hover:border-orange-400',
      textColor: 'text-orange-800'
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
                <p className="text-sm font-medium text-orange-600">
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

export default BeneficiaryPastilles;