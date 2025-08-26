// Scanner classique avec simulation OCR pour reconnaissance de prix
export interface PriceDetectionResult {
  price: number;
  currency: string;
  confidence: number;
  ocrText: string;
  detectedAt: Date;
  processingTime: number;
}

export interface BarcodeDetectionResult {
  barcode: string;
  format: 'EAN13' | 'EAN8' | 'UPC' | 'CODE128';
  confidence: number;
  detectedAt: Date;
}

export interface ClassicScanResult {
  barcode: BarcodeDetectionResult | null;
  price: PriceDetectionResult | null;
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
  processingTime: number;
  recommendations: string[];
}

export class ClassicScanner {
  private scanHistory: ClassicScanResult[] = [];
  private priceDatabase: Map<string, any> = new Map();

  constructor() {
    this.initializePriceDatabase();
  }

  private initializePriceDatabase() {
    // Base de données simulée de prix par magasin
    const priceData = [
      { barcode: '3560070123456', prices: { 'Carrefour': 2.99, 'Leclerc': 2.79, 'Auchan': 3.19 } },
      { barcode: '3560070123461', prices: { 'Carrefour': 1.15, 'Leclerc': 1.09, 'Auchan': 1.19 } },
      { barcode: '3560070123465', prices: { 'Carrefour': 3.29, 'Leclerc': 2.99, 'Auchan': 3.49 } },
      { barcode: '3560070123466', prices: { 'Carrefour': 1.89, 'Leclerc': 1.69, 'Auchan': 1.99 } },
      { barcode: '3560070123462', prices: { 'Carrefour': 2.89, 'Leclerc': 2.69, 'Auchan': 2.99 } },
      { barcode: '3560070123467', prices: { 'Carrefour': 2.19, 'Leclerc': 1.99, 'Auchan': 2.29 } }
    ];

    priceData.forEach(item => {
      this.priceDatabase.set(item.barcode, item.prices);
    });
  }

  // Simulation de la reconnaissance de code-barres
  async simulateBarcodeDetection(imageData: string): Promise<BarcodeDetectionResult | null> {
    // Simuler le temps de traitement
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    // 95% de chance de détecter un code-barres
    if (Math.random() > 0.05) {
      const barcodes = Array.from(this.priceDatabase.keys());
      const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];

      return {
        barcode: randomBarcode,
        format: 'EAN13',
        confidence: 95 + Math.random() * 5, // 95-100%
        detectedAt: new Date()
      };
    }

    return null;
  }

  // Simulation de l'OCR pour détecter le prix
  async simulateOCRPriceDetection(imageData: string, barcode?: string): Promise<PriceDetectionResult | null> {
    // Simuler le temps de traitement OCR
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    // 90% de chance de détecter un prix
    if (Math.random() > 0.10) {
      let price: number;
      let ocrText: string;

      if (barcode && this.priceDatabase.has(barcode)) {
        // Utiliser un prix réaliste basé sur le code-barres
        const prices = this.priceDatabase.get(barcode);
        const stores = Object.keys(prices);
        const randomStore = stores[Math.floor(Math.random() * stores.length)];
        price = prices[randomStore];
        
        // Ajouter une petite variation pour simuler les différences de prix
        const variation = (Math.random() - 0.5) * 0.4; // ±0.20€
        price = Math.max(0.1, price + variation);
        price = Math.round(price * 100) / 100; // Arrondir à 2 décimales
      } else {
        // Prix aléatoire si pas de correspondance
        price = Math.round((Math.random() * 15 + 0.5) * 100) / 100;
      }

      // Simuler différents formats d'étiquettes OCR
      const formats = [
        `${price.toFixed(2)}€`,
        `${price.toFixed(2)} €`,
        `€ ${price.toFixed(2)}`,
        `${price.toString().replace('.', ',')}€`,
        `PRIX: ${price.toFixed(2)}€`
      ];
      
      ocrText = formats[Math.floor(Math.random() * formats.length)];

      return {
        price,
        currency: 'EUR',
        confidence: 85 + Math.random() * 12, // 85-97%
        ocrText,
        detectedAt: new Date(),
        processingTime: 1200 + Math.random() * 800
      };
    }

    return null;
  }

  // Analyser la qualité de l'image
  private analyzeImageQuality(imageData: string): 'excellent' | 'good' | 'fair' | 'poor' {
    // Simulation basée sur la taille de l'image et d'autres facteurs
    const qualities = ['excellent', 'good', 'fair', 'poor'] as const;
    const weights = [0.3, 0.4, 0.25, 0.05]; // Probabilités pondérées
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < qualities.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return qualities[i];
      }
    }
    
    return 'good';
  }

  // Générer des recommandations basées sur les résultats
  private generateRecommendations(
    barcode: BarcodeDetectionResult | null,
    price: PriceDetectionResult | null,
    imageQuality: string
  ): string[] {
    const recommendations: string[] = [];

    if (imageQuality === 'poor') {
      recommendations.push('Améliorer l\'éclairage pour une meilleure reconnaissance');
    }

    if (!barcode) {
      recommendations.push('Centrer le code-barres dans l\'image');
    } else if (barcode.confidence < 95) {
      recommendations.push('Maintenir l\'appareil plus stable lors du scan');
    }

    if (!price) {
      recommendations.push('S\'assurer que l\'étiquette de prix est visible et lisible');
    } else if (price.confidence < 90) {
      recommendations.push('Améliorer la netteté de l\'étiquette de prix');
    }

    if (barcode && price && imageQuality === 'excellent') {
      recommendations.push('Scan parfait ! Code-barres et prix détectés avec succès.');
    }

    if (barcode && price && barcode.confidence > 95 && price.confidence > 90) {
      recommendations.push('Excellente qualité de scan - données fiables');
    }

    return recommendations;
  }

  // Processus principal de scan classique
  async processClassicScan(imageData: string): Promise<ClassicScanResult> {
    const startTime = Date.now();
    
    // Analyser la qualité de l'image
    const imageQuality = this.analyzeImageQuality(imageData);

    // Étape 1: Détecter le code-barres
    const barcodeResult = await this.simulateBarcodeDetection(imageData);
    
    // Étape 2: Détecter le prix avec OCR (utiliser le code-barres si disponible)
    const priceResult = await this.simulateOCRPriceDetection(imageData, barcodeResult?.barcode);

    const processingTime = Date.now() - startTime;

    // Générer des recommandations
    const recommendations = this.generateRecommendations(barcodeResult, priceResult, imageQuality);

    const result: ClassicScanResult = {
      barcode: barcodeResult,
      price: priceResult,
      imageQuality,
      processingTime,
      recommendations
    };

    // Ajouter à l'historique
    this.scanHistory.push(result);

    return result;
  }

  // Méthodes utilitaires
  getScanHistory(): ClassicScanResult[] {
    return this.scanHistory;
  }

  clearHistory(): void {
    this.scanHistory = [];
  }

  // Validation des résultats de scan
  validateScanResult(result: ClassicScanResult): {
    isValid: boolean;
    confidence: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let totalConfidence = 0;
    let detectionCount = 0;

    if (result.barcode) {
      totalConfidence += result.barcode.confidence;
      detectionCount++;
    } else {
      issues.push('Code-barres non détecté');
    }

    if (result.price) {
      totalConfidence += result.price.confidence;
      detectionCount++;
    } else {
      issues.push('Prix non détecté');
    }

    const averageConfidence = detectionCount > 0 ? totalConfidence / detectionCount : 0;
    const isValid = detectionCount >= 1 && averageConfidence >= 80;

    return {
      isValid,
      confidence: averageConfidence,
      issues
    };
  }

  // Obtenir le prix pour un code-barres donné
  getPriceForBarcode(barcode: string, storeName: string): number | null {
    const prices = this.priceDatabase.get(barcode);
    if (prices && prices[storeName]) {
      return prices[storeName];
    }
    return null;
  }

  // Obtenir tous les magasins disponibles pour un code-barres
  getAvailableStoresForBarcode(barcode: string): string[] {
    const prices = this.priceDatabase.get(barcode);
    return prices ? Object.keys(prices) : [];
  }
}

export default ClassicScanner;