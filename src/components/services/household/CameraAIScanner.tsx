import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Scan, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Heart, 
  MapPin, 
  Building, 
  Loader, 
  Zap, 
  Eye,
  Star,
  TrendingUp,
  Info,
  RotateCcw,
  Target,
  Crosshair,
  Focus,
  Maximize,
  RefreshCw,
  X,
  Check,
  ArrowLeft
} from 'lucide-react';
import DatabaseService, { Product, Association } from '../../../data/database';

interface LabelData {
  brand: string;
  product: string;
  price: number;
  weight: string;
  barcode: string;
  confidence: number;
}

interface ProductData {
  brand: string;
  product: string;
  weight: string;
  barcode: string;
  confidence: number;
}

interface MatchingResult {
  isValid: boolean;
  brandMatch: boolean;
  weightMatch: boolean;
  productMatch: boolean;
  barcodeMatch: boolean;
  confidence: number;
  finalProduct: Product;
  finalPrice: number;
}

interface CameraState {
  isActive: boolean;
  isScanning: boolean;
  currentCase: 1 | 2 | 3;
  step: 'label' | 'product' | 'validation' | 'completed';
}

const CameraAIScanner: React.FC = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isScanning: false,
    currentCase: 1,
    step: 'label'
  });
  
  const [labelData, setLabelData] = useState<LabelData | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectionZone, setDetectionZone] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [photos, setPhotos] = useState<{ label?: string; product?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const associations = DatabaseService.getAssociations();

  // Initialiser la caméra
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraState(prev => ({ ...prev, isActive: true }));
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      setErrorMessage('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraState(prev => ({ ...prev, isActive: false }));
  };

  // Capturer une photo
  const capturePhoto = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Simulation OCR pour extraire les données de l'étiquette
  const extractLabelData = async (imageData: string): Promise<LabelData> => {
    // Simulation de l'OCR avec Tesseract.js
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Données simulées basées sur les produits de la base
    const products = DatabaseService.getAllProductsWithPrices();
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const bestPrice = DatabaseService.getBestPriceForProduct(randomProduct.id);
    const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;

    return {
      brand: randomProduct.brand,
      product: randomProduct.name,
      price: price,
      weight: '500g', // Simulé
      barcode: randomProduct.barcode,
      confidence: 92 + Math.random() * 6 // 92-98%
    };
  };

  // Simulation OCR pour extraire les données du produit
  const extractProductData = async (imageData: string): Promise<ProductData> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Utiliser les mêmes données que l'étiquette avec de légères variations
    if (labelData) {
      return {
        brand: labelData.brand,
        product: labelData.product,
        weight: labelData.weight,
        barcode: labelData.barcode,
        confidence: 89 + Math.random() * 8 // 89-97%
      };
    }

    // Fallback
    const products = DatabaseService.getAllProductsWithPrices();
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    return {
      brand: randomProduct.brand,
      product: randomProduct.name,
      weight: '500g',
      barcode: randomProduct.barcode,
      confidence: 89 + Math.random() * 8
    };
  };

  // Vérifier la correspondance entre étiquette et produit
  const validateMatching = (label: LabelData, product: ProductData): MatchingResult => {
    const brandMatch = label.brand.toLowerCase() === product.brand.toLowerCase();
    const weightMatch = label.weight === product.weight;
    const productMatch = label.product.toLowerCase() === product.product.toLowerCase();
    const barcodeMatch = label.barcode === product.barcode;

    const isValid = brandMatch && weightMatch && productMatch && barcodeMatch;
    const confidence = (
      (brandMatch ? 25 : 0) +
      (weightMatch ? 25 : 0) +
      (productMatch ? 25 : 0) +
      (barcodeMatch ? 25 : 0)
    );

    // Trouver le produit correspondant dans la base
    const finalProduct = DatabaseService.getProductByBarcode(label.barcode) || 
                        DatabaseService.getAllProductsWithPrices()[0];

    return {
      isValid,
      brandMatch,
      weightMatch,
      productMatch,
      barcodeMatch,
      confidence,
      finalProduct,
      finalPrice: label.price
    };
  };

  // Cas 1: Reconnaissance d'étiquette en un seul scan
  const handleCase1 = async () => {
    setCameraState(prev => ({ ...prev, isScanning: true, currentCase: 1 }));
    setScanProgress(0);

    const photo = capturePhoto();
    if (!photo) return;

    // Progression de l'analyse
    for (let progress = 0; progress <= 100; progress += 10) {
      setScanProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      // Extraire les données de l'étiquette
      const labelResult = await extractLabelData(photo);
      setLabelData(labelResult);

      // Simuler l'analyse du produit dans la même image
      const productResult = await extractProductData(photo);
      setProductData(productResult);

      // Valider la correspondance
      const matching = validateMatching(labelResult, productResult);
      setMatchingResult(matching);

      setCameraState(prev => ({ ...prev, step: 'validation' }));
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setErrorMessage('Erreur lors de l\'analyse. Passage au cas 2.');
      handleCase2();
    } finally {
      setCameraState(prev => ({ ...prev, isScanning: false }));
    }
  };

  // Cas 2: Reconnaissance + vérification code-barres
  const handleCase2 = async () => {
    setCameraState(prev => ({ ...prev, isScanning: true, currentCase: 2 }));
    setScanProgress(0);

    const photo = capturePhoto();
    if (!photo) return;

    try {
      // Progression de l'analyse
      for (let progress = 0; progress <= 100; progress += 8) {
        setScanProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // Extraire les données avec vérification code-barres renforcée
      const labelResult = await extractLabelData(photo);
      setLabelData(labelResult);

      const productResult = await extractProductData(photo);
      setProductData(productResult);

      // Validation avec contrôle code-barres strict
      const matching = validateMatching(labelResult, productResult);
      
      // Renforcer la validation avec le code-barres
      if (!matching.barcodeMatch) {
        setErrorMessage('Code-barres non correspondant. Passage au cas 3.');
        handleCase3();
        return;
      }

      setMatchingResult(matching);
      setCameraState(prev => ({ ...prev, step: 'validation' }));
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setErrorMessage('Erreur lors de l\'analyse. Passage au cas 3.');
      handleCase3();
    } finally {
      setCameraState(prev => ({ ...prev, isScanning: false }));
    }
  };

  // Cas 3: Double photo séparée
  const handleCase3 = async () => {
    setCameraState(prev => ({ ...prev, currentCase: 3, step: 'label' }));
  };

  const captureForCase3 = async (type: 'label' | 'product') => {
    setCameraState(prev => ({ ...prev, isScanning: true }));
    setScanProgress(0);

    const photo = capturePhoto();
    if (!photo) return;

    setPhotos(prev => ({ ...prev, [type]: photo }));

    // Progression de l'analyse
    for (let progress = 0; progress <= 100; progress += 12) {
      setScanProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (type === 'label') {
      const labelResult = await extractLabelData(photo);
      setLabelData(labelResult);
      setCameraState(prev => ({ ...prev, step: 'product', isScanning: false }));
    } else {
      const productResult = await extractProductData(photo);
      setProductData(productResult);
      
      if (labelData) {
        const matching = validateMatching(labelData, productResult);
        setMatchingResult(matching);
        setCameraState(prev => ({ ...prev, step: 'validation', isScanning: false }));
      }
    }
  };

  const handleValidation = async () => {
    if (!matchingResult || !selectedAssociation) return;

    // Simuler l'envoi de notification
    const association = associations.find(a => a.id === selectedAssociation);
    console.log(`📧 NOTIFICATION ASSOCIATION - ${association?.name}:`);
    console.log(`Nouveau don reçu: ${matchingResult.finalProduct.name}`);
    console.log(`Prix: ${matchingResult.finalPrice.toFixed(2)}€`);
    console.log(`Donateur: Famille Martin`);

    setShowSuccess(true);
    setCameraState(prev => ({ ...prev, step: 'completed' }));

    // Réinitialiser après 3 secondes
    setTimeout(() => {
      resetScanner();
    }, 3000);
  };

  const resetScanner = () => {
    setLabelData(null);
    setProductData(null);
    setMatchingResult(null);
    setSelectedAssociation('');
    setShowSuccess(false);
    setScanProgress(0);
    setPhotos({});
    setErrorMessage(null);
    setCameraState({
      isActive: false,
      isScanning: false,
      currentCase: 1,
      step: 'label'
    });
    stopCamera();
  };

  // Zone de détection dynamique
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const updateDetectionZone = () => {
        const rect = video.getBoundingClientRect();
        setDetectionZone({
          x: rect.width * 0.1,
          y: rect.height * 0.3,
          width: rect.width * 0.8,
          height: rect.height * 0.4
        });
      };
      
      video.addEventListener('loadedmetadata', updateDetectionZone);
      window.addEventListener('resize', updateDetectionZone);
      
      return () => {
        video.removeEventListener('loadedmetadata', updateDetectionZone);
        window.removeEventListener('resize', updateDetectionZone);
      };
    }
  }, [cameraState.isActive]);

  // Nettoyer la caméra lors du démontage du composant
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <Camera className="mr-3" size={28} />
            Scanner IA Caméra - Reconnaissance Prix/Produit
          </h1>
          <p className="text-emerald-100">
            3 cas de figure • Détection 1mm-30cm • Validation automatique • Workflow complet
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {!cameraState.isActive ? (
          /* Interface de sélection du cas */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Choisissez le mode de reconnaissance
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Cas 1 */}
              <button
                onClick={() => {
                  initializeCamera();
                  setCameraState(prev => ({ ...prev, currentCase: 1 }));
                }}
                className="group p-6 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200">
                    <Target className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Cas 1: Scan Unique</h3>
                  <p className="text-sm text-gray-600">
                    Reconnaissance étiquette + produit en une seule photo
                  </p>
                  <div className="mt-3 text-xs text-emerald-600">
                    • Analyse simultanée<br/>
                    • Validation automatique<br/>
                    • Plus rapide
                  </div>
                </div>
              </button>

              {/* Cas 2 */}
              <button
                onClick={() => {
                  initializeCamera();
                  setCameraState(prev => ({ ...prev, currentCase: 2 }));
                }}
                className="group p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200">
                    <Scan className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Cas 2: Scan + Code-barres</h3>
                  <p className="text-sm text-gray-600">
                    Reconnaissance renforcée avec validation code-barres
                  </p>
                  <div className="mt-3 text-xs text-blue-600">
                    • Double vérification<br/>
                    • Sécurité renforcée<br/>
                    • Précision maximale
                  </div>
                </div>
              </button>

              {/* Cas 3 */}
              <button
                onClick={() => {
                  initializeCamera();
                  setCameraState(prev => ({ ...prev, currentCase: 3 }));
                }}
                className="group p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200">
                    <Package className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Cas 3: Double Photo</h3>
                  <p className="text-sm text-gray-600">
                    Photos séparées étiquette + produit avec validation manuelle
                  </p>
                  <div className="mt-3 text-xs text-purple-600">
                    • Contrôle total<br/>
                    • Validation manuelle<br/>
                    • Cas complexes
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Interface caméra active */
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Colonne gauche - Caméra */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Camera className="mr-2" size={24} />
                  Cas {cameraState.currentCase}: {
                    cameraState.currentCase === 1 ? 'Scan Unique' :
                    cameraState.currentCase === 2 ? 'Scan + Code-barres' :
                    'Double Photo'
                  }
                </h2>
                <button
                  onClick={resetScanner}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Interface caméra */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-80 object-cover"
                />
                
                {/* Zone de détection */}
                <div 
                  className="absolute border-2 border-emerald-400 bg-emerald-400/20"
                  style={{
                    left: detectionZone.x,
                    top: detectionZone.y,
                    width: detectionZone.width,
                    height: detectionZone.height
                  }}
                >
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs">
                    Zone de détection (1mm - 30cm)
                  </div>
                  
                  {/* Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Crosshair className="text-emerald-400" size={48} />
                  </div>
                </div>

                {/* Overlay de scan */}
                {cameraState.isScanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader className="animate-spin mx-auto mb-4" size={48} />
                      <div className="text-lg font-medium mb-2">Analyse IA en cours...</div>
                      <div className="w-64 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm mt-2">{scanProgress}%</div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded">
                  <div className="text-sm">
                    {cameraState.currentCase === 3 ? (
                      cameraState.step === 'label' ? 
                        '📋 Photographiez l\'ÉTIQUETTE PRIX du rayon' :
                        '📦 Photographiez l\'EMBALLAGE du produit'
                    ) : (
                      '🎯 Centrez l\'étiquette ET le produit dans la zone'
                    )}
                  </div>
                </div>
              </div>

              {/* Message d'erreur */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertTriangle className="inline mr-2" size={16} />
                  {errorMessage}
                </div>
              )}

              {/* Boutons de contrôle */}
              <div className="mt-4 flex justify-center space-x-4">
                {cameraState.currentCase === 3 ? (
                  <>
                    {cameraState.step === 'label' && (
                      <button
                        onClick={() => captureForCase3('label')}
                        disabled={cameraState.isScanning}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors flex items-center"
                      >
                        <Camera className="mr-2" size={20} />
                        Photo Étiquette
                      </button>
                    )}
                    {cameraState.step === 'product' && (
                      <button
                        onClick={() => captureForCase3('product')}
                        disabled={cameraState.isScanning}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
                      >
                        <Package className="mr-2" size={20} />
                        Photo Produit
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={cameraState.currentCase === 1 ? handleCase1 : handleCase2}
                    disabled={cameraState.isScanning}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors flex items-center"
                  >
                    <Scan className="mr-2" size={20} />
                    Scanner Maintenant
                  </button>
                )}
              </div>
            </div>

            {/* Colonne droite - Résultats */}
            <div className="space-y-6">
              
              {/* Photos capturées (Cas 3) */}
              {cameraState.currentCase === 3 && Object.keys(photos).length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Photos Capturées</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {photos.label && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Étiquette</div>
                        <img src={photos.label} alt="Étiquette" className="w-full h-32 object-cover rounded border" />
                      </div>
                    )}
                    {photos.product && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Produit</div>
                        <img src={photos.product} alt="Produit" className="w-full h-32 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Données extraites */}
              {labelData && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CheckCircle className="mr-2 text-green-500" size={24} />
                    Données Étiquette (Confiance: {labelData.confidence.toFixed(1)}%)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Marque:</span>
                      <div className="text-gray-900">{labelData.brand}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Produit:</span>
                      <div className="text-gray-900">{labelData.product}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Prix:</span>
                      <div className="text-green-600 font-bold">{labelData.price.toFixed(2)}€</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Poids:</span>
                      <div className="text-gray-900">{labelData.weight}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Code-barres:</span>
                      <div className="text-gray-900 font-mono text-xs">{labelData.barcode}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation du matching */}
              {matchingResult && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    {matchingResult.isValid ? (
                      <CheckCircle className="mr-2 text-green-500" size={24} />
                    ) : (
                      <AlertTriangle className="mr-2 text-red-500" size={24} />
                    )}
                    Validation Correspondance ({matchingResult.confidence}%)
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Marque', match: matchingResult.brandMatch },
                      { label: 'Poids', match: matchingResult.weightMatch },
                      { label: 'Produit', match: matchingResult.productMatch },
                      { label: 'Code-barres', match: matchingResult.barcodeMatch }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{item.label}:</span>
                        <div className="flex items-center">
                          {item.match ? (
                            <CheckCircle className="text-green-500" size={16} />
                          ) : (
                            <X className="text-red-500" size={16} />
                          )}
                          <span className={`ml-2 text-sm ${item.match ? 'text-green-600' : 'text-red-600'}`}>
                            {item.match ? 'Correspondant' : 'Non correspondant'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {matchingResult.isValid && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Validation Réussie</h4>
                      <p className="text-sm text-green-700">
                        Toutes les informations correspondent. Vous pouvez procéder au don.
                      </p>
                      
                      {/* Sélection d'association */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Association bénéficiaire:
                        </label>
                        <select
                          value={selectedAssociation}
                          onChange={(e) => setSelectedAssociation(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
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
                        onClick={handleValidation}
                        disabled={!selectedAssociation}
                        className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                          !selectedAssociation
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <Heart className="mr-2" size={20} />
                        Valider et Faire le Don
                      </button>
                    </div>
                  )}

                  {!matchingResult.isValid && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">❌ Validation Échouée</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Les informations ne correspondent pas. Veuillez reprendre le scan.
                      </p>
                      <button
                        onClick={resetScanner}
                        className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <RefreshCw className="inline mr-2" size={16} />
                        Recommencer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de succès */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Don Validé avec Succès !
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Le produit a été reconnu et ajouté au stock FIFO de l'association.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  <strong>Cas {cameraState.currentCase} complété:</strong><br/>
                  ✓ Reconnaissance IA réussie<br/>
                  ✓ Validation des correspondances<br/>
                  ✓ Intégration stock FIFO
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraAIScanner;