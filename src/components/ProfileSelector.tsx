import React from 'react';
import { Users, Heart, Package, UserCheck, Shield, Globe, Zap } from 'lucide-react';

interface ProfileSelectorProps {
  onSelectProfile: (profile: 'household' | 'social_worker' | 'association' | 'beneficiary') => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelectProfile }) => {
  const profiles = [
    {
      id: 'household' as const,
      title: 'Profil Ménage',
      description: 'Créer des listes de courses, faire des dons, covoiturage et livraison',
      features: ['Scanner IA produits', 'Reçus fiscaux', 'Covoiturage 15€ + 0.60€/km'],
      icon: Users,
      color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      iconColor: 'text-emerald-600',
      gradient: 'from-emerald-400 to-emerald-600'
    },
    {
      id: 'social_worker' as const,
      title: 'Travailleur Social',
      description: 'Valider les profils, établir des parcours, gérer les demandes',
      features: ['Validation <48h', 'QR codes sécurisés', 'API CAF intégrée'],
      icon: UserCheck,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 'association' as const,
      title: 'Association',
      description: 'Gérer les stocks, réceptionner les colis, distribuer',
      features: ['Alertes automatiques', 'Géolocalisation', 'Scan QR sécurisé'],
      icon: Package,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      id: 'beneficiary' as const,
      title: 'Bénéficiaire',
      description: 'Faire des demandes, consulter l\'historique, retirer les colis',
      features: ['Validation documents', 'QR codes 72h', 'Historique complet'],
      icon: Heart,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600',
      gradient: 'from-orange-400 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Globe className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Peuple Solidaire
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Plateforme digitale de solidarité alimentaire avec IA, géolocalisation et validation sécurisée
            </p>
            
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="flex items-center text-green-600">
                <Shield className="mr-2" size={20} />
                <span className="font-medium">Sécurisé</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Zap className="mr-2" size={20} />
                <span className="font-medium">IA Intégrée</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Globe className="mr-2" size={20} />
                <span className="font-medium">Géolocalisé</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {profiles.map((profile) => {
              const Icon = profile.icon;
              return (
                <button
                  key={profile.id}
                  onClick={() => onSelectProfile(profile.id)}
                  className={`${profile.color} border-2 rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl group relative overflow-hidden`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <div className={`bg-gradient-to-r ${profile.gradient} p-4 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <div className="ml-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {profile.title}
                        </h3>
                        <p className="text-gray-600">
                          {profile.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {profile.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-700">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${profile.gradient} mr-3`}></div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-r ${profile.gradient} opacity-10 rounded-full transform translate-x-16 translate-y-16 group-hover:scale-150 transition-transform duration-300`}></div>
                </button>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Architecture Technique
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">Frontend</h4>
                  <p className="text-gray-600">React + Tailwind CSS<br/>Interface WCAG 2.1</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">IA & Sécurité</h4>
                  <p className="text-gray-600">TensorFlow Lite<br/>Chiffrement AES-256</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">KPIs</h4>
                  <p className="text-gray-600">Validation &lt;48h<br/>Précision IA ≥90%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;