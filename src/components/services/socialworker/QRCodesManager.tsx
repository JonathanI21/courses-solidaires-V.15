import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Send, 
  Archive, 
  Eye, 
  X, 
  Bell, 
  Users, 
  Building, 
  ShoppingCart, 
  History, 
  Filter, 
  Search,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  familySize: number;
  address: string;
  phone: string;
  email: string;
  socialWorkerId: string;
  verified: boolean;
  registrationDate: Date;
  lastActivity: Date;
}

interface QRCodeItem {
  productId: string;
  productName: string;
  quantity: number;
  associationId: string;
  associationName: string;
  validated: boolean;
}

interface GeneratedQRCode {
  id: string;
  code: string;
  beneficiaryId: string;
  items: QRCodeItem[];
  generatedAt: Date;
  validUntil: Date;
  status: 'active' | 'expired' | 'used';
  associationNotified: boolean;
  beneficiaryNotified: boolean;
  notes?: string;
  sourceRequestId?: string; // Lien vers la demande d'origine
}

interface QRCodesByBeneficiary {
  [beneficiaryId: string]: GeneratedQRCode[];
}

const QRCodesManager: React.FC = () => {
  const [beneficiaries] = useState<Beneficiary[]>([
    {
      id: 'ben_001',
      firstName: 'Marie',
      lastName: 'Dubois',
      code: 'PDS-2024-001',
      familySize: 3,
      address: '123 Rue de la Paix, 13001 Marseille',
      phone: '06 12 34 56 78',
      email: 'marie.dubois@email.com',
      socialWorkerId: 'sw_001',
      verified: true,
      registrationDate: new Date('2024-01-10'),
      lastActivity: new Date('2024-01-16T14:30:00')
    },
    {
      id: 'ben_002',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      code: 'PDS-2024-002',
      familySize: 5,
      address: '456 Avenue des Fleurs, 13003 Marseille',
      phone: '06 98 76 54 32',
      email: 'ahmed.hassan@email.com',
      socialWorkerId: 'sw_001',
      verified: true,
      registrationDate: new Date('2024-01-12'),
      lastActivity: new Date('2024-01-15T09:15:00')
    },
    {
      id: 'ben_003',
      firstName: 'Sophie',
      lastName: 'Martin',
      code: 'PDS-2024-003',
      familySize: 2,
      address: '789 Boulevard du Soleil, 13008 Marseille',
      phone: '06 55 44 33 22',
      email: 'sophie.martin@email.com',
      socialWorkerId: 'sw_001',
      verified: false,
      registrationDate: new Date('2024-01-14'),
      lastActivity: new Date('2024-01-16T16:45:00')
    }
  ]);

  const [pendingQRItems, setPendingQRItems] = useState<QRCodeItem[]>([]);

  // État pour les QR codes archivés - maintenant chargé depuis localStorage
  const [archivedQRCodes, setArchivedQRCodes] = useState<QRCodesByBeneficiary>({});

  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('ben_001');
  const [showArchive, setShowArchive] = useState(true); // Commencer par l'historique
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'used'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerationSuccess, setShowGenerationSuccess] = useState<GeneratedQRCode | null>(null);

  // Charger les QR codes depuis localStorage au démarrage
  useEffect(() => {
    const loadQRCodes = () => {
      try {
        const stored = localStorage.getItem('generatedQRCodes');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convertir les dates string en objets Date
          const converted: QRCodesByBeneficiary = {};
          Object.keys(parsed).forEach(beneficiaryId => {
            converted[beneficiaryId] = parsed[beneficiaryId].map((qr: any) => ({
              ...qr,
              generatedAt: new Date(qr.generatedAt),
              validUntil: new Date(qr.validUntil)
            }));
          });
          setArchivedQRCodes(converted);
        } else {
          // Initialiser avec quelques QR codes de démonstration
          const initialQRCodes: QRCodesByBeneficiary = {
            'ben_001': [
              {
                id: 'qr_001',
                code: 'QR-2024-001-001',
                beneficiaryId: 'ben_001',
                items: [
                  {
                    productId: 'prod_007',
                    productName: 'Yaourts nature x8',
                    quantity: 2,
                    associationId: 'assoc_001',
                    associationName: 'Restos du Cœur',
                    validated: true
                  },
                  {
                    productId: 'prod_012',
                    productName: 'Pain de mie complet',
                    quantity: 1,
                    associationId: 'assoc_001',
                    associationName: 'Restos du Cœur',
                    validated: true
                  }
                ],
                generatedAt: new Date('2024-01-14T10:30:00'),
                validUntil: new Date('2024-01-17T10:30:00'),
                status: 'used',
                associationNotified: true,
                beneficiaryNotified: true,
                notes: 'Récupéré le 15/01/2024'
              },
              {
                id: 'qr_002',
                code: 'QR-2024-001-002',
                beneficiaryId: 'ben_001',
                items: [
                  {
                    productId: 'prod_018',
                    productName: 'Conserve tomates',
                    quantity: 3,
                    associationId: 'assoc_003',
                    associationName: 'Banque Alimentaire',
                    validated: true
                  }
                ],
                generatedAt: new Date('2024-01-16T14:15:00'),
                validUntil: new Date('2024-01-19T14:15:00'),
                status: 'active',
                associationNotified: true,
                beneficiaryNotified: true
              }
            ],
            'ben_002': [
              {
                id: 'qr_003',
                code: 'QR-2024-002-001',
                beneficiaryId: 'ben_002',
                items: [
                  {
                    productId: 'prod_011',
                    productName: 'Pâtes spaghetti',
                    quantity: 3,
                    associationId: 'assoc_001',
                    associationName: 'Restos du Cœur',
                    validated: true
                  },
                  {
                    productId: 'prod_014',
                    productName: 'Escalopes de poulet',
                    quantity: 2,
                    associationId: 'assoc_002',
                    associationName: 'Secours Populaire',
                    validated: true
                  }
                ],
                generatedAt: new Date('2024-01-13T09:45:00'),
                validUntil: new Date('2024-01-16T09:45:00'),
                status: 'expired',
                associationNotified: true,
                beneficiaryNotified: true,
                notes: 'Non récupéré - expiré'
              }
            ]
          };
          setArchivedQRCodes(initialQRCodes);
          localStorage.setItem('generatedQRCodes', JSON.stringify(initialQRCodes));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des QR codes:', error);
      }
    };

    loadQRCodes();

    // Écouter les changements dans localStorage (pour les QR codes générés depuis la pastille Demandes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'generatedQRCodes') {
        loadQRCodes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement les changements (pour les changements dans la même fenêtre)
    const interval = setInterval(loadQRCodes, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const selectedBeneficiaryData = beneficiaries.find(b => b.id === selectedBeneficiary);
  const beneficiaryQRCodes = archivedQRCodes[selectedBeneficiary] || [];

  const filteredQRCodes = beneficiaryQRCodes.filter(qr => {
    const matchesStatus = filterStatus === 'all' || qr.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      qr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      case 'used': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'expired': return 'Expiré';
      case 'used': return 'Utilisé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} />;
      case 'expired': return <AlertTriangle size={14} />;
      case 'used': return <Archive size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleGenerateQRCode = () => {
    if (pendingQRItems.length === 0) {
      alert('Aucun article à inclure dans le QR code');
      return;
    }

    const validatedItems = pendingQRItems.filter(item => item.validated);
    if (validatedItems.length === 0) {
      alert('Aucun article validé pour la génération du QR code');
      return;
    }

    // Générer le nouveau QR code
    const newQRCode: GeneratedQRCode = {
      id: `qr_${Date.now()}`,
      code: `QR-2024-${selectedBeneficiary.split('_')[1]}-${String(beneficiaryQRCodes.length + 1).padStart(3, '0')}`,
      beneficiaryId: selectedBeneficiary,
      items: validatedItems,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
      status: 'active',
      associationNotified: false,
      beneficiaryNotified: false
    };

    // Envoyer les notifications
    sendNotificationToAssociation(newQRCode);
    sendNotificationToBeneficiary(newQRCode);

    // Marquer les notifications comme envoyées
    newQRCode.associationNotified = true;
    newQRCode.beneficiaryNotified = true;

    // Archiver le QR code
    const updatedQRCodes = {
      ...archivedQRCodes,
      [selectedBeneficiary]: [...(archivedQRCodes[selectedBeneficiary] || []), newQRCode]
    };
    setArchivedQRCodes(updatedQRCodes);
    localStorage.setItem('generatedQRCodes', JSON.stringify(updatedQRCodes));

    // Retirer les articles traités de la liste en attente
    setPendingQRItems([]);

    // Afficher le succès
    setShowGenerationSuccess(newQRCode);

    // Masquer le message de succès après 5 secondes
    setTimeout(() => {
      setShowGenerationSuccess(null);
    }, 5000);
  };

  const sendNotificationToAssociation = (qrCode: GeneratedQRCode) => {
    const associations = [...new Set(qrCode.items.map(item => item.associationName))];
    
    associations.forEach(associationName => {
      const associationItems = qrCode.items.filter(item => item.associationName === associationName);
      
      console.log(`📧 NOTIFICATION ASSOCIATION - ${associationName}:`);
      console.log(`QR Code généré: ${qrCode.code}`);
      console.log(`Bénéficiaire: ${selectedBeneficiaryData?.firstName} ${selectedBeneficiaryData?.lastName} (${selectedBeneficiaryData?.code})`);
      console.log(`Articles à préparer:`);
      associationItems.forEach(item => {
        console.log(`  - ${item.productName} (x${item.quantity})`);
      });
      console.log(`Validité: jusqu'au ${qrCode.validUntil.toLocaleDateString('fr-FR')} à ${qrCode.validUntil.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      console.log(`Contact bénéficiaire: ${selectedBeneficiaryData?.phone}`);
      console.log('---');
    });
  };

  const sendNotificationToBeneficiary = (qrCode: GeneratedQRCode) => {
    console.log(`📱 NOTIFICATION BÉNÉFICIAIRE - ${selectedBeneficiaryData?.firstName} ${selectedBeneficiaryData?.lastName}:`);
    console.log(`Votre QR code ${qrCode.code} a été généré.`);
    console.log(`IMPORTANT: Attendre que l'association vous transmette une notification pour récupérer le colis.`);
    console.log(`Articles inclus: ${qrCode.items.length} produits`);
    console.log(`Validité: jusqu'au ${qrCode.validUntil.toLocaleDateString('fr-FR')}`);
    console.log(`Ne vous présentez pas avant d'avoir reçu la confirmation de l'association.`);
  };

  const renderGenerationSuccessModal = () => {
    if (!showGenerationSuccess) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              QR Code généré avec succès !
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <QrCode className="text-blue-600 mr-2" size={16} />
                <span className="font-medium text-blue-800">Code: {showGenerationSuccess.code}</span>
              </div>
              <p className="text-sm text-blue-700">
                Valide jusqu'au {showGenerationSuccess.validUntil.toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-green-600 text-sm">
                <Send className="mr-2" size={14} />
                <span>Notification envoyée aux associations</span>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <Bell className="mr-2" size={14} />
                <span>Notification envoyée au bénéficiaire</span>
              </div>
              <div className="flex items-center text-blue-600 text-sm">
                <Archive className="mr-2" size={14} />
                <span>QR code archivé automatiquement</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Articles inclus:</strong> {showGenerationSuccess.items.length}</p>
              <p><strong>Bénéficiaire:</strong> {selectedBeneficiaryData?.firstName} {selectedBeneficiaryData?.lastName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <QrCode className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">QR Codes 72h - Géolocalisation Sécurisée</h1>
              <p className="text-green-100 text-sm">Génération • Archivage • Suivi par bénéficiaire</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowArchive(!showArchive)}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                showArchive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-green-100 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Archive className="mr-2" size={16} />
              {showArchive ? 'Génération QR' : 'Historique QR'}
            </button>
            
            <div className="text-right text-sm">
              <div className="font-medium">{beneficiaries.length} bénéficiaires</div>
              <div className="text-green-200">
                {Object.values(archivedQRCodes).flat().length} QR archivés
              </div>
            </div>
          </div>
        </div>
      </div>

      {!showArchive ? (
        /* INTERFACE DE GÉNÉRATION QR (conservée pour compatibilité) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          
          {/* PARTIE GAUCHE - Sélection bénéficiaire */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <Users className="mr-2" size={20} />
                Sélection du Bénéficiaire
              </h2>
              
              <div className="space-y-2">
                {beneficiaries.map(beneficiary => (
                  <button
                    key={beneficiary.id}
                    onClick={() => setSelectedBeneficiary(beneficiary.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedBeneficiary === beneficiary.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {beneficiary.firstName} {beneficiary.lastName}
                        </h3>
                        <p className="text-sm text-green-600 font-mono">{beneficiary.code}</p>
                        <p className="text-xs text-gray-600">
                          Foyer: {beneficiary.familySize} personne{beneficiary.familySize > 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      {beneficiary.verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Vérifié
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Non vérifié
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Informations du bénéficiaire sélectionné */}
            {selectedBeneficiaryData && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <User className="mr-2" size={20} />
                  Informations Bénéficiaire
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Phone className="mr-2 text-gray-400" size={14} />
                    <span>{selectedBeneficiaryData.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-2 text-gray-400" size={14} />
                    <span>{selectedBeneficiaryData.email}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="mr-2 mt-0.5 text-gray-400" size={14} />
                    <span>{selectedBeneficiaryData.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 text-gray-400" size={14} />
                    <span>Inscrit le {selectedBeneficiaryData.registrationDate.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PARTIE DROITE - Articles et génération QR */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <Package className="mr-2" size={20} />
                Articles Validés pour QR Code
              </h2>
              
              <div className="text-center py-8 bg-green-50 rounded-lg">
                <Package className="mx-auto text-green-400 mb-3" size={48} />
                <p className="text-green-700 font-medium mb-1">Génération depuis la pastille "Demandes"</p>
                <p className="text-green-600 text-sm">
                  Les QR codes sont maintenant générés directement depuis la pastille "Demandes" 
                  et apparaissent automatiquement dans l'historique ci-dessous.
                </p>
                <button
                  onClick={() => setShowArchive(true)}
                  className="mt-4 flex items-center mx-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Archive className="mr-2" size={16} />
                  Voir l'historique des QR codes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INTERFACE D'ARCHIVAGE */
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-green-800 flex items-center">
                <Archive className="mr-3" size={28} />
                Historique QR Codes par Bénéficiaire
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un QR code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="expired">Expirés</option>
                  <option value="used">Utilisés</option>
                </select>
              </div>
            </div>

            {/* Sélection du bénéficiaire pour l'historique */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Sélectionner un bénéficiaire</h3>
              <div className="flex flex-wrap gap-2">
                {beneficiaries.map(beneficiary => (
                  <button
                    key={beneficiary.id}
                    onClick={() => setSelectedBeneficiary(beneficiary.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedBeneficiary === beneficiary.id
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="text-sm">
                      <div className="font-medium">{beneficiary.firstName} {beneficiary.lastName}</div>
                      <div className="text-xs opacity-75">{beneficiary.code}</div>
                    </div>
                    <div className="text-xs mt-1">
                      {(archivedQRCodes[beneficiary.id] || []).length} QR code{(archivedQRCodes[beneficiary.id] || []).length > 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Historique du bénéficiaire sélectionné */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Historique QR - {selectedBeneficiaryData?.firstName} {selectedBeneficiaryData?.lastName}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({filteredQRCodes.length} QR code{filteredQRCodes.length > 1 ? 's' : ''})
                </span>
              </h3>
              
              {filteredQRCodes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Archive className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 font-medium">Aucun QR code trouvé</p>
                  <p className="text-gray-500 text-sm">
                    {beneficiaryQRCodes.length === 0 
                      ? 'Aucun QR code généré pour ce bénéficiaire'
                      : 'Modifiez vos filtres de recherche'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQRCodes.map(qrCode => (
                    <div key={qrCode.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <QrCode className="mr-2 text-green-600" size={20} />
                            {qrCode.code}
                            {qrCode.sourceRequestId && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                                Depuis demande
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Généré le {qrCode.generatedAt.toLocaleDateString('fr-FR')} à {qrCode.generatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Valide jusqu'au {qrCode.validUntil.toLocaleDateString('fr-FR')} à {qrCode.validUntil.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-sm border flex items-center ${getStatusColor(qrCode.status)}`}>
                          {getStatusIcon(qrCode.status)}
                          <span className="ml-1">{getStatusText(qrCode.status)}</span>
                        </span>
                      </div>
                      
                      {/* Articles du QR code */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                          <ShoppingCart className="mr-1" size={16} />
                          Articles inclus ({qrCode.items.length})
                        </h5>
                        <div className="grid md:grid-cols-2 gap-2">
                          {qrCode.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                              <div>
                                <div className="font-medium text-sm text-gray-800">{item.productName}</div>
                                <div className="text-xs text-gray-600">{item.associationName}</div>
                              </div>
                              <span className="text-sm font-bold text-green-600">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Statut des notifications */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center ${qrCode.associationNotified ? 'text-green-600' : 'text-gray-400'}`}>
                            <Building className="mr-1" size={12} />
                            <span>Association {qrCode.associationNotified ? 'notifiée' : 'non notifiée'}</span>
                          </div>
                          <div className={`flex items-center ${qrCode.beneficiaryNotified ? 'text-green-600' : 'text-gray-400'}`}>
                            <Bell className="mr-1" size={12} />
                            <span>Bénéficiaire {qrCode.beneficiaryNotified ? 'notifié' : 'non notifié'}</span>
                          </div>
                        </div>
                        
                        {qrCode.notes && (
                          <div className="text-gray-600 italic">
                            {qrCode.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès de génération */}
      {renderGenerationSuccessModal()}
    </div>
  );
};

export default QRCodesManager;