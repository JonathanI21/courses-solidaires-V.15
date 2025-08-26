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
  Target, 
  Eye,
  Star,
  TrendingUp,
  Info,
  RotateCcw,
  Crosshair,
  Focus,
  Maximize,
  RefreshCw,
  X,
  Check,
  ArrowLeft,
  Download,
  BarChart3,
  Clock,
  Lightbulb,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import ClassicScanner, { ClassicScanResult } from '../../../utils/classicScanner';
import DatabaseService from '../../../data/database';

interface ClassicBarcodeScannerProps {
  onBack?: () => void;
}

const ClassicBarcodeScanner: React.FC<ClassicBarcodeScannerProps> = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ClassicScanResult | null>(null);
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageQuality, setImageQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const classicScanner = useRef(new ClassicScanner());

  const associations = DatabaseService.getAssociations();

  // Initialiser la caméra
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
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

  // Simuler le processus de scan classique
  const performClassicScan = async () => {
    if (!cameraActive) {
      await initializeCamera();
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setProcessingProgress(0);

    try {
      // Capturer l'image
      const imageData = capturePhoto();
      if (!imageData) {
        throw new Error('Impossible de capturer l\'image');
      }

      // Étapes de traitement avec progression
      const steps = [
        { name: 'Capture de l\'image', duration: 300 },
        { name: 'Prétraitement de l\'image', duration: 600 },
        { name: 'Détection du code-barres', duration: 1000 },
        { name: 'Reconnaissance OCR du prix', duration: 1400 },
        { name: 'Validation des données', duration: 500 },
        { name: 'Finalisation', duration: 200 }
      ];

      let currentProgress = 0;
      const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

      for (const step of steps) {
        setProcessingStep(step.name);
        
        // Progression graduelle pendant l'étape
        const stepStart = currentProgress;
        const stepEnd = currentProgress + (step.duration / totalDuration) * 100;
        
        const progressInterval = setInterval(() => {
          setProcessingProgress(prev => {
            const newProgress = prev + 1.5;
            return newProgress > stepEnd ? stepEnd : newProgress;
          });
        }, 30);

        await new Promise(resolve => setTimeout(resolve, step.duration));
        clearInterval(progressInterval);
        
        currentProgress = stepEnd;
        setProcessingProgress(stepEnd);
      }

      // Traitement avec le scanner classique
      const result = await classicScanner.current.processClassicScan(imageData);
      setScanResult(result);

      setProcessingProgress(100);
      setProcessingStep('Scan terminé');

      // Jouer un son de succès si activé
      if (soundEnabled) {
        playSuccessSound();
      }

    } catch (error) {
      console.error('Erreur lors du scan:', error);
      alert('Erreur lors du scan classique');
      
      if (soundEnabled) {
        playErrorSound();
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Gérer la validation et le don
  const handleValidateAndDonate = async () => {
    if (!scanResult || !selectedAssociation) return;

    const association = associations.find(a => a.id === selectedAssociation);
    if (!association) return;

    // Simuler l'envoi de notification
    console.log(`📧 NOTIFICATION ASSOCIATION - ${association.name}:`);
    console.log(`Nouveau don reçu via Scanner Classique:`);
    if (scanResult.barcode) {
      console.log(`Code-barres: ${scanResult.barcode.barcode}`);
      console.log(`Confiance: ${scanResult.barcode.confidence.toFixed(1)}%`);
    }
    if (scanResult.price) {
      console.log(`Prix détecté: ${scanResult.price.price.toFixed(2)}€`);
      console.log(`OCR: "${scanResult.price.ocrText}"`);
      console.log(`Confiance: ${scanResult.price.confidence.toFixed(1)}%`);
    }
    console.log(`Donateur: Famille Martin`);
    console.log(`Qualité image: ${scanResult.imageQuality}`);
    console.log(`Temps de traitement: ${scanResult.processingTime}ms`);

    setShowSuccess(true);

    // Réinitialiser après 3 secondes
    setTimeout(() => {
      resetScanner();
    }, 3000);
  };

  const resetScanner = () => {
    setScanResult(null);
    setSelectedAssociation('');
    setShowSuccess(false);
    setProcessingProgress(0);
    setProcessingStep('');
    stopCamera();
  };

  // Sons de feedback
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Double bip de succès
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.frequency.setValueAtTime(1000, audioContext.currentTime);
      gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.1);
      
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.setValueAtTime(1500, audioContext.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      osc2.start(audioContext.currentTime + 0.15);
      osc2.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  const playErrorSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(400, audioContext.currentTime);
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 85) return 'text-blue-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center text-white/80 hover:text-white mr-4 transition-colors"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Retour
                </button>
              )}
              <div className="flex items-center">
                <Scan className="mr-3" size={28} />
                <div>
                  <h1 className="text-2xl font-bold">Scanner Classique - Code-barres + OCR Prix</h1>
                  <p className="text-emerald-100">
                    Lecture code-barres • OCR étiquettes • Validation croisée
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              <div className="text-right text-sm">
                <div className="font-medium">Précision OCR: 92.3%</div>
                <div className="text-emerald-200">Temps moyen: 1.8s</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Colonne gauche - Interface caméra */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Camera className="mr-2" size={24} />
              Scanner Classique avec Caméra
            </h2>

            {!cameraActive ? (
              /* Interface d'activation */
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center">
                <Camera className="mx-auto text-emerald-500 mb-4" size={64} />
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                  Activer la caméra classique
                </h3>
                <p className="text-emerald-700 mb-6">
                  Scanner traditionnel pour codes-barres et reconnaissance OCR des prix
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                  <div className="bg-white border border-emerald-200 rounded-lg p-3">
                    <Scan className="mx-auto text-emerald-600 mb-2" size={20} />
                    <div className="font-medium text-emerald-800">Code-barres</div>
                    <div className="text-emerald-600">Lecture traditionnelle</div>
                  </div>
                  <div className="bg-white border border-emerald-200 rounded-lg p-3">
                    <Target className="mx-auto text-emerald-600 mb-2" size={20} />
                    <div className="font-medium text-emerald-800">Prix OCR</div>
                    <div className="text-emerald-600">Reconnaissance texte</div>
                  </div>
                </div>
                
                <button
                  onClick={initializeCamera}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <Camera className="inline mr-2" size={20} />
                  Activer la caméra
                </button>
              </div>
            ) : (
              /* Interface caméra active */
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-80 object-cover"
                  />
                  
                  {/* Zone de scan pour code-barres */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-emerald-400 bg-emerald-400/20 rounded-lg p-4">
                      <div className="w-64 h-16 border-2 border-dashed border-white/60 rounded flex items-center justify-center">
                        <Crosshair className="text-white" size={32} />
                      </div>
                      <div className="text-center mt-2 text-white text-sm font-medium">
                        Zone de scan code-barres
                      </div>
                    </div>
                  </div>

                  {/* Overlay de traitement */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader className="animate-spin mx-auto mb-4" size={48} />
                        <div className="text-lg font-medium mb-2">{processingStep}</div>
                        <div className="w-64 bg-gray-700 rounded-full h-3 mb-2">
                          <div 
                            className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm">{processingProgress.toFixed(0)}%</div>
                      </div>
                    </div>
                  )}

                  {/* Indicateur de qualité */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(imageQuality)}`}>
                      Qualité: {imageQuality}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={performClassicScan}
                    disabled={isScanning}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                      isScanning 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isScanning ? (
                      <Loader className="animate-spin mr-2" size={20} />
                    ) : (
                      <Scan className="mr-2" size={20} />
                    )}
                    {isScanning ? 'Scan en cours...' : 'Scanner maintenant'}
                  </button>
                  
                  <button
                    onClick={resetScanner}
                    className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Résultats */}
          <div className="space-y-6">
            
            {/* Résultats de scan */}
            {scanResult && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-green-500" size={24} />
                  Résultats du Scanner Classique
                </h3>
                
                <div className="space-y-4">
                  {/* Code-barres détecté */}
                  {scanResult.barcode ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-800 mb-2 flex items-center">
                        <Scan className="mr-2" size={18} />
                        Code-barres Détecté
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Code:</strong> {scanResult.barcode.barcode}</div>
                        <div><strong>Format:</strong> {scanResult.barcode.format}</div>
                        <div className="flex items-center">
                          <strong>Confiance:</strong>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(scanResult.barcode.confidence)}`}>
                            {scanResult.barcode.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                        <AlertTriangle className="mr-2" size={18} />
                        Code-barres Non Détecté
                      </h4>
                      <p className="text-sm text-red-700">Code-barres non visible ou illisible</p>
                    </div>
                  )}

                  {/* Prix détecté */}
                  {scanResult.price ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <Target className="mr-2" size={18} />
                        Prix Détecté (OCR)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Prix:</strong> {scanResult.price.price.toFixed(2)}€</div>
                        <div><strong>Texte OCR:</strong> "{scanResult.price.ocrText}"</div>
                        <div><strong>Temps OCR:</strong> {scanResult.price.processingTime}ms</div>
                        <div className="flex items-center">
                          <strong>Confiance:</strong>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(scanResult.price.confidence)}`}>
                            {scanResult.price.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                        <AlertTriangle className="mr-2" size={18} />
                        Prix Non Détecté
                      </h4>
                      <p className="text-sm text-red-700">Impossible de lire le prix sur l'étiquette</p>
                    </div>
                  )}
                </div>

                {/* Recommandations */}
                {scanResult.recommendations.length > 0 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <Lightbulb className="mr-2" size={18} />
                      Recommandations
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {scanResult.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Validation et don */}
                {(scanResult.barcode || scanResult.price) && (
                  <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-3">Faire un don solidaire</h4>
                    
                    <div className="mb-4">
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
                      onClick={handleValidateAndDonate}
                      disabled={!selectedAssociation}
                      className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
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
              </div>
            )}

            {/* Métriques de performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Métriques Scanner Classique
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-emerald-800">Temps de traitement</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {scanResult ? `${scanResult.processingTime}ms` : '---'}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Qualité image</div>
                  <div className={`text-lg font-bold ${getQualityColor(scanResult?.imageQuality || 'good').split(' ')[0]}`}>
                    {scanResult?.imageQuality || 'En attente'}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">Éléments détectés</div>
                  <div className="text-lg font-bold text-purple-600">
                    {scanResult ? 
                      [scanResult.barcode, scanResult.price].filter(Boolean).length + '/2' : 
                      '0/2'
                    }
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">Confiance moyenne</div>
                  <div className="text-lg font-bold text-orange-600">
                    {scanResult ? (() => {
                      const confidences = [
                        scanResult.barcode?.confidence,
                        scanResult.price?.confidence
                      ].filter(Boolean) as number[];
                      const avg = confidences.length > 0 ? 
                        confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0;
                      return avg.toFixed(1) + '%';
                    })() : '---'}
                  </div>
                </div>
              </div>

              {/* Historique des scans */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Clock className="mr-2" size={16} />
                  Historique des scans
                </h4>
                <div className="text-sm text-gray-600">
                  <div>Total scans: {classicScanner.current.getScanHistory().length}</div>
                  <div>Scans réussis: {classicScanner.current.getScanHistory().filter(s => s.barcode || s.price).length}</div>
                </div>
              </div>
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
                  Scan Classique Réussi !
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Le produit a été scanné et le don a été envoyé à l'association.
                </p>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
                  <strong>Scanner Classique activé:</strong><br/>
                  ✓ Lecture code-barres traditionnelle<br/>
                  ✓ OCR prix sur étiquettes<br/>
                  ✓ Validation croisée<br/>
                  ✓ Don solidaire envoyé
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

export default ClassicBarcodeScanner;