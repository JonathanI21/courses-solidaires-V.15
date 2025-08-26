import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Check, 
  Heart,
  Package,
  CheckCircle,
  Gift,
  Users
} from 'lucide-react';
import DatabaseService, { Product, ShoppingList, ShoppingListItem } from '../../../data/database';

interface ShoppingListManagerProps {
  onListValidated: (list: ShoppingList) => void;
  existingList?: ShoppingList | null;
}

const ShoppingListManager: React.FC<ShoppingListManagerProps> = ({ onListValidated, existingList }) => {
  const [currentList, setCurrentList] = useState<ShoppingListItem[]>([]);
  const [listName, setListName] = useState('Ma liste de courses');
  const [listStatus, setListStatus] = useState<'draft' | 'validated' | 'error'>('draft');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [donationItems, setDonationItems] = useState<Set<string>>(new Set());
  const [showManualInput, setShowManualInput] = useState<{ category: string; show: boolean }>({ category: '', show: false });
  const [manualProductName, setManualProductName] = useState('');
  const [lastClickedCategory, setLastClickedCategory] = useState<string>('');
  const [manuallyAddedItems, setManuallyAddedItems] = useState<{ [category: string]: string[] }>({});
  const [showConfirmation, setShowConfirmation] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Charger une liste existante si elle existe
  useEffect(() => {
    if (existingList) {
      setCurrentList(existingList.items);
      setListName(existingList.name);
      setListStatus('draft');
      
      const checkedSet = new Set<string>();
      existingList.items.forEach(item => {
        const product = DatabaseService.getProduct(item.productId);
        if (product) {
          checkedSet.add(product.name.toLowerCase());
        }
      });
      setCheckedItems(checkedSet);
    }
  }, [existingList]);

  // Gérer le clic sur une case à cocher
  const handleItemToggle = (itemName: string, category: string) => {
    if (itemName === '---') return;
    
    const itemKey = itemName.toLowerCase();
    const newCheckedItems = new Set(checkedItems);
    
    if (checkedItems.has(itemKey)) {
      newCheckedItems.delete(itemKey);
      setCheckedItems(newCheckedItems);
      
      const itemToRemove = currentList.find(listItem => {
        const product = DatabaseService.getProduct(listItem.productId);
        return product && product.name.toLowerCase().includes(itemName.toLowerCase());
      });
      
      if (itemToRemove) {
        setCurrentList(currentList.filter(item => item.id !== itemToRemove.id));
      }
    } else {
      newCheckedItems.add(itemKey);
      setCheckedItems(newCheckedItems);
      addProductToList(itemName, category);
    }
  };

  // Gérer le clic sur le cœur (don)
  const handleDonationToggle = (itemName: string) => {
    if (itemName === '---') return;
    
    const itemKey = itemName.toLowerCase();
    const newDonationItems = new Set(donationItems);
    
    if (donationItems.has(itemKey)) {
      newDonationItems.delete(itemKey);
    } else {
      newDonationItems.add(itemKey);
    }
    
    setDonationItems(newDonationItems);
  };

  // Gérer l'ajout manuel de produit
  const handleAddManualProduct = (categoryName: string) => {
    setLastClickedCategory(categoryName);
    setShowManualInput({ category: categoryName, show: true });
    setManualProductName('');
  };

  const handleConfirmManualProduct = () => {
    if (manualProductName.trim()) {
      const categoryKey = lastClickedCategory.toLowerCase();
      
      // Vérifier si l'article existe déjà dans cette catégorie
      const existingItems = manuallyAddedItems[categoryKey] || [];
      const articleExists = existingItems.some(item => 
        item.toLowerCase() === manualProductName.trim().toLowerCase()
      );
      
      if (articleExists) {
        const confirmDuplicate = window.confirm(
          `L'article "${manualProductName}" existe déjà dans la catégorie "${lastClickedCategory}". Voulez-vous l'ajouter quand même ?`
        );
        if (!confirmDuplicate) {
          return;
        }
      }
      
      // Ajouter l'article à la catégorie
      const updatedManualItems = {
        ...manuallyAddedItems,
        [categoryKey]: [...existingItems, manualProductName.trim()]
      };
      setManuallyAddedItems(updatedManualItems);
      
      const itemKey = manualProductName.toLowerCase();
      const newCheckedItems = new Set(checkedItems);
      newCheckedItems.add(itemKey);
      setCheckedItems(newCheckedItems);
      
      // Ajouter le produit à la liste
      addProductToList(manualProductName, categoryKey);
      
      // Afficher la confirmation
      setShowConfirmation({
        show: true,
        message: `Article "${manualProductName}" ajouté avec succès à la catégorie "${lastClickedCategory}"`
      });
      
      // Masquer la confirmation après 3 secondes
      setTimeout(() => {
        setShowConfirmation({ show: false, message: '' });
      }, 3000);
      
      // Réinitialiser
      setShowManualInput({ category: '', show: false });
      setManualProductName('');
      setLastClickedCategory('');
    }
  };

  const handleCancelManualProduct = () => {
    setShowManualInput({ category: '', show: false });
    setManualProductName('');
    setLastClickedCategory('');
  };

  const addProductToList = (itemName: string, category: string) => {
    const allProducts = DatabaseService.getAllProductsWithPrices();
    let matchingProduct: Product | null = null;

    const productMappings: { [key: string]: string } = {
      'pommes': 'Pommes Golden',
      'bananes': 'Bananes',
      'poires': 'Pommes Golden',
      'oranges': 'Bananes',
      'clémentines': 'Bananes',
      'melon': 'Pommes Golden',
      'ananas': 'Bananes',
      'raisin': 'Pommes Golden',
      'pommes de terre': 'Pommes de terre',
      'carottes': 'Carottes',
      'tomates': 'Tomates cerises',
      'salade': 'Salade iceberg',
      'pâtes': 'Pâtes spaghetti',
      'riz': 'Riz basmati 1kg',
      'lait': 'Lait demi-écrémé 1L',
      'yaourts': 'Yaourts nature x8',
      'beurre': 'Beurre doux 250g',
      'fromage': 'Fromage râpé',
      'pain de mie': 'Pain de mie complet',
      'poulet': 'Escalopes de poulet',
      'jambon': 'Jambon blanc',
      'saumon': 'Saumon fumé',
      'huile': 'Huile d\'olive',
      'conserve tomates': 'Conserve tomates',
      'café': 'Café moulu',
      'céréales': 'Céréales'
    };

    const mappedName = productMappings[itemName.toLowerCase()];
    if (mappedName) {
      matchingProduct = allProducts.find(p => p.name === mappedName) || null;
    }

    if (!matchingProduct) {
      matchingProduct = allProducts.find(product => 
        product.name.toLowerCase().includes(itemName.toLowerCase()) ||
        (category === 'fruits' && product.category === 'fruits-legumes') ||
        (category === 'légumes' && product.category === 'fruits-legumes') ||
        (category === 'épicerie' && product.category === 'epicerie') ||
        (category === 'viande' && product.category === 'viandes-poissons') ||
        (category === 'poisson' && product.category === 'viandes-poissons') ||
        (category === 'crémerie' && product.category === 'produits-laitiers')
      ) || null;
    }

    if (!matchingProduct) {
      if (category === 'fruits' || category === 'légumes') {
        matchingProduct = allProducts.find(p => p.category === 'fruits-legumes') || null;
      } else if (category === 'épicerie' || category === 'p\'tit dej') {
        matchingProduct = allProducts.find(p => p.category === 'epicerie') || null;
      } else if (category === 'viande' || category === 'poisson') {
        matchingProduct = allProducts.find(p => p.category === 'viandes-poissons') || null;
      } else if (category === 'crémerie') {
        matchingProduct = allProducts.find(p => p.category === 'produits-laitiers') || null;
      }
    }

    if (matchingProduct) {
      const existingItem = currentList.find(item => item.productId === matchingProduct!.id);
      
      if (existingItem) {
        setCurrentList(currentList.map(item => 
          item.productId === matchingProduct!.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        const newItem: ShoppingListItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          productId: matchingProduct.id,
          quantity: 1,
          priority: 'medium',
          addedAt: new Date()
        };
        setCurrentList([...currentList, newItem]);
      }
    }
  };

  const validateList = () => {
    if (checkedItems.size === 0) {
      setListStatus('error');
      return;
    }

    // Créer les items de la liste basés sur les produits cochés
    const validatedItems: ShoppingListItem[] = [];
    
    // Parcourir toutes les catégories et leurs items
    shoppingCategories.forEach(category => {
      const categoryItems = [...category.items, ...(manuallyAddedItems[category.name.toLowerCase()] || [])];
      
      categoryItems.forEach(itemName => {
        const itemKey = itemName.toLowerCase();
        if (checkedItems.has(itemKey)) {
          // Trouver le produit correspondant dans la base de données
          const allProducts = DatabaseService.getAllProductsWithPrices();
          let matchingProduct = allProducts.find(p => 
            p.name.toLowerCase().includes(itemName.toLowerCase())
          );
          
          // Si pas de correspondance exacte, utiliser le mapping ou un produit par défaut de la catégorie
          if (!matchingProduct) {
            const productMappings: { [key: string]: string } = {
              'pommes': 'Pommes Golden',
              'bananes': 'Bananes',
              'poires': 'Pommes Golden',
              'oranges': 'Bananes',
              'clémentines': 'Bananes',
              'melon': 'Pommes Golden',
              'ananas': 'Bananes',
              'raisin': 'Pommes Golden',
              'pommes de terre': 'Pommes de terre',
              'carottes': 'Carottes',
              'tomates': 'Tomates cerises',
              'salade': 'Salade iceberg',
              'pâtes': 'Pâtes spaghetti',
              'riz': 'Riz basmati 1kg',
              'lait': 'Lait demi-écrémé 1L',
              'yaourts': 'Yaourts nature x8',
              'beurre': 'Beurre doux 250g',
              'fromage': 'Fromage râpé',
              'pain de mie': 'Pain de mie complet',
              'poulet': 'Escalopes de poulet',
              'jambon': 'Jambon blanc',
              'saumon': 'Saumon fumé',
              'huile': 'Huile d\'olive',
              'conserve tomates': 'Conserve tomates',
              'café': 'Café moulu',
              'céréales': 'Céréales'
            };
            
            const mappedName = productMappings[itemKey];
            if (mappedName) {
              matchingProduct = allProducts.find(p => p.name === mappedName);
            }
            
            // Si toujours pas de correspondance, utiliser un produit par défaut de la catégorie
            if (!matchingProduct) {
              if (category.name.toLowerCase() === 'fruits' || category.name.toLowerCase() === 'légumes') {
                matchingProduct = allProducts.find(p => p.category === 'fruits-legumes');
              } else if (category.name.toLowerCase() === 'épicerie' || category.name.toLowerCase() === "p'tit dej") {
                matchingProduct = allProducts.find(p => p.category === 'epicerie');
              } else if (category.name.toLowerCase() === 'viande') {
                matchingProduct = allProducts.find(p => p.category === 'viandes-poissons');
              } else if (category.name.toLowerCase() === 'crémerie') {
                matchingProduct = allProducts.find(p => p.category === 'produits-laitiers');
              } else {
                // Produit par défaut
                matchingProduct = allProducts[0];
              }
            }
          }
          
          if (matchingProduct) {
            // Vérifier si l'item existe déjà dans la liste validée
            const existingItemIndex = validatedItems.findIndex(item => item.productId === matchingProduct!.id);
            
            if (existingItemIndex >= 0) {
              // Augmenter la quantité si l'item existe déjà
              validatedItems[existingItemIndex].quantity += 1;
            } else {
              // Créer un nouvel item
              const newItem: ShoppingListItem = {
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                productId: matchingProduct.id,
                quantity: 1,
                priority: donationItems.has(itemKey) ? 'high' : 'medium',
                addedAt: new Date()
              };
              validatedItems.push(newItem);
            }
          }
        }
      });
    });

    const totalEstimated = currentList.reduce((total, item) => {
      const bestPrice = DatabaseService.getBestPriceForProduct(item.productId);
      const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;
      return total + (price * item.quantity);
    }, 0);

    const newList: ShoppingList = {
      id: existingList?.id || Date.now().toString(),
      name: listName,
      items: validatedItems,
      status: 'validated',
      createdAt: existingList?.createdAt || new Date(),
      validatedAt: new Date(),
      totalEstimated
    };

    DatabaseService.saveShoppingList(newList);
    setListStatus('validated');
    onListValidated(newList);
  };

  // Interface post-validation
  if (listStatus === 'validated') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête de confirmation */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl shadow-lg mb-8">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4" size={48} />
              <h1 className="text-2xl font-bold mb-2">Liste de courses validée avec succès !</h1>
              <p className="text-emerald-100">
                {checkedItems.size} articles sélectionnés
                {donationItems.size > 0 && ` • ${donationItems.size} dons solidaires`}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* COLONNE DE GAUCHE - Pastille "Faire mes achats en magasin" */}
            <div className="flex items-center justify-center h-full">
              <button
                onClick={() => {
                  // Navigation vers le scanner
                  console.log('Navigation vers le scanner en magasin');
                }}
                className="group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-lg w-full max-w-md"
              >
                {/* Gradient background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon avec gradient */}
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg mb-6 group-hover:shadow-xl transition-shadow">
                    <ShoppingCart size={48} className="text-white" />
                  </div>
                  
                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-800 transition-colors">
                      Faire mes achats en magasin
                    </h3>
                    <p className="text-emerald-600 font-medium">
                      Scanner • Guide courses • Dons solidaires
                    </p>
                  </div>
                </div>
                
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-10 rounded-full transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-300"></div>
              </button>
            </div>

            {/* COLONNE DE DROITE - Scanner et Panier dans l'ordre hiérarchique */}
            <div className="space-y-6">
              
              {/* 1. Scanner avec Caméra Réelle (Position supérieure) */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
                  <Package className="mr-3" size={24} />
                  Scanner avec Caméra Réelle
                </h2>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <Package className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                    Scanner prêt à utiliser
                  </h3>
                  <p className="text-emerald-700 text-sm mb-4">
                    Utilisez votre caméra pour scanner les codes-barres des produits en magasin
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white border border-emerald-300 rounded-lg p-3">
                      <div className="text-emerald-600 font-semibold text-sm">Scanner Classique</div>
                      <div className="text-emerald-500 text-xs">Code-barres traditionnel</div>
                    </div>
                    <div className="bg-white border border-emerald-300 rounded-lg p-3">
                      <div className="text-emerald-600 font-semibold text-sm">Scanner IA</div>
                      <div className="text-emerald-500 text-xs">Reconnaissance intelligente</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        // Navigation vers le scanner classique
                        console.log('Navigation vers le scanner classique');
                      }}
                      className="bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                    >
                      Scanner Classique
                    </button>
                    <button 
                      onClick={() => {
                        // Navigation vers le scanner IA
                        window.location.hash = '#ai-scanner';
                      }}
                      className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Scanner IA
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Panier (Position inférieure) */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
                  <ShoppingCart className="mr-3" size={24} />
                  Panier
                </h2>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  {currentList.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto text-gray-400 mb-3" size={40} />
                      <p className="text-gray-600 font-medium mb-1">Panier vide</p>
                      <p className="text-gray-500 text-sm">Scannez des produits pour commencer</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {currentList.map(item => {
                        const product = DatabaseService.getProduct(item.productId);
                        if (!product) return null;

                        const bestPrice = DatabaseService.getBestPriceForProduct(item.productId);
                        const price = bestPrice ? DatabaseService.calculatePromotionalPrice(bestPrice.price, bestPrice.promotion) : 0;
                        const itemKey = product.name.toLowerCase();
                        const isDonation = donationItems.has(itemKey);

                        return (
                          <div 
                            key={item.id}
                            className={`p-3 rounded-lg border transition-all ${
                              isDonation 
                                ? 'bg-pink-50 border-pink-200' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1 min-w-0">
                                <span className="text-lg mr-3">{product.image}</span>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-medium text-sm truncate ${isDonation ? 'text-pink-800' : 'text-gray-800'}`}>
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center space-x-2 text-xs">
                                    <span className={`${isDonation ? 'text-pink-600' : 'text-gray-600'}`}>
                                      {product.brand}
                                    </span>
                                    {price > 0 && (
                                      <span className="font-semibold text-emerald-600">
                                        {(price * item.quantity).toFixed(2)}€
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-emerald-600">x{item.quantity}</span>
                                {isDonation && (
                                  <Heart className="text-pink-500 fill-current" size={16} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Résumé du panier */}
                  {currentList.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Total articles:</span>
                        <span className="font-bold text-emerald-600">
                          {currentList.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      {donationItems.size > 0 && (
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="font-medium text-pink-700">Dons solidaires:</span>
                          <span className="font-bold text-pink-600">{donationItems.size}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions supplémentaires */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setListStatus('draft')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Modifier ma liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interface de création/modification de liste
  // Catégories compactes pour tenir sur une page
  const shoppingCategories = [
    {
      name: "Fruits",
      color: "#ff6b35",
      icon: "🍍",
      items: ["Pommes", "Bananes", "Poires", "Oranges", "Clémentines", "Melon", "Ananas", "Raisin"]
    },
    {
      name: "Épicerie", 
      color: "#e91e63",
      icon: "🥄",
      items: ["Pâtes", "Riz", "Farine", "Lentilles", "Huile", "Sucre", "Conserves", "Épices"]
    },
    {
      name: "P'tit dej",
      color: "#9c27b0",
      icon: "☕",
      items: ["Café", "Thé", "Céréales", "Confiture", "Pain de mie", "Brioche"]
    },
    {
      name: "Boissons",
      color: "#4caf50", 
      icon: "🥤",
      items: ["Eau", "Lait", "Jus de fruits", "Soda", "Sirop", "Vin"]
    },
    {
      name: "Entretien",
      color: "#ff9800",
      icon: "🧽", 
      items: ["Lessive", "Liquide vaisselle", "Éponges", "Papier toilette", "Essuie-tout", "Javel"]
    },
    {
      name: "Légumes",
      color: "#4caf50",
      icon: "🥬",
      items: ["Pommes de terre", "Carottes", "Tomates", "Salade", "Oignons", "Courgettes"]
    },
    {
      name: "Viande",
      color: "#f44336",
      icon: "🥩",
      items: ["Poulet", "Boeuf", "Jambon", "Poisson", "Charcuterie"]
    },
    {
      name: "Surgelés",
      color: "#00bcd4",
      icon: "🧊",
      items: ["Frites", "Légumes", "Plats cuisinés", "Glaces", "Pizzas"]
    },
    {
      name: "Hygiène",
      color: "#e91e63",
      icon: "🧴",
      items: ["Gel douche", "Shampoing", "Dentifrice", "Déodorant", "Savon", "Brosse à dents"]
    },
    {
      name: "Crémerie",
      color: "#4caf50",
      icon: "🧀",
      items: ["Yaourts", "Beurre", "Fromage", "Oeufs", "Crème fraîche"]
    },
    {
      name: "Bébé",
      color: "#2196f3",
      icon: "👶",
      items: ["Couches", "Lait bébé", "Petits pots", "Compotes"]
    }
  ];

  return (
    <div className="bg-white">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Georgia:wght@400;700&display=swap');
          
          .shopping-list-container {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: white;
            padding: 20px;
            position: relative;
            border: 3px dashed #9ca3af;
            border-radius: 16px;
            max-width: 1200px;
            margin: 0 auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          
          .shopping-list-header {
            text-align: center;
            margin-bottom: 24px;
            border-bottom: 2px dashed #9ca3af;
            padding-bottom: 20px;
          }
          
          .shopping-list-title {
            color: #2e7d32;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 6px;
            text-shadow: 0 3px 6px rgba(46, 125, 50, 0.3);
            font-family: 'Georgia', serif;
            line-height: 1.1;
          }
          
          .shopping-list-subtitle {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 40px;
            margin-bottom: 16px;
            font-size: 14px;
            font-weight: 700;
          }
          
          .subtitle-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #2e7d32;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
          }
          
          .app-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 12px;
            color: #374151;
            margin-top: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 800;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .shopping-categories {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          
          .shopping-category {
            border: 2px solid;
            border-radius: 12px;
            padding: 12px;
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            min-height: 160px;
            position: relative;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .shopping-category:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          
          .category-header {
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid currentColor;
            padding-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
            font-family: 'Georgia', serif;
          }
          
          .category-items {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .shopping-item {
            display: flex;
            align-items: center;
            padding: 4px 2px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            position: relative;
          }
          
          .shopping-item:hover:not(.disabled) {
            background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9));
            transform: translateX(2px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .shopping-checkbox {
            appearance: none;
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border: 2px solid;
            border-radius: 4px;
            margin-right: 8px;
            position: relative;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .shopping-checkbox:checked {
            background-color: currentColor;
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          
          .shopping-checkbox:checked::after {
            content: "✓";
            position: absolute;
            color: white;
            font-size: 12px;
            font-weight: 900;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          }
          
          .shopping-checkbox:disabled {
            opacity: 0.25;
            cursor: not-allowed;
          }
          
          .donation-heart {
            width: 16px;
            height: 16px;
            margin-left: 4px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            color: #e91e63;
            opacity: 0.3;
          }
          
          .donation-heart:hover {
            opacity: 1;
            transform: scale(1.2);
          }
          
          .donation-heart.active {
            opacity: 1;
            color: #e91e63;
            transform: scale(1.1);
          }
          
          .shopping-label {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 11px;
            flex: 1;
            color: #1f2937;
            line-height: 1.4;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          
          .shopping-label.checked {
            text-decoration: line-through;
            color: #9ca3af;
            opacity: 0.65;
            transform: scale(0.98);
          }
          
          .shopping-label.disabled {
            color: #d1d5db;
            cursor: default;
            font-style: italic;
            font-weight: 400;
          }
          
          .validate-button {
            position: sticky;
            bottom: 16px;
            margin-top: 24px;
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #059669, #16a34a, #22c55e);
            color: white;
            border: none;
            border-radius: 16px;
            font-family: 'Georgia', serif;
            font-size: 18px;
            font-weight: 900;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-transform: uppercase;
            letter-spacing: 3px;
            box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.4), 0 4px 6px -2px rgba(5, 150, 105, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .validate-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(5, 150, 105, 0.5), 0 10px 10px -5px rgba(5, 150, 105, 0.2);
            background: linear-gradient(135deg, #10b981, #059669, #16a34a);
          }
          
          .validate-button:disabled {
            background: linear-gradient(135deg, #d1d5db, #9ca3af);
            cursor: not-allowed;
            transform: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-shadow: none;
          }
          
          .footer-text {
            text-align: center;
            margin-top: 24px;
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
            letter-spacing: 1px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
            font-family: 'Georgia', serif;
          }

          .manual-add-button {
            width: 20px;
            height: 20px;
            border: none;
            border-radius: 50%;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            margin-left: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .manual-add-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          }

          .manual-input-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .manual-input-modal {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
          }

          .manually-added-indicator {
            margin-left: 4px;
            font-size: 10px;
            opacity: 0.8;
          }

          .manually-added {
            background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8));
            border-left: 3px solid #10b981;
            padding-left: 6px;
          }

          .confirmation-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .donation-summary {
            background: linear-gradient(135deg, #ec4899, #be185d);
            color: white;
            padding: 12px;
            border-radius: 12px;
            margin: 16px 0;
            text-align: center;
            box-shadow: 0 8px 15px rgba(236, 72, 153, 0.3);
          }

          .donation-summary h3 {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
        `}
      </style>
      
      <div className="shopping-list-container">
        {/* En-tête avec compteurs */}
        <div className="shopping-list-header">
          <h1 className="shopping-list-title">LISTE DE COURSES</h1>
          
          <div className="shopping-list-subtitle">
            <div className="subtitle-item">
              <span style={{ color: '#2e7d32', fontSize: '16px' }}>✅</span>
              <span>TEXTE MODIFIABLE</span>
            </div>
            <div className="subtitle-item">
              <span style={{ color: '#2e7d32', fontSize: '16px' }}>✅</span>
              <span>CASE À COCHER</span>
            </div>
            <div className="subtitle-item">
              <span style={{ color: '#e91e63', fontSize: '16px' }}>💖</span>
              <span>CLIQUE SUR LE COEUR POUR FAIRE UN DON</span>
            </div>
          </div>
          
          <div className="app-logo">
            <span style={{ fontSize: '16px' }}>📱</span>
            <span style={{ fontWeight: '900' }}>APPLICATION RÉMUNÉRATRICE</span>
          </div>

          {/* Compteurs */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
              <ShoppingCart className="mr-1" size={14} />
              <span className="font-bold">{checkedItems.size}</span> articles
            </div>
            {donationItems.size > 0 && (
              <div className="flex items-center px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                <Heart className="mr-1 fill-current" size={14} />
                <span className="font-bold">{donationItems.size}</span> dons
              </div>
            )}
          </div>
        </div>
        
        {/* Grille des catégories compacte */}
        <div className="shopping-categories">
          {shoppingCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex} 
              className="shopping-category" 
              style={{ 
                borderColor: category.color,
                color: category.color
              }}
            >
              <div className="category-header" style={{ color: category.color }}>
                <span style={{ fontSize: '16px' }}>{category.icon}</span>
                <span>{category.name}</span>
                {category.name !== 'Notes' && (
                  <button
                    onClick={() => handleAddManualProduct(category.name)}
                    className="manual-add-button"
                    style={{ 
                      backgroundColor: category.color,
                      color: 'white'
                    }}
                  >
                    +
                  </button>
                )}
              </div>
              
              <div className="category-items">
                {[...category.items, ...(manuallyAddedItems[category.name.toLowerCase()] || [])].map((item, itemIndex) => {
                  const itemKey = item.toLowerCase();
                  const isChecked = checkedItems.has(itemKey);
                  const isDonation = donationItems.has(itemKey);
                  const isDisabled = item === '---';
                  const isManuallyAdded = manuallyAddedItems[category.name.toLowerCase()]?.includes(item);
                  
                  return (
                    <div 
                      key={itemIndex} 
                      className={`shopping-item ${isDisabled ? 'disabled' : ''} ${isManuallyAdded ? 'manually-added' : ''}`}
                    >
                      <input 
                        type="checkbox" 
                        id={`${category.name}-${itemIndex}`}
                        className="shopping-checkbox"
                        style={{ 
                          borderColor: category.color, 
                          color: category.color 
                        }}
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => !isDisabled && handleItemToggle(item, category.name.toLowerCase())}
                      />
                      <label 
                        htmlFor={`${category.name}-${itemIndex}`}
                        className={`shopping-label ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && handleItemToggle(item, category.name.toLowerCase())}
                      >
                        {item}
                        {isManuallyAdded && (
                          <span className="manually-added-indicator" title="Ajouté manuellement">
                            ✨
                          </span>
                        )}
                      </label>
                      
                      {/* Cœur pour les dons - visible seulement si l'item est coché */}
                      {!isDisabled && isChecked && (
                        <Heart
                          className={`donation-heart ${isDonation ? 'active' : ''} ${isDonation ? 'fill-current' : ''}`}
                          size={14}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDonationToggle(item);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Résumé des dons si il y en a */}
        {donationItems.size > 0 && (
          <div className="donation-summary">
            <h3>🎁 Dons Solidaires Sélectionnés</h3>
            <p className="text-sm">
              {donationItems.size} produit{donationItems.size > 1 ? 's' : ''} sélectionné{donationItems.size > 1 ? 's' : ''} pour les associations locales
            </p>
            <div className="flex items-center justify-center mt-2 text-xs">
              <Users className="mr-1" size={12} />
              <span>Notifications automatiques aux associations</span>
            </div>
          </div>
        )}
        
        {/* Modal d'ajout manuel */}
        {showManualInput.show && (
          <div className="manual-input-overlay">
            <div className="manual-input-modal">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ajouter un produit dans "{lastClickedCategory}"
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Le produit sera automatiquement ajouté à la catégorie "{lastClickedCategory}" et coché dans votre liste.
              </p>
              <input
                type="text"
                placeholder="Nom du produit..."
                value={manualProductName}
                onChange={(e) => setManualProductName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmManualProduct()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none mb-4"
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmManualProduct}
                  disabled={!manualProductName.trim()}
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Ajouter
                </button>
                <button
                  onClick={handleCancelManualProduct}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Toast de confirmation */}
        {showConfirmation.show && (
          <div className="confirmation-toast">
            <div className="flex items-center">
              <CheckCircle className="mr-2 text-white" size={20} />
              <div>
                <div className="font-bold text-sm">Article ajouté !</div>
                <div className="text-xs opacity-90">{showConfirmation.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bouton de validation */}
        <button
          onClick={validateList}
          disabled={checkedItems.size === 0}
          className="validate-button"
        >
          {listStatus === 'validated' ? (
            <>
              <CheckCircle size={24} />
              LISTE VALIDÉE ✓
            </>
          ) : (
            <>
              <Check size={24} />
              {existingList ? 'VALIDER LES MODIFICATIONS' : `VALIDER MA LISTE (${checkedItems.size} ARTICLES)`}
              {donationItems.size > 0 && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                  + {donationItems.size} dons
                </span>
              )}
            </>
          )}
        </button>
        
        {/* Footer */}
        <div className="footer-text">
          Liste de courses créée avec soin pour vos besoins quotidiens
        </div>
      </div>
    </div>
  );
};

export default ShoppingListManager;