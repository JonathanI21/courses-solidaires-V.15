import React, { useState } from 'react';
import { ArrowLeft, Users, UserCheck, Package, Heart } from 'lucide-react';
import HouseholdPastilles from './pastilles/HouseholdPastilles';
import SocialWorkerPastilles from './pastilles/SocialWorkerPastilles';
import AssociationPastilles from './pastilles/AssociationPastilles';
import BeneficiaryPastilles from './pastilles/BeneficiaryPastilles';
import ServiceDetail from './services/ServiceDetail';

interface PastillesInterfaceProps {
  profileType: 'household' | 'social_worker' | 'association' | 'beneficiary';
  onBack: () => void;
}

const PastillesInterface: React.FC<PastillesInterfaceProps> = ({ profileType, onBack }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const profileConfig = {
    household: {
      title: 'Ménage',
      subtitle: 'Scanner IA • Dons solidaires • Services premium',
      gradient: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      icon: Users
    },
    social_worker: {
      title: 'Travailleur Social',
      subtitle: 'Validation sécurisée • API CAF • QR géolocalisés',
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      icon: UserCheck
    },
    association: {
      title: 'Association',
      subtitle: 'Scanner automatique • Alertes IA • QR géolocalisé',
      gradient: 'from-purple-600 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      icon: Package
    },
    beneficiary: {
      title: 'Bénéficiaire',
      subtitle: 'Accompagnement validé • Demandes anonymes • QR sécurisés',
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      icon: Heart
    }
  };

  const config = profileConfig[profileType];
  const ProfileIcon = config.icon;

  const handleBackToPastilles = () => {
    setSelectedService(null);
  };

  const renderPastilles = () => {
    switch (profileType) {
      case 'household':
        return <HouseholdPastilles onSelectService={setSelectedService} selectedService={selectedService} />;
      case 'social_worker':
        return <SocialWorkerPastilles onSelectService={setSelectedService} selectedService={selectedService} />;
      case 'association':
        return <AssociationPastilles onSelectService={setSelectedService} selectedService={selectedService} />;
      case 'beneficiary':
        return <BeneficiaryPastilles onSelectService={setSelectedService} selectedService={selectedService} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.gradient} text-white p-4 shadow-lg`}>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={selectedService ? handleBackToPastilles : onBack}
            className="flex items-center text-white/80 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            {selectedService ? 'Retour aux services' : 'Retour aux profils'}
          </button>
          <div className="flex items-center justify-center">
            <ProfileIcon className="mr-3" size={32} />
            <div className="text-center">
              <h1 className="text-2xl font-bold">{config.title}</h1>
              <p className="text-white/90 text-sm">{config.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedService ? (
          <ServiceDetail 
            serviceId={selectedService} 
            profileType={profileType}
            onBack={handleBackToPastilles}
          />
        ) : (
          renderPastilles()
        )}
      </div>
    </div>
  );
};

export default PastillesInterface;