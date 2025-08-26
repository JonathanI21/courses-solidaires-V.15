import React from 'react';
import { ArrowLeft } from 'lucide-react';
import HouseholdServices from './household/HouseholdServices';
import SocialWorkerServices from './socialworker/SocialWorkerServices';
import AssociationServices from './association/AssociationServices';
import BeneficiaryServices from './beneficiary/BeneficiaryServices';

interface ServiceDetailProps {
  serviceId: string;
  profileType: 'household' | 'social_worker' | 'association' | 'beneficiary';
  onBack: () => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId, profileType, onBack }) => {
  const renderService = () => {
    switch (profileType) {
      case 'household':
        return <HouseholdServices serviceId={serviceId} onBack={onBack} />;
      case 'social_worker':
        return <SocialWorkerServices serviceId={serviceId} onBack={onBack} />;
      case 'association':
        return <AssociationServices serviceId={serviceId} onBack={onBack} />;
      case 'beneficiary':
        return <BeneficiaryServices serviceId={serviceId} onBack={onBack} />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Service non trouvé</h2>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux services
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderService()}
    </div>
  );
};

export default ServiceDetail;