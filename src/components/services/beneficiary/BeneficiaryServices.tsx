import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Clock, 
  QrCode, 
  Shield,
  FileText,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  Download,
  Eye,
  Send,
  Bell,
  Archive,
  Plus,
  Minus,
  X,
  Save,
  Edit3,
  Building,
  Globe,
  Lock,
  Key,
  Database,
  Trash2,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info,
  Zap,
  Target,
  TrendingUp,
  Gift,
  Users,
  Home,
  Baby,
  GraduationCap,
  Briefcase,
  DollarSign,
  CreditCard,
  Receipt,
  Smartphone,
  Wifi,
  Settings,
  HelpCircle,
  BookOpen,
  Video,
  Headphones,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';

interface BeneficiaryServicesProps {
  serviceId: string;
  onBack: () => void;
}

interface DonationRequest {
  id: string;
  items: Array<{
    id: string;
    productName: string;
    category: string;
    quantity: number;
    priority: 'low' | 'medium' | 'high';
    reason?: string;
  }>;
  status: 'draft' | 'submitted' | 'validated' | 'qr_generated' | 'ready_for_pickup' | 'collected' | 'expired';
  createdAt: Date;
  submittedAt?: Date;
  validatedAt?: Date;
  qrGeneratedAt?: Date;
  collectedAt?: Date;
  socialWorkerName?: string;
  associationName?: string;
  notes?: string;
  urgency: 'low' | 'medium' | 'high';
  anonymousRequest: boolean;
}

interface QRCodeData {
  id: string;
  code: string;
  requestId: string;
  items: Array<{
    productName: string;
    quantity: number;
    associationName: string;
    location: string;
  }>;
  generatedAt: Date;
  validUntil: Date;
  status: 'active' | 'expired' | 'used';
  associationAddress: string;
  associationPhone: string;
  pickupInstructions: string;
  specialNotes?: string;
}

interface BeneficiaryProfile {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  familySize: number;
  address: string;
  phone: string;
  email: string;
  registrationDate: Date;
  lastActivity: Date;
  socialWorkerName: string;
  socialWorkerPhone: string;
  verified: boolean;
  documentsStatus: {
    identityCard: 'valid' | 'expired' | 'missing';
    proofOfAddress: 'valid' | 'expired' | 'missing';
    incomeProof: 'valid' | 'expired' | 'missing';
    familyComposition: 'valid' | 'expired' | 'missing';
  };
  preferences: {
    notifications: boolean;
    smsAlerts: boolean;
    emailUpdates: boolean;
    language: 'fr' | 'en' | 'ar' | 'es';
  };
  statistics: {
    totalRequests: number;
    successfulPickups: number;
    averageResponseTime: number; // en heures
    satisfactionScore: number; // sur 5
  };
}

interface CommunicationMessage {
  id: string;
  from: 'beneficiary' | 'social_worker' | 'association' | 'system';
  fromName: string;
  to: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'message' | 'notification' | 'alert' | 'reminder';
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
  }>;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
}

const BeneficiaryServices: React.FC<BeneficiaryServicesProps> = ({ serviceId, onBack }) => {
  // États pour les données simulées
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [profile, setProfile] = useState<BeneficiaryProfile | null>(null);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  // États pour les interfaces
  const [newRequestItems, setNewRequestItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [requestUrgency, setRequestUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showNewRequestForm, setShowNewRequestForm] = useState<boolean>(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Initialisation des données simulées
  useEffect(() => {
    initializeSimulatedData();
  }, []);

  const initializeSimulatedData = () => {
    // Profil bénéficiaire simulé
    const simulatedProfile: BeneficiaryProfile = {
      id: 'ben_001',
      code: 'PDS-2024-156',
      firstName: 'Marie',
      lastName: 'Dubois',
      familySize: 3,
      address: '123 Rue de la Solidarité, 13001 Marseille',
      phone: '06 12 34 56 78',
      email: 'marie.dubois@email.com',
      registrationDate: new Date('2024-01-10'),
      lastActivity: new Date(),
      socialWorkerName: 'Sophie Laurent',
      socialWorkerPhone: '04 91 XX XX XX',
      verified: true,
      documentsStatus: {
        identityCard: 'valid',
        proofOfAddress: 'valid',
        incomeProof: 'expired',
        familyComposition: 'valid'
      },
      preferences: {
        notifications: true,
        smsAlerts: true,
        emailUpdates: false,
        language: 'fr'
      },
      statistics: {
        totalRequests: 12,
        successfulPickups: 10,
        averageResponseTime: 18,
        satisfactionScore: 4.2
      }
    };

    // Demandes simulées
    const simulatedRequests: DonationRequest[] = [
      {
        id: 'req_001',
        items: [
          {
            id: 'item_001',
            productName: 'Lait demi-écrémé 1L',
            category: 'produits-laitiers',
            quantity: 4,
            priority: 'high',
            reason: 'Enfants en bas âge'
          },
          {
            id: 'item_002',
            productName: 'Riz basmati 1kg',
            category: 'feculents',
            quantity: 2,
            priority: 'medium'
          },
          {
            id: 'item_003',
            productName: 'Yaourts nature x8',
            category: 'produits-laitiers',
            quantity: 1,
            priority: 'low'
          }
        ],
        status: 'ready_for_pickup',
        createdAt: new Date('2024-01-15T10:30:00'),
        submittedAt: new Date('2024-01-15T10:35:00'),
        validatedAt: new Date('2024-01-15T14:20:00'),
        qrGeneratedAt: new Date('2024-01-16T09:15:00'),
        socialWorkerName: 'Sophie Laurent',
        associationName: 'Restos du Cœur Marseille',
        urgency: 'high',
        anonymousRequest: false,
        notes: 'Demande validée rapidement en raison de la situation familiale'
      },
      {
        id: 'req_002',
        items: [
          {
            id: 'item_004',
            productName: 'Pâtes spaghetti',
            category: 'feculents',
            quantity: 3,
            priority: 'medium'
          },
          {
            id: 'item_005',
            productName: 'Conserve tomates',
            category: 'epicerie',
            quantity: 2,
            priority: 'low'
          }
        ],
        status: 'validated',
        createdAt: new Date('2024-01-16T16:45:00'),
        submittedAt: new Date('2024-01-16T16:50:00'),
        validatedAt: new Date('2024-01-17T08:30:00'),
        socialWorkerName: 'Sophie Laurent',
        urgency: 'medium',
        anonymousRequest: true,
        notes: 'En attente de génération du QR code'
      },
      {
        id: 'req_003',
        items: [
          {
            id: 'item_006',
            productName: 'Pain de mie complet',
            category: 'feculents',
            quantity: 2,
            priority: 'high'
          }
        ],
        status: 'submitted',
        createdAt: new Date('2024-01-17T14:20:00'),
        submittedAt: new Date('2024-01-17T14:25:00'),
        urgency: 'low',
        anonymousRequest: false,
        notes: 'En cours de validation par le travailleur social'
      },
      {
        id: 'req_004',
        items: [
          {
            id: 'item_007',
            productName: 'Huile d\'olive',
            category: 'epicerie',
            quantity: 1,
            priority: 'medium'
          },
          {
            id: 'item_008',
            productName: 'Pommes Golden',
            category: 'fruits-legumes',
            quantity: 2,
            priority: 'low'
          }
        ],
        status: 'collected',
        createdAt: new Date('2024-01-12T09:15:00'),
        submittedAt: new Date('2024-01-12T09:20:00'),
        validatedAt: new Date('2024-01-12T15:45:00'),
        qrGeneratedAt: new Date('2024-01-13T10:00:00'),
        collectedAt: new Date('2024-01-14T11:30:00'),
        socialWorkerName: 'Sophie Laurent',
        associationName: 'Secours Populaire Marseille',
        urgency: 'medium',
        anonymousRequest: false
      }
    ];

    // QR Codes simulés
    const simulatedQRCodes: QRCodeData[] = [
      {
        id: 'qr_001',
        code: 'QR-2024-156-001',
        requestId: 'req_001',
        items: [
          {
            productName: 'Lait demi-écrémé 1L',
            quantity: 4,
            associationName: 'Restos du Cœur Marseille',
            location: 'Entrepôt A - Réfrigérateur 2'
          },
          {
            productName: 'Riz basmati 1kg',
            quantity: 2,
            associationName: 'Restos du Cœur Marseille',
            location: 'Entrepôt A - Étagère 3'
          },
          {
            productName: 'Yaourts nature x8',
            quantity: 1,
            associationName: 'Restos du Cœur Marseille',
            location: 'Entrepôt A - Réfrigérateur 1'
          }
        ],
        generatedAt: new Date('2024-01-16T09:15:00'),
        validUntil: new Date('2024-01-19T09:15:00'),
        status: 'active',
        associationAddress: '123 Avenue de la Solidarité, 13001 Marseille',
        associationPhone: '04 91 XX XX XX',
        pickupInstructions: 'Présentez-vous à l\'accueil avec ce QR code et une pièce d\'identité. Horaires: Mar-Jeu 14h-17h, Sam 9h-12h.',
        specialNotes: 'Produits frais à récupérer en priorité'
      },
      {
        id: 'qr_002',
        code: 'QR-2024-156-002',
        requestId: 'req_004',
        items: [
          {
            productName: 'Huile d\'olive',
            quantity: 1,
            associationName: 'Secours Populaire Marseille',
            location: 'Local B - Étagère 5'
          },
          {
            productName: 'Pommes Golden',
            quantity: 2,
            associationName: 'Secours Populaire Marseille',
            location: 'Local B - Bac fruits'
          }
        ],
        generatedAt: new Date('2024-01-13T10:00:00'),
        validUntil: new Date('2024-01-16T10:00:00'),
        status: 'used',
        associationAddress: '456 Rue de l\'Entraide, 13003 Marseille',
        associationPhone: '04 91 YY YY YY',
        pickupInstructions: 'Retrait effectué le 14/01/2024 à 11h30'
      }
    ];

    // Messages simulés
    const simulatedMessages: CommunicationMessage[] = [
      {
        id: 'msg_001',
        from: 'social_worker',
        fromName: 'Sophie Laurent',
        to: 'Marie Dubois',
        subject: 'Validation de votre demande',
        content: 'Bonjour Marie, votre demande du 15/01 a été validée. Le QR code sera généré sous 24h. N\'hésitez pas si vous avez des questions.',
        timestamp: new Date('2024-01-15T14:25:00'),
        read: true,
        priority: 'medium',
        type: 'message'
      },
      {
        id: 'msg_002',
        from: 'association',
        fromName: 'Restos du Cœur Marseille',
        to: 'Marie Dubois',
        subject: 'Votre colis est prêt',
        content: 'Votre colis est préparé et vous attend. Vous pouvez venir le récupérer avec votre QR code aux horaires d\'ouverture.',
        timestamp: new Date('2024-01-16T09:30:00'),
        read: false,
        priority: 'high',
        type: 'notification'
      },
      {
        id: 'msg_003',
        from: 'system',
        fromName: 'Système Peuple Solidaire',
        to: 'Marie Dubois',
        subject: 'Rappel: QR code expire bientôt',
        content: 'Votre QR code QR-2024-156-001 expire dans 24h. Pensez à récupérer votre colis avant expiration.',
        timestamp: new Date('2024-01-18T09:15:00'),
        read: false,
        priority: 'high',
        type: 'reminder'
      }
    ];

    // Alertes simulées
    const simulatedAlerts: Alert[] = [
      {
        id: 'alert_001',
        type: 'warning',
        title: 'Document expiré',
        message: 'Votre justificatif de revenus a expiré. Veuillez le renouveler pour continuer à bénéficier du service.',
        timestamp: new Date('2024-01-16T08:00:00'),
        read: false,
        actionRequired: true,
        actionText: 'Mettre à jour',
        actionUrl: '/documents'
      },
      {
        id: 'alert_002',
        type: 'success',
        title: 'Profil vérifié',
        message: 'Votre profil a été vérifié avec succès. Vous pouvez maintenant faire des demandes.',
        timestamp: new Date('2024-01-10T15:30:00'),
        read: true,
        actionRequired: false
      },
      {
        id: 'alert_003',
        type: 'info',
        title: 'Nouvelle fonctionnalité',
        message: 'Vous pouvez maintenant suivre vos demandes en temps réel et recevoir des notifications.',
        timestamp: new Date('2024-01-14T12:00:00'),
        read: true,
        actionRequired: false
      }
    ];

    setProfile(simulatedProfile);
    setRequests(simulatedRequests);
    setQRCodes(simulatedQRCodes);
    setMessages(simulatedMessages);
    setAlerts(simulatedAlerts);
  };

  const categories = [
    { id: 'fruits-legumes', name: 'Fruits et Légumes', icon: '🥕' },
    { id: 'produits-laitiers', name: 'Produits laitiers', icon: '🥛' },
    { id: 'feculents', name: 'Féculents', icon: '🍞' },
    { id: 'viandes-poissons', name: 'Viandes et Poissons', icon: '🍗' },
    { id: 'epicerie', name: 'Épicerie', icon: '🥫' }
  ];

  const availableProducts = [
    { id: 'prod_001', name: 'Lait demi-écrémé 1L', category: 'produits-laitiers' },
    { id: 'prod_002', name: 'Yaourts nature x8', category: 'produits-laitiers' },
    { id: 'prod_003', name: 'Fromage râpé', category: 'produits-laitiers' },
    { id: 'prod_004', name: 'Riz basmati 1kg', category: 'feculents' },
    { id: 'prod_005', name: 'Pâtes spaghetti', category: 'feculents' },
    { id: 'prod_006', name: 'Pain de mie complet', category: 'feculents' },
    { id: 'prod_007', name: 'Pommes Golden', category: 'fruits-legumes' },
    { id: 'prod_008', name: 'Bananes', category: 'fruits-legumes' },
    { id: 'prod_009', name: 'Carottes', category: 'fruits-legumes' },
    { id: 'prod_010', name: 'Escalopes de poulet', category: 'viandes-poissons' },
    { id: 'prod_011', name: 'Saumon fumé', category: 'viandes-poissons' },
    { id: 'prod_012', name: 'Huile d\'olive', category: 'epicerie' },
    { id: 'prod_013', name: 'Conserve tomates', category: 'epicerie' },
    { id: 'prod_014', name: 'Céréales', category: 'epicerie' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'validated': return 'bg-green-100 text-green-800 border-green-300';
      case 'qr_generated': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ready_for_pickup': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'collected': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'submitted': return 'Envoyée';
      case 'validated': return 'Validée';
      case 'qr_generated': return 'QR généré';
      case 'ready_for_pickup': return 'Prêt à récupérer';
      case 'collected': return 'Récupéré';
      case 'expired': return 'Expiré';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 size={14} />;
      case 'submitted': return <Send size={14} />;
      case 'validated': return <CheckCircle size={14} />;
      case 'qr_generated': return <QrCode size={14} />;
      case 'ready_for_pickup': return <Package size={14} />;
      case 'collected': return <Archive size={14} />;
      case 'expired': return <AlertTriangle size={14} />;
      default: return <Clock size={14} />;
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

  const addProductToRequest = (product: any) => {
    const existingItem = newRequestItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setNewRequestItems(newRequestItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity: 1,
        priority: 'medium' as const,
        reason: ''
      };
      setNewRequestItems([...newRequestItems, newItem]);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setNewRequestItems(newRequestItems.filter(item => item.id !== itemId));
      return;
    }
    
    setNewRequestItems(newRequestItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity }
        : item
    ));
  };

  const updateItemPriority = (itemId: string, priority: 'low' | 'medium' | 'high') => {
    setNewRequestItems(newRequestItems.map(item => 
      item.id === itemId 
        ? { ...item, priority }
        : item
    ));
  };

  const submitNewRequest = () => {
    if (newRequestItems.length === 0) {
      alert('Veuillez ajouter au moins un article à votre demande');
      return;
    }

    const newRequest: DonationRequest = {
      id: `req_${Date.now()}`,
      items: newRequestItems,
      status: 'submitted',
      createdAt: new Date(),
      submittedAt: new Date(),
      urgency: requestUrgency,
      anonymousRequest: isAnonymous,
      notes: 'Nouvelle demande en cours de traitement'
    };

    setRequests([newRequest, ...requests]);
    setNewRequestItems([]);
    setShowNewRequestForm(false);
    setRequestUrgency('medium');
    setIsAnonymous(false);

    // Simuler une notification de confirmation
    alert('Votre demande a été envoyée avec succès ! Vous recevrez une notification dès qu\'elle sera validée.');
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = selectedCategory === 'all' 
    ? availableProducts 
    : availableProducts.filter(p => p.category === selectedCategory);

  const renderNewRequest = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="mr-3 fill-current" size={28} />
            <div>
              <h1 className="text-xl font-bold">Nouvelle Demande d'Aide</h1>
              <p className="text-orange-100 text-sm">Demande anonyme et sécurisée</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewRequestForm(!showNewRequestForm)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showNewRequestForm 
                ? 'bg-white/20 text-white' 
                : 'bg-white text-orange-600 hover:bg-orange-50'
            }`}
          >
            {showNewRequestForm ? 'Masquer le formulaire' : 'Nouvelle demande'}
          </button>
        </div>
      </div>

      {/* Formulaire de nouvelle demande */}
      {showNewRequestForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-6">Créer une nouvelle demande</h3>
          
          {/* Configuration de la demande */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'urgence
              </label>
              <select
                value={requestUrgency}
                onChange={(e) => setRequestUrgency(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="low">Faible - Pas urgent</option>
                <option value="medium">Moyen - Dans la semaine</option>
                <option value="high">Élevé - Urgent</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2 text-orange-600"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Demande anonyme (votre identité ne sera pas transmise aux ménages)
              </label>
            </div>
          </div>

          {/* Sélection des produits */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Catalogue produits */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Sélectionner des articles</h4>
              
              {/* Filtres par catégorie */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    Tous
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des produits */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addProductToRequest(product)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{product.name}</span>
                      <Plus className="text-orange-600" size={16} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Articles sélectionnés */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Articles demandés ({newRequestItems.length})</h4>
              
              {newRequestItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">Aucun article sélectionné</p>
                  <p className="text-gray-500 text-sm">Choisissez des produits dans la liste</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {newRequestItems.map(item => (
                    <div key={item.id} className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-orange-800">{item.productName}</span>
                        <button
                          onClick={() => setNewRequestItems(newRequestItems.filter(i => i.id !== item.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Quantité */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-orange-300 rounded-full text-orange-600 hover:bg-orange-100"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-bold text-orange-800">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-orange-300 rounded-full text-orange-600 hover:bg-orange-100"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Priorité */}
                        <select
                          value={item.priority}
                          onChange={(e) => updateItemPriority(item.id, e.target.value as any)}
                          className="px-2 py-1 border border-orange-300 rounded text-xs bg-white"
                        >
                          <option value="low">Faible</option>
                          <option value="medium">Moyen</option>
                          <option value="high">Urgent</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton de soumission */}
              {newRequestItems.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={submitNewRequest}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Send className="mr-2" size={20} />
                    Envoyer la demande
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informations importantes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <Info className="mr-2" size={20} />
          Comment ça marche ?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="font-bold">1</span>
            </div>
            <h4 className="font-medium text-blue-800 mb-2">Créez votre demande</h4>
            <p className="text-sm text-blue-700">Sélectionnez les articles dont vous avez besoin et indiquez le niveau d'urgence</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="font-bold">2</span>
            </div>
            <h4 className="font-medium text-blue-800 mb-2">Validation rapide</h4>
            <p className="text-sm text-blue-700">Votre travailleur social valide votre demande sous 48h maximum</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="font-bold">3</span>
            </div>
            <h4 className="font-medium text-blue-800 mb-2">Récupération</h4>
            <p className="text-sm text-blue-700">Recevez votre QR code et récupérez vos articles dans l'association</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Historique de mes Demandes</h1>
              <p className="text-blue-100 text-sm">Suivi transparent et complet</p>
            </div>
          </div>
        </div>

        {profile && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{profile.statistics.totalRequests}</div>
              <div className="text-blue-100 text-sm">Demandes totales</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{profile.statistics.successfulPickups}</div>
              <div className="text-blue-100 text-sm">Colis récupérés</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{profile.statistics.averageResponseTime}h</div>
              <div className="text-blue-100 text-sm">Temps de réponse moyen</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{profile.statistics.satisfactionScore}/5</div>
              <div className="text-blue-100 text-sm">Satisfaction</div>
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="submitted">Envoyées</option>
              <option value="validated">Validées</option>
              <option value="qr_generated">QR générés</option>
              <option value="ready_for_pickup">Prêts</option>
              <option value="collected">Récupérés</option>
              <option value="expired">Expirés</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Clock className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Aucune demande trouvée</p>
            <p className="text-gray-500 text-sm">Modifiez vos filtres ou créez une nouvelle demande</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div 
              key={request.id} 
              className={`bg-white rounded-lg shadow-md border-l-4 ${getUrgencyColor(request.urgency)} overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                      <Package className="mr-2 text-blue-600" size={20} />
                      Demande #{request.id.split('_')[1]}
                      {request.anonymousRequest && (
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                          Anonyme
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Créée le {request.createdAt.toLocaleDateString('fr-FR')} à {request.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {request.socialWorkerName && (
                      <p className="text-sm text-gray-600">
                        Traitée par: {request.socialWorkerName}
                      </p>
                    )}
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm border flex items-center ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1">{getStatusText(request.status)}</span>
                  </span>
                </div>

                {/* Articles de la demande */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Articles demandés ({request.items.length})</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {request.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded p-2">
                        <div>
                          <span className="font-medium text-gray-800 text-sm">{item.productName}</span>
                          {item.reason && (
                            <div className="text-xs text-gray-600 italic">{item.reason}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-700">x{item.quantity}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority === 'high' ? 'Urgent' : 
                             item.priority === 'medium' ? 'Moyen' : 'Faible'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline de la demande */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-2 text-sm">Suivi de la demande</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="mr-2" size={12} />
                      <span>Créée le {request.createdAt.toLocaleDateString('fr-FR')}</span>
                    </div>
                    {request.submittedAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2" size={12} />
                        <span>Envoyée le {request.submittedAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {request.validatedAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2" size={12} />
                        <span>Validée le {request.validatedAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {request.qrGeneratedAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2" size={12} />
                        <span>QR généré le {request.qrGeneratedAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {request.collectedAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2" size={12} />
                        <span>Récupéré le {request.collectedAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {request.notes && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> {request.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderQRCodes = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <QrCode className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Mes QR Codes Sécurisés</h1>
              <p className="text-green-100 text-sm">Retrait sécurisé avec géolocalisation</p>
            </div>
          </div>
          
          <div className="text-right text-sm">
            <div className="font-medium">{qrCodes.length} QR codes</div>
            <div className="text-green-200">
              {qrCodes.filter(qr => qr.status === 'active').length} actifs
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes actifs */}
      <div className="space-y-4">
        {qrCodes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <QrCode className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Aucun QR code disponible</p>
            <p className="text-gray-500 text-sm">Vos QR codes apparaîtront ici après validation de vos demandes</p>
          </div>
        ) : (
          qrCodes.map(qr => (
            <div key={qr.id} className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-green-100 border-2 border-green-300 rounded-xl flex items-center justify-center mr-4">
                      <QrCode size={32} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-800">{qr.code}</h3>
                      <p className="text-green-600 text-sm">
                        {qr.status === 'active' ? 'Valide pour retrait' : 
                         qr.status === 'used' ? 'Utilisé' : 'Expiré'}
                      </p>
                      <p className="text-gray-600 text-xs">
                        Généré le {qr.generatedAt.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm border ${
                      qr.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                      qr.status === 'used' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {qr.status === 'active' ? 'Actif' :
                       qr.status === 'used' ? 'Utilisé' : 'Expiré'}
                    </span>
                    
                    {qr.status === 'active' && (
                      <div className="mt-2 text-sm">
                        <div className="text-gray-600">Expire le:</div>
                        <div className="font-bold text-red-600">
                          {qr.validUntil.toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-red-500">
                          {Math.ceil((qr.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60))}h restantes
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Articles du QR code */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-3">Articles à récupérer ({qr.items.length})</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {qr.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                        <div>
                          <div className="font-medium text-green-800 text-sm">{item.productName}</div>
                          <div className="text-xs text-green-600">{item.location}</div>
                        </div>
                        <span className="text-sm font-bold text-green-600">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations de retrait */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-blue-800 mb-3 flex items-center">
                    <Building className="mr-2" size={16} />
                    Lieu de retrait
                  </h5>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-start">
                      <MapPin className="mr-2 mt-0.5" size={14} />
                      <span>{qr.associationAddress}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2" size={14} />
                      <span>{qr.associationPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                    <Info className="mr-2" size={16} />
                    Instructions de retrait
                  </h5>
                  <p className="text-sm text-yellow-700 mb-2">{qr.pickupInstructions}</p>
                  
                  {qr.specialNotes && (
                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>Note spéciale:</strong> {qr.specialNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {qr.status === 'active' && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedQR(qr)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Eye className="mr-2" size={16} />
                      Voir en grand
                    </button>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <AlertTriangle className="mr-1 text-orange-500" size={14} />
                        <span>Pensez à apporter une pièce d'identité</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal QR Code agrandi */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">QR Code de retrait</h3>
                <button
                  onClick={() => setSelectedQR(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="w-48 h-48 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode size={120} className="text-gray-600" />
              </div>
              
              <div className="text-center mb-4">
                <div className="font-bold text-lg text-gray-900">{selectedQR.code}</div>
                <div className="text-sm text-gray-600">
                  Valide jusqu'au {selectedQR.validUntil.toLocaleDateString('fr-FR')}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium mb-1">Instructions:</p>
                <p>Présentez ce QR code à l'accueil de l'association avec votre pièce d'identité.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* En-tête profil */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Mon Profil Validé</h1>
              <p className="text-purple-100 text-sm">Code unique: {profile?.code}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-green-300">
              <CheckCircle className="mr-1" size={16} />
              <span className="text-sm">Profil vérifié</span>
            </div>
          </div>
        </div>
      </div>

      {profile && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Informations personnelles
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nom complet:</span>
                <span className="font-medium">{profile.firstName} {profile.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Taille du foyer:</span>
                <span className="font-medium">{profile.familySize} personne{profile.familySize > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600">Adresse:</span>
                <span className="font-medium text-right max-w-xs">{profile.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Téléphone:</span>
                <span className="font-medium">{profile.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Inscrit le:</span>
                <span className="font-medium">{profile.registrationDate.toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Accompagnement social */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <Users className="mr-2" size={20} />
              Accompagnement social
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <MessageCircle className="text-blue-500 mr-2" size={16} />
                <span className="font-medium text-blue-800">{profile.socialWorkerName}</span>
              </div>
              <p className="text-sm text-blue-700">Travailleur social référent</p>
              <div className="flex items-center mt-2">
                <Phone className="text-blue-500 mr-2" size={14} />
                <span className="text-sm text-blue-600">{profile.socialWorkerPhone}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Demandes totales:</span>
                <span className="font-bold text-purple-600">{profile.statistics.totalRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Colis récupérés:</span>
                <span className="font-bold text-green-600">{profile.statistics.successfulPickups}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Temps de réponse moyen:</span>
                <span className="font-bold text-blue-600">{profile.statistics.averageResponseTime}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Satisfaction:</span>
                <div className="flex items-center">
                  <span className="font-bold text-yellow-600 mr-1">{profile.statistics.satisfactionScore}/5</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={star <= profile.statistics.satisfactionScore ? 'text-yellow-500 fill-current' : 'text-gray-300'} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statut des documents */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Mes documents
            </h3>
            
            <div className="space-y-3">
              {Object.entries(profile.documentsStatus).map(([docType, status]) => {
                const docNames = {
                  identityCard: 'Pièce d\'identité',
                  proofOfAddress: 'Justificatif de domicile',
                  incomeProof: 'Justificatif de revenus',
                  familyComposition: 'Composition familiale'
                };
                
                return (
                  <div key={docType} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-gray-700">{docNames[docType as keyof typeof docNames]}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      status === 'valid' ? 'bg-green-100 text-green-800' :
                      status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status === 'valid' ? 'Valide' :
                       status === 'expired' ? 'Expiré' : 'Manquant'}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Mettre à jour mes documents
            </button>
          </div>

          {/* Préférences */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <Settings className="mr-2" size={20} />
              Préférences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Notifications push</span>
                <input 
                  type="checkbox" 
                  checked={profile.preferences.notifications}
                  className="text-purple-600"
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Alertes SMS</span>
                <input 
                  type="checkbox" 
                  checked={profile.preferences.smsAlerts}
                  className="text-purple-600"
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Emails</span>
                <input 
                  type="checkbox" 
                  checked={profile.preferences.emailUpdates}
                  className="text-purple-600"
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Langue</span>
                <select 
                  value={profile.preferences.language}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  disabled
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Mes Documents</h1>
              <p className="text-indigo-100 text-sm">Gestion sécurisée et confidentielle</p>
            </div>
          </div>
          
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
            <Plus className="mr-2" size={16} />
            Ajouter un document
          </button>
        </div>
      </div>

      {/* Statut des documents requis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4">Documents requis</h3>
        
        {profile && (
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(profile.documentsStatus).map(([docType, status]) => {
              const docInfo = {
                identityCard: {
                  name: 'Pièce d\'identité',
                  description: 'Carte d\'identité ou passeport en cours de validité',
                  icon: <User size={20} />
                },
                proofOfAddress: {
                  name: 'Justificatif de domicile',
                  description: 'Facture récente (électricité, gaz, téléphone) de moins de 3 mois',
                  icon: <Home size={20} />
                },
                incomeProof: {
                  name: 'Justificatif de revenus',
                  description: 'Avis d\'imposition, bulletins de salaire ou attestation CAF',
                  icon: <DollarSign size={20} />
                },
                familyComposition: {
                  name: 'Composition familiale',
                  description: 'Livret de famille ou attestation CAF',
                  icon: <Users size={20} />
                }
              };
              
              const info = docInfo[docType as keyof typeof docInfo];
              
              return (
                <div key={docType} className={`p-4 border-2 rounded-lg ${
                  status === 'valid' ? 'border-green-200 bg-green-50' :
                  status === 'expired' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        status === 'valid' ? 'bg-green-100 text-green-600' :
                        status === 'expired' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{info.name}</h4>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'valid' ? 'bg-green-100 text-green-800' :
                      status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status === 'valid' ? 'Valide' :
                       status === 'expired' ? 'Expiré' : 'Manquant'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {status === 'valid' && 'Document vérifié et validé'}
                      {status === 'expired' && 'Document expiré - Renouvellement requis'}
                      {status === 'missing' && 'Document non fourni'}
                    </div>
                    
                    <button className={`px-3 py-1 rounded text-xs font-medium ${
                      status === 'valid' ? 'bg-green-600 text-white hover:bg-green-700' :
                      'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}>
                      {status === 'valid' ? 'Voir' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historique des documents */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4">Historique des documents</h3>
        
        <div className="space-y-3">
          {[
            {
              name: 'Justificatif de revenus - Avis d\'imposition 2023',
              uploadedAt: new Date('2024-01-10T14:30:00'),
              status: 'expired',
              size: '2.3 MB'
            },
            {
              name: 'Pièce d\'identité - Carte nationale',
              uploadedAt: new Date('2024-01-10T14:25:00'),
              status: 'valid',
              size: '1.8 MB'
            },
            {
              name: 'Justificatif de domicile - Facture EDF',
              uploadedAt: new Date('2024-01-10T14:20:00'),
              status: 'valid',
              size: '1.2 MB'
            }
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <FileText className="mr-3 text-gray-400" size={20} />
                <div>
                  <h4 className="font-medium text-gray-800">{doc.name}</h4>
                  <p className="text-sm text-gray-600">
                    Ajouté le {doc.uploadedAt.toLocaleDateString('fr-FR')} • {doc.size}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  doc.status === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {doc.status === 'valid' ? 'Valide' : 'Expiré'}
                </span>
                
                <button className="text-indigo-600 hover:text-indigo-800">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations de sécurité */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <Lock className="mr-2" size={20} />
          Sécurité et confidentialité
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Protection des données</h4>
            <ul className="space-y-1">
              <li>• Chiffrement AES-256 de tous vos documents</li>
              <li>• Accès restreint aux personnes autorisées</li>
              <li>• Conformité RGPD complète</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Vos droits</h4>
            <ul className="space-y-1">
              <li>• Droit d'accès à vos données</li>
              <li>• Droit de rectification</li>
              <li>• Droit à l'effacement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunication = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Communication</h1>
              <p className="text-blue-100 text-sm">Accompagnement et support</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="font-medium">{messages.filter(m => !m.read).length} non lus</div>
              <div className="text-blue-200">{messages.length} messages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages récents */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <Mail className="mr-2" size={20} />
          Messages récents
        </h3>
        
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <MessageCircle className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">Aucun message</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id} 
                className={`p-4 border rounded-lg transition-colors ${
                  message.read 
                    ? 'border-gray-200 bg-white' 
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      message.from === 'social_worker' ? 'bg-blue-100 text-blue-600' :
                      message.from === 'association' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {message.from === 'social_worker' ? <User size={16} /> :
                       message.from === 'association' ? <Building size={16} /> :
                       <Bell size={16} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{message.subject}</h4>
                      <p className="text-sm text-gray-600">De: {message.fromName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {message.timestamp.toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {!message.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    message.priority === 'high' ? 'bg-red-100 text-red-800' :
                    message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {message.type === 'notification' ? 'Notification' :
                     message.type === 'reminder' ? 'Rappel' :
                     message.type === 'alert' ? 'Alerte' : 'Message'}
                  </span>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Répondre
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contacts utiles */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <Users className="mr-2" size={20} />
            Contacts utiles
          </h3>
          
          <div className="space-y-4">
            {profile && (
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center mb-2">
                  <User className="mr-2 text-blue-600" size={16} />
                  <span className="font-medium text-blue-800">{profile.socialWorkerName}</span>
                </div>
                <p className="text-sm text-blue-700 mb-2">Travailleur social référent</p>
                <div className="flex items-center text-sm text-blue-600">
                  <Phone className="mr-1" size={12} />
                  <span>{profile.socialWorkerPhone}</span>
                </div>
              </div>
            )}
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Headphones className="mr-2 text-gray-600" size={16} />
                <span className="font-medium text-gray-800">Support technique</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Aide pour l'utilisation de l'application</p>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="mr-1" size={12} />
                <span>04 91 XX XX XX</span>
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="mr-2 text-orange-600" size={16} />
                <span className="font-medium text-gray-800">Urgence sociale</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Numéro d'urgence 24h/24</p>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="mr-1" size={12} />
                <span>115 (gratuit)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <HelpCircle className="mr-2" size={20} />
            Aide et ressources
          </h3>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <BookOpen className="mr-3 text-blue-600" size={16} />
                <div>
                  <h4 className="font-medium text-gray-800">Guide d'utilisation</h4>
                  <p className="text-sm text-gray-600">Comment utiliser l'application</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Video className="mr-3 text-green-600" size={16} />
                <div>
                  <h4 className="font-medium text-gray-800">Tutoriels vidéo</h4>
                  <p className="text-sm text-gray-600">Vidéos explicatives</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <MessageSquare className="mr-3 text-purple-600" size={16} />
                <div>
                  <h4 className="font-medium text-gray-800">FAQ</h4>
                  <p className="text-sm text-gray-600">Questions fréquentes</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRights = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center">
          <CheckCircle className="mr-3" size={28} />
          <div>
            <h1 className="text-xl font-bold">Mes Droits</h1>
            <p className="text-green-100 text-sm">Protection RGPD et droits fondamentaux</p>
          </div>
        </div>
      </div>

      {/* Droits RGPD */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-6 flex items-center">
          <Shield className="mr-2" size={20} />
          Vos droits selon le RGPD
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: 'Droit d\'accès',
              description: 'Vous pouvez demander l\'accès à toutes vos données personnelles que nous détenons.',
              icon: <Eye size={20} />,
              action: 'Demander l\'accès'
            },
            {
              title: 'Droit de rectification',
              description: 'Vous pouvez demander la correction de vos données personnelles inexactes.',
              icon: <Edit3 size={20} />,
              action: 'Corriger mes données'
            },
            {
              title: 'Droit à l\'effacement',
              description: 'Vous pouvez demander la suppression de vos données personnelles.',
              icon: <Trash2 size={20} />,
              action: 'Supprimer mes données'
            },
            {
              title: 'Droit à la portabilité',
              description: 'Vous pouvez récupérer vos données dans un format structuré.',
              icon: <Download size={20} />,
              action: 'Exporter mes données'
            },
            {
              title: 'Droit d\'opposition',
              description: 'Vous pouvez vous opposer au traitement de vos données personnelles.',
              icon: <X size={20} />,
              action: 'M\'opposer au traitement'
            },
            {
              title: 'Droit à la limitation',
              description: 'Vous pouvez demander la limitation du traitement de vos données.',
              icon: <Lock size={20} />,
              action: 'Limiter le traitement'
            }
          ].map((right, index) => (
            <div key={index} className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3">
                  {right.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 mb-1">{right.title}</h4>
                  <p className="text-sm text-green-700">{right.description}</p>
                </div>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                {right.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Consentements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          Gestion des consentements
        </h3>
        
        <div className="space-y-4">
          {[
            {
              title: 'Traitement des données personnelles',
              description: 'Consentement pour le traitement de vos données dans le cadre du service',
              granted: true,
              required: true,
              date: new Date('2024-01-10T14:30:00')
            },
            {
              title: 'Communications marketing',
              description: 'Recevoir des informations sur nos services et partenaires',
              granted: false,
              required: false,
              date: null
            },
            {
              title: 'Partage avec les partenaires',
              description: 'Partage anonymisé de données statistiques avec nos partenaires',
              granted: true,
              required: false,
              date: new Date('2024-01-10T14:35:00')
            },
            {
              title: 'Géolocalisation',
              description: 'Utilisation de votre position pour optimiser les services',
              granted: true,
              required: false,
              date: new Date('2024-01-10T14:40:00')
            }
          ].map((consent, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h4 className="font-medium text-gray-800">{consent.title}</h4>
                  {consent.required && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                      Obligatoire
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{consent.description}</p>
                {consent.date && (
                  <p className="text-xs text-gray-500">
                    Accordé le {consent.date.toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  consent.granted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {consent.granted ? 'Accordé' : 'Refusé'}
                </span>
                
                {!consent.required && (
                  <button className={`px-3 py-1 rounded text-xs font-medium ${
                    consent.granted 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}>
                    {consent.granted ? 'Révoquer' : 'Accorder'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact DPO */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <Mail className="mr-2" size={20} />
          Contact Délégué à la Protection des Données (DPO)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-blue-700 mb-4">
              Pour toute question concernant vos droits ou le traitement de vos données personnelles, 
              vous pouvez contacter notre Délégué à la Protection des Données.
            </p>
            
            <div className="space-y-2 text-sm text-blue-600">
              <div className="flex items-center">
                <Mail className="mr-2" size={14} />
                <span>dpo@peuplesolidaire.fr</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2" size={14} />
                <span>04 91 XX XX XX</span>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-2 mt-0.5" size={14} />
                <span>123 Avenue de la Protection des Données<br/>13001 Marseille</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Délais de réponse</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Demande d'accès: 1 mois maximum</li>
              <li>• Rectification: 1 mois maximum</li>
              <li>• Effacement: 1 mois maximum</li>
              <li>• Portabilité: 1 mois maximum</li>
            </ul>
            
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Contacter le DPO
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Mes Alertes</h1>
              <p className="text-yellow-100 text-sm">Notifications importantes</p>
            </div>
          </div>
          
          <div className="text-right text-sm">
            <div className="font-medium">{alerts.filter(a => !a.read).length} non lues</div>
            <div className="text-yellow-200">{alerts.length} alertes</div>
          </div>
        </div>
      </div>

      {/* Alertes */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Aucune alerte</p>
            <p className="text-gray-500 text-sm">Vous serez notifié ici des informations importantes</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`bg-white rounded-lg shadow-md border-l-4 p-4 ${
                alert.type === 'error' ? 'border-l-red-500' :
                alert.type === 'warning' ? 'border-l-yellow-500' :
                alert.type === 'success' ? 'border-l-green-500' :
                'border-l-blue-500'
              } ${!alert.read ? 'bg-opacity-95' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    alert.type === 'error' ? 'bg-red-100 text-red-600' :
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    alert.type === 'success' ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {alert.type === 'error' ? <X size={20} /> :
                     alert.type === 'warning' ? <AlertTriangle size={20} /> :
                     alert.type === 'success' ? <CheckCircle size={20} /> :
                     <Info size={20} />}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                    <p className="text-gray-700 text-sm mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleDateString('fr-FR')} à {alert.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!alert.read && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                  
                  {alert.actionRequired && alert.actionText && (
                    <button className={`px-3 py-1 rounded text-xs font-medium ${
                      alert.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                      alert.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                      'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {alert.actionText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paramètres des notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
          <Settings className="mr-2" size={20} />
          Paramètres des notifications
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Types de notifications</h4>
            <div className="space-y-3">
              {[
                { id: 'status_updates', label: 'Mises à jour de statut', enabled: true },
                { id: 'qr_expiry', label: 'Expiration des QR codes', enabled: true },
                { id: 'document_expiry', label: 'Expiration des documents', enabled: true },
                { id: 'new_messages', label: 'Nouveaux messages', enabled: true },
                { id: 'system_updates', label: 'Mises à jour système', enabled: false }
              ].map(notif => (
                <div key={notif.id} className="flex items-center justify-between">
                  <span className="text-gray-700">{notif.label}</span>
                  <input 
                    type="checkbox" 
                    checked={notif.enabled}
                    className="text-orange-600"
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Canaux de notification</h4>
            <div className="space-y-3">
              {[
                { id: 'push', label: 'Notifications push', enabled: true, icon: <Smartphone size={16} /> },
                { id: 'sms', label: 'SMS', enabled: true, icon: <MessageSquare size={16} /> },
                { id: 'email', label: 'Email', enabled: false, icon: <Mail size={16} /> }
              ].map(channel => (
                <div key={channel.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">{channel.icon}</span>
                    <span className="text-gray-700">{channel.label}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={channel.enabled}
                    className="text-orange-600"
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceContent = () => {
    switch (serviceId) {
      case 'new-request':
        return renderNewRequest();
      case 'history':
        return renderHistory();
      case 'qr-codes':
        return renderQRCodes();
      case 'profile':
        return renderProfile();
      case 'documents':
        return renderDocuments();
      case 'communication':
        return renderCommunication();
      case 'rights':
        return renderRights();
      case 'alerts':
        return renderAlerts();
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Service en développement</h2>
            <p className="text-gray-500 mb-6">Ce service sera bientôt disponible.</p>
            <button
              onClick={onBack}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Retour aux services
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderServiceContent()}
    </div>
  );
};

export default BeneficiaryServices;