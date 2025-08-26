// Système de reconnaissance d'image IA pour produits et prix
export interface ProductDetectionResult {
  productId: string;
  productName: string;
  brand: string;
  category: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PriceDetectionResult {
  price: number;
  currency: string;
  confidence: number;
  ocrText: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface BarcodeDetectionResult {
  barcode: string;
  format: 'EAN13' | 'EAN8' | 'UPC' | 'CODE128';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AIRecognitionResult {
  product: ProductDetectionResult | null;
  price: PriceDetectionResult | null;
  barcode: BarcodeDetectionResult | null;
  processingTime: number;
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export class AIImageRecognition {
  private productDatabase: Map<string, any> = new Map();
  private processingHistory: AIRecognitionResult[] = [];

  constructor() {
    this.initializeProductDatabase();
  }

  private initializeProductDatabase() {
    // Base de données simulée de produits avec patterns de reconnaissance
    const products = [
      {
        id: 'prod_001',
        name: 'Pommes Golden',
        brand: 'Carrefour Bio',
        category: 'fruits-legumes',
        patterns: ['pomme', 'golden', 'bio', 'fruit'],
        barcodes: ['3560070123456'],
        priceRange: { min: 2.50, max: 3.50 }
      },
      {
        id: 'prod_002',
        name: 'Lait demi-écrémé 1L',
        brand: 'Lactel',
        category: 'produits-laitiers',
        patterns: ['lait', 'lactel', 'demi', 'écrémé'],
        barcodes: ['3560070123461'],
        priceRange: { min: 1.00, max: 1.50 }
      },
      {
        id: 'prod_003',
        name: 'Pâtes spaghetti',
        brand: 'Barilla',
        category: 'feculents',
        patterns: ['pâtes', 'spaghetti', 'barilla'],
        barcodes: ['3560070123466'],
        priceRange: { min: 1.50, max: 2.50 }
      },
      {
        id: 'prod_004',
        name: 'Yaourts nature x8',
        brand: 'Danone',
        category: 'produits-laitiers',
        patterns: ['yaourt', 'nature', 'danone'],
        barcodes: ['3560070123462'],
        priceRange: { min: 2.50, max: 3.50 }
      },
      {
        id: 'prod_005',
        name: 'Riz basmati 1kg',
        brand: 'Uncle Ben\'s',
        category: 'feculents',
        patterns: ['riz', 'basmati', 'uncle', 'ben'],
        barcodes: ['3560070123465'],
        priceRange: { min: 2.80, max: 3.80 }
      }
    ];

    products.forEach(product => {
      this.productDatabase.set(product.id, product);
    });
  }

  // Analyser une image et détecter produit, prix et code-barres
  async processImage(imageData: string): Promise<AIRecognitionResult> {
    const startTime = Date.now();
    
    // Simuler le temps de traitement IA
    await this.simulateProcessingDelay();

    // Analyser la qualité de l'image
    const imageQuality = this.analyzeImageQuality(imageData);

    // Détecter le produit
    const productResult = await this.detectProduct(imageData);
    
    // Détecter le prix
    const priceResult = await this.detectPrice(imageData);
    
    // Détecter le code-barres
    const barcodeResult = await this.detectBarcode(imageData);

    const processingTime = Date.now() - startTime;

    // Générer des recommandations
    const recommendations = this.generateRecommendations(productResult, priceResult, barcodeResult, imageQuality);

    const result: AIRecognitionResult = {
      product: productResult,
      price: priceResult,
      barcode: barcodeResult,
      processingTime,
      imageQuality,
      recommendations
    };

    // Ajouter à l'historique
    this.processingHistory.push(result);

    return result;
  }

  private async simulateProcessingDelay(): Promise<void> {
    // Simuler le temps de traitement réaliste de l'IA
    const delay = Math.random() * 2000 + 1000; // 1-3 secondes
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private analyzeImageQuality(imageData: string): 'excellent' | 'good' | 'fair' | 'poor' {
    // Simuler l'analyse de qualité basée sur la taille et la clarté
    const qualities = ['excellent', 'good', 'fair', 'poor'] as const;
    const weights = [0.4, 0.35, 0.2, 0.05]; // Probabilités pondérées
    
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

  private async detectProduct(imageData: string): Promise<ProductDetectionResult | null> {
    // Simuler la détection de produit avec IA
    await new Promise(resolve => setTimeout(resolve, 800));

    // Sélectionner un produit aléatoire de la base
    const products = Array.from(this.productDatabase.values());
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    if (Math.random() > 0.1) { // 90% de chance de détecter un produit
      return {
        productId: randomProduct.id,
        productName: randomProduct.name,
        brand: randomProduct.brand,
        category: randomProduct.category,
        confidence: Math.random() * 15 + 85, // 85-100%
        boundingBox: {
          x: Math.random() * 100 + 50,
          y: Math.random() * 100 + 50,
          width: Math.random() * 200 + 150,
          height: Math.random() * 200 + 150
        }
      };
    }

    return null;
  }

  private async detectPrice(imageData: string): Promise<PriceDetectionResult | null> {
    // Simuler la détection de prix avec OCR
    await new Promise(resolve => setTimeout(resolve, 600));

    if (Math.random() > 0.15) { // 85% de chance de détecter un prix
      const price = Math.random() * 10 + 1; // 1-11€
      const roundedPrice = Math.round(price * 100) / 100;

      return {
        price: roundedPrice,
        currency: 'EUR',
        confidence: Math.random() * 20 + 80, // 80-100%
        ocrText: `${roundedPrice.toFixed(2)}€`,
        boundingBox: {
          x: Math.random() * 150 + 200,
          y: Math.random() * 50 + 300,
          width: Math.random() * 100 + 80,
          height: Math.random() * 30 + 25
        }
      };
    }

    return null;
  }

  private async detectBarcode(imageData: string): Promise<BarcodeDetectionResult | null> {
    // Simuler la détection de code-barres
    await new Promise(resolve => setTimeout(resolve, 400));

    if (Math.random() > 0.2) { // 80% de chance de détecter un code-barres
      // Générer un code-barres EAN13 valide
      const barcode = this.generateEAN13();

      return {
        barcode,
        format: 'EAN13',
        confidence: Math.random() * 10 + 90, // 90-100%
        boundingBox: {
          x: Math.random() * 100 + 400,
          y: Math.random() * 50 + 100,
          width: Math.random() * 150 + 120,
          height: Math.random() * 40 + 30
        }
      };
    }

    return null;
  }

  private generateEAN13(): string {
    // Générer un code-barres EAN13 valide
    const prefix = '356007012';
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = prefix + randomDigits;
    
    // Calculer la clé de contrôle
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return code + checkDigit;
  }

  private generateRecommendations(
    product: ProductDetectionResult | null,
    price: PriceDetectionResult | null,
    barcode: BarcodeDetectionResult | null,
    imageQuality: string
  ): string[] {
    const recommendations: string[] = [];

    if (imageQuality === 'poor') {
      recommendations.push('Améliorer l\'éclairage pour une meilleure reconnaissance');
    }

    if (!product) {
      recommendations.push('Centrer le produit dans l\'image pour améliorer la détection');
    } else if (product.confidence < 90) {
      recommendations.push('Prendre une photo plus nette du produit');
    }

    if (!price) {
      recommendations.push('S\'assurer que l\'étiquette de prix est visible et lisible');
    } else if (price.confidence < 85) {
      recommendations.push('Améliorer la netteté de l\'étiquette de prix');
    }

    if (!barcode) {
      recommendations.push('Inclure le code-barres dans l\'image si possible');
    }

    if (product && price && barcode && imageQuality === 'excellent') {
      recommendations.push('Reconnaissance parfaite ! Tous les éléments ont été détectés.');
    }

    return recommendations;
  }

  // Méthodes utilitaires pour l'interface
  getProcessingHistory(): AIRecognitionResult[] {
    return this.processingHistory;
  }

  clearHistory(): void {
    this.processingHistory = [];
  }

  getProductDatabase(): Map<string, any> {
    return this.productDatabase;
  }

  // Validation croisée produit-prix-barcode
  validateDetection(result: AIRecognitionResult): {
    isValid: boolean;
    confidence: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let totalConfidence = 0;
    let detectionCount = 0;

    if (result.product) {
      totalConfidence += result.product.confidence;
      detectionCount++;
    } else {
      issues.push('Produit non détecté');
    }

    if (result.price) {
      totalConfidence += result.price.confidence;
      detectionCount++;
    } else {
      issues.push('Prix non détecté');
    }

    if (result.barcode) {
      totalConfidence += result.barcode.confidence;
      detectionCount++;
    } else {
      issues.push('Code-barres non détecté');
    }

    const averageConfidence = detectionCount > 0 ? totalConfidence / detectionCount : 0;
    const isValid = detectionCount >= 2 && averageConfidence >= 80;

    return {
      isValid,
      confidence: averageConfidence,
      issues
    };
  }
}

export default AIImageRecognition;