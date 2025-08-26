import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  Scan, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Maximize, 
  Minimize, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  Image, 
  FileText, 
  Info, 
  HelpCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (imageData: string, metadata: ScanMetadata) => void;
  userType: 'household' | 'association' | 'social_worker' | 'beneficiary';
  scanType: 'product' | 'qr_code' | 'document';
  title?: string;
  helpText?: string;
}

export interface ScanMetadata {
  timestamp: Date;
  scanType: string;
  confidence?: number;
  detectedText?: string;
  detectedBarcode?: string;
  detectedQRData?: string;
  userType: string;
}

const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  userType,
  scanType,
  title,
  helpText
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [showControls, setShowControls] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanQuality, setScanQuality] = useState<'low' | 'medium' | 'high' | 'excellent'>('medium');
  const [detectionBox, setDetectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Détermine le titre par défaut en fonction du type d'utilisateur et de scan
  const getDefaultTitle = () => {
    if (scanType === 'product') {
      return userType === 'household' ? 'Scanner un produit' : 'Scanner un produit en stock';
    } else if (scanType === 'qr_code') {
      return userType === 'association' ? 'Scanner un QR Code bénéficiaire' : 'Scanner un QR Code';
    } else {
      return 'Scanner un document';
    }
  };

  // Détermine le texte d'aide par défaut
  const getDefaultHelpText = () => {
    if (scanType === 'product') {
      return 'Placez le code-barres du produit dans la zone de scan et maintenez-le stable.';
    } else if (scanType === 'qr_code') {
      return 'Placez le QR code dans la zone de scan jusqu\'à ce qu\'il soit reconnu.';
    } else {
      return 'Placez le document à plat dans la zone de scan et assurez-vous qu\'il soit bien éclairé.';
    }
  };

  // Initialiser la caméra lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else if (stream) {
      stopCamera();
    }
    
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [isOpen]);

  // Mettre à jour la zone de détection lorsque la vidéo est chargée
  useEffect(() => {
    if (videoRef.current) {
      const updateDetectionZone = () => {
        const video = videoRef.current;
        if (!video) return;
        
        const rect = video.getBoundingClientRect();
        
        // Ajuster la taille de la zone de détection selon le type de scan
        let width, height;
        
        if (scanType === 'product') {
          // Zone rectangulaire horizontale pour les codes-barres
          width = rect.width * 0.8;
          height = rect.height * 0.3;
        } else if (scanType === 'qr_code') {
          // Zone carrée pour les QR codes
          width = rect.width * 0.6;
          height = rect.width * 0.6;
          if (height > rect.height * 0.8) {
            height = rect.height * 0.8;
            width = height;
          }
        } else {
          // Zone large pour les documents
          width = rect.width * 0.85;
          height = rect.height * 0.7;
        }
        
        const x = (rect.width - width) / 2;
        const y = (rect.height - height) / 2;
        
        setDetectionBox({ x, y, width, height });
      };
      
      updateDetectionZone();
      window.addEventListener('resize', updateDetectionZone);
      
      return () => {
        window.removeEventListener('resize', updateDetectionZone);
      };
    }
  }, [scanType, videoRef.current]);

  // Initialiser la caméra
  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Caméra arrière
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          advanced: [{ zoom: zoom / 100 }]
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions de votre navigateur.');
      onClose();
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capturer une image depuis la caméra
  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Définir les dimensions du canvas pour correspondre à la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image complète
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Appliquer des ajustements de luminosité si nécessaire
    if (brightness !== 100) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const factor = brightness / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * factor);         // R
        data[i + 1] = Math.min(255, data[i + 1] * factor); // G
        data[i + 2] = Math.min(255, data[i + 2] * factor); // B
      }
      
      context.putImageData(imageData, 0, 0);
    }
    
    // Retourner l'image en base64
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Simuler le processus de scan
  const performScan = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setScanMessage('Initialisation du scan...');
    
    // Jouer un son de démarrage si activé
    if (soundEnabled && audioRef.current) {
      playBeepSound();
    }
    
    // Simuler les étapes du processus de scan
    const scanSteps = getScanSteps();
    
    for (const step of scanSteps) {
      setScanProgress(step.progress);
      setScanMessage(step.message);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
    
    // Capturer l'image
    const imageData = captureImage();
    
    if (imageData) {
      // Jouer un son de succès
      if (soundEnabled && audioRef.current) {
        playSuccessSound();
      }
      
      // Générer des métadonnées simulées
      const metadata: ScanMetadata = {
        timestamp: new Date(),
        scanType,
        userType,
        confidence: Math.floor(Math.random() * 15) + 85, // 85-99%
      };
      
      // Ajouter des métadonnées spécifiques selon le type de scan
      if (scanType === 'product') {
        metadata.detectedBarcode = `978${Math.floor(Math.random() * 10000000000)}`;
      } else if (scanType === 'qr_code') {
        metadata.detectedQRData = `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      } else if (scanType === 'document') {
        metadata.detectedText = 'Document scanné avec succès';
      }
      
      // Attendre un peu avant de fermer pour montrer le succès
      setTimeout(() => {
        onScanComplete(imageData, metadata);
        setIsScanning(false);
        onClose();
      }, 1000);
    } else {
      // Gérer l'erreur
      setScanMessage('Erreur lors de la capture. Veuillez réessayer.');
      setScanProgress(0);
      setIsScanning(false);
      
      // Jouer un son d'erreur
      if (soundEnabled && audioRef.current) {
        playErrorSound();
      }
    }
  };

  // Obtenir les étapes de scan selon le type
  const getScanSteps = () => {
    if (scanType === 'product') {
      return [
        { progress: 10, message: 'Recherche du code-barres...', duration: 800 },
        { progress: 30, message: 'Code-barres détecté', duration: 600 },
        { progress: 50, message: 'Lecture des données...', duration: 700 },
        { progress: 70, message: 'Vérification du produit...', duration: 800 },
        { progress: 90, message: 'Finalisation...', duration: 500 },
        { progress: 100, message: 'Scan réussi !', duration: 500 }
      ];
    } else if (scanType === 'qr_code') {
      return [
        { progress: 15, message: 'Recherche du QR code...', duration: 700 },
        { progress: 40, message: 'QR code détecté', duration: 500 },
        { progress: 65, message: 'Décodage des données...', duration: 800 },
        { progress: 85, message: 'Vérification de validité...', duration: 600 },
        { progress: 100, message: 'QR code validé !', duration: 500 }
      ];
    } else {
      return [
        { progress: 10, message: 'Analyse du document...', duration: 600 },
        { progress: 25, message: 'Détection des contours...', duration: 700 },
        { progress: 45, message: 'Optimisation de l\'image...', duration: 800 },
        { progress: 65, message: 'Reconnaissance du texte...', duration: 900 },
        { progress: 85, message: 'Traitement final...', duration: 700 },
        { progress: 100, message: 'Document scanné !', duration: 500 }
      ];
    }
  };

  // Jouer un son de bip
  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  // Jouer un son de succès
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Premier bip (aigu)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.frequency.setValueAtTime(1200, audioContext.currentTime);
      gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.1);
      
      // Deuxième bip (plus aigu)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.setValueAtTime(1800, audioContext.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      osc2.start(audioContext.currentTime + 0.15);
      osc2.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  // Jouer un son d'erreur
  const playErrorSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Premier bip (grave)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.frequency.setValueAtTime(300, audioContext.currentTime);
      gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  // Basculer en mode plein écran
  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    
    if (!fullscreen) {
      if (modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen();
      } else if ((modalRef.current as any).webkitRequestFullscreen) {
        (modalRef.current as any).webkitRequestFullscreen();
      } else if ((modalRef.current as any).msRequestFullscreen) {
        (modalRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    
    setFullscreen(!fullscreen);
  };

  // Évaluer la qualité du scan en fonction de la luminosité et de la stabilité
  useEffect(() => {
    if (!isOpen || !videoRef.current || isScanning) return;
    
    const checkQuality = () => {
      // Simuler l'évaluation de la qualité
      const qualities = ['low', 'medium', 'high', 'excellent'] as const;
      const randomIndex = Math.floor(Math.random() * 4);
      setScanQuality(qualities[randomIndex]);
    };
    
    const interval = setInterval(checkQuality, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isOpen, isScanning]);

  // Surveiller les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Obtenir la couleur en fonction du type d'utilisateur
  const getUserTypeColor = () => {
    switch (userType) {
      case 'household': return 'from-emerald-600 to-teal-600';
      case 'association': return 'from-purple-600 to-indigo-600';
      case 'social_worker': return 'from-blue-600 to-indigo-600';
      case 'beneficiary': return 'from-orange-600 to-red-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  // Obtenir la couleur de la zone de détection
  const getDetectionBoxColor = () => {
    switch (userType) {
      case 'household': return 'border-emerald-400 bg-emerald-400/20';
      case 'association': return 'border-purple-400 bg-purple-400/20';
      case 'social_worker': return 'border-blue-400 bg-blue-400/20';
      case 'beneficiary': return 'border-orange-400 bg-orange-400/20';
      default: return 'border-gray-400 bg-gray-400/20';
    }
  };

  // Obtenir la couleur de la barre de progression
  const getProgressColor = () => {
    switch (userType) {
      case 'household': return 'bg-emerald-500';
      case 'association': return 'bg-purple-500';
      case 'social_worker': return 'bg-blue-500';
      case 'beneficiary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Obtenir la couleur du bouton principal
  const getButtonColor = () => {
    switch (userType) {
      case 'household': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'association': return 'bg-purple-600 hover:bg-purple-700';
      case 'social_worker': return 'bg-blue-600 hover:bg-blue-700';
      case 'beneficiary': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Obtenir l'icône et le texte pour la qualité du scan
  const getScanQualityInfo = () => {
    switch (scanQuality) {
      case 'low':
        return {
          icon: <AlertCircle size={14} className="text-red-500" />,
          text: 'Qualité faible',
          color: 'text-red-500 bg-red-100'
        };
      case 'medium':
        return {
          icon: <Info size={14} className="text-yellow-500" />,
          text: 'Qualité moyenne',
          color: 'text-yellow-500 bg-yellow-100'
        };
      case 'high':
        return {
          icon: <CheckCircle size={14} className="text-green-500" />,
          text: 'Bonne qualité',
          color: 'text-green-500 bg-green-100'
        };
      case 'excellent':
        return {
          icon: <CheckCircle size={14} className="text-emerald-500" />,
          text: 'Excellente qualité',
          color: 'text-emerald-500 bg-emerald-100'
        };
    }
  };

  if (!isOpen) return null;

  const qualityInfo = getScanQualityInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className={`bg-white rounded-xl overflow-hidden ${
          fullscreen ? 'fixed inset-0 rounded-none' : 'max-w-3xl w-full mx-4'
        }`}
      >
        {/* En-tête */}
        <div className={`bg-gradient-to-r ${getUserTypeColor()} text-white p-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center">
              <Camera className="mr-2" size={24} />
              {title || getDefaultTitle()}
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white/80 hover:text-white"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-white/80 hover:text-white"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white"
              >
                {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Aide contextuelle */}
        {showHelp && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Info className="mr-2" size={16} />
              Conseils pour un scan optimal
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Assurez-vous que le document est bien éclairé</li>
              <li>• Évitez les reflets et les ombres</li>
              <li>• Maintenez l'appareil stable pendant le scan</li>
              <li>• Centrez le document dans la zone de détection</li>
              <li>• Utilisez les contrôles de luminosité si nécessaire</li>
            </ul>
            <p className="text-sm text-blue-600 mt-2">
              {helpText || getDefaultHelpText()}
            </p>
          </div>
        )}
        
        {/* Zone de la caméra */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
            style={{ maxHeight: fullscreen ? 'calc(100vh - 200px)' : '60vh' }}
          />
          
          {/* Zone de détection */}
          <div 
            className={`absolute border-2 ${getDetectionBoxColor()} rounded-lg`}
            style={{
              left: detectionBox.x,
              top: detectionBox.y,
              width: detectionBox.width,
              height: detectionBox.height
            }}
          >
            {/* Coins de la zone de détection */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
          </div>
          
          {/* Indicateur de qualité */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs flex items-center space-x-1 bg-black/50 text-white">
            <div className={`px-2 py-1 rounded-full flex items-center ${qualityInfo.color}`}>
              {qualityInfo.icon}
              <span className="ml-1">{qualityInfo.text}</span>
            </div>
          </div>
          
          {/* Bouton pour afficher/masquer les contrôles */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="absolute bottom-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
          >
            {showControls ? <X size={20} /> : <Image size={20} />}
          </button>
          
          {/* Overlay de scan en cours */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader className="animate-spin mx-auto mb-4" size={48} />
                <div className="text-lg font-medium mb-2">{scanMessage}</div>
                <div className="w-64 bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm">{scanProgress}%</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Contrôles de l'image */}
        {showControls && (
          <div className="p-4 bg-gray-100 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Luminosité
                </label>
                <div className="flex items-center space-x-2">
                  <Moon size={16} className="text-gray-500" />
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Sun size={16} className="text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zoom
                </label>
                <div className="flex items-center space-x-2">
                  <ZoomOut size={16} className="text-gray-500" />
                  <input
                    type="range"
                    min="100"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <ZoomIn size={16} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={() => {
                  setBrightness(100);
                  setZoom(100);
                }}
                className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                <RotateCw size={14} className="mr-1" />
                Réinitialiser
              </button>
            </div>
          </div>
        )}
        
        {/* Bouton de scan */}
        <div className="p-4 flex justify-center">
          <button
            onClick={performScan}
            disabled={isScanning}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
              isScanning 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : getButtonColor() + ' text-white'
            }`}
          >
            {isScanning ? (
              <Loader className="animate-spin mr-2" size={20} />
            ) : (
              <Scan className="mr-2" size={20} />
            )}
            {isScanning ? 'Scan en cours...' : 'Scanner maintenant'}
          </button>
        </div>
        
        {/* Canvas caché pour le traitement d'image */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Audio pour les sons */}
        <audio ref={audioRef} />
      </div>
    </div>
  );
};

export default DocumentScannerModal;