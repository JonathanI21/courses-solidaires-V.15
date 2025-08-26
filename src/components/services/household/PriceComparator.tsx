import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  Euro, 
  Star, 
  AlertCircle,
  CheckCircle,
  Truck,
  Car,
  ShoppingCart,
  Filter,
  BarChart3,
  Target,
  Plus,
  Minus,
  Package,
  Store,
  Zap,
  Heart,
  X,
  Search,
  Edit3,
  Lightbulb,
  List,
  Grid3X3
} from 'lucide-react';
import DatabaseService, { ShoppingList, Store as TStore, Product, ShoppingListItem } from '../../../data/database';

interface PriceComparatorProps {
  validatedList?: ShoppingList;
}

interface ProductSelection {
  product: Product;
  quantity: number;
  selected: boolean;
}

interface StoreComparison {
  storeId: string;
  storeName: string;
  distance: number;
  products: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    available: boolean;
    promotion?: any;
  }>;
  subtotal: number;
  transportCost: number;
  total: number;
}

interface OptimalSelection {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  storeId: string;
  storeName: string;
  unitPrice: number;
  totalPrice: number;
}

const PriceComparator: React.FC<PriceComparatorProps> = ({ validatedList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('fruits-legumes');
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);
  const [storeComparisons, setStoreComparisons] = useState<StoreComparison[]>([]);
  const [viewMode, setViewMode] = useState<'selection' | 'comparison' | 'optimal'>('selection');
  const [optimalSelections, setOptimalSelections] = useState<OptimalSelection[]>([]);
  const [optimalViewMode, setOptimalViewMode] = useState<'list' | 'stores'>('list'); // Nouveau state pour le mode d'affichage optimal

  const categories = [
    { id: 'fruits-legumes', name: 'Fruits et Légumes', icon: '🥕', color: 'green' },
    { id: 'produits-laitiers', name: 'Produits laitiers', icon: '🥛', color: 'blue' },
    { id: 'feculents', name: 'Féculents', icon: '🍞', color: 'yellow' },
    { id: 'viandes-poissons', name: 'Viandes et Poissons', icon: '🍗', color: 'red' },
    { id: 'epicerie', name: 'Épicerie', icon: '🥫', color: 'purple' }
  ];

  // Calculer les comparaisons par magasin
  useEffect(() => {
    if (selectedProducts.filter(p => p.selected).length > 0) {
      const stores = DatabaseService.getStores();
      const comparisons: StoreComparison[] = stores.map(store => {
        const products = selectedProducts
          .filter(p => p.selected)
          .map(p => {
            const productWithPrices = DatabaseService.getProductWithPrices(p.product.id);
            const storePrice = productWithPrices?.prices.find(price => price.storeId === store.id);
            
            const unitPrice = storePrice?.availability ? 
              DatabaseService.calculatePromotionalPrice(storePrice.price, storePrice.promotion) : 0;
            
            return {
              productId: p.product.id,
              productName: p.product.name,
              productImage: p.product.image,
              quantity: p.quantity,
              unitPrice,
              totalPrice: unitPrice * p.quantity,
              available: storePrice?.availability || false,
              promotion: storePrice?.promotion
            };
          });

        const subtotal = products.reduce((sum, p) => sum + p.totalPrice, 0);
        const transportCost = store.distance * 0.15 * 2; // 0.15€/km aller-retour
        
        return {
          storeId: store.id,
          storeName: store.name,
          distance: store.distance,
          products,
          subtotal,
          transportCost,
          total: subtotal + transportCost
        };
      });

      setStoreComparisons(comparisons.sort((a, b) => a.total - b.total));
    } else {
      setStoreComparisons([]);
    }
  }, [selectedProducts]);

  // Calculer la sélection optimale (produits les moins chers par enseigne)
  const calculateOptimalSelection = () => {
    const optimal: OptimalSelection[] = [];

    selectedProducts
      .filter(p => p.selected)
      .forEach(selection => {
        const productWithPrices = DatabaseService.getProductWithPrices(selection.product.id);
        if (!productWithPrices) return;

        // Trouver le meilleur prix pour ce produit
        const availablePrices = productWithPrices.prices.filter(p => p.availability);
        if (availablePrices.length === 0) return;

        const bestPrice = availablePrices.reduce((best, current) => {
          const currentPrice = DatabaseService.calculatePromotionalPrice(current.price, current.promotion);
          const bestPriceValue = DatabaseService.calculatePromotionalPrice(best.price, best.promotion);
          return currentPrice < bestPriceValue ? current : best;
        });

        const unitPrice = DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion);
        
        const optimalItem: OptimalSelection = {
          productId: selection.product.id,
          productName: selection.product.name,
          productImage: selection.product.image,
          quantity: selection.quantity,
          storeId: bestPrice.storeId,
          storeName: bestPrice.storeName,
          unitPrice,
          totalPrice: unitPrice * selection.quantity
        };

        optimal.push(optimalItem);
      });

    setOptimalSelections(optimal);
    setOptimalViewMode('list'); // Commencer par la vue liste
    setViewMode('optimal');
  };

  const addProductToSelection = (product: Product) => {
    const existingProduct = selectedProducts.find(p => p.product.id === product.id);
    
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.product.id === product.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      const newSelection: ProductSelection = {
        product,
        quantity: 1,
        selected: true
      };
      setSelectedProducts([...selectedProducts, newSelection]);
    }
  };

  const removeProductFromSelection = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.product.id !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromSelection(productId);
      return;
    }
    
    setSelectedProducts(selectedProducts.map(p => 
      p.product.id === productId ? { ...p, quantity } : p
    ));
  };

  const updateOptimalQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOptimalSelections(optimalSelections.filter(item => item.productId !== productId));
      return;
    }
    
    setOptimalSelections(optimalSelections.map(item => 
      item.productId === productId 
        ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
        : item
    ));
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.product.id === productId ? { ...p, selected: !p.selected } : p
    ));
  };

  const validateComparison = () => {
    if (selectedProducts.filter(p => p.selected).length === 0) {
      alert('Veuillez sélectionner au moins un produit');
      return;
    }
    setViewMode('comparison');
  };

  const getCategoryColor = (categoryId: string, isActive: boolean) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    
    if (isActive) {
      switch (category.color) {
        case 'green': return 'bg-green-600 text-white border-green-600';
        case 'blue': return 'bg-blue-600 text-white border-blue-600';
        case 'yellow': return 'bg-yellow-600 text-white border-yellow-600';
        case 'red': return 'bg-red-600 text-white border-red-600';
        case 'purple': return 'bg-purple-600 text-white border-purple-600';
        default: return 'bg-gray-600 text-white border-gray-600';
      }
    } else {
      switch (category.color) {
        case 'green': return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
        case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
        case 'red': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
        case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
        default: return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      }
    }
  };

  const filteredProducts = searchTerm 
    ? DatabaseService.searchProducts(searchTerm).filter(p => p.category === activeCategory)
    : DatabaseService.getProductsByCategory(activeCategory);

  const bestStore = storeComparisons.length > 0 ? storeComparisons[0] : null;
  const maxSavings = storeComparisons.length > 1 ? 
    storeComparisons[storeComparisons.length - 1].total - storeComparisons[0].total : 0;

  // Calculer les totaux pour la sélection optimale
  const optimalTotalByStore = optimalSelections.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        total: 0,
        items: []
      };
    }
    acc[item.storeId].total += item.totalPrice;
    acc[item.storeId].items.push(item);
    return acc;
  }, {} as { [storeId: string]: { storeName: string; total: number; items: OptimalSelection[] } });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Comparateur de Prix Multi-Enseignes
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Sélecteur de mode */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('selection')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'selection' 
                    ? 'bg-white text-blue-600' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Search className="inline mr-1" size={16} />
                Sélection
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                disabled={selectedProducts.filter(p => p.selected).length === 0}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'comparison' 
                    ? 'bg-white text-blue-600' 
                    : selectedProducts.filter(p => p.selected).length === 0
                      ? 'text-white/40 cursor-not-allowed'
                      : 'text-white/80 hover:text-white'
                }`}
              >
                <BarChart3 className="inline mr-1" size={16} />
                Comparaison ({selectedProducts.filter(p => p.selected).length})
              </button>
              <button
                onClick={() => setViewMode('optimal')}
                disabled={optimalSelections.length === 0}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'optimal' 
                    ? 'bg-white text-blue-600' 
                    : optimalSelections.length === 0
                      ? 'text-white/40 cursor-not-allowed'
                      : 'text-white/80 hover:text-white'
                }`}
              >
                <Lightbulb className="inline mr-1" size={16} />
                Optimal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* MODE SÉLECTION */}
        {viewMode === 'selection' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PARTIE GAUCHE - Catalogue produits */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="mr-2 text-blue-600" size={24} />
                Catalogue Produits
              </h2>
              
              {/* Barre de recherche */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Onglets des catégories */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => {
                    const isActive = activeCategory === category.id;
                    const categoryProducts = DatabaseService.getProductsByCategory(category.id);
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center px-3 py-2 rounded-lg border-2 font-medium transition-all text-sm ${getCategoryColor(category.id, isActive)}`}
                      >
                        <span className="text-base mr-1">{category.icon}</span>
                        <span className="hidden sm:inline">{category.name}</span>
                        <span className="ml-1 px-1 py-0.5 rounded-full text-xs bg-white/20">
                          {categoryProducts.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Produits en étiquettes */}
              <div className="max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 font-medium">
                      {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit dans cette catégorie'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {filteredProducts.map(product => {
                      const isSelected = selectedProducts.some(p => p.product.id === product.id);
                      
                      return (
                        <button
                          key={product.id}
                          onClick={() => addProductToSelection(product)}
                          className={`inline-flex items-center px-3 py-2 rounded-full border-2 transition-all text-sm ${
                            isSelected 
                              ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-md' 
                              : 'bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <span className="text-base mr-2">{product.image}</span>
                          <span className="font-medium truncate max-w-24">
                            {product.name}
                          </span>
                          {isSelected && (
                            <span className="ml-2 px-1 py-0.5 bg-blue-200 text-blue-700 rounded text-xs font-medium">
                              ✓
                            </span>
                          )}
                          <div className={`ml-2 w-5 h-5 rounded-full flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            <Plus size={10} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* PARTIE DROITE - Produits sélectionnés */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                  <ShoppingCart className="mr-2" size={24} />
                  Produits à comparer
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedProducts.length} produits
                </span>
              </div>
              
              {selectedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto text-blue-400 mb-4" size={48} />
                  <p className="text-blue-700 font-medium mb-2">
                    Aucun produit sélectionné
                  </p>
                  <p className="text-blue-600 text-sm">
                    Ajoutez des produits depuis le catalogue
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {selectedProducts.map(selection => (
                      <div key={selection.product.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center flex-1">
                            <span className="text-xl mr-3">{selection.product.image}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-800">{selection.product.name}</h4>
                              <p className="text-sm text-blue-600">{selection.product.brand}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeProductFromSelection(selection.product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Contrôles quantité */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateProductQuantity(selection.product.id, selection.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-200 text-blue-700 rounded-full hover:bg-blue-300"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center font-bold text-blue-800">{selection.quantity}</span>
                            <button
                              onClick={() => updateProductQuantity(selection.product.id, selection.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-200 text-blue-700 rounded-full hover:bg-blue-300"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Toggle sélection */}
                          <button
                            onClick={() => toggleProductSelection(selection.product.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selection.selected 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {selection.selected ? 'Inclus' : 'Exclu'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={validateComparison}
                    disabled={selectedProducts.filter(p => p.selected).length === 0}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      selectedProducts.filter(p => p.selected).length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <BarChart3 className="inline mr-2" size={20} />
                    Comparer les prix ({selectedProducts.filter(p => p.selected).length} produits)
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* MODE COMPARAISON */}
        {viewMode === 'comparison' && (
          <div className="space-y-6">
            {storeComparisons.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Aucun produit à comparer
                </h2>
                <p className="text-gray-600 mb-6">
                  Retournez à la sélection pour ajouter des produits.
                </p>
                <button
                  onClick={() => setViewMode('selection')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour à la sélection
                </button>
              </div>
            ) : (
              <>
                {/* Résumé global avec boutons d'action */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Résumé des économies</h2>
                    
                    {/* Boutons d'action */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setViewMode('selection')}
                        className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit3 className="mr-2" size={16} />
                        Rectifier ma liste
                      </button>
                      <button
                        onClick={calculateOptimalSelection}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Lightbulb className="mr-2" size={16} />
                        Sélectionner les produits moins coûteux
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Meilleur prix total</span>
                        <Star className="text-yellow-500" size={16} />
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {bestStore?.total.toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-500">
                        {bestStore?.storeName} (transport inclus)
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Économie maximale</span>
                        <Target className="text-blue-500" size={16} />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {maxSavings.toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-500">
                        vs magasin le plus cher
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Produits comparés</span>
                        <Package className="text-purple-500" size={16} />
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedProducts.filter(p => p.selected).length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedProducts.reduce((sum, p) => sum + (p.selected ? p.quantity : 0), 0)} unités total
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparaison par colonnes d'enseignes */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-6">Comparaison par enseigne</h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storeComparisons.map((store, index) => {
                      const isBest = index === 0;
                      const savings = store.total - storeComparisons[0].total;
                      
                      return (
                        <div 
                          key={store.storeId}
                          className={`border-2 rounded-xl p-6 ${
                            isBest 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          {/* En-tête magasin */}
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center mb-2">
                              <Store className={`mr-2 ${isBest ? 'text-green-600' : 'text-gray-600'}`} size={24} />
                              <h3 className={`text-lg font-bold ${isBest ? 'text-green-800' : 'text-gray-800'}`}>
                                {store.storeName}
                              </h3>
                            </div>
                            {isBest && (
                              <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                                🏆 Meilleur choix
                              </span>
                            )}
                            <div className="flex items-center justify-center text-gray-600 text-sm mt-2">
                              <MapPin className="mr-1" size={14} />
                              <span>{store.distance} km</span>
                            </div>
                          </div>

                          {/* Liste des produits */}
                          <div className="space-y-3 mb-6">
                            {store.products.map(product => (
                              <div 
                                key={product.productId}
                                className={`p-3 rounded-lg border ${
                                  product.available 
                                    ? 'bg-white border-gray-200' 
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    <span className="text-lg mr-2">{product.productImage}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {product.productName}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Qté: {product.quantity}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {product.available ? (
                                      <>
                                        <div className="font-bold text-sm">
                                          {product.totalPrice.toFixed(2)}€
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {product.unitPrice.toFixed(2)}€/u
                                        </div>
                                        {product.promotion && (
                                          <div className="text-xs text-red-600 font-medium">
                                            PROMO
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="text-xs text-red-600 font-medium">
                                        Non dispo
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Récapitulatif des coûts */}
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="font-medium text-blue-800">Sous-total produits:</span>
                              <span className="font-bold text-blue-600">{store.subtotal.toFixed(2)}€</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                              <div>
                                <span className="font-medium text-orange-800">Frais transport:</span>
                                <div className="text-xs text-orange-600">
                                  {store.distance} km × 0,15€ × 2 (A/R)
                                </div>
                              </div>
                              <span className="font-bold text-orange-600">{store.transportCost.toFixed(2)}€</span>
                            </div>
                            
                            <div className={`flex justify-between items-center p-4 rounded-lg ${
                              isBest ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <span className={`text-lg font-bold ${isBest ? 'text-green-800' : 'text-gray-800'}`}>
                                TOTAL:
                              </span>
                              <span className={`text-xl font-bold ${isBest ? 'text-green-600' : 'text-gray-800'}`}>
                                {store.total.toFixed(2)}€
                              </span>
                            </div>

                            {savings > 0 && (
                              <div className="text-center p-2 bg-red-50 rounded-lg">
                                <span className="text-sm text-red-600 font-medium">
                                  +{savings.toFixed(2)}€ vs meilleur prix
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bouton d'action */}
                          <button
                            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                              isBest 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <Zap className="mr-2" size={16} />
                            Choisir {store.storeName}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* MODE SÉLECTION OPTIMALE */}
        {viewMode === 'optimal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Lightbulb className="mr-2 text-yellow-500" size={24} />
                  Sélection Optimale - Produits les moins coûteux
                </h2>
                
                {/* Boutons de navigation et mode d'affichage */}
                <div className="flex items-center space-x-3">
                  {/* Toggle vue liste/magasins */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setOptimalViewMode('list')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        optimalViewMode === 'list' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <List className="inline mr-1" size={16} />
                      Liste unique
                    </button>
                    <button
                      onClick={() => setOptimalViewMode('stores')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        optimalViewMode === 'stores' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Grid3X3 className="inline mr-1" size={16} />
                      Par magasin
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setViewMode('comparison')}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <BarChart3 className="mr-2" size={16} />
                    Retour à la comparaison
                  </button>
                </div>
              </div>

              {/* Résumé global de l'optimisation */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  💡 Répartition optimale par enseigne
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600">Total optimisé</div>
                    <div className="text-2xl font-bold text-green-600">
                      {optimalSelections.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}€
                    </div>
                    <div className="text-xs text-gray-500">Produits uniquement</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600">Magasins à visiter</div>
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(optimalTotalByStore).length}
                    </div>
                    <div className="text-xs text-gray-500">Enseignes différentes</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600">Économie vs pire cas</div>
                    <div className="text-2xl font-bold text-green-600">
                      {maxSavings.toFixed(2)}€
                    </div>
                    <div className="text-xs text-gray-500">Maximum possible</div>
                  </div>
                </div>
              </div>

              {/* AFFICHAGE EN LISTE UNIQUE */}
              {optimalViewMode === 'list' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <List className="mr-2" size={20} />
                    Liste optimale avec enseignes
                  </h3>
                  
                  <div className="space-y-3">
                    {optimalSelections.map(item => (
                      <div key={item.productId} className="bg-white border border-yellow-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <span className="text-xl mr-3">{item.productImage}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-yellow-800">{item.productName}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium flex items-center">
                                  <Store className="mr-1" size={12} />
                                  {item.storeName}
                                </span>
                                <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                                  💰 OPTIMAL
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Contrôles quantité */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateOptimalQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center bg-yellow-200 text-yellow-700 rounded-full hover:bg-yellow-300"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center font-bold text-yellow-800">{item.quantity}</span>
                              <button
                                onClick={() => updateOptimalQuantity(item.productId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-yellow-200 text-yellow-700 rounded-full hover:bg-yellow-300"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            
                            {/* Prix */}
                            <div className="text-right">
                              <div className="font-bold text-yellow-700">
                                {item.totalPrice.toFixed(2)}€
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.unitPrice.toFixed(2)}€/u
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Récapitulatif de la liste */}
                  <div className="mt-6 bg-white border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-yellow-800">Récapitulatif par enseigne</h4>
                      <button
                        onClick={() => setOptimalViewMode('stores')}
                        className="flex items-center px-3 py-1 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-colors text-sm"
                      >
                        <Grid3X3 className="mr-1" size={14} />
                        Liste par magasin
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(optimalTotalByStore).map(([storeId, storeData]) => {
                        const store = DatabaseService.getStore(storeId);
                        const transportCost = store ? store.distance * 0.15 * 2 : 0;
                        
                        return (
                          <div key={storeId} className="bg-yellow-100 p-3 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Store className="mr-1 text-yellow-600" size={16} />
                                <span className="font-medium text-yellow-800">{storeData.storeName}</span>
                              </div>
                              <span className="text-xs text-gray-600">{storeData.items.length} produits</span>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Produits:</span>
                                <span className="font-medium">{storeData.total.toFixed(2)}€</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Transport:</span>
                                <span className="font-medium">{transportCost.toFixed(2)}€</span>
                              </div>
                              <div className="flex justify-between border-t border-yellow-300 pt-1 font-bold">
                                <span>Total:</span>
                                <span>{(storeData.total + transportCost).toFixed(2)}€</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* AFFICHAGE PAR MAGASINS */}
              {optimalViewMode === 'stores' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(optimalTotalByStore).map(([storeId, storeData]) => {
                    const store = DatabaseService.getStore(storeId);
                    const transportCost = store ? store.distance * 0.15 * 2 : 0;
                    const totalWithTransport = storeData.total + transportCost;
                    
                    return (
                      <div key={storeId} className="border-2 border-yellow-300 bg-yellow-50 rounded-xl p-6">
                        {/* En-tête magasin */}
                        <div className="text-center mb-6">
                          <div className="flex items-center justify-center mb-2">
                            <Store className="mr-2 text-yellow-600" size={24} />
                            <h3 className="text-lg font-bold text-yellow-800">
                              {storeData.storeName}
                            </h3>
                          </div>
                          <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                            ⭐ Meilleur prix pour ces produits
                          </span>
                          {store && (
                            <div className="flex items-center justify-center text-gray-600 text-sm mt-2">
                              <MapPin className="mr-1" size={14} />
                              <span>{store.distance} km</span>
                            </div>
                          )}
                        </div>

                        {/* Liste des produits optimaux */}
                        <div className="space-y-3 mb-6">
                          {storeData.items.map(item => (
                            <div key={item.productId} className="p-3 bg-white rounded-lg border border-yellow-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                  <span className="text-lg mr-2">{item.productImage}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      {item.productName}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Qté: {item.quantity}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm text-yellow-700">
                                    {item.totalPrice.toFixed(2)}€
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.unitPrice.toFixed(2)}€/u
                                  </div>
                                  <div className="text-xs text-green-600 font-medium">
                                    💰 OPTIMAL
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Récapitulatif des coûts */}
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-yellow-200">
                            <span className="font-medium text-yellow-800">Sous-total produits:</span>
                            <span className="font-bold text-yellow-600">{storeData.total.toFixed(2)}€</span>
                          </div>
                          
                          {store && (
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div>
                                <span className="font-medium text-orange-800">Frais transport:</span>
                                <div className="text-xs text-orange-600">
                                  {store.distance} km × 0,15€ × 2 (A/R)
                                </div>
                              </div>
                              <span className="font-bold text-orange-600">{transportCost.toFixed(2)}€</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                            <span className="text-lg font-bold text-yellow-800">
                              TOTAL:
                            </span>
                            <span className="text-xl font-bold text-yellow-600">
                              {totalWithTransport.toFixed(2)}€
                            </span>
                          </div>
                        </div>

                        {/* Bouton d'action */}
                        <button
                          className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center font-medium"
                        >
                          <Zap className="mr-2" size={16} />
                          Aller chez {storeData.storeName}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recommandations pour l'optimisation */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🚗 Recommandations de parcours
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Optimisation transport</h4>
                    <p className="text-sm text-blue-700">
                      Planifiez votre parcours pour visiter les {Object.keys(optimalTotalByStore).length} magasins 
                      dans l'ordre le plus efficace selon leur proximité.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Alternative</h4>
                    <p className="text-sm text-blue-700">
                      Si vous préférez un seul magasin, <strong>{bestStore?.storeName}</strong> reste 
                      le meilleur compromis avec seulement <strong>+{(bestStore ? bestStore.total - optimalSelections.reduce((sum, item) => sum + item.totalPrice, 0) : 0).toFixed(2)}€</strong> de différence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparator;