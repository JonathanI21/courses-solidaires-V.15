import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  ArrowLeft, 
  Loader, 
  Target, 
  X, 
  Plus, 
  Minus, 
  Save, 
  Truck, 
  ArrowRight, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Heart, 
  FileText, 
  Warehouse, 
  BarChart3, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Volume2, 
  VolumeX,
  Check,
  XCircle,
  AlertTriangle,
  ShoppingCart,
  Clipboard,
  ClipboardCheck,
  SortAsc,
  SortDesc,
  CalendarDays,
  Eye
} from 'lucide-react';
import { FIFOStockManager, StockItem } from '../../../data/fifoStock';
import DatabaseService, { DonationPackage, DonatedItem } from '../../../data/database';
import DocumentScannerModal, { ScanMetadata } from '../../shared/DocumentScannerModal';

interface ScanMode {
  type: 'entry' | 'exit';
  label: string;
}

interface ScannedItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  scannedAt: Date;
  donationId?: string;
  donorName?: string;
  qrCode?: string;
  beneficiaryId?: string;
  beneficiaryName?: string;
}

interface ValidatedDonation {
  id: string;
  donationPackage: DonationPackage;
  status: 'not_scanned' | 'in_progress' | 'validated' | 'discrepancy';
  scannedItems: Array<{
    itemId: string;
    productId: string;
    productName: string;
    expectedQuantity: number;
    scannedQuantity: number;
    scannedAt?: Date;
  }>;
  startedScanningAt?: Date;
  completedScanningAt?: Date;
  notes?: string;
}

const StockManagementScanner: React.FC = () => {
  const [scanMode, setScanMode] = useState<ScanMode>({ type: 'entry', label: 'Entrées' });
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingDonations, setPendingDonations] = useState<DonationPackage[]>([]);
  const [validatedDonations, setValidatedDonations] = useState<ValidatedDonation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);
  const [activeDonationForScan, setActiveDonationForScan] = useState<string | null>(null);
  const [donationSearchTerm, setDonationSearchTerm] = useState('');
  const [donationStatusFilter, setDonationStatusFilter] = useState<'all' | 'not_scanned' | 'in_progress' | 'validated' | 'discrepancy'>('all');
  const [donationSortOrder, setDonationSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [donationDateFilter, setDonationDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Charger les données de stock et les dons en attente
  useEffect(() => {
    // Charger le stock
    const items = FIFOStockManager.getAllStockItems('assoc_001'); // ID de l'association connectée
    setStockItems(items);
    
    // Charger les dons en attente
    const donations = DatabaseService.getPendingDonationsForAssociation('assoc_001');
    setPendingDonations(donations);
    
    // Générer des dons validés simulés pour la démonstration
    generateMockValidatedDonations();
  }, []);

  // Générer des dons validés simulés
  const generateMockValidatedDonations = () => {
    const mockDonations: ValidatedDonation[] = [
      {
        id: 'vd_001',
        donationPackage: {
          id: 'donation_001',
          householdId: 'household_001',
          householdName: 'Famille Martin',
          associationId: 'assoc_001',
          associationName: 'Restos du Cœur Marseille',
          items: [
            {
              id: 'item_001',
              productId: 'prod_006',
              quantity: 3,
              unitPrice: 1.15,
              totalValue: 3.45
            },
            {
              id: 'item_002',
              productId: 'prod_010',
              quantity: 2,
              unitPrice: 3.29,
              totalValue: 6.58
            }
          ],
          totalValue: 10.03,
          taxDeduction: 6.62,
          status: 'received',
          createdAt: new Date(Date.now() - 3600000 * 2), // 2 heures avant
          receivedAt: new Date(Date.now() - 3600000),
          storeName: 'Carrefour Marseille Centre',
          storeAddress: '123 Avenue de la République, 13001 Marseille'
        },
        status: 'validated',
        scannedItems: [
          {
            itemId: 'item_001',
            productId: 'prod_006',
            productName: 'Lait demi-écrémé 1L',
            expectedQuantity: 3,
            scannedQuantity: 3,
            scannedAt: new Date(Date.now() - 1800000)
          },
          {
            itemId: 'item_002',
            productId: 'prod_010',
            productName: 'Riz basmati 1kg',
            expectedQuantity: 2,
            scannedQuantity: 2,
            scannedAt: new Date(Date.now() - 1700000)
          }
        ],
        startedScanningAt: new Date(Date.now() - 1900000),
        completedScanningAt: new Date(Date.now() - 1600000)
      },
      {
        id: 'vd_002',
        donationPackage: {
          id: 'donation_002',
          householdId: 'household_002',
          householdName: 'Famille Dubois',
          associationId: 'assoc_001',
          associationName: 'Restos du Cœur Marseille',
          items: [
            {
              id: 'item_003',
              productId: 'prod_018',
              quantity: 5,
              unitPrice: 1.29,
              totalValue: 6.45
            }
          ],
          totalValue: 6.45,
          taxDeduction: 4.26,
          status: 'received',
          createdAt: new Date(Date.now() - 3600000 * 5), // 5 heures avant
          receivedAt: new Date(Date.now() - 3600000 * 4),
          storeName: 'Leclerc Marseille Est',
          storeAddress: '456 Boulevard National, 13003 Marseille'
        },
        status: 'in_progress',
        scannedItems: [
          {
            itemId: 'item_003',
            productId: 'prod_018',
            productName: 'Conserve tomates',
            expectedQuantity: 5,
            scannedQuantity: 3,
            scannedAt: new Date(Date.now() - 1200000)
          }
        ],
        startedScanningAt: new Date(Date.now() - 1300000)
      },
      {
        id: 'vd_003',
        donationPackage: {
          id: 'donation_003',
          householdId: 'household_003',
          householdName: 'Famille Petit',
          associationId: 'assoc_001',
          associationName: 'Restos du Cœur Marseille',
          items: [
            {
              id: 'item_004',
              productId: 'prod_007',
              quantity: 2,
              unitPrice: 2.89,
              totalValue: 5.78
            },
            {
              id: 'item_005',
              productId: 'prod_011',
              quantity: 3,
              unitPrice: 1.89,
              totalValue: 5.67
            },
            {
              id: 'item_006',
              productId: 'prod_013',
              quantity: 1,
              unitPrice: 2.99,
              totalValue: 2.99
            }
          ],
          totalValue: 14.44,
          taxDeduction: 9.53,
          status: 'received',
          createdAt: new Date(Date.now() - 3600000 * 8), // 8 heures avant
          receivedAt: new Date(Date.now() - 3600000 * 7),
          storeName: 'Auchan Marseille Nord',
          storeAddress: '789 Route de Lyon, 13015 Marseille'
        },
        status: 'not_scanned',
        scannedItems: [
          {
            itemId: 'item_004',
            productId: 'prod_007',
            productName: 'Yaourts nature x8',
            expectedQuantity: 2,
            scannedQuantity: 0
          },
          {
            itemId: 'item_005',
            productId: 'prod_011',
            productName: 'Pâtes spaghetti',
            expectedQuantity: 3,
            scannedQuantity: 0
          },
          {
            itemId: 'item_006',
            productId: 'prod_013',
            productName: 'Pommes de terre',
            expectedQuantity: 1,
            scannedQuantity: 0
          }
        ]
      },
      {
        id: 'vd_004',
        donationPackage: {
          id: 'donation_004',
          householdId: 'household_001',
          householdName: 'Famille Martin',
          associationId: 'assoc_001',
          associationName: 'Restos du Cœur Marseille',
          items: [
            {
              id: 'item_007',
              productId: 'prod_012',
              quantity: 2,
              unitPrice: 2.19,
              totalValue: 4.38
            },
            {
              id: 'item_008',
              productId: 'prod_016',
              quantity: 1,
              unitPrice: 2.99,
              totalValue: 2.99
            }
          ],
          totalValue: 7.37,
          taxDeduction: 4.86,
          status: 'received',
          createdAt: new Date(Date.now() - 3600000 * 24), // 24 heures avant
          receivedAt: new Date(Date.now() - 3600000 * 23),
          storeName: 'Monoprix Marseille Vieux-Port',
          storeAddress: '321 Rue de la République, 13002 Marseille'
        },
        status: 'discrepancy',
        scannedItems: [
          {
            itemId: 'item_007',
            productId: 'prod_012',
            productName: 'Pain de mie complet',
            expectedQuantity: 2,
            scannedQuantity: 1,
            scannedAt: new Date(Date.now() - 3600000 * 22)
          },
          {
            itemId: 'item_008',
            productId: 'prod_016',
            productName: 'Jambon blanc',
            expectedQuantity: 1,
            scannedQuantity: 2,
            scannedAt: new Date(Date.now() - 3600000 * 22)
          }
        ],
        startedScanningAt: new Date(Date.now() - 3600000 * 22.5),
        completedScanningAt: new Date(Date.now() - 3600000 * 22),
        notes: 'Différence détectée: 1 pain de mie manquant, 1 jambon supplémentaire'
      }
    ];
    
    setValidatedDonations(mockDonations);
  };

  // Gérer la complétion du scan
  const handleScanComplete = (imageData: string, metadata: ScanMetadata) => {
    console.log('Scan complété:', metadata);
    
    if (scanMode.type === 'entry') {
      if (activeDonationForScan) {
        handleDonationItemScan(activeDonationForScan);
      } else {
        handleEntryScan();
      }
    } else {
      handleExitScan();
    }
  };

  // Gérer le scan d'un article de don
  const handleDonationItemScan = (donationId: string) => {
    // Trouver le don actif
    const donation = validatedDonations.find(d => d.id === donationId);
    if (!donation) return;
    
    // Trouver un article non scanné ou partiellement scanné
    const unscannedItems = donation.scannedItems.filter(item => 
      item.scannedQuantity < item.expectedQuantity
    );
    
    if (unscannedItems.length === 0) {
      alert('Tous les articles de ce don ont déjà été scannés.');
      return;
    }
    
    // Sélectionner un article aléatoire à scanner
    const randomIndex = Math.floor(Math.random() * unscannedItems.length);
    const itemToScan = unscannedItems[randomIndex];
    
    // Mettre à jour le statut du don
    setValidatedDonations(prev => prev.map(d => {
      if (d.id === donationId) {
        // Mettre à jour le statut de l'article
        const updatedItems = d.scannedItems.map(item => {
          if (item.itemId === itemToScan.itemId) {
            const newScannedQuantity = Math.min(item.expectedQuantity, item.scannedQuantity + 1);
            return {
              ...item,
              scannedQuantity: newScannedQuantity,
              scannedAt: new Date()
            };
          }
          return item;
        });
        
        // Vérifier si tous les articles sont scannés
        const allScanned = updatedItems.every(item => item.scannedQuantity === item.expectedQuantity);
        
        // Vérifier s'il y a des différences
        const hasDifferences = updatedItems.some(item => item.scannedQuantity !== item.expectedQuantity);
        
        // Déterminer le nouveau statut
        let newStatus: ValidatedDonation['status'];
        if (allScanned) {
          newStatus = hasDifferences ? 'discrepancy' : 'validated';
        } else {
          newStatus = 'in_progress';
        }
        
        return {
          ...d,
          status: newStatus,
          scannedItems: updatedItems,
          startedScanningAt: d.startedScanningAt || new Date(),
          completedScanningAt: allScanned ? new Date() : d.completedScanningAt
        };
      }
      return d;
    }));
    
    // Ajouter l'article au stock FIFO si c'est le premier scan de cet article
    if (itemToScan.scannedQuantity === 0) {
      const product = DatabaseService.getProduct(itemToScan.productId);
      if (product) {
        // Ajouter au stock FIFO
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // 30 jours d'expiration
        
        FIFOStockManager.addToStock(
          itemToScan.productId,
          product.name,
          1, // On scanne un par un
          'assoc_001', // ID de l'association connectée
          'Entrepôt principal',
          donation.donationPackage.id,
          expirationDate
        );
        
        // Mettre à jour le stock affiché
        const updatedStock = FIFOStockManager.getAllStockItems('assoc_001');
        setStockItems(updatedStock);
      }
    }
    
    // Ajouter l'article aux scans récents
    const product = DatabaseService.getProduct(itemToScan.productId);
    if (product) {
      const newScannedItem: ScannedItem = {
        id: Date.now().toString(),
        productId: itemToScan.productId,
        productName: product.name,
        quantity: 1,
        scannedAt: new Date(),
        donationId: donation.donationPackage.id,
        donorName: donation.donationPackage.householdName
      };
      
      setScannedItems(prev => [...prev, newScannedItem]);
    }
    
    // Afficher un message de succès
    alert(`✅ Article scanné avec succès !\n\nProduit: ${itemToScan.productName}\nDonateur: ${donation.donationPackage.householdName}\n\nProgression: ${itemToScan.scannedQuantity + 1}/${itemToScan.expectedQuantity}`);
  };

  // Gérer le scan d'entrée
  const handleEntryScan = () => {
    // Simuler la réception d'un don
    if (pendingDonations.length > 0) {
      // Prendre un don aléatoire en attente
      const randomIndex = Math.floor(Math.random() * pendingDonations.length);
      const donation = pendingDonations[randomIndex];
      
      // Prendre un article aléatoire du don
      const randomItemIndex = Math.floor(Math.random() * donation.items.length);
      const donationItem = donation.items[randomItemIndex];
      
      const product = DatabaseService.getProduct(donationItem.productId);
      
      if (product) {
        const newScannedItem: ScannedItem = {
          id: Date.now().toString(),
          productId: donationItem.productId,
          productName: product.name,
          quantity: donationItem.quantity,
          scannedAt: new Date(),
          donationId: donation.id,
          donorName: donation.householdName
        };
        
        setScannedItems(prev => [...prev, newScannedItem]);
        
        // Ajouter au stock FIFO
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // 30 jours d'expiration
        
        FIFOStockManager.addToStock(
          donationItem.productId,
          product.name,
          donationItem.quantity,
          'assoc_001', // ID de l'association connectée
          'Entrepôt principal',
          donation.id,
          expirationDate
        );
        
        // Mettre à jour le stock affiché
        const updatedStock = FIFOStockManager.getAllStockItems('assoc_001');
        setStockItems(updatedStock);
        
        // Créer un nouvel enregistrement de don validé
        const newValidatedDonation: ValidatedDonation = {
          id: `vd_${Date.now()}`,
          donationPackage: donation,
          status: 'not_scanned',
          scannedItems: donation.items.map(item => {
            const prod = DatabaseService.getProduct(item.productId);
            return {
              itemId: item.id,
              productId: item.productId,
              productName: prod?.name || 'Produit inconnu',
              expectedQuantity: item.quantity,
              scannedQuantity: 0
            };
          })
        };
        
        setValidatedDonations(prev => [newValidatedDonation, ...prev]);
        
        // Simuler la validation du don
        setTimeout(() => {
          DatabaseService.updateDonationStatus(donation.id, 'received');
          setPendingDonations(prev => prev.filter(d => d.id !== donation.id));
          
          // Après 24h (simulé en 10 secondes), valider le don et générer le reçu
          setTimeout(() => {
            DatabaseService.updateDonationStatus(donation.id, 'validated');
            setTimeout(() => {
              DatabaseService.updateDonationStatus(donation.id, 'receipt_available', {
                receiptNumber: `REC-${Date.now()}`
              });
            }, 5000); // 5 secondes pour générer le reçu
          }, 10000); // 10 secondes pour valider
        }, 2000);
        
        alert(`✅ Don reçu avec succès !\n\nProduit: ${product.name}\nQuantité: ${donationItem.quantity}\nDonateur: ${donation.householdName}\n\nAjouté à la liste des dons à scanner.`);
      }
    } else {
      // Simuler un scan d'un produit aléatoire
      const allProducts = DatabaseService.getAllProductsWithPrices();
      const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
      
      if (randomProduct) {
        const newScannedItem: ScannedItem = {
          id: Date.now().toString(),
          productId: randomProduct.id,
          productName: randomProduct.name,
          quantity: Math.floor(Math.random() * 5) + 1,
          scannedAt: new Date()
        };
        
        setScannedItems(prev => [...prev, newScannedItem]);
        
        // Ajouter au stock FIFO
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // 30 jours d'expiration
        
        FIFOStockManager.addToStock(
          randomProduct.id,
          randomProduct.name,
          newScannedItem.quantity,
          'assoc_001', // ID de l'association connectée
          'Entrepôt principal'
        );
        
        // Mettre à jour le stock affiché
        const updatedStock = FIFOStockManager.getAllStockItems('assoc_001');
        setStockItems(updatedStock);
        
        alert(`✅ Produit scanné avec succès !\n\nProduit: ${randomProduct.name}\nQuantité: ${newScannedItem.quantity}\n\nAjouté au stock FIFO.`);
      }
    }
  };

  // Gérer le scan de sortie
  const handleExitScan = () => {
    // Simuler la sortie de stock
    const allProducts = DatabaseService.getAllProductsWithPrices();
    const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
    
    if (randomProduct) {
      const qrCode = `QR-2024-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
      const beneficiaryName = ['Marie Dubois', 'Ahmed Hassan', 'Sophie Martin'][Math.floor(Math.random() * 3)];
      const beneficiaryId = `ben_00${Math.floor(Math.random() * 3) + 1}`;
      
      const newScannedItem: ScannedItem = {
        id: Date.now().toString(),
        productId: randomProduct.id,
        productName: randomProduct.name,
        quantity: Math.floor(Math.random() * 3) + 1,
        scannedAt: new Date(),
        qrCode,
        beneficiaryId,
        beneficiaryName
      };
      
      setScannedItems(prev => [...prev, newScannedItem]);
      
      // Retirer du stock FIFO
      const result = FIFOStockManager.removeFromStock(
        randomProduct.id,
        newScannedItem.quantity,
        'assoc_001', // ID de l'association connectée
        'op_001', // ID de l'opérateur
        'Sophie Laurent', // Nom de l'opérateur
        `Distribution QR ${qrCode}`
      );
      
      // Mettre à jour le stock affiché
      const updatedStock = FIFOStockManager.getAllStockItems('assoc_001');
      setStockItems(updatedStock);
      
      // Afficher un message de succès ou d'erreur
      if (result.success) {
        alert(`✅ Distribution validée !\n\nQR Code: ${qrCode}\nBénéficiaire: ${beneficiaryName}\nProduit: ${randomProduct.name} (x${newScannedItem.quantity})\n\nStock mis à jour.`);
      } else {
        alert(`⚠️ Attention: Stock insuffisant !\n\nQR Code: ${qrCode}\nBénéficiaire: ${beneficiaryName}\nProduit: ${randomProduct.name}\n\nQuantité demandée: ${newScannedItem.quantity}\nQuantité disponible: ${result.totalQuantity}`);
      }
    }
  };

  // Filtrer les dons validés
  const filteredDonations = validatedDonations.filter(donation => {
    // Filtre par statut
    const matchesStatus = donationStatusFilter === 'all' || donation.status === donationStatusFilter;
    
    // Filtre par recherche
    const matchesSearch = donationSearchTerm === '' || 
      donation.donationPackage.householdName.toLowerCase().includes(donationSearchTerm.toLowerCase()) ||
      donation.scannedItems.some(item => item.productName.toLowerCase().includes(donationSearchTerm.toLowerCase()));
    
    // Filtre par date
    let matchesDate = true;
    if (donationDateFilter !== 'all') {
      const now = new Date();
      const donationDate = donation.donationPackage.createdAt;
      
      switch (donationDateFilter) {
        case 'today':
          matchesDate = donationDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = donationDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = donationDate >= monthAgo;
          break;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });
  
  // Trier les dons validés
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (donationSortOrder === 'newest') {
      return b.donationPackage.createdAt.getTime() - a.donationPackage.createdAt.getTime();
    } else {
      return a.donationPackage.createdAt.getTime() - b.donationPackage.createdAt.getTime();
    }
  });

  // Obtenir la couleur du statut
  const getStatusColor = (status: ValidatedDonation['status']) => {
    switch (status) {
      case 'not_scanned': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'validated': return 'bg-green-100 text-green-800 border-green-300';
      case 'discrepancy': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: ValidatedDonation['status']) => {
    switch (status) {
      case 'not_scanned': return 'Non scanné';
      case 'in_progress': return 'En cours de scan';
      case 'validated': return 'Validé';
      case 'discrepancy': return 'Différence détectée';
      default: return 'Inconnu';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: ValidatedDonation['status']) => {
    switch (status) {
      case 'not_scanned': return <Clock size={14} />;
      case 'in_progress': return <Loader size={14} className="animate-spin" />;
      case 'validated': return <CheckCircle size={14} />;
      case 'discrepancy': return <AlertTriangle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  // Calculer le pourcentage de progression du scan
  const calculateScanProgress = (donation: ValidatedDonation) => {
    const totalItems = donation.scannedItems.reduce((sum, item) => sum + item.expectedQuantity, 0);
    const scannedItems = donation.scannedItems.reduce((sum, item) => sum + item.scannedQuantity, 0);
    
    return totalItems > 0 ? Math.round((scannedItems / totalItems) * 100) : 0;
  };

  // Filtrer les éléments du stock
  const filteredStockItems = stockItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || 
      DatabaseService.getProduct(item.productId)?.category === filterCategory;
    
    const matchesSearch = searchTerm === '' || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Commencer le scan d'un don
  const startDonationScan = (donationId: string) => {
    setActiveDonationForScan(donationId);
    setShowScannerModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Scan className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Gestion du Stock</h1>
              <p className="text-purple-100 text-sm">Scanner entrées/sorties • Reçus fiscaux • FIFO</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              <Package className="mr-1" size={14} />
              {showHistory ? 'Scanner' : 'Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications de dons en attente */}
      {pendingDonations.length > 0 && !showHistory && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
            <Heart className="mr-2" size={16} />
            Dons en attente de scan ({pendingDonations.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {pendingDonations.map(donation => (
              <div key={donation.id} className="flex items-center justify-between p-2 bg-white rounded border border-yellow-300 text-sm">
                <div>
                  <strong>{donation.householdName}</strong> a fait un don de {donation.items.length} article(s)
                </div>
                <div className="text-xs text-yellow-600">
                  {new Date(donation.createdAt).toLocaleDateString('fr-FR')} à {new Date(donation.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showHistory ? (
        <div className="grid grid-cols-1 gap-4 p-4">
          
          {/* PARTIE SUPÉRIEURE - Scanner avec caméra réelle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélection du mode de scan */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-3">Mode de scan</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setScanMode({ type: 'entry', label: 'Entrées' })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    scanMode.type === 'entry'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <Truck className={`mx-auto mb-2 ${scanMode.type === 'entry' ? 'text-purple-600' : 'text-gray-600'}`} size={24} />
                  <div className={`font-medium ${scanMode.type === 'entry' ? 'text-purple-800' : 'text-gray-800'}`}>
                    Scanner Entrées
                  </div>
                  <div className="text-xs text-purple-600">
                    Dons et approvisionnements
                  </div>
                </button>
                
                <button
                  onClick={() => setScanMode({ type: 'exit', label: 'Sorties' })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    scanMode.type === 'exit'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <ArrowRight className={`mx-auto mb-2 ${scanMode.type === 'exit' ? 'text-indigo-600' : 'text-gray-600'}`} size={24} />
                  <div className={`font-medium ${scanMode.type === 'exit' ? 'text-indigo-800' : 'text-gray-800'}`}>
                    Scanner Sorties
                  </div>
                  <div className="text-xs text-indigo-600">
                    QR codes bénéficiaires
                  </div>
                </button>
              </div>
            </div>
            
            {/* Interface de scan avec caméra */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                <Scan className="mr-2" size={20} />
                Scanner {scanMode.label}
              </h2>
              
              <div className="text-center py-6">
                <Camera className="mx-auto text-purple-500 mb-3" size={48} />
                <p className="text-purple-700 font-medium mb-4">
                  {activeDonationForScan 
                    ? 'Scannez les articles du don sélectionné'
                    : `Activez la caméra pour scanner ${scanMode.type === 'entry' ? 'les dons' : 'les QR codes'}`
                  }
                </p>
                
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Camera className="inline mr-2" size={20} />
                  Activer la caméra
                </button>
                
                {activeDonationForScan && (
                  <button
                    onClick={() => setActiveDonationForScan(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ml-2"
                  >
                    <X className="inline mr-2" size={20} />
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* PARTIE INFÉRIEURE - Suivi des dons validés */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-800 flex items-center">
                <ClipboardCheck className="mr-2" size={20} />
                Suivi des Dons Validés
              </h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {validatedDonations.length} dons
              </span>
            </div>
            
            {/* Filtres et recherche */}
            <div className="flex flex-wrap items-center gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Search className="text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un don..."
                  value={donationSearchTerm}
                  onChange={(e) => setDonationSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400" size={16} />
                <select
                  value={donationStatusFilter}
                  onChange={(e) => setDonationStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="not_scanned">Non scannés</option>
                  <option value="in_progress">En cours</option>
                  <option value="validated">Validés</option>
                  <option value="discrepancy">Différences</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarDays className="text-gray-400" size={16} />
                <select
                  value={donationDateFilter}
                  onChange={(e) => setDonationDateFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">Toutes dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
              
              <button
                onClick={() => setDonationSortOrder(donationSortOrder === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {donationSortOrder === 'newest' ? (
                  <>
                    <SortDesc className="mr-1" size={16} />
                    Plus récents
                  </>
                ) : (
                  <>
                    <SortAsc className="mr-1" size={16} />
                    Plus anciens
                  </>
                )}
              </button>
            </div>
            
            {/* Liste des dons validés */}
            {sortedDonations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Clipboard className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 font-medium mb-1 text-sm">Aucun don validé</p>
                <p className="text-gray-500 text-xs">Les dons validés apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDonations.map(donation => (
                  <div 
                    key={donation.id} 
                    className={`border-2 rounded-lg overflow-hidden transition-all ${
                      selectedDonation === donation.id ? 'border-purple-500' : 'border-gray-200'
                    }`}
                  >
                    {/* En-tête du don */}
                    <div className="p-4 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <Heart className="mr-3 text-pink-500" size={20} />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Don de {donation.donationPackage.householdName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {donation.donationPackage.createdAt.toLocaleDateString('fr-FR')} à {donation.donationPackage.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs border flex items-center ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)}
                            <span className="ml-1">{getStatusText(donation.status)}</span>
                          </span>
                          
                          <button
                            onClick={() => setSelectedDonation(selectedDonation === donation.id ? null : donation.id)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            {selectedDonation === donation.id ? <X size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Résumé du don */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <ShoppingCart className="mr-1 text-gray-500" size={14} />
                            <span>{donation.scannedItems.length} articles</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1 text-gray-500">€</span>
                            <span>{donation.donationPackage.totalValue.toFixed(2)}€</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1 text-gray-500">🏪</span>
                            <span>{donation.donationPackage.storeName}</span>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                donation.status === 'validated' ? 'bg-green-500' :
                                donation.status === 'discrepancy' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${calculateScanProgress(donation)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {calculateScanProgress(donation)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Bouton de scan */}
                      {donation.status !== 'validated' && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => startDonationScan(donation.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                              donation.status === 'not_scanned'
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : donation.status === 'in_progress'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Scan className="mr-2" size={16} />
                            {donation.status === 'not_scanned'
                              ? 'Commencer le scan'
                              : donation.status === 'in_progress'
                                ? 'Continuer le scan'
                                : 'Vérifier à nouveau'
                            }
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Détails du don (visible si sélectionné) */}
                    {selectedDonation === donation.id && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3">Détail des articles</h4>
                        
                        <div className="space-y-2">
                          {donation.scannedItems.map(item => (
                            <div 
                              key={item.itemId} 
                              className={`p-3 rounded-lg border ${
                                item.scannedQuantity === 0
                                  ? 'bg-white border-gray-200'
                                  : item.scannedQuantity < item.expectedQuantity
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : item.scannedQuantity > item.expectedQuantity
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-green-50 border-green-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-gray-800">{item.productName}</div>
                                <div className="flex items-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.scannedQuantity === 0
                                      ? 'bg-gray-100 text-gray-600'
                                      : item.scannedQuantity < item.expectedQuantity
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : item.scannedQuantity > item.expectedQuantity
                                          ? 'bg-red-100 text-red-600'
                                          : 'bg-green-100 text-green-600'
                                  }`}>
                                    {item.scannedQuantity} / {item.expectedQuantity}
                                  </span>
                                </div>
                              </div>
                              
                              {item.scannedAt && (
                                <div className="text-xs text-gray-500">
                                  Scanné le {item.scannedAt.toLocaleDateString('fr-FR')} à {item.scannedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                              
                              {item.scannedQuantity !== item.expectedQuantity && (
                                <div className={`mt-2 text-xs ${
                                  item.scannedQuantity < item.expectedQuantity
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}>
                                  {item.scannedQuantity < item.expectedQuantity
                                    ? `Manquant: ${item.expectedQuantity - item.scannedQuantity}`
                                    : `Excédent: ${item.scannedQuantity - item.expectedQuantity}`
                                  }
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Notes et informations supplémentaires */}
                        {donation.notes && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h5 className="font-medium text-yellow-800 text-sm mb-1">Notes:</h5>
                            <p className="text-sm text-yellow-700">{donation.notes}</p>
                          </div>
                        )}
                        
                        {donation.status === 'validated' && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-700 text-sm">
                              <CheckCircle className="mr-2" size={16} />
                              <span>Don validé et intégré au stock FIFO</span>
                            </div>
                            {donation.completedScanningAt && (
                              <div className="text-xs text-green-600 mt-1">
                                Validation complétée le {donation.completedScanningAt.toLocaleDateString('fr-FR')} à {donation.completedScanningAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {donation.status === 'discrepancy' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center text-red-700 text-sm">
                              <AlertTriangle className="mr-2" size={16} />
                              <span>Différences détectées entre les articles attendus et scannés</span>
                            </div>
                            <div className="text-xs text-red-600 mt-1">
                              Veuillez vérifier les quantités et contacter le donateur si nécessaire.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Historique des scans récents */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-purple-800 flex items-center">
                <Clock className="mr-2" size={20} />
                Historique des scans récents
              </h2>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                {scannedItems.length} scans
              </span>
            </div>
            
            {scannedItems.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Package className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 font-medium mb-1 text-sm">Aucun scan récent</p>
                <p className="text-gray-500 text-xs">Scannez des produits ou QR codes</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {scannedItems.slice(0, 5).map(item => {
                  const isEntry = !item.qrCode;
                  
                  return (
                    <div key={item.id} className={`p-3 rounded-lg border ${
                      isEntry 
                        ? 'bg-purple-50 border-purple-200' 
                        : 'bg-indigo-50 border-indigo-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {isEntry ? (
                            <Truck className="mr-2 text-purple-600" size={18} />
                          ) : (
                            <ArrowRight className="mr-2 text-indigo-600" size={18} />
                          )}
                          <div>
                            <h4 className={`font-medium text-sm ${isEntry ? 'text-purple-800' : 'text-indigo-800'}`}>
                              {item.productName}
                            </h4>
                            <div className="flex items-center text-xs">
                              <span className={`${isEntry ? 'text-purple-600' : 'text-indigo-600'}`}>
                                Quantité: {item.quantity}
                              </span>
                              <span className="mx-2">•</span>
                              <Clock className="mr-1" size={12} />
                              <span>
                                {item.scannedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          isEntry ? 'bg-purple-200 text-purple-800' : 'bg-indigo-200 text-indigo-800'
                        }`}>
                          {isEntry ? 'Entrée' : 'Sortie'}
                        </div>
                      </div>
                      
                      {/* Informations supplémentaires */}
                      <div className={`p-2 rounded text-xs ${
                        isEntry ? 'bg-purple-100' : 'bg-indigo-100'
                      }`}>
                        {isEntry ? (
                          <div className="flex items-center">
                            <Heart className="mr-1" size={12} />
                            <span>
                              {item.donorName 
                                ? `Don de ${item.donorName}` 
                                : 'Approvisionnement standard'
                              }
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <FileText className="mr-1" size={12} />
                              <span>QR Code: {item.qrCode}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="mr-1" size={12} />
                              <span>Bénéficiaire: {item.beneficiaryName}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {scannedItems.length > 5 && (
                  <div className="text-center text-sm text-purple-600">
                    + {scannedItems.length - 5} autres scans récents
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AFFICHAGE DU STOCK */
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-purple-800 flex items-center">
                <Warehouse className="mr-3" size={28} />
                Gestion du Stock FIFO
              </h2>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowHistory(false)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Scan className="mr-2" size={16} />
                  Retour au scanner
                </button>
                
                <button
                  onClick={() => {
                    const updatedStock = FIFOStockManager.getAllStockItems('assoc_001');
                    setStockItems(updatedStock);
                  }}
                  className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RefreshCw className="mr-1" size={14} />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400" size={16} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">Toutes catégories</option>
                  <option value="fruits-legumes">Fruits et Légumes</option>
                  <option value="produits-laitiers">Produits laitiers</option>
                  <option value="feculents">Féculents</option>
                  <option value="viandes-poissons">Viandes et Poissons</option>
                  <option value="epicerie">Épicerie</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Search className="text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Statistiques du stock */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Total produits</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {stockItems.filter(item => item.status === 'available').length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Quantité totale</h3>
                <p className="text-2xl font-bold text-green-600">
                  {stockItems.filter(item => item.status === 'available').reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Produits critiques</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {FIFOStockManager.getCriticalStockProducts('assoc_001').length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Bientôt expirés</h3>
                <p className="text-2xl font-bold text-red-600">
                  {FIFOStockManager.getExpiringProducts('assoc_001').length}
                </p>
              </div>
            </div>

            {/* Liste des produits en stock */}
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Produits en stock ({filteredStockItems.filter(item => item.status === 'available').length})
            </h3>
            
            {filteredStockItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Warehouse className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">Aucun produit trouvé</p>
                <p className="text-gray-500 text-sm">Modifiez vos filtres ou scannez des produits</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStockItems
                  .filter(item => item.status === 'available')
                  .map(item => {
                    const product = DatabaseService.getProduct(item.productId);
                    const category = product?.category || '';
                    const categoryName = {
                      'fruits-legumes': 'Fruits et Légumes',
                      'produits-laitiers': 'Produits laitiers',
                      'feculents': 'Féculents',
                      'viandes-poissons': 'Viandes et Poissons',
                      'epicerie': 'Épicerie'
                    }[category] || 'Autre';
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">
                              {product?.image || '📦'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                              <p className="text-sm text-gray-600">
                                Catégorie: {categoryName}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Calendar className="mr-1" size={12} />
                                <span>
                                  Entrée: {item.entryDate.toLocaleDateString('fr-FR')}
                                </span>
                                {item.expirationDate && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <Clock className="mr-1" size={12} />
                                    <span>
                                      Expire: {item.expirationDate.toLocaleDateString('fr-FR')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {item.quantity}
                            </div>
                            <div className="text-xs text-purple-600">
                              unités
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="mr-1" size={14} />
                            <span>{item.location}</span>
                          </div>
                          
                          {item.donationId && (
                            <div className="flex items-center text-pink-600">
                              <Heart className="mr-1" size={14} />
                              <span>Don</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de scanner de document */}
      <DocumentScannerModal
        isOpen={showScannerModal}
        onClose={() => {
          setShowScannerModal(false);
          setActiveDonationForScan(null);
        }}
        onScanComplete={handleScanComplete}
        userType="association"
        scanType={scanMode.type === 'entry' ? 'product' : 'qr_code'}
        title={activeDonationForScan 
          ? 'Scanner les articles du don' 
          : `Scanner ${scanMode.label}`
        }
        helpText={activeDonationForScan
          ? 'Scannez chaque article du don pour valider sa réception et l\'ajouter au stock.'
          : scanMode.type === 'entry' 
            ? 'Placez le code-barres du produit dans la zone de scan pour l\'ajouter au stock.' 
            : 'Placez le QR code du bénéficiaire dans la zone de scan pour valider la distribution.'
        }
      />
      
      {/* Audio pour les sons */}
      <audio ref={audioRef} />
    </div>
  );
};

export default StockManagementScanner;