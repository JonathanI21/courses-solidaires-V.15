import React, { useState } from 'react';
import { 
  UserCheck, 
  ClipboardList, 
  QrCode, 
  Shield,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  Archive,
  AlertTriangle,
  Lock,
  Key,
  Database,
  Globe
} from 'lucide-react';
import RequestsManager from './RequestsManager';
import QRCodesManager from './QRCodesManager';

interface SocialWorkerServicesProps {
  serviceId: string;
  onBack: () => void;
}

interface RGPDDocument {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  documentType: 'consent' | 'data_processing' | 'right_to_forget' | 'data_portability' | 'access_request';
  title: string;
  status: 'signed' | 'pending' | 'expired' | 'revoked';
  signedAt?: Date;
  validUntil?: Date;
  ipAddress: string;
  userAgent: string;
  documentVersion: string;
}

const SocialWorkerServices: React.FC<SocialWorkerServicesProps> = ({ serviceId, onBack }) => {
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Données simulées des documents RGPD
  const rgpdDocuments: RGPDDocument[] = [
    {
      id: 'rgpd_001',
      beneficiaryId: 'ben_001',
      beneficiaryName: 'Marie Dubois',
      documentType: 'consent',
      title: 'Consentement traitement des données personnelles',
      status: 'signed',
      signedAt: new Date('2024-01-10T14:30:00'),
      validUntil: new Date('2025-01-10T14:30:00'),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      documentVersion: 'v2.1'
    },
    {
      id: 'rgpd_002',
      beneficiaryId: 'ben_001',
      beneficiaryName: 'Marie Dubois',
      documentType: 'data_processing',
      title: 'Autorisation traitement données sensibles',
      status: 'signed',
      signedAt: new Date('2024-01-10T14:35:00'),
      validUntil: new Date('2025-01-10T14:35:00'),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      documentVersion: 'v1.3'
    },
    {
      id: 'rgpd_003',
      beneficiaryId: 'ben_002',
      beneficiaryName: 'Ahmed Hassan',
      documentType: 'consent',
      title: 'Consentement traitement des données personnelles',
      status: 'signed',
      signedAt: new Date('2024-01-12T09:15:00'),
      validUntil: new Date('2025-01-12T09:15:00'),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Android 12; Mobile)',
      documentVersion: 'v2.1'
    },
    {
      id: 'rgpd_004',
      beneficiaryId: 'ben_003',
      beneficiaryName: 'Sophie Martin',
      documentType: 'consent',
      title: 'Consentement traitement des données personnelles',
      status: 'pending',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)',
      documentVersion: 'v2.1'
    },
    {
      id: 'rgpd_005',
      beneficiaryId: 'ben_001',
      beneficiaryName: 'Marie Dubois',
      documentType: 'access_request',
      title: 'Demande d\'accès aux données personnelles',
      status: 'signed',
      signedAt: new Date('2024-01-15T16:20:00'),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      documentVersion: 'v1.0'
    }
  ];

  const beneficiaries = [
    { id: 'ben_001', name: 'Marie Dubois' },
    { id: 'ben_002', name: 'Ahmed Hassan' },
    { id: 'ben_003', name: 'Sophie Martin' }
  ];

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'consent': return 'Consentement RGPD';
      case 'data_processing': return 'Traitement données';
      case 'right_to_forget': return 'Droit à l\'oubli';
      case 'data_portability': return 'Portabilité données';
      case 'access_request': return 'Accès aux données';
      default: return 'Document RGPD';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      case 'revoked': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'signed': return 'Signé';
      case 'pending': return 'En attente';
      case 'expired': return 'Expiré';
      case 'revoked': return 'Révoqué';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'expired': return <AlertTriangle size={14} />;
      case 'revoked': return <Archive size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const filteredDocuments = rgpdDocuments.filter(doc => {
    const matchesBeneficiary = selectedBeneficiary === 'all' || doc.beneficiaryId === selectedBeneficiary;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBeneficiary && matchesStatus && matchesSearch;
  });

  const renderRGPDDocuments = () => (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <FileText className="mr-2" size={20} />
          Documents RGPD par Bénéficiaire
        </h3>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <User className="text-gray-400" size={16} />
            <select
              value={selectedBeneficiary}
              onChange={(e) => setSelectedBeneficiary(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les bénéficiaires</option>
              {beneficiaries.map(ben => (
                <option key={ben.id} value={ben.id}>{ben.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="signed">Signés</option>
              <option value="pending">En attente</option>
              <option value="expired">Expirés</option>
              <option value="revoked">Révoqués</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 text-sm">Documents signés</h4>
            <p className="text-xl font-bold text-green-600">
              {rgpdDocuments.filter(d => d.status === 'signed').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-yellow-800 text-sm">En attente</h4>
            <p className="text-xl font-bold text-yellow-600">
              {rgpdDocuments.filter(d => d.status === 'pending').length}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <h4 className="font-medium text-red-800 text-sm">Expirés</h4>
            <p className="text-xl font-bold text-red-600">
              {rgpdDocuments.filter(d => d.status === 'expired').length}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 text-sm">Total documents</h4>
            <p className="text-xl font-bold text-blue-600">{rgpdDocuments.length}</p>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          Documents RGPD ({filteredDocuments.length})
        </h3>
        
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Aucun document trouvé</p>
            <p className="text-gray-500 text-sm">Modifiez vos filtres de recherche</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <FileText className="mr-2 text-blue-600" size={18} />
                      {doc.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Bénéficiaire:</strong> {doc.beneficiaryName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Type:</strong> {getDocumentTypeLabel(doc.documentType)}
                    </p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm border flex items-center ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    <span className="ml-1">{getStatusText(doc.status)}</span>
                  </span>
                </div>
                
                {/* Détails techniques */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h5 className="font-medium text-gray-800 mb-2 text-sm">Détails techniques</h5>
                  <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>
                      <strong>Version document:</strong> {doc.documentVersion}
                    </div>
                    <div>
                      <strong>Adresse IP:</strong> {doc.ipAddress}
                    </div>
                    <div className="md:col-span-2">
                      <strong>User Agent:</strong> {doc.userAgent}
                    </div>
                  </div>
                </div>
                
                {/* Dates et actions */}
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    {doc.signedAt && (
                      <div className="flex items-center text-green-600">
                        <Calendar className="mr-1" size={12} />
                        <span>Signé le {doc.signedAt.toLocaleDateString('fr-FR')} à {doc.signedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {doc.validUntil && (
                      <div className="flex items-center text-blue-600">
                        <Clock className="mr-1" size={12} />
                        <span>Valide jusqu'au {doc.validUntil.toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-xs">
                      <Eye className="mr-1" size={12} />
                      Consulter
                    </button>
                    <button className="flex items-center px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors text-xs">
                      <Download className="mr-1" size={12} />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderServiceContent = () => {
    switch (serviceId) {
      case 'beneficiary-info':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <UserCheck className="mr-3 text-blue-600" size={28} />
              Informations Bénéficiaires
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Bénéficiaires actifs</h3>
                <p className="text-2xl font-bold text-blue-600">127</p>
                <p className="text-sm text-blue-600">+12 ce mois</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Validations effectuées</h3>
                <p className="text-2xl font-bold text-green-600">89</p>
                <p className="text-sm text-green-600">Délai moyen: 24h</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">En attente de validation</h3>
                <p className="text-2xl font-bold text-yellow-600">8</p>
                <p className="text-sm text-yellow-600">À traiter</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Processus de validation</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">1</div>
                  <div>
                    <h4 className="font-medium">Vérification des documents</h4>
                    <p className="text-sm text-blue-700">Contrôle automatique par IA (96% de précision)</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">2</div>
                  <div>
                    <h4 className="font-medium">Validation CAF</h4>
                    <p className="text-sm text-blue-700">Intégration API officielle en temps réel</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">3</div>
                  <div>
                    <h4 className="font-medium">Attribution du code unique</h4>
                    <p className="text-sm text-blue-700">Génération automatique du code PDS-YYYY-XXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'requests':
        return <RequestsManager />;

      case 'qr-codes':
        return <QRCodesManager />;

      case 'security':
        return (
          <div className="space-y-6">
            {/* En-tête sécurité */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Shield className="mr-3 text-blue-600" size={28} />
                Sécurité & Conformité RGPD
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lock className="mr-2 text-blue-600" size={20} />
                    <h3 className="font-semibold text-blue-800">Chiffrement AES-256</h3>
                  </div>
                  <p className="text-sm text-blue-700">Toutes les données sensibles sont chiffrées</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Globe className="mr-2 text-green-600" size={20} />
                    <h3 className="font-semibold text-green-800">Conformité RGPD</h3>
                  </div>
                  <p className="text-sm text-green-700">Respect total de la réglementation</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Key className="mr-2 text-purple-600" size={20} />
                    <h3 className="font-semibold text-purple-800">Authentification 2FA</h3>
                  </div>
                  <p className="text-sm text-purple-700">Double authentification obligatoire</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Database className="mr-2 text-orange-600" size={20} />
                    <h3 className="font-semibold text-orange-800">Audit de sécurité</h3>
                  </div>
                  <p className="text-sm text-orange-700">Contrôles réguliers et logs détaillés</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Mesures de protection</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-blue-700 text-sm">Anonymisation automatique des données sensibles</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-blue-700 text-sm">Géolocalisation sécurisée avec validation GPS</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-blue-700 text-sm">QR codes temporaires avec expiration automatique</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-blue-700 text-sm">Validation croisée des identités bénéficiaires</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-blue-700 text-sm">Consentements RGPD horodatés et signés</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-blue-700 text-sm">Traçabilité complète des accès aux données</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents RGPD */}
            {renderRGPDDocuments()}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Service en développement</h2>
            <p className="text-gray-500 mb-6">Ce service sera bientôt disponible.</p>
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
      {renderServiceContent()}
    </div>
  );
};

export default SocialWorkerServices;