import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Package, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Plus,
  Minus,
  Eye,
  X,
  Calendar,
  User,
  MapPin,
  Warehouse,
  TrendingDown,
  TrendingUp,
  Bell,
  History,
  Edit3,
  Save,
  BarChart3,
  FileText
} from 'lucide-react';
import DocumentScannerModal, { ScanMetadata } from '../../shared/DocumentScannerModal';

interface StockItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  location: string;
  entryDate: Date;
  expirationDate?: Date;
  status: 'available' | 'reserved' | 'expired' | 'damaged';
  batchNumber?: string;
  supplier?: string;
  unitPrice?: number;
}

interface StockMovement {
  id: string;
  type: 'entry' | 'exit';
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  timestamp: Date;
  operatorId: string;
  operatorName: string;
  reason: string;
  location: string;
  batchNumber?: string;
  notes?: string;
  corrected?: boolean;
  correctionOf?: string;
}

interface StockAlert {
  id: string;
  type: 'low_stock' | 'expiring' | 'expired' | 'damaged';
  productId: string;
  productName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  acknowledged: boolean;
}

const StockFlowManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'exit' | 'inventory' | 'movements' | 'alerts'>('entry');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerType, setScannerType] = useState<'entry' | 'exit'>('entry');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [scanQuantity, setScanQuantity] = useState(1);
  const [scanLocation, setScanLocation] = useState('Entrepôt A');
  const [scanReason, setScanReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showMovementDetails, setShowMovementDetails] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(0);

  // Données de démonstration
  useEffect(() => {
    const demoStockItems: StockItem[] = [
      {
        id: 'stock_001',
        productId: 'prod_006',
        productName: 'Lait demi-écrémé 1L',
        barcode: '3560070123461',
        quantity: 15,
        location: 'Réfrigérateur A',
        entryDate: new Date('2024-01-15T10:00:00'),
        expirationDate: new Date('2024-01-25T23:59:59'),
        status: 'available',
        batchNumber: 'LOT2024001',
        supplier: 'Don Famille Martin',
        unitPrice: 1.15
      },
      {
        id: 'stock_002',
        productId: 'prod_010',
        productName: 'Riz basmati 1kg',
        barcode: '3560070123465',
        quantity: 8,
        location: 'Entrepôt A - Étagère 3',
        entryDate: new Date('2024-01-14T14:30:00'),
        status: 'available',
        batchNumber: 'LOT2024002',
        supplier: 'Don Famille Dubois',
        unitPrice: 3.29
      },
      {
        id: 'stock_003',
        productId: 'prod_018',
        productName: 'Conserve tomates',
        barcode: '3560070123473',
        quantity: 3,
        location: 'Entrepôt B - Zone A',
        entryDate: new Date('2024-01-13T09:15:00'),
        expirationDate: new Date('2025-01-13T23:59:59'),
        status: 'available',
        batchNumber: 'LOT2024003',
        supplier: 'Don Famille Hassan',
        unitPrice: 1.29
      },
      {
        id: 'stock_004',
        productId: 'prod_007',
        productName: 'Yaourts nature x8',
        barcode: '3560070123462',
        quantity: 2,
        location: 'Réfrigérateur B',
        entryDate: new Date('2024-01-16T16:20:00'),
        expirationDate: new Date('2024-01-20T23:59:59'),
        status: 'available',
        batchNumber: 'LOT2024004',
        supplier: 'Don Famille Martin',
        unitPrice: 2.89
      }
    ];

    const demoMovements: StockMovement[] = [
      {
        id: 'mov_001',
        type: 'entry',
        productId: 'prod_006',
        productName: 'Lait demi-écrémé 1L',
        barcode: '3560070123461',
        quantity: 15,
        timestamp: new Date('2024-01-15T10:00:00'),
        operatorId: 'op_001',
        operatorName: 'Sophie Laurent',
        reason: 'Don reçu',
        location: 'Réfrigérateur A',
        batchNumber: 'LOT2024001'
      },
      {
        id: 'mov_002',
        type: 'exit',
        productId: 'prod_010',
        productName: 'Riz basmati 1kg',
        barcode: '3560070123465',
        quantity: 2,
        timestamp: new Date('2024-01-16T14:30:00'),
        operatorId: 'op_002',
        operatorName: 'Pierre Martin',
        reason: 'Distribution bénéficiaire',
        location: 'Entrepôt A - Étagère 3',
        notes: 'QR Code: QR-2024-001-003'
      },
      {
        id: 'mov_003',
        type: 'entry',
        productId: 'prod_018',
        productName: 'Conserve tomates',
        barcode: '3560070123473',
        quantity: 5,
        timestamp: new Date('2024-01-13T09:15:00'),
        operatorId: 'op_001',
        operatorName: 'Sophie Laurent',
        reason: 'Don reçu',
        location: 'Entrepôt B - Zone A',
        batchNumber: 'LOT2024003'
      },
      {
        id: 'mov_004',
        type: 'exit',
        productId: 'prod_018',
        productName: 'Conserve tomates',
        barcode: '3560070123473',
        quantity: 2,
        timestamp: new Date('2024-01-15T11:45:00'),
        operatorId: 'op_003',
        operatorName: 'Marie Dubois',
        reason: 'Distribution bénéficiaire',
        location: 'Entrepôt B - Zone A',
        notes: 'QR Code: QR-2024-002-001'
      }
    ];

    const demoAlerts: StockAlert[] = [
      {
        id: 'alert_001',
        type: 'low_stock',
        productId: 'prod_018',
        productName: 'Conserve tomates',
        message: 'Stock critique: seulement 3 unités restantes',
        severity: 'high',
        createdAt: new Date('2024-01-16T08:00:00'),
        acknowledged: false
      },
      {
        id: 'alert_002',
        type: 'expiring',
        productId: 'prod_007',
        productName: 'Yaourts nature x8',
        message: 'Produit expire dans 4 jours',
        severity: 'medium',
        createdAt: new Date('2024-01-16T09:00:00'),
        acknowledged: false
      },
      {
        id: 'alert_003',
        type: 'low_stock',
        productId: 'prod_007',
        productName: 'Yaourts nature x8',
        message: 'Stock critique: seulement 2 unités restantes',
        severity: 'high',
        createdAt: new Date('2024-01-16T16:30:00'),
        acknowledged: false
      }
    ];

    setStockItems(demoStockItems);
    setMovements(demoMovements);
    setAlerts(demoAlerts);
  }, []);

  const handleScanComplete = (imageData: string, metadata: ScanMetadata) => {
    console.log('Scan complété:', metadata);
    
    // Simuler la reconnaissance du code-barres
    const mockBarcodes = [
      '3560070123461', // Lait
      '3560070123465', // Riz
      '3560070123473', // Conserve tomates
      '3560070123462', // Yaourts
      '3560070123466', // Pâtes
      '3560070123467'  // Pain
    ];
    
    const detectedBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    
    if (scannerType === 'entry') {
      handleProductEntry(detectedBarcode);
    } else {
      handleProductExit(detectedBarcode);
    }
    
    setShowScannerModal(false);
  };

  const handleProductEntry = (barcode: string) => {
    // Simuler la reconnaissance du produit
    const productNames: { [key: string]: string } = {
      '3560070123461': 'Lait demi-écrémé 1L',
      '3560070123465': 'Riz basmati 1kg',
      '3560070123473': 'Conserve tomates',
      '3560070123462': 'Yaourts nature x8',
      '3560070123466': 'Pâtes spaghetti',
      '3560070123467': 'Pain de mie complet'
    };

    const productName = productNames[barcode] || 'Produit inconnu';
    const productId = `prod_${Object.keys(productNames).indexOf(barcode) + 1}`;

    // Vérifier si le produit existe déjà en stock
    const existingStock = stockItems.find(item => item.barcode === barcode && item.location === scanLocation);

    if (existingStock) {
      // Mettre à jour la quantité existante
      setStockItems(stockItems.map(item => 
        item.id === existingStock.id 
          ? { ...item, quantity: item.quantity + scanQuantity }
          : item
      ));
    } else {
      // Créer un nouvel item de stock
      const newStockItem: StockItem = {
        id: `stock_${Date.now()}`,
        productId,
        productName,
        barcode,
        quantity: scanQuantity,
        location: scanLocation,
        entryDate: new Date(),
        status: 'available',
        batchNumber: `LOT${Date.now()}`,
        supplier: 'Don reçu'
      };
      setStockItems([...stockItems, newStockItem]);
    }

    // Enregistrer le mouvement
    const newMovement: StockMovement = {
      id: `mov_${Date.now()}`,
      type: 'entry',
      productId,
      productName,
      barcode,
      quantity: scanQuantity,
      timestamp: new Date(),
      operatorId: 'op_current',
      operatorName: 'Opérateur Actuel',
      reason: scanReason || 'Entrée stock',
      location: scanLocation,
      batchNumber: `LOT${Date.now()}`
    };
    setMovements([newMovement, ...movements]);

    // Réinitialiser les champs
    setScanQuantity(1);
    setScanReason('');

    alert(`✅ Entrée enregistrée: ${productName} (x${scanQuantity}) ajouté au stock`);
  };

  const handleProductExit = (barcode: string) => {
    // Trouver le produit en stock
    const stockItem = stockItems.find(item => item.barcode === barcode && item.status === 'available');

    if (!stockItem) {
      alert('❌ Produit non trouvé en stock ou non disponible');
      return;
    }

    if (stockItem.quantity < scanQuantity) {
      alert(`❌ Stock insuffisant. Disponible: ${stockItem.quantity}, Demandé: ${scanQuantity}`);
      return;
    }

    // Mettre à jour le stock
    setStockItems(stockItems.map(item => 
      item.id === stockItem.id 
        ? { ...item, quantity: item.quantity - scanQuantity }
        : item
    ));

    // Enregistrer le mouvement
    const newMovement: StockMovement = {
      id: `mov_${Date.now()}`,
      type: 'exit',
      productId: stockItem.productId,
      productName: stockItem.productName,
      barcode,
      quantity: scanQuantity,
      timestamp: new Date(),
      operatorId: 'op_current',
      operatorName: 'Opérateur Actuel',
      reason: scanReason || 'Sortie stock',
      location: stockItem.location,
      notes: scanReason
    };
    setMovements([newMovement, ...movements]);

    // Vérifier les alertes de stock bas
    const newQuantity = stockItem.quantity - scanQuantity;
    if (newQuantity <= 5 && newQuantity > 0) {
      const newAlert: StockAlert = {
        id: `alert_${Date.now()}`,
        type: 'low_stock',
        productId: stockItem.productId,
        productName: stockItem.productName,
        message: `Stock critique: seulement ${newQuantity} unités restantes`,
        severity: newQuantity <= 2 ? 'critical' : 'high',
        createdAt: new Date(),
        acknowledged: false
      };
      setAlerts([newAlert, ...alerts]);
    }

    // Réinitialiser les champs
    setScanQuantity(1);
    setScanReason('');

    alert(`✅ Sortie enregistrée: ${stockItem.productName} (x${scanQuantity}) retiré du stock`);
  };

  const openScanner = (type: 'entry' | 'exit') => {
    setScannerType(type);
    setShowScannerModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'reserved': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'damaged': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    ));
  };

  const updateQuantity = (stockId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const oldItem = stockItems.find(item => item.id === stockId);
    if (!oldItem) return;

    const quantityDiff = newQuantity - oldItem.quantity;

    setStockItems(stockItems.map(item => 
      item.id === stockId 
        ? { ...item, quantity: newQuantity }
        : item
    ));

    // Enregistrer le mouvement de correction
    const correctionMovement: StockMovement = {
      id: `mov_${Date.now()}`,
      type: quantityDiff > 0 ? 'entry' : 'exit',
      productId: oldItem.productId,
      productName: oldItem.productName,
      barcode: oldItem.barcode,
      quantity: Math.abs(quantityDiff),
      timestamp: new Date(),
      operatorId: 'op_current',
      operatorName: 'Opérateur Actuel',
      reason: 'Correction manuelle',
      location: oldItem.location,
      notes: `Correction: ${oldItem.quantity} → ${newQuantity}`,
      corrected: true
    };

    setMovements([correctionMovement, ...movements]);
    setEditingQuantity(null);
  };

  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = searchTerm === '' || 
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.barcode.includes(searchTerm) ||
      movement.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Warehouse className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Gestion des Flux de Stock</h1>
              <p className="text-purple-100 text-sm">Scanner entrées/sorties • Traçabilité complète • Alertes automatiques</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {unacknowledgedAlerts.length > 0 && (
              <div className="flex items-center px-3 py-1 bg-red-500 rounded-full">
                <Bell className="mr-1" size={16} />
                <span className="text-sm font-medium">{unacknowledgedAlerts.length}</span>
              </div>
            )}
            
            <div className="text-right text-sm">
              <div className="font-medium">{stockItems.length} produits</div>
              <div className="text-purple-200">
                {stockItems.reduce((sum, item) => sum + item.quantity, 0)} unités
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'entry', label: 'Scanner Entrées', icon: ArrowDown },
            { id: 'exit', label: 'Scanner Sorties', icon: ArrowUp },
            { id: 'inventory', label: 'Inventaire', icon: Package },
            { id: 'movements', label: 'Mouvements', icon: History },
            { id: 'alerts', label: 'Alertes', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="mr-2" size={16} />
              {tab.label}
              {tab.id === 'alerts' && unacknowledgedAlerts.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {/* Scanner Entrées */}
        {activeTab === 'entry' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-6 flex items-center">
                <ArrowDown className="mr-2" size={24} />
                Scanner Entrées de Stock
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité à ajouter
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={scanQuantity}
                      onChange={(e) => setScanQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emplacement
                    </label>
                    <select
                      value={scanLocation}
                      onChange={(e) => setScanLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Entrepôt A">Entrepôt A</option>
                      <option value="Entrepôt B">Entrepôt B</option>
                      <option value="Réfrigérateur A">Réfrigérateur A</option>
                      <option value="Réfrigérateur B">Réfrigérateur B</option>
                      <option value="Zone de tri">Zone de tri</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Don reçu, livraison, etc."
                      value={scanReason}
                      onChange={(e) => setScanReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => openScanner('entry')}
                    className="flex flex-col items-center justify-center w-48 h-48 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Scan size={48} className="mb-4" />
                    <span className="text-lg font-bold">Scanner Entrée</span>
                    <span className="text-sm opacity-90">Code-barres produit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Sorties */}
        {activeTab === 'exit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-6 flex items-center">
                <ArrowUp className="mr-2" size={24} />
                Scanner Sorties de Stock
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité à retirer
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={scanQuantity}
                      onChange={(e) => setScanQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif de sortie
                    </label>
                    <select
                      value={scanReason}
                      onChange={(e) => setScanReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Sélectionner un motif</option>
                      <option value="Distribution bénéficiaire">Distribution bénéficiaire</option>
                      <option value="Produit expiré">Produit expiré</option>
                      <option value="Produit endommagé">Produit endommagé</option>
                      <option value="Transfert">Transfert vers autre association</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="QR Code, nom bénéficiaire, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => openScanner('exit')}
                    className="flex flex-col items-center justify-center w-48 h-48 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Scan size={48} className="mb-4" />
                    <span className="text-lg font-bold">Scanner Sortie</span>
                    <span className="text-sm opacity-90">Code-barres produit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventaire */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-purple-800 flex items-center">
                  <Package className="mr-2" size={24} />
                  Inventaire en Temps Réel
                </h2>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Search className="text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="available">Disponible</option>
                    <option value="reserved">Réservé</option>
                    <option value="expired">Expiré</option>
                    <option value="damaged">Endommagé</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredStockItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="text-purple-600" size={24} />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                          <p className="text-sm text-gray-600">Code-barres: {item.barcode}</p>
                          <p className="text-sm text-gray-600">Emplacement: {item.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {editingQuantity === item.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={tempQuantity}
                                  onChange={(e) => setTempQuantity(parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                  autoFocus
                                />
                                <button
                                  onClick={() => updateQuantity(item.id, tempQuantity)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => setEditingQuantity(null)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-purple-600">{item.quantity}</span>
                                <button
                                  onClick={() => {
                                    setEditingQuantity(item.id);
                                    setTempQuantity(item.quantity);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit3 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">unités</div>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                          {item.status === 'available' ? 'Disponible' :
                           item.status === 'reserved' ? 'Réservé' :
                           item.status === 'expired' ? 'Expiré' : 'Endommagé'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Entrée:</span> {item.entryDate.toLocaleDateString('fr-FR')}
                      </div>
                      {item.expirationDate && (
                        <div>
                          <span className="font-medium">Expiration:</span> {item.expirationDate.toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      {item.batchNumber && (
                        <div>
                          <span className="font-medium">Lot:</span> {item.batchNumber}
                        </div>
                      )}
                      {item.supplier && (
                        <div>
                          <span className="font-medium">Source:</span> {item.supplier}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mouvements */}
        {activeTab === 'movements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-purple-800 flex items-center">
                  <History className="mr-2" size={24} />
                  Historique des Mouvements
                </h2>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Search className="text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Download className="mr-2" size={16} />
                    Exporter
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredMovements.map(movement => (
                  <div key={movement.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          movement.type === 'entry' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {movement.type === 'entry' ? 
                            <ArrowDown className="text-green-600" size={24} /> :
                            <ArrowUp className="text-red-600" size={24} />
                          }
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{movement.productName}</h3>
                          <p className="text-sm text-gray-600">
                            {movement.type === 'entry' ? 'Entrée' : 'Sortie'} de {movement.quantity} unité{movement.quantity > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-gray-500">
                            {movement.timestamp.toLocaleDateString('fr-FR')} à {movement.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {movement.corrected && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Correction
                          </span>
                        )}
                        
                        <button
                          onClick={() => setShowMovementDetails(showMovementDetails === movement.id ? null : movement.id)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>
                    
                    {showMovementDetails === movement.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Opérateur:</span>
                          <p className="text-gray-600">{movement.operatorName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Motif:</span>
                          <p className="text-gray-600">{movement.reason}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Emplacement:</span>
                          <p className="text-gray-600">{movement.location}</p>
                        </div>
                        {movement.batchNumber && (
                          <div>
                            <span className="font-medium text-gray-700">Lot:</span>
                            <p className="text-gray-600">{movement.batchNumber}</p>
                          </div>
                        )}
                        {movement.notes && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Notes:</span>
                            <p className="text-gray-600">{movement.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alertes */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-6 flex items-center">
                <Bell className="mr-2" size={24} />
                Alertes de Stock ({unacknowledgedAlerts.length} non lues)
              </h2>

              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          alert.type === 'low_stock' ? 'bg-orange-100' :
                          alert.type === 'expiring' ? 'bg-yellow-100' :
                          alert.type === 'expired' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {alert.type === 'low_stock' ? <TrendingDown size={16} className="text-orange-600" /> :
                           alert.type === 'expiring' ? <Clock size={16} className="text-yellow-600" /> :
                           alert.type === 'expired' ? <AlertTriangle size={16} className="text-red-600" /> :
                           <Package size={16} className="text-gray-600" />}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{alert.productName}</h3>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            {alert.createdAt.toLocaleDateString('fr-FR')} à {alert.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity === 'critical' ? 'Critique' :
                           alert.severity === 'high' ? 'Élevé' :
                           alert.severity === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                        
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                          >
                            Acquitter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="mx-auto mb-4" size={48} />
                    <p className="font-medium">Aucune alerte</p>
                    <p className="text-sm">Votre stock est en bon état</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de scanner */}
      <DocumentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanComplete={handleScanComplete}
        userType="association"
        scanType="product"
        title={scannerType === 'entry' ? 'Scanner Entrée de Stock' : 'Scanner Sortie de Stock'}
        helpText={scannerType === 'entry' 
          ? 'Scannez le code-barres du produit à ajouter au stock.' 
          : 'Scannez le code-barres du produit à retirer du stock.'}
      />
    </div>
  );
};

export default StockFlowManager;