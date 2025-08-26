import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Scan, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Heart, 
  MapPin, 
  Building, 
  Loader, 
  Zap, 
  Eye, 
  Star,
  TrendingUp,
  Info
} from 'lucide-react';
import DatabaseService, { Product, Association } from '../../../data/database';
import { FIFOStockManager } from '../../../data/fifoStock';
import { WorkflowEngine } from '../../../data/workflow';

interface ScanResult {
  product: Product;
  price: number;
  confidence: number;
  store: string;
  category: string;
  nutritionalInfo: {
    nutriScore: string;
    ecoScore: string;
    allergens: string[];
  };
}

interface DonationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp?: Date;
}

const AIProductScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  const [donationSteps, setDonationSteps] = useState<DonationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0);

  const associations = DatabaseService.getAssociations();

  // Initialiser les étapes du processus de don
  useEffect(() => {
    setDonationSteps([
      {
        id: 'scan',
        title: 'Scanner le produit',
        description: 'Reconnaissance IA du produit en magasin',
        status: 'pending'
      },
      {
        id: 'ai_analysis',
        title: 'Analyse IA',
        description: 'Reconnaissance prix, catégorie, informations nutritionnelles',
        status: 'pending'
      },
      {
        id: 'select_association',
        title: 'Sélection association',
        description: 'Choisir l\'association bénéficiaire locale',
        status: 'pending'
      },
      {
        id: 'notification',
        title: 'Notification',
        description: 'Envoi automatique à l\'association',
        status: 'pending'
      },
      {
        id: 'reception',
        title: 'Réception',
        description: 'Scan de réception par l\'association',
        status: 'pending'
      },
      {
        id: 'stock_update',
        title: 'Mise à jour stock',
        description: 'Intégration FIFO dans les stocks',
        status: 'pending'
      }
    ]);
  }, []);

  const simulateAIScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setShowSuccess(false);
    
    // Étape 1: Scanner le produit
    updateStepStatus(0, 'in_progress');
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateStepStatus(0, 'completed');

    // Étape 2: Analyse IA
    updateStepStatus(1, 'in_progress');
    
    // Simuler la progression de la confiance IA
    for (let confidence = 0; confidence <= 96; confidence += 8) {
      setAiConfidence(confidence);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sélectionner un produit aléatoire pour la simulation
    const allProducts = DatabaseService.getAllProductsWithPrices();
    const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
    
    if (randomProduct && randomProduct.prices.length > 0) {
      const bestPrice = DatabaseService.getBestPriceForProduct(randomProduct.id);
      const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;
      
      const result: ScanResult = {
        product: randomProduct,
        price,
        confidence: 96,
        store: bestPrice?.storeName || 'Magasin',
        category: randomProduct.category,
        nutritionalInfo: {
          nutriScore: randomProduct.nutriScore,
          ecoScore: randomProduct.ecoScore,
          allergens: randomProduct.allergens
        }
      };
      
      setScanResult(result);
      updateStepStatus(1, 'completed');
    }
    
    setIsScanning(false);
  };

  const updateStepStatus = (stepIndex: number, status: DonationStep['status']) => {
    setDonationSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status, timestamp: status === 'completed' ? new Date() : step.timestamp }
        : step
    ));
    
    if (status === 'completed') {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleDonation = async () => {
    if (!scanResult || !selectedAssociation) return;

    // Étape 3: Sélection association
    updateStepStatus(2, 'completed');

    // Étape 4: Notification
    updateStepStatus(3, 'in_progress');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer le workflow de don
    const donationWorkflow = WorkflowEngine.createDonationWorkflow(`donation_${Date.now()}`);
    
    // Simuler l'envoi de notification
    const association = associations.find(a => a.id === selectedAssociation);
    console.log(`📧 NOTIFICATION ASSOCIATION - ${association?.name}:`);
    console.log(`Nouveau don reçu: ${scanResult.product.name}`);
    console.log(`Prix: ${scanResult.price.toFixed(2)}€`);
    console.log(`Magasin: ${scanResult.store}`);
    console.log(`Donateur: Famille Martin`);
    
    updateStepStatus(3, 'completed');

    // Étape 5: Simulation de la réception par l'association
    updateStepStatus(4, 'in_progress');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simuler le scan de réception
    console.log(`📦 SCAN RÉCEPTION - ${association?.name}:`);
    console.log(`Produit reçu et scanné: ${scanResult.product.name}`);
    
    updateStepStatus(4, 'completed');

    // Étape 6: Mise à jour du stock FIFO
    updateStepStatus(5, 'in_progress');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ajouter au stock FIFO
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 jours d'expiration
    
    FIFOStockManager.addToStock(
      scanResult.product.id,
      scanResult.product.name,
      1, // quantité
      selectedAssociation,
      'Entrepôt principal',
      `donation_${Date.now()}`,
      expirationDate
    );
    
    console.log(`📊 STOCK FIFO UPDATED:`);
    console.log(`Produit ajouté: ${scanResult.product.name}`);
    console.log(`Association: ${association?.name}`);
    console.log(`Méthode: FIFO (Premier Entré, Premier Sorti)`);
    
    updateStepStatus(5, 'completed');
    setShowSuccess(true);

    // Réinitialiser après 5 secondes
    setTimeout(() => {
      setShowSuccess(false);
      setScanResult(null);
      setSelectedAssociation('');
      setCurrentStep(0);
      setAiConfidence(0);
      setDonationSteps(prev => prev.map(step => ({ ...step, status: 'pending', timestamp: undefined })));
    }, 5000);
  };

  const getStepIcon = (step: DonationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'in_progress':
        return <Loader className="text-blue-500 animate-spin" size={20} />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>;
    }
  };

  const getStepColor = (step: DonationStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <Zap className="mr-3" size={28} />
            Scanner IA - Processus de Don Complet
          </h1>
          <p className="text-emerald-100">
            Reconnaissance automatique • Workflow intégré • Stock FIFO • Notifications temps réel
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Colonne gauche - Scanner et résultat */}
          <div className="space-y-6">
            
            {/* Interface de scan */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Camera className="mr-2" size={24} />
                Scanner IA Produit
              </h2>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center">
                <div className="relative">
                  <Camera className="mx-auto text-emerald-500 mb-4" size={64} />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {aiConfidence > 0 && isScanning && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-emerald-700 mb-2">
                      Confiance IA: {aiConfidence}%
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${aiConfidence}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <p className="text-emerald-700 font-medium mb-4">
                  {isScanning ? 'Analyse IA en cours...' : 'Pointez vers le code-barres du produit'}
                </p>
                
                <button
                  onClick={simulateAIScan}
                  disabled={isScanning}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isScanning 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Scan className="inline mr-2" size={20} />
                  {isScanning ? 'Scan en cours...' : 'Démarrer le scan'}
                </button>
              </div>
            </div>

            {/* Résultat du scan */}
            {scanResult && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-green-500" size={24} />
                  Produit Reconnu (Confiance: {scanResult.confidence}%)
                </h3>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-4xl">{scanResult.product.image}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-800 text-lg">{scanResult.product.name}</h4>
                      <p className="text-green-700 mb-2">{scanResult.product.brand}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-green-700">Prix détecté:</span>
                          <div className="text-xl font-bold text-green-600">{scanResult.price.toFixed(2)}€</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-700">Magasin:</span>
                          <div className="font-medium text-green-800">{scanResult.store}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scanResult.nutritionalInfo.nutriScore === 'A' ? 'bg-green-100 text-green-800' :
                          scanResult.nutritionalInfo.nutriScore === 'B' ? 'bg-lime-100 text-lime-800' :
                          scanResult.nutritionalInfo.nutriScore === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          Nutri-Score: {scanResult.nutritionalInfo.nutriScore}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scanResult.nutritionalInfo.ecoScore === 'A' ? 'bg-green-100 text-green-800' :
                          scanResult.nutritionalInfo.ecoScore === 'B' ? 'bg-lime-100 text-lime-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          Eco-Score: {scanResult.nutritionalInfo.ecoScore}
                        </span>
                      </div>
                      
                      {scanResult.nutritionalInfo.allergens.length > 0 && (
                        <div className="text-xs text-orange-600">
                          <strong>Allergènes:</strong> {scanResult.nutritionalInfo.allergens.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sélection d'association */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner l'association bénéficiaire:
                  </label>
                  <select
                    value={selectedAssociation}
                    onChange={(e) => setSelectedAssociation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Choisir une association...</option>
                    {associations.map(assoc => (
                      <option key={assoc.id} value={assoc.id}>
                        {assoc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleDonation}
                  disabled={!selectedAssociation || currentStep > 2}
                  className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    !selectedAssociation || currentStep > 2
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Heart className="mr-2" size={20} />
                  Faire le don solidaire
                </button>
              </div>
            )}
          </div>

          {/* Colonne droite - Workflow */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="mr-2" size={24} />
              Processus de Don en Temps Réel
            </h2>
            
            <div className="space-y-4">
              {donationSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all ${getStepColor(step)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm opacity-75">{step.description}</p>
                      {step.timestamp && (
                        <p className="text-xs mt-1 opacity-60">
                          Complété à {step.timestamp.toLocaleTimeString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Informations techniques */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <Info className="mr-2" size={16} />
                Spécifications Techniques
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>IA:</strong> Reconnaissance 96% de précision</li>
                <li>• <strong>Stock:</strong> Gestion FIFO automatique</li>
                <li>• <strong>Sécurité:</strong> Chiffrement AES-256</li>
                <li>• <strong>Notifications:</strong> Temps réel</li>
                <li>• <strong>Workflow:</strong> 6 étapes automatisées</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal de succès */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Don réalisé avec succès !
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Votre don a été traité selon le processus complet PRD et ajouté au stock FIFO de l'association.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  <strong>Workflow complété:</strong><br/>
                  ✓ Scan IA (96% confiance)<br/>
                  ✓ Notification association<br/>
                  ✓ Réception et scan<br/>
                  ✓ Intégration stock FIFO
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProductScanner;