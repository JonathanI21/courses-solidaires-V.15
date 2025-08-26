// Système de gestion des stocks FIFO (Premier Entré, Premier Sorti)
export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  entryDate: Date;
  expirationDate?: Date;
  donationId?: string;
  location: string;
  associationId: string;
  status: 'available' | 'reserved' | 'distributed' | 'expired';
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: 'entry' | 'exit' | 'transfer' | 'expiry';
  quantity: number;
  timestamp: Date;
  reason: string;
  operatorId: string;
  operatorName: string;
}

export class FIFOStockManager {
  private static stockItems: StockItem[] = [];
  private static movements: StockMovement[] = [];

  // Ajouter un produit au stock (entrée)
  static addToStock(
    productId: string,
    productName: string,
    quantity: number,
    associationId: string,
    location: string,
    donationId?: string,
    expirationDate?: Date
  ): StockItem {
    const stockItem: StockItem = {
      id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      productName,
      quantity,
      entryDate: new Date(),
      expirationDate,
      donationId,
      location,
      associationId,
      status: 'available'
    };

    this.stockItems.push(stockItem);

    // Enregistrer le mouvement
    this.recordMovement(stockItem.id, 'entry', quantity, 'Réception don', 'system', 'Système automatique');

    return stockItem;
  }

  // Retirer du stock selon FIFO
  static removeFromStock(
    productId: string,
    quantityNeeded: number,
    associationId: string,
    operatorId: string,
    operatorName: string,
    reason: string = 'Distribution'
  ): { success: boolean; items: StockItem[]; totalQuantity: number } {
    // Récupérer tous les items disponibles pour ce produit, triés par date d'entrée (FIFO)
    const availableItems = this.stockItems
      .filter(item => 
        item.productId === productId && 
        item.associationId === associationId && 
        item.status === 'available' &&
        item.quantity > 0
      )
      .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());

    let remainingQuantity = quantityNeeded;
    const usedItems: StockItem[] = [];
    let totalQuantity = 0;

    for (const item of availableItems) {
      if (remainingQuantity <= 0) break;

      const quantityToTake = Math.min(item.quantity, remainingQuantity);
      
      // Mettre à jour la quantité de l'item
      item.quantity -= quantityToTake;
      
      if (item.quantity === 0) {
        item.status = 'distributed';
      }

      // Enregistrer le mouvement
      this.recordMovement(item.id, 'exit', quantityToTake, reason, operatorId, operatorName);

      usedItems.push({
        ...item,
        quantity: quantityToTake // Quantité effectivement prise
      });

      totalQuantity += quantityToTake;
      remainingQuantity -= quantityToTake;
    }

    return {
      success: remainingQuantity === 0,
      items: usedItems,
      totalQuantity
    };
  }

  // Vérifier la disponibilité d'un produit
  static checkAvailability(productId: string, associationId: string): number {
    return this.stockItems
      .filter(item => 
        item.productId === productId && 
        item.associationId === associationId && 
        item.status === 'available'
      )
      .reduce((total, item) => total + item.quantity, 0);
  }

  // Obtenir les produits proches de l'expiration
  static getExpiringProducts(associationId: string, daysThreshold: number = 3): StockItem[] {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.stockItems.filter(item => 
      item.associationId === associationId &&
      item.status === 'available' &&
      item.expirationDate &&
      item.expirationDate <= thresholdDate
    );
  }

  // Obtenir les produits en stock critique (seuil bas)
  static getCriticalStockProducts(associationId: string, threshold: number = 6): Array<{
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
    shortage: number;
  }> {
    const productStocks = new Map<string, { name: string; quantity: number }>();

    // Calculer le stock total par produit
    this.stockItems
      .filter(item => item.associationId === associationId && item.status === 'available')
      .forEach(item => {
        const existing = productStocks.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productStocks.set(item.productId, {
            name: item.productName,
            quantity: item.quantity
          });
        }
      });

    // Identifier les produits en stock critique
    const criticalProducts: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      threshold: number;
      shortage: number;
    }> = [];

    productStocks.forEach((stock, productId) => {
      if (stock.quantity < threshold) {
        criticalProducts.push({
          productId,
          productName: stock.name,
          currentStock: stock.quantity,
          threshold,
          shortage: threshold - stock.quantity
        });
      }
    });

    return criticalProducts;
  }

  // Enregistrer un mouvement de stock
  private static recordMovement(
    stockItemId: string,
    type: StockMovement['type'],
    quantity: number,
    reason: string,
    operatorId: string,
    operatorName: string
  ): void {
    const movement: StockMovement = {
      id: `movement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stockItemId,
      type,
      quantity,
      timestamp: new Date(),
      reason,
      operatorId,
      operatorName
    };

    this.movements.push(movement);
  }

  // Obtenir l'historique des mouvements
  static getMovements(associationId?: string, productId?: string): StockMovement[] {
    let filteredMovements = this.movements;

    if (associationId || productId) {
      filteredMovements = this.movements.filter(movement => {
        const stockItem = this.stockItems.find(item => item.id === movement.stockItemId);
        if (!stockItem) return false;

        if (associationId && stockItem.associationId !== associationId) return false;
        if (productId && stockItem.productId !== productId) return false;

        return true;
      });
    }

    return filteredMovements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Obtenir tous les items de stock
  static getAllStockItems(associationId?: string): StockItem[] {
    if (associationId) {
      return this.stockItems.filter(item => item.associationId === associationId);
    }
    return this.stockItems;
  }

  // Marquer les produits expirés
  static markExpiredProducts(): void {
    const now = new Date();
    
    this.stockItems.forEach(item => {
      if (item.expirationDate && item.expirationDate <= now && item.status === 'available') {
        item.status = 'expired';
        this.recordMovement(item.id, 'expiry', item.quantity, 'Produit expiré', 'system', 'Système automatique');
      }
    });
  }

  // Initialiser avec des données de démonstration
  static initializeDemoData(): void {
    // Ajouter quelques produits en stock pour la démonstration
    this.addToStock('prod_006', 'Lait demi-écrémé 1L', 15, 'assoc_001', 'Réfrigérateur A', 'donation_demo_001');
    this.addToStock('prod_010', 'Riz basmati 1kg', 8, 'assoc_001', 'Entrepôt A - Étagère 3', 'donation_demo_002');
    this.addToStock('prod_018', 'Conserve tomates', 18, 'assoc_003', 'Entrepôt Central - Zone A', 'donation_demo_003');
    this.addToStock('prod_011', 'Pâtes spaghetti', 12, 'assoc_001', 'Entrepôt A - Étagère 1', 'donation_demo_004');
    this.addToStock('prod_007', 'Yaourts nature x8', 5, 'assoc_002', 'Local B - Frigo principal', 'donation_demo_005');
    this.addToStock('prod_012', 'Pain de mie complet', 4, 'assoc_002', 'Local B - Boulangerie', 'donation_demo_006');
    
    // Ajouter quelques produits avec des dates d'expiration proches
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.addToStock('prod_006', 'Lait demi-écrémé 1L', 3, 'assoc_001', 'Réfrigérateur B', 'donation_demo_007', tomorrow);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.addToStock('prod_007', 'Yaourts nature x8', 2, 'assoc_001', 'Réfrigérateur A', 'donation_demo_008', nextWeek);
  }
}

// Initialiser les données de démonstration
FIFOStockManager.initializeDemoData();