import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Scan, 
  ArrowLeft,
  Package,
  Clock,
  BarChart3,
  Target,
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Gift,
  Users,
  Edit3,
  Save,
  X,
  Trash2,
  List,
  FileText,
  TrendingUp,
  Store,
  Euro,
  Zap,
  History,
  Lightbulb,
  Bell,
  Loader,
  Volume2,
  VolumeX
} from 'lucide-react';
import DatabaseService, { ShoppingList, Product, ShoppingListItem, DonationPackage } from '../../../data/database';
import DocumentScannerModal, { ScanMetadata } from '../../shared/DocumentScannerModal';

interface InStoreScannerProps {
  validatedList?: ShoppingList | null;
  onListUpdated: (list: ShoppingList) => void;
  onNavigateToShoppingList?: () => void;
  onRectifyList?: () => void;
}

interface ScannedProduct {
  id: string;
  productId: string;
  quantity: number;
  scannedAt: Date;
  donated: boolean;
  scanMethod: 'classic' | 'ai_camera';
  confidence?: number;
}

interface ScannerType {
  id: 'classic' | 'ai_camera';
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface DonationNotification {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  donorName: string;
  associationId: string;
  associationName: string;
  sentAt: Date;
  status: 'sent' | 'received' | 'validated';
  receiptSent?: boolean;
}

const InStoreScanner: React.FC<InStoreScannerProps> = ({ 
  validatedList, 
  onListUpdated, 
  onNavigateToShoppingList,
  onRectifyList
}) => {
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [selectedScannerType, setSelectedScannerType] = useState<ScannerType['id']>('classic');
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [donationCount, setDonationCount] = useState(0);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<string>('assoc_001');
  const [showDonationSuccess, setShowDonationSuccess] = useState<DonationPackage | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState<DonationNotification[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const scannerTypes: ScannerType[] = [
    {
      id: 'classic',
      name: 'Scanner Classique',
      description: 'Comme en caisse',
      icon: <Scan className="mx-auto mb-2 text-emerald-600" size={24} />
    },
    {
      id: 'ai_camera',
      name: 'Scanner IA',
      description: 'Reconnaissance image',
      icon: <Camera className="mx-auto mb-2 text-blue-600" size={24} />
    }
  ];

  // Gérer la complétion du scan
  const handleScanComplete = (imageData: string, metadata: ScanMetadata) => {
    console.log('Scan complété:', metadata);
    
    // Ajouter un produit aléatoire au panier
    addRandomProduct(
      metadata.scanType === 'product' ? 
        (selectedScannerType === 'classic' ? 'classic' : 'ai_camera') : 
        'classic',
      metadata.confidence
    );
  };

  // Ajouter un produit aléatoire au panier
  const addRandomProduct = (scanMethod: 'classic' | 'ai_camera', confidence?: number) => {
    const allProducts = DatabaseService.getAllProductsWithPrices();
    const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
    
    if (!randomProduct) return;

    const existingProduct = scannedProducts.find(p => p.productId === randomProduct.id);
    
    if (existingProduct) {
      setScannedProducts(scannedProducts.map(p => 
        p.productId === randomProduct.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      const newScannedProduct: ScannedProduct = {
        id: Date.now().toString(),
        productId: randomProduct.id,
        quantity: 1,
        scannedAt: new Date(),
        donated: false,
        scanMethod,
        confidence: confidence || Math.floor(Math.random() * 10) + 88 // 88-98%
      };
      setScannedProducts([...scannedProducts, newScannedProduct]);
    }
  };

  // Gérer le clic sur le cœur (don)
  const toggleDonation = (productId: string) => {
    setScannedProducts(scannedProducts.map(p => {
      if (p.productId === productId) {
        const newDonated = !p.donated;
        
        if (newDonated) {
          setDonationCount(prev => prev + p.quantity);
          // Envoyer notification à l'association
          sendDonationNotification(p);
        } else {
          setDonationCount(prev => prev - p.quantity);
          // Annuler la notification (si pas encore validée)
          cancelDonationNotification(p.productId);
        }
        
        return { ...p, donated: newDonated };
      }
      return p;
    }));
  };

  // Envoyer notification de don à l'association
  const sendDonationNotification = (scannedProduct: ScannedProduct) => {
    const product = DatabaseService.getProduct(scannedProduct.productId);
    const association = DatabaseService.getAssociation(selectedAssociation);
    
    if (!product || !association) return;

    const notification: DonationNotification = {
      id: `notif_${Date.now()}`,
      productId: scannedProduct.productId,
      productName: product.name,
      quantity: scannedProduct.quantity,
      donorName: 'Famille Martin', // À récupérer du contexte utilisateur
      associationId: selectedAssociation,
      associationName: association.name,
      sentAt: new Date(),
      status: 'sent'
    };

    setNotifications(prev => [...prev, notification]);

    // Simuler l'envoi de notification
    console.log(`📧 NOTIFICATION ENVOYÉE À ${association.name}:`);
    console.log(`Nouveau don disponible:`);
    console.log(`- Produit: ${product.name}`);
    console.log(`- Quantité: ${scannedProduct.quantity}`);
    console.log(`- Donateur: Famille Martin`);
    console.log(`- À récupérer et scanner pour validation`);

    // Simuler la réception par l'association après 2-5 secondes
    setTimeout(() => {
      simulateAssociationReception(notification.id);
    }, Math.random() * 3000 + 2000);
  };

  // Annuler notification de don
  const cancelDonationNotification = (productId: string) => {
    setNotifications(prev => prev.filter(n => n.productId !== productId || n.status !== 'sent'));
  };

  // Simuler la réception par l'association
  const simulateAssociationReception = (notificationId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId && n.status === 'sent') {
        console.log(`📦 ASSOCIATION ${n.associationName}:`);
        console.log(`Don reçu: ${n.productName} (x${n.quantity})`);
        console.log(`Scan de vérification en cours...`);
        
        return { ...n, status: 'received' };
      }
      return n;
    }));

    // Simuler le scan de vérification après 3-7 secondes
    setTimeout(() => {
      simulateAssociationValidation(notificationId);
    }, Math.random() * 4000 + 3000);
  };

  // Simuler la validation par scan de l'association
  const simulateAssociationValidation = (notificationId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId && n.status === 'received') {
        console.log(`✅ VALIDATION ASSOCIATION ${n.associationName}:`);
        console.log(`Produit scanné et vérifié: ${n.productName}`);
        console.log(`Correspondance confirmée !`);
        console.log(`📧 Envoi automatique du reçu fiscal à ${n.donorName}`);
        
        // Générer et envoyer le reçu fiscal
        generateAndSendReceipt(n);
        
        return { ...n, status: 'validated', receiptSent: true };
      }
      return n;
    }));
  };

  // Générer et envoyer le reçu fiscal
  const generateAndSendReceipt = (notification: DonationNotification) => {
    const product = DatabaseService.getProduct(notification.productId);
    const bestPrice = DatabaseService.getBestPriceForProduct(notification.productId);
    const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;
    
    const donationValue = price * notification.quantity;
    const taxDeduction = donationValue * 0.66; // 66% de déduction

    const receipt = `
REÇU FISCAL AUTOMATIQUE
═══════════════════════════════════════

Association: ${notification.associationName}
Date: ${new Date().toLocaleDateString('fr-FR')}
Heure: ${new Date().toLocaleTimeString('fr-FR')}

DÉTAIL DU DON:
- Produit: ${notification.productName}
- Quantité: ${notification.quantity}
- Valeur unitaire: ${price.toFixed(2)}€
- Valeur totale: ${donationValue.toFixed(2)}€

DÉDUCTION FISCALE:
- Taux de déduction: 66%
- Montant déductible: ${taxDeduction.toFixed(2)}€

Donateur: ${notification.donorName}
Numéro de reçu: REC-${Date.now()}

Ce reçu est généré automatiquement suite à la 
validation par scan de l'association.
    `.trim();

    console.log(`📄 REÇU FISCAL GÉNÉRÉ:`);
    console.log(receipt);
    console.log(`📧 Reçu envoyé par email à ${notification.donorName}`);

    // Afficher une notification de succès
    alert(`✅ Reçu fiscal envoyé !\n\nVotre don de ${donationValue.toFixed(2)}€ a été validé.\nDéduction fiscale: ${taxDeduction.toFixed(2)}€\n\nReçu envoyé par email.`);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setScannedProducts(scannedProducts.filter(p => p.productId !== productId));
      return;
    }
    
    setScannedProducts(scannedProducts.map(p => 
      p.productId === productId 
        ? { ...p, quantity: newQuantity }
        : p
    ));
  };

  const calculateTotal = () => {
    return scannedProducts.reduce((total, item) => {
      const bestPrice = DatabaseService.getBestPriceForProduct(item.productId);
      const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateDonationTotal = () => {
    return scannedProducts
      .filter(item => item.donated)
      .reduce((total, item) => {
        const bestPrice = DatabaseService.getBestPriceForProduct(item.productId);
        const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;
        return total + (price * item.quantity);
      }, 0);
  };

  const handleFinalizePurchase = () => {
    if (scannedProducts.length === 0) {
      alert('Aucun produit scanné');
      return;
    }

    const donatedItems = scannedProducts.filter(item => item.donated);
    
    if (donatedItems.length > 0) {
      alert(`✅ Achat finalisé !\n\nTotal: ${calculateTotal().toFixed(2)}€\nDons: ${calculateDonationTotal().toFixed(2)}€\n\nLes reçus fiscaux seront envoyés après validation des associations.`);
    } else {
      alert(`✅ Achat finalisé !\n\nTotal: ${calculateTotal().toFixed(2)}€`);
    }
    
    setScannedProducts([]);
    setDonationCount(0);
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <Camera className="mr-2" size={24} />
            Scanner Magasin
          </h1>
          
          <div className="flex items-center space-x-2">
            {validatedList ? (
              <button
                onClick={onRectifyList}
                className="flex items-center px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                <Edit3 className="mr-1" size={14} />
                Rectifier
              </button>
            ) : (
              <button
                onClick={onNavigateToShoppingList}
                className="flex items-center px-3 py-1 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                <FileText className="mr-1" size={14} />
                Liste courses
              </button>
            )}
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            
            <div className="flex items-center space-x-1">
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                {scannedProducts.length}
              </span>
              {donationCount > 0 && (
                <span className="px-2 py-1 bg-pink-500 rounded-full text-xs flex items-center">
                  <Heart className="mr-1" size={10} />
                  {donationCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sélection d'association pour les dons */}
      {donationCount > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="text-emerald-600 mr-2" size={16} />
              <span className="font-medium text-emerald-800">Association bénéficiaire:</span>
            </div>
            <select
              value={selectedAssociation}
              onChange={(e) => setSelectedAssociation(e.target.value)}
              className="px-3 py-1 border border-emerald-300 rounded-lg bg-white text-emerald-800 text-sm"
            >
              {DatabaseService.getAssociations().map(assoc => (
                <option key={assoc.id} value={assoc.id}>
                  {assoc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Ma Liste de Courses Validée */}

      {/* Notifications de don en temps réel */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
            <Bell className="mr-2" size={16} />
            Notifications de dons ({notifications.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notifications.map(notif => (
              <div key={notif.id} className={`flex items-center justify-between p-2 rounded text-sm ${
                notif.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                notif.status === 'received' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                <div>
                  <strong>{notif.productName}</strong> (x{notif.quantity}) → {notif.associationName}
                </div>
                <div className="text-xs">
                  {notif.status === 'sent' && '📤 Envoyé'}
                  {notif.status === 'received' && '📦 Reçu - Scan en cours...'}
                  {notif.status === 'validated' && '✅ Validé - Reçu envoyé'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        
        {/* PARTIE GAUCHE - Ma Liste de Courses Validée */}
        <div className="space-y-4">
          
          {/* Ma Liste de Courses Validée - Limitée à la colonne de gauche */}
          {validatedList && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-emerald-800 flex items-center">
                  <List className="mr-2" size={20} />
                  Ma Liste de Courses Validée
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                    {validatedList.items.length} articles • {validatedList.items.reduce((sum, item) => sum + item.quantity, 0)} unités
                  </span>
                  <button
                    onClick={() => setShowShoppingList(!showShoppingList)}
                    className="text-emerald-600 hover:text-emerald-800 transition-colors text-sm"
                  >
                    {showShoppingList ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>
              
              {showShoppingList && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="mb-3">
                    <div className="text-sm font-medium text-emerald-800">{validatedList.name}</div>
                    <div className="text-xs text-emerald-600">
                      Validée le {validatedList.validatedAt?.toLocaleDateString('fr-FR')} à {validatedList.validatedAt?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {validatedList.items.map(item => {
                      const product = DatabaseService.getProduct(item.productId);
                      if (!product) return null;
                      
                      const isScanned = scannedProducts.some(sp => sp.productId === item.productId);
                      const scannedProduct = scannedProducts.find(sp => sp.productId === item.productId);
                      const scannedQuantity = scannedProduct ? scannedProduct.quantity : 0;
                      const remainingQuantity = item.quantity - scannedQuantity;
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded border text-sm transition-all ${
                            remainingQuantity <= 0
                              ? 'bg-green-100 border-green-300' 
                              : isScanned
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <span className="text-lg mr-3">{product.image}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{product.name}</div>
                              <div className="text-xs text-gray-600">{product.brand}</div>
                              <div className="text-xs">
                                <span className={`font-medium ${
                                  remainingQuantity <= 0 ? 'text-green-600' : 'text-gray-700'
                                }`}>
                                  Demandé: {item.quantity}
                                </span>
                                {isScanned && (
                                  <span className="ml-2 text-blue-600">
                                    • Scanné: {scannedQuantity}
                                  </span>
                                )}
                                {remainingQuantity > 0 && isScanned && (
                                  <span className="ml-2 text-orange-600">
                                    • Restant: {remainingQuantity}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {remainingQuantity <= 0 ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle size={16} className="mr-1" />
                                <span className="text-xs font-medium">Complet</span>
                              </div>
                            ) : isScanned ? (
                              <div className="flex items-center text-blue-600">
                                <Clock size={16} className="mr-1" />
                                <span className="text-xs font-medium">Partiel</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-500">
                                <Package size={16} className="mr-1" />
                                <span className="text-xs font-medium">À scanner</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Progression globale */}
                  <div className="mt-4 pt-3 border-t border-emerald-300">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-emerald-700">Progression:</span>
                      <span className="font-bold text-emerald-600">
                        {validatedList.items.filter(item => {
                          const scannedProduct = scannedProducts.find(sp => sp.productId === item.productId);
                          const scannedQuantity = scannedProduct ? scannedProduct.quantity : 0;
                          return scannedQuantity >= item.quantity;
                        }).length} / {validatedList.items.length} articles
                      </span>
                    </div>
                    
                    <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(validatedList.items.filter(item => {
                            const scannedProduct = scannedProducts.find(sp => sp.productId === item.productId);
                            const scannedQuantity = scannedProduct ? scannedProduct.quantity : 0;
                            return scannedQuantity >= item.quantity;
                          }).length / validatedList.items.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PARTIE DROITE - Scanner + Panier */}
        <div className="space-y-4">
          
          {/* Scanner avec Caméra Réelle - Déplacé en haut de la colonne droite */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
              <Camera className="mr-2" size={20} />
              Scanner avec Caméra Réelle
            </h2>
            
            {/* Sélection du type de scanner */}
            <div className="space-y-4">
              <div className="text-center">
                <Camera className="mx-auto text-emerald-500 mb-3" size={40} />
                <p className="text-emerald-700 font-medium mb-4 text-sm">
                  Choisissez votre mode de scan
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {scannerTypes.map(scanner => (
                  <button
                    key={scanner.id}
                    onClick={() => {
                      setSelectedScannerType(scanner.id);
                      if (scanner.id === 'classic') {
                        window.location.hash = '#classic-scanner';
                      } else {
                        window.location.hash = '#ai-scanner';
                      }
                    }}
                    className={`p-3 border-2 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center ${
                      scanner.id === 'classic' ? 'border-emerald-300' : 'border-blue-300'
                    }`}
                  >
                    {scanner.icon}
                    <div className="font-medium text-gray-800 text-sm">{scanner.name}</div>
                    <div className="text-xs text-gray-600">{scanner.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Panier - Maintenant en dessous du scanner */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-emerald-800 flex items-center">
                <ShoppingCart className="mr-2" size={20} />
                Panier ({scannedProducts.length})
              </h2>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                {scannedProducts.reduce((sum, p) => sum + p.quantity, 0)} articles
              </span>
            </div>
            
            {scannedProducts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Package className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 font-medium mb-1 text-sm">Panier vide</p>
                <p className="text-gray-500 text-xs">Scannez des produits pour commencer</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {scannedProducts.map(item => {
                  const product = DatabaseService.getProduct(item.productId);
                  if (!product) return null;

                  const bestPrice = DatabaseService.getBestPriceForProduct(item.productId);
                  const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;

                  return (
                    <div key={item.id}>
                      <div 
                        className={`p-3 rounded-lg border transition-all ${
                          item.donated 
                            ? 'bg-pink-50 border-pink-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center flex-1 min-w-0">
                            <span className="text-lg mr-2">{product.image}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm truncate ${item.donated ? 'text-pink-800' : 'text-gray-800'}`}>
                                {product.name}
                              </h4>
                              <div className="flex items-center space-x-2 text-xs">
                                <span className={`${item.donated ? 'text-pink-600' : 'text-gray-600'}`}>
                                  {product.brand}
                                </span>
                                <span className={`px-1 py-0.5 rounded text-xs ${
                                  item.scanMethod === 'classic' 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {item.scanMethod === 'classic' ? 'Classique' : `IA ${item.confidence}%`}
                                </span>
                              </div>
                              {price > 0 && (
                                <div className="text-xs font-semibold text-emerald-600 mt-1">
                                  {(price * item.quantity).toFixed(2)}€
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setScannedProducts(scannedProducts.filter(p => p.id !== item.id))}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Contrôles quantité */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Bouton don */}
                          <button
                            onClick={() => toggleDonation(item.productId)}
                            className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-all ${
                              item.donated
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                            }`}
                          >
                            <Heart 
                              className={`mr-2 ${item.donated ? 'fill-current' : ''}`} 
                              size={16} 
                            />
                            Don Solidaire
                          </button>
                        </div>

                        {item.donated && (
                          <div className="mt-2 p-2 bg-pink-100 border border-pink-200 rounded text-xs">
                            <div className="flex items-center text-pink-700">
                              <Gift className="mr-1" size={12} />
                              <span className="font-medium">
                                Don solidaire activé - Notification envoyée
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          {scannedProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Euro className="mr-2" size={20} />
                Récapitulatif
              </h2>
              
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-emerald-700 text-sm">Mes achats:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {(calculateTotal() - calculateDonationTotal()).toFixed(2)}€
                    </span>
                  </div>
                </div>

                {donationCount > 0 && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <Heart className="mr-1 text-pink-600 fill-current" size={14} />
                        <span className="font-medium text-pink-700 text-sm">Mes dons:</span>
                      </div>
                      <span className="text-lg font-bold text-pink-600">
                        {calculateDonationTotal().toFixed(2)}€
                      </span>
                    </div>
                    <div className="text-xs text-pink-600">
                      Reçus fiscaux envoyés après validation
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Total à payer:</span>
                    <span className="text-2xl font-bold">
                      {calculateTotal().toFixed(2)}€
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleFinalizePurchase}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center"
                >
                  <Zap className="mr-2" size={16} />
                  Finaliser mes achats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de scanner de document */}
      <DocumentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanComplete={handleScanComplete}
        userType="household"
        scanType="product"
        title={selectedScannerType === 'classic' ? 'Scanner Classique' : 'Scanner IA'}
        helpText={selectedScannerType === 'classic' 
          ? 'Placez le code-barres du produit dans la zone de scan et maintenez-le stable.' 
          : 'Placez le produit ou l\'étiquette dans la zone de scan pour une reconnaissance par IA.'}
      />
      
      {/* Audio pour les sons */}
      <audio ref={audioRef} />
    </div>
  );
};

export default InStoreScanner;