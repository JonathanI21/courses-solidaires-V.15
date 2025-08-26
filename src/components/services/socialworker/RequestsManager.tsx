import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
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
  RefreshCw,
  QrCode,
  Plus,
  Minus,
  Heart,
  Gift,
  Warehouse,
  Globe,
  ArrowRight
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

interface StockInfo {
  associationId: string;
  associationName: string;
  quantity: number;
  location: string;
}

interface RequestItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  validated: boolean;
  associationId?: string;
  associationName?: string;
  notes?: string;
  availableInStock?: boolean;
  stockInfo?: StockInfo[]; // Nouveau: informations détaillées sur les stocks par association
}

interface DonationRequest {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  items: RequestItem[];
  status: 'pending' | 'validated' | 'qr_generated' | 'fulfilled' | 'collected';
  createdAt: Date;
  validatedAt?: Date;
  qrGeneratedAt?: Date;
  fulfilledAt?: Date;
  collectedAt?: Date;
  socialWorkerId: string;
  notes?: string;
  urgency: 'low' | 'medium' | 'high';
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
  sourceRequestId: string; // Lien vers la demande d'origine
}

interface AnonymousRequest {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  requestedAt: Date;
  status: 'pending' | 'sent';
}

const RequestsManager: React.FC = () => {
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

  const [requests, setRequests] = useState<DonationRequest[]>([
    {
      id: 'req_001',
      beneficiaryId: 'ben_001',
      beneficiaryName: 'Marie Dubois',
      items: [
        {
          id: 'item_001',
          productName: 'Lait demi-écrémé 1L',
          category: 'produits-laitiers',
          quantity: 4,
          priority: 'high',
          validated: true,
          associationId: 'assoc_001',
          associationName: 'Restos du Cœur',
          availableInStock: true,
          stockInfo: [
            {
              associationId: 'assoc_001',
              associationName: 'Restos du Cœur',
              quantity: 15,
              location: 'Entrepôt A - Réfrigérateur 2'
            },
            {
              associationId: 'assoc_002',
              associationName: 'Secours Populaire',
              quantity: 8,
              location: 'Local B - Frigo principal'
            }
          ]
        },
        {
          id: 'item_002',
          productName: 'Riz basmati 1kg',
          category: 'feculents',
          quantity: 2,
          priority: 'medium',
          validated: true,
          associationId: 'assoc_001',
          associationName: 'Restos du Cœur',
          availableInStock: true,
          stockInfo: [
            {
              associationId: 'assoc_001',
              associationName: 'Restos du Cœur',
              quantity: 8,
              location: 'Entrepôt A - Étagère 3'
            },
            {
              associationId: 'assoc_003',
              associationName: 'Banque Alimentaire',
              quantity: 25,
              location: 'Entrepôt Central - Zone C'
            }
          ]
        },
        {
          id: 'item_003',
          productName: 'Pommes Golden',
          category: 'fruits-legumes',
          quantity: 3,
          priority: 'low',
          validated: false,
          availableInStock: false,
          stockInfo: []
        }
      ],
      status: 'validated',
      createdAt: new Date('2024-01-15T10:30:00'),
      validatedAt: new Date('2024-01-15T14:20:00'),
      socialWorkerId: 'sw_001',
      urgency: 'high',
      notes: 'Famille avec enfants en bas âge'
    },
    {
      id: 'req_002',
      beneficiaryId: 'ben_002',
      beneficiaryName: 'Ahmed Hassan',
      items: [
        {
          id: 'item_004',
          productName: 'Pâtes spaghetti',
          category: 'feculents',
          quantity: 5,
          priority: 'high',
          validated: false,
          availableInStock: true,
          stockInfo: [
            {
              associationId: 'assoc_001',
              associationName: 'Restos du Cœur',
              quantity: 12,
              location: 'Entrepôt A - Étagère 1'
            },
            {
              associationId: 'assoc_002',
              associationName: 'Secours Populaire',
              quantity: 7,
              location: 'Local B - Réserve'
            }
          ]
        },
        {
          id: 'item_005',
          productName: 'Conserve tomates',
          category: 'epicerie',
          quantity: 3,
          priority: 'medium',
          validated: false,
          availableInStock: true,
          stockInfo: [
            {
              associationId: 'assoc_003',
              associationName: 'Banque Alimentaire',
              quantity: 18,
              location: 'Entrepôt Central - Zone A'
            }
          ]
        },
        {
          id: 'item_006',
          productName: 'Yaourts nature x8',
          category: 'produits-laitiers',
          quantity: 2,
          priority: 'low',
          validated: false,
          availableInStock: false,
          stockInfo: []
        },
        {
          id: 'item_007',
          productName: 'Huile d\'olive',
          category: 'epicerie',
          quantity: 1,
          priority: 'medium',
          validated: false,
          availableInStock: false,
          stockInfo: []
        }
      ],
      status: 'pending',
      createdAt: new Date('2024-01-16T09:15:00'),
      socialWorkerId: 'sw_001',
      urgency: 'medium',
      notes: 'Famille nombreuse, situation temporaire'
    },
    {
      id: 'req_003',
      beneficiaryId: 'ben_003',
      beneficiaryName: 'Sophie Martin',
      items: [
        {
          id: 'item_008',
          productName: 'Pain de mie complet',
          category: 'feculents',
          quantity: 2,
          priority: 'medium',
          validated: false,
          availableInStock: true,
          stockInfo: [
            {
              associationId: 'assoc_002',
              associationName: 'Secours Populaire',
              quantity: 4,
              location: 'Local B - Boulangerie'
            }
          ]
        },
        {
          id: 'item_009',
          productName: 'Jambon blanc',
          category: 'viandes-poissons',
          quantity: 1,
          priority: 'low',
          validated: false,
          availableInStock: false,
          stockInfo: []
        }
      ],
      status: 'pending',
      createdAt: new Date('2024-01-16T16:45:00'),
      socialWorkerId: 'sw_001',
      urgency: 'low',
      notes: 'Première demande, vérification en cours'
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'validated' | 'qr_generated' | 'fulfilled' | 'collected'>('all');
  const [filterBeneficiary, setFilterBeneficiary] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRGenerationSuccess, setShowQRGenerationSuccess] = useState<GeneratedQRCode | null>(null);
  const [anonymousRequests, setAnonymousRequests] = useState<AnonymousRequest[]>([]);

  // Associations disponibles
  const associations = [
    { id: 'assoc_001', name: 'Restos du Cœur' },
    { id: 'assoc_002', name: 'Secours Populaire' },
    { id: 'assoc_003', name: 'Banque Alimentaire' },
    { id: 'assoc_004', name: 'Croix-Rouge' }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesBeneficiary = filterBeneficiary === 'all' || request.beneficiaryId === filterBeneficiary;
    const matchesSearch = searchTerm === '' || 
      request.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesBeneficiary && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'validated': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'qr_generated': return 'bg-green-100 text-green-800 border-green-300';
      case 'fulfilled': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'collected': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validée';
      case 'qr_generated': return 'QR généré';
      case 'fulfilled': return 'Préparée';
      case 'collected': return 'Récupérée';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'validated': return <CheckCircle size={14} />;
      case 'qr_generated': return <QrCode size={14} />;
      case 'fulfilled': return <Package size={14} />;
      case 'collected': return <Archive size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleValidateItem = (requestId: string, itemId: string, associationId: string) => {
    const association = associations.find(a => a.id === associationId);
    if (!association) return;

    setRequests(requests.map(request => {
      if (request.id === requestId) {
        const updatedItems = request.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              validated: true,
              associationId,
              associationName: association.name
            };
          }
          return item;
        });

        // Vérifier si tous les articles disponibles en stock sont validés
        const stockItems = updatedItems.filter(item => item.availableInStock);
        const allStockItemsValidated = stockItems.length > 0 && stockItems.every(item => item.validated);
        const newStatus = allStockItemsValidated ? 'validated' : 'pending';
        const validatedAt = allStockItemsValidated && !request.validatedAt ? new Date() : request.validatedAt;

        return {
          ...request,
          items: updatedItems,
          status: newStatus,
          validatedAt
        };
      }
      return request;
    }));
  };

  const handleInvalidateItem = (requestId: string, itemId: string) => {
    setRequests(requests.map(request => {
      if (request.id === requestId) {
        const updatedItems = request.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              validated: false,
              associationId: undefined,
              associationName: undefined
            };
          }
          return item;
        });

        return {
          ...request,
          items: updatedItems,
          status: 'pending'
        };
      }
      return request;
    }));
  };

  const handleUpdateQuantity = (requestId: string, itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    setRequests(requests.map(request => {
      if (request.id === requestId) {
        const updatedItems = request.items.map(item => {
          if (item.id === itemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        return { ...request, items: updatedItems };
      }
      return request;
    }));
  };

  const handleSendAnonymousRequest = (requestId: string, itemId: string) => {
    const request = requests.find(r => r.id === requestId);
    const item = request?.items.find(i => i.id === itemId);
    
    if (!item) return;

    const anonymousRequest: AnonymousRequest = {
      id: `anon_${Date.now()}`,
      productName: item.productName,
      category: item.category,
      quantity: item.quantity,
      priority: item.priority,
      requestedAt: new Date(),
      status: 'sent'
    };

    setAnonymousRequests(prev => [...prev, anonymousRequest]);

    // Simuler l'envoi de la demande anonyme aux ménages
    console.log(`📢 DEMANDE ANONYME ENVOYÉE AUX MÉNAGES:`);
    console.log(`Produit demandé: ${item.productName}`);
    console.log(`Quantité: ${item.quantity}`);
    console.log(`Priorité: ${item.priority}`);
    console.log(`Envoyé à tous les utilisateurs du profil ménage`);

    alert(`Demande anonyme envoyée aux ménages pour: ${item.productName} (x${item.quantity})`);
  };

  const handleGenerateQRCode = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const validatedItems = request.items.filter(item => item.validated && item.availableInStock);
    if (validatedItems.length === 0) {
      alert('Aucun article en stock validé pour générer le QR code');
      return;
    }

    const beneficiary = beneficiaries.find(b => b.id === request.beneficiaryId);
    if (!beneficiary) return;

    // Créer le QR code avec les informations de la demande
    const qrCodeItems: QRCodeItem[] = validatedItems.map(item => ({
      productId: `prod_${item.id}`, // Simulation d'un ID produit
      productName: item.productName,
      quantity: item.quantity,
      associationId: item.associationId!,
      associationName: item.associationName!,
      validated: true
    }));

    const newQRCode: GeneratedQRCode = {
      id: `qr_${Date.now()}`,
      code: `QR-2024-${request.beneficiaryId.split('_')[1]}-${String(Date.now()).slice(-3)}`,
      beneficiaryId: request.beneficiaryId,
      items: qrCodeItems,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
      status: 'active',
      associationNotified: false,
      beneficiaryNotified: false,
      sourceRequestId: requestId
    };

    // Sauvegarder le QR code dans le localStorage pour la pastille QR Codes
    const existingQRCodes = JSON.parse(localStorage.getItem('generatedQRCodes') || '{}');
    if (!existingQRCodes[request.beneficiaryId]) {
      existingQRCodes[request.beneficiaryId] = [];
    }
    existingQRCodes[request.beneficiaryId].push(newQRCode);
    localStorage.setItem('generatedQRCodes', JSON.stringify(existingQRCodes));

    // Envoyer les notifications
    sendNotificationToAssociation(newQRCode, beneficiary);
    sendNotificationToBeneficiary(newQRCode, beneficiary);

    // Marquer les notifications comme envoyées
    newQRCode.associationNotified = true;
    newQRCode.beneficiaryNotified = true;

    // Mettre à jour le statut de la demande
    setRequests(requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'qr_generated',
          qrGeneratedAt: new Date()
        };
      }
      return r;
    }));

    // Afficher le succès
    setShowQRGenerationSuccess(newQRCode);

    // Masquer le message de succès après 5 secondes
    setTimeout(() => {
      setShowQRGenerationSuccess(null);
    }, 5000);
  };

  const sendNotificationToAssociation = (qrCode: GeneratedQRCode, beneficiary: Beneficiary) => {
    const associations = [...new Set(qrCode.items.map(item => item.associationName))];
    
    associations.forEach(associationName => {
      const associationItems = qrCode.items.filter(item => item.associationName === associationName);
      
      console.log(`📧 NOTIFICATION ASSOCIATION - ${associationName}:`);
      console.log(`QR Code généré: ${qrCode.code}`);
      console.log(`Bénéficiaire: ${beneficiary.firstName} ${beneficiary.lastName} (${beneficiary.code})`);
      console.log(`Articles à préparer:`);
      associationItems.forEach(item => {
        console.log(`  - ${item.productName} (x${item.quantity})`);
      });
      console.log(`Validité: jusqu'au ${qrCode.validUntil.toLocaleDateString('fr-FR')} à ${qrCode.validUntil.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      console.log(`Contact bénéficiaire: ${beneficiary.phone}`);
      console.log('---');
    });
  };

  const sendNotificationToBeneficiary = (qrCode: GeneratedQRCode, beneficiary: Beneficiary) => {
    console.log(`📱 NOTIFICATION BÉNÉFICIAIRE - ${beneficiary.firstName} ${beneficiary.lastName}:`);
    console.log(`Votre QR code ${qrCode.code} a été généré.`);
    console.log(`IMPORTANT: Attendre que l'association vous transmette une notification pour récupérer le colis.`);
    console.log(`Articles inclus: ${qrCode.items.length} produits`);
    console.log(`Validité: jusqu'au ${qrCode.validUntil.toLocaleDateString('fr-FR')}`);
    console.log(`Ne vous présentez pas avant d'avoir reçu la confirmation de l'association.`);
  };

  const renderQRGenerationSuccessModal = () => {
    if (!showQRGenerationSuccess) return null;

    const beneficiary = beneficiaries.find(b => b.id === showQRGenerationSuccess.beneficiaryId);

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
                <span className="font-medium text-blue-800">Code: {showQRGenerationSuccess.code}</span>
              </div>
              <p className="text-sm text-blue-700">
                Valide jusqu'au {showQRGenerationSuccess.validUntil.toLocaleDateString('fr-FR')}
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
                <span>QR code archivé dans la pastille "QR Codes 72h"</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Articles inclus:</strong> {showQRGenerationSuccess.items.length}</p>
              <p><strong>Bénéficiaire:</strong> {beneficiary?.firstName} {beneficiary?.lastName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardList className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Gestion des Demandes</h1>
              <p className="text-blue-100 text-sm">Validation • Attribution • Génération QR</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="font-medium">{requests.length} demandes</div>
              <div className="text-blue-200">
                {requests.filter(r => r.status === 'pending').length} en attente
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="validated">Validées</option>
              <option value="qr_generated">QR générés</option>
              <option value="fulfilled">Préparées</option>
              <option value="collected">Récupérées</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="text-gray-400" size={16} />
            <select
              value={filterBeneficiary}
              onChange={(e) => setFilterBeneficiary(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les bénéficiaires</option>
              {beneficiaries.map(ben => (
                <option key={ben.id} value={ben.id}>
                  {ben.firstName} {ben.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="p-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Aucune demande trouvée</p>
            <p className="text-gray-500 text-sm">Modifiez vos filtres de recherche</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => {
              const beneficiary = beneficiaries.find(b => b.id === request.beneficiaryId);
              const isExpanded = selectedRequest === request.id;
              
              // Séparer les articles en stock, non en stock et validés
              const stockItems = request.items.filter(item => item.availableInStock && !item.validated);
              const nonStockItems = request.items.filter(item => !item.availableInStock);
              const validatedItems = request.items.filter(item => item.validated);
              
              return (
                <div 
                  key={request.id} 
                  className={`bg-white rounded-lg shadow-md border-l-4 ${getUrgencyColor(request.urgency)} overflow-hidden`}
                >
                  {/* En-tête de la demande */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <User className="mr-3 text-blue-600" size={24} />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {request.beneficiaryName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Code: {beneficiary?.code} • Foyer: {beneficiary?.familySize} personne{beneficiary?.familySize && beneficiary.familySize > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            Demande créée le {request.createdAt.toLocaleDateString('fr-FR')} à {request.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm border flex items-center ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusText(request.status)}</span>
                        </span>
                        
                        <button
                          onClick={() => setSelectedRequest(isExpanded ? null : request.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {isExpanded ? <X size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Résumé des articles */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Package className="mr-1 text-gray-500" size={14} />
                          <span>{request.items.length} articles demandés</span>
                        </div>
                        <div className="flex items-center">
                          <Warehouse className="mr-1 text-green-500" size={14} />
                          <span>{stockItems.length} en stock</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-1 text-blue-500" size={14} />
                          <span>{validatedItems.length} validés</span>
                        </div>
                        {request.notes && (
                          <div className="flex items-center">
                            <FileText className="mr-1 text-blue-500" size={14} />
                            <span className="italic text-blue-600">{request.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Détails étendus avec nouvelle organisation en colonnes */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <ShoppingCart className="mr-2" size={18} />
                        Articles demandés
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* COLONNE GAUCHE - Tous les produits (disponibles et non disponibles) */}
                        <div className="space-y-4">
                          {/* Produits disponibles en stock */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                              <Warehouse className="mr-2" size={16} />
                              Produits disponibles en stock ({stockItems.length})
                            </h5>
                            
                            {stockItems.length === 0 ? (
                              <div className="text-center py-4 text-green-600">
                                <CheckCircle className="mx-auto mb-2" size={32} />
                                <p className="text-sm">Tous les produits en stock sont validés</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {stockItems.map(item => (
                                  <div 
                                    key={item.id} 
                                    className="p-3 rounded-lg border-2 bg-white border-green-200"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center">
                                        <h6 className="font-medium text-gray-800">{item.productName}</h6>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                                          {item.priority === 'high' ? 'Urgent' : 
                                           item.priority === 'medium' ? 'Moyen' : 'Faible'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Informations de stock par association */}
                                    {item.stockInfo && item.stockInfo.length > 0 && (
                                      <div className="mb-3 bg-green-100 border border-green-300 rounded p-2">
                                        <h6 className="text-xs font-medium text-green-800 mb-2">Disponibilité par association:</h6>
                                        <div className="space-y-1">
                                          {item.stockInfo.map((stock, index) => (
                                            <div key={index} className="flex items-center justify-between text-xs">
                                              <div className="flex items-center">
                                                <Building className="mr-1 text-green-600" size={10} />
                                                <span className="font-medium text-green-700">{stock.associationName}</span>
                                              </div>
                                              <div className="text-right">
                                                <div className="font-bold text-green-600">Stock: {stock.quantity}</div>
                                                <div className="text-green-500">{stock.location}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                      {/* Contrôles quantité */}
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={() => handleUpdateQuantity(request.id, item.id, item.quantity - 1)}
                                          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                                        >
                                          <Minus size={12} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                          onClick={() => handleUpdateQuantity(request.id, item.id, item.quantity + 1)}
                                          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                                        >
                                          <Plus size={12} />
                                        </button>
                                      </div>

                                      {/* Sélection association et validation */}
                                      <div className="flex items-center space-x-2">
                                        <select
                                          id={`association-${item.id}`}
                                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                                          defaultValue=""
                                        >
                                          <option value="">Choisir association</option>
                                          {item.stockInfo?.map(stock => (
                                            <option key={stock.associationId} value={stock.associationId}>
                                              {stock.associationName} ({stock.quantity} dispo)
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => {
                                            const select = document.getElementById(`association-${item.id}`) as HTMLSelectElement;
                                            if (select?.value) {
                                              handleValidateItem(request.id, item.id, select.value);
                                            }
                                          }}
                                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                        >
                                          Valider
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Produits non disponibles (demande anonyme) */}
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h5 className="font-semibold text-orange-800 mb-3 flex items-center">
                              <Globe className="mr-2" size={16} />
                              Produits non disponibles ({nonStockItems.length})
                            </h5>
                            
                            {nonStockItems.length === 0 ? (
                              <div className="text-center py-4 text-orange-600">
                                <CheckCircle className="mx-auto mb-2" size={32} />
                                <p className="text-sm">Tous les produits sont disponibles en stock</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {nonStockItems.map(item => (
                                  <div 
                                    key={item.id} 
                                    className="p-3 rounded-lg border-2 bg-white border-orange-200"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center">
                                        <h6 className="font-medium text-gray-800">{item.productName}</h6>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                                          {item.priority === 'high' ? 'Urgent' : 
                                           item.priority === 'medium' ? 'Moyen' : 'Faible'}
                                        </span>
                                      </div>
                                      
                                      <div className="text-xs text-red-600 font-medium">
                                        Stock: 0
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      {/* Contrôles quantité */}
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={() => handleUpdateQuantity(request.id, item.id, item.quantity - 1)}
                                          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                                        >
                                          <Minus size={12} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                          onClick={() => handleUpdateQuantity(request.id, item.id, item.quantity + 1)}
                                          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                                        >
                                          <Plus size={12} />
                                        </button>
                                      </div>

                                      {/* Bouton demande anonyme */}
                                      <button
                                        onClick={() => handleSendAnonymousRequest(request.id, item.id)}
                                        className="flex items-center px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
                                      >
                                        <Heart className="mr-1" size={12} />
                                        Demande anonyme
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                                  <p className="text-xs text-orange-700">
                                    <strong>Demande anonyme:</strong> Envoie une notification à tous les utilisateurs du profil ménage 
                                    pour demander ces produits via le système de dons solidaires.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* COLONNE DROITE - Produits validés avec bouton QR */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <CheckCircle className="mr-2" size={16} />
                            Produits validés ({validatedItems.length})
                          </h5>
                          
                          {validatedItems.length === 0 ? (
                            <div className="text-center py-8 text-blue-600">
                              <QrCode className="mx-auto mb-3" size={48} />
                              <p className="text-sm font-medium mb-2">Aucun produit validé</p>
                              <p className="text-xs">Validez des produits en stock pour générer un QR code</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {validatedItems.map(item => (
                                <div 
                                  key={item.id} 
                                  className="p-3 rounded-lg border-2 bg-blue-100 border-blue-300"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <h6 className="font-medium text-blue-800">{item.productName}</h6>
                                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                                        {item.priority === 'high' ? 'Urgent' : 
                                         item.priority === 'medium' ? 'Moyen' : 'Faible'}
                                      </span>
                                    </div>
                                    
                                    <div className="text-xs text-blue-600 font-medium">
                                      Qté: {item.quantity}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-blue-600 text-sm">
                                      <Building className="mr-1" size={12} />
                                      <span>{item.associationName}</span>
                                    </div>
                                    
                                    <button
                                      onClick={() => handleInvalidateItem(request.id, item.id)}
                                      className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Bouton de génération QR */}
                              <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
                                <div className="text-center mb-4">
                                  <h3 className="font-bold text-lg flex items-center justify-center">
                                    <QrCode className="mr-2" size={20} />
                                    Génération QR Code
                                  </h3>
                                  <p className="text-blue-100 text-sm">
                                    {validatedItems.length} article{validatedItems.length > 1 ? 's' : ''} validé{validatedItems.length > 1 ? 's' : ''} pour {request.beneficiaryName}
                                  </p>
                                </div>
                                
                                <button
                                  onClick={() => handleGenerateQRCode(request.id)}
                                  className="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center"
                                >
                                  <QrCode className="mr-2" size={20} />
                                  Générer QR Code (72h)
                                  <ArrowRight className="ml-2" size={16} />
                                </button>
                                
                                <div className="mt-3 text-xs text-blue-100 text-center">
                                  ⚡ Renvoi direct vers la pastille "QR Codes 72h"
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions globales */}
                      <div className="mt-6 pt-4 border-t border-gray-300 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {request.validatedAt && (
                            <span>Validée le {request.validatedAt.toLocaleDateString('fr-FR')} à {request.validatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                          {request.qrGeneratedAt && (
                            <span className="ml-4">QR généré le {request.qrGeneratedAt.toLocaleDateString('fr-FR')} à {request.qrGeneratedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de succès de génération QR */}
      {renderQRGenerationSuccessModal()}
    </div>
  );
};

export default RequestsManager;