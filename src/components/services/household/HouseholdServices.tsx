import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Camera, 
  Heart, 
  Car, 
  TrendingUp,
  Gift,
  ArrowLeft,
  AlertCircle,
  Truck,
  Users,
  MapPin,
  Calculator,
  Package,
  Clock,
  Navigation,
  Loader,
  FileText,
  Download,
  Eye,
  Calendar,
  Settings,
  Zap
} from 'lucide-react';
import ShoppingListManager from './ShoppingListManager';
import InStoreScanner from './InStoreScanner';
import PriceComparator from './PriceComparator';
import DonationsManager from './DonationsManager';
import AIImageScanner from './AIImageScanner';
import ClassicBarcodeScanner from './ClassicBarcodeScanner';
import DatabaseService, { ShoppingList } from '../../../data/database';

interface HouseholdServicesProps {
  serviceId: string;
  onBack: () => void;
}

const HouseholdServices: React.FC<HouseholdServicesProps> = ({ serviceId, onBack }) => {
  const [validatedList, setValidatedList] = useState<ShoppingList | null>(null);
  const [currentService, setCurrentService] = useState<string>(serviceId);
  const [listToRectify, setListToRectify] = useState<ShoppingList | null>(null);
  const [selectedTransportService, setSelectedTransportService] = useState<string | null>(null);
  
  // États pour les calculs de transport avec géolocalisation
  const [distance, setDistance] = useState<number>(0);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('standard');
  const [isCalculatingDistance, setIsCalculatingDistance] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('');

  // Charger la liste validée au démarrage
  useEffect(() => {
    const existingList = DatabaseService.getValidatedList();
    if (existingList) {
      setValidatedList(existingList);
    }
  }, []);

  // Obtenir la géolocalisation de l'utilisateur
  useEffect(() => {
    if (selectedTransportService && !userLocation) {
      getCurrentLocation();
    }
  }, [selectedTransportService]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsCalculatingDistance(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setIsCalculatingDistance(false);
          
          // Si un magasin est sélectionné, calculer automatiquement la distance
          if (selectedStore) {
            calculateDistanceToStore(location, selectedStore);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setIsCalculatingDistance(false);
          // Utiliser une distance par défaut en cas d'erreur
          setDistance(10);
          alert('Impossible d\'obtenir votre position. Distance par défaut utilisée: 10km');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      setDistance(10); // Distance par défaut
    }
  };

  const calculateDistanceToStore = (userLoc: {lat: number, lng: number}, storeId: string) => {
    const stores = DatabaseService.getStores();
    const store = stores.find(s => s.id === storeId);
    
    if (store && userLoc) {
      // Calcul de la distance en utilisant la formule de Haversine
      const R = 6371; // Rayon de la Terre en km
      const dLat = (store.coordinates.lat - userLoc.lat) * Math.PI / 180;
      const dLng = (store.coordinates.lng - userLoc.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(store.coordinates.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const calculatedDistance = R * c;
      
      setDistance(Math.round(calculatedDistance * 10) / 10); // Arrondir à 1 décimale
    }
  };

  const calculateDistanceToAddress = async (address: string) => {
    if (!userLocation || !address.trim()) return;
    
    setIsCalculatingDistance(true);
    
    // Simulation d'un appel à une API de géocodage (Google Maps, OpenStreetMap, etc.)
    // En production, vous utiliseriez une vraie API
    setTimeout(() => {
      // Distance simulée basée sur l'adresse
      const simulatedDistance = Math.random() * 20 + 2; // Entre 2 et 22 km
      setDistance(Math.round(simulatedDistance * 10) / 10);
      setIsCalculatingDistance(false);
    }, 1500);
  };

  const handleListValidated = (list: ShoppingList) => {
    setValidatedList(list);
    setListToRectify(null);
    setCurrentService('scanner');
  };

  const handleListUpdated = (list: ShoppingList) => {
    setValidatedList(list);
    DatabaseService.saveShoppingList(list);
  };

  const handleNavigateToShoppingList = () => {
    setListToRectify(null);
    setCurrentService('shopping-list');
  };

  const handleRectifyList = () => {
    if (validatedList) {
      setListToRectify(validatedList);
      setCurrentService('shopping-list');
    }
  };

  // Calculs pour le covoiturage
  const calculateCovoituragePrice = (distance: number) => {
    const basePrice = 15;
    const pricePerKm = 0.60;
    const commission = 0.15;
    
    const subtotal = basePrice + (distance * pricePerKm);
    const commissionAmount = subtotal * commission;
    const total = subtotal + commissionAmount;
    
    return {
      basePrice,
      kmPrice: distance * pricePerKm,
      subtotal,
      commissionAmount,
      total
    };
  };

  // Calculs pour la livraison
  const calculateLivraisonPrice = (distance: number, vehicleType: string) => {
    const basePrice = 15;
    const pricePerKm = 0.60;
    const commission = 0.15;
    
    // Suppléments selon le type de véhicule
    const vehicleSupplements = {
      'standard': 0,
      'utilitaire': 10,
      'camionnette': 20,
      'camion': 35,
      'refrigere': 25
    };
    
    const vehicleSupplement = vehicleSupplements[vehicleType as keyof typeof vehicleSupplements] || 0;
    const subtotal = basePrice + (distance * pricePerKm) + vehicleSupplement;
    const commissionAmount = subtotal * commission;
    const total = subtotal + commissionAmount;
    
    return {
      basePrice,
      kmPrice: distance * pricePerKm,
      vehicleSupplement,
      subtotal,
      commissionAmount,
      total
    };
  };

  const vehicleTypes = [
    {
      id: 'standard',
      name: 'Véhicule Standard',
      description: 'Voiture personnelle (coffre standard)',
      capacity: 'Jusqu\'à 5 sacs de courses',
      supplement: 0,
      icon: '🚗'
    },
    {
      id: 'utilitaire',
      name: 'Utilitaire Léger',
      description: 'Véhicule utilitaire compact',
      capacity: 'Jusqu\'à 15 sacs ou produits volumineux',
      supplement: 10,
      icon: '🚐'
    },
    {
      id: 'camionnette',
      name: 'Camionnette',
      description: 'Pour gros volumes ou électroménager',
      capacity: 'Jusqu\'à 30 sacs ou gros électroménager',
      supplement: 20,
      icon: '🚚'
    },
    {
      id: 'camion',
      name: 'Camion',
      description: 'Pour très gros volumes ou mobilier',
      capacity: 'Mobilier, gros électroménager',
      supplement: 35,
      icon: '🚛'
    },
    {
      id: 'refrigere',
      name: 'Véhicule Réfrigéré',
      description: 'Pour produits frais et surgelés',
      capacity: 'Produits frais, surgelés, température contrôlée',
      supplement: 25,
      icon: '🧊'
    }
  ];

  const renderGeolocationSection = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
        <Navigation className="mr-2" size={20} />
        Calcul automatique du trajet
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sélection magasin ou adresse personnalisée */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="space-y-3">
            <select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                if (e.target.value && userLocation) {
                  calculateDistanceToStore(userLocation, e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un magasin</option>
              {DatabaseService.getStores().map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} - {store.address}
                </option>
              ))}
            </select>
            
            <div className="text-center text-gray-500 text-sm">ou</div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Adresse personnalisée..."
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => calculateDistanceToAddress(destinationAddress)}
                disabled={!destinationAddress.trim() || isCalculatingDistance}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isCalculatingDistance ? <Loader className="animate-spin" size={16} /> : 'Calculer'}
              </button>
            </div>
          </div>
        </div>

        {/* Affichage du résultat */}
        <div className="bg-white border border-blue-300 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <MapPin className="mr-2" size={16} />
            Résultat du calcul
          </h4>
          
          {isCalculatingDistance ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin mr-2 text-blue-600" size={20} />
              <span className="text-blue-600">Calcul en cours...</span>
            </div>
          ) : userLocation ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-green-600">
                <Navigation className="mr-2" size={14} />
                <span>Position détectée</span>
              </div>
              {distance > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span>Distance calculée:</span>
                    <span className="font-bold text-blue-600">{distance} km</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Calcul basé sur votre position GPS actuelle
                  </div>
                </>
              ) : (
                <div className="text-gray-600">
                  Sélectionnez une destination pour calculer la distance
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <button
                onClick={getCurrentLocation}
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Navigation className="mr-2" size={16} />
                Activer la géolocalisation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTransportServices = () => (
    <div className="space-y-6">
      {/* En-tête avec retour */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSelectedTransportService(null)}
              className="flex items-center text-white/80 hover:text-white mr-4 transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              Retour
            </button>
            <div className="flex items-center">
              <Car className="mr-3" size={28} />
              <div>
                <h1 className="text-xl font-bold">Services de Transport</h1>
                <p className="text-emerald-100 text-sm">Covoiturage et livraison avec géolocalisation automatique</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection du service si aucun n'est sélectionné */}
      {!selectedTransportService ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pastille Covoiturage */}
          <button
            onClick={() => setSelectedTransportService('covoiturage')}
            className="group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg mb-6 group-hover:shadow-xl transition-shadow">
                <Users size={32} className="text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-800 transition-colors">
                  Covoiturage
                </h3>
                <p className="text-emerald-600 font-medium mb-4">
                  Partagez vos trajets courses
                </p>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Tarif de base:</span>
                    <span className="font-semibold text-emerald-600">15€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Par kilomètre:</span>
                    <span className="font-semibold text-emerald-600">0.60€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission app:</span>
                    <span className="font-semibold text-emerald-600">15%</span>
                  </div>
                  <div className="flex items-center mt-3 text-blue-600">
                    <Navigation className="mr-1" size={14} />
                    <span className="text-xs">Calcul GPS automatique</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-10 rounded-full transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-300"></div>
          </button>

          {/* Pastille Livraison */}
          <button
            onClick={() => setSelectedTransportService('livraison')}
            className="group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-white border-2 border-teal-200 hover:border-teal-400 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-teal-400 to-teal-600 shadow-lg mb-6 group-hover:shadow-xl transition-shadow">
                <Truck size={32} className="text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-800 transition-colors">
                  Livraison
                </h3>
                <p className="text-teal-600 font-medium mb-4">
                  Livraison avec choix du véhicule
                </p>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Tarif de base:</span>
                    <span className="font-semibold text-teal-600">15€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Par kilomètre:</span>
                    <span className="font-semibold text-teal-600">0.60€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission app:</span>
                    <span className="font-semibold text-teal-600">15%</span>
                  </div>
                  <div className="flex items-center mt-3 text-blue-600">
                    <Navigation className="mr-1" size={14} />
                    <span className="text-xs">Calcul GPS automatique</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-teal-400 to-teal-600 opacity-10 rounded-full transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-300"></div>
          </button>
        </div>
      ) : (
        /* Interface détaillée du service sélectionné */
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Section géolocalisation commune */}
          {renderGeolocationSection()}

          {selectedTransportService === 'covoiturage' ? (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Users className="mr-3 text-emerald-600" size={28} />
                Service de Covoiturage
              </h2>
              
              {/* Calculateur de prix */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                  <Calculator className="mr-2" size={20} />
                  Calculateur de Prix Automatique
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-white border border-emerald-300 rounded-lg p-4">
                      <h4 className="font-medium text-emerald-800 mb-3">Distance calculée</h4>
                      <div className="flex items-center justify-center">
                        {distance > 0 ? (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-600">{distance} km</div>
                            <div className="text-sm text-emerald-600">Trajet GPS</div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <Navigation className="mx-auto mb-2" size={32} />
                            <div className="text-sm">Sélectionnez une destination</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-emerald-300 rounded-lg p-4">
                    <h4 className="font-medium text-emerald-800 mb-3">Détail du calcul</h4>
                    {(() => {
                      const calc = calculateCovoituragePrice(distance);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tarif de base:</span>
                            <span>{calc.basePrice.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance ({distance}km × 0.60€):</span>
                            <span>{calc.kmPrice.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between border-t border-emerald-200 pt-2">
                            <span>Sous-total:</span>
                            <span>{calc.subtotal.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commission app (15%):</span>
                            <span>{calc.commissionAmount.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between border-t border-emerald-300 pt-2 font-bold text-emerald-600">
                            <span>Total à payer:</span>
                            <span>{calc.total.toFixed(2)}€</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Avantages</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Économique et écologique
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Rencontres et convivialité
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Assurance incluse
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Conducteurs vérifiés
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Navigation className="mr-2 text-gray-500" size={16} />
                      <span>Géolocalisation automatique</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 text-gray-500" size={16} />
                      <span>Réservation jusqu'à 2h avant</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="mr-2 text-gray-500" size={16} />
                      <span>Espace coffre partagé</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                disabled={distance === 0}
                className={`w-full py-3 rounded-lg font-medium text-lg flex items-center justify-center transition-colors ${
                  distance > 0 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Users className="mr-2" size={20} />
                {distance > 0 
                  ? `Réserver un covoiturage pour ${calculateCovoituragePrice(distance).total.toFixed(2)}€`
                  : 'Sélectionnez une destination pour continuer'
                }
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Truck className="mr-3 text-teal-600" size={28} />
                Service de Livraison
              </h2>
              
              {/* Calculateur de prix avec choix du véhicule */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                  <Calculator className="mr-2" size={20} />
                  Calculateur de Prix Automatique
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="bg-white border border-teal-300 rounded-lg p-4">
                      <h4 className="font-medium text-teal-800 mb-3">Distance calculée</h4>
                      <div className="flex items-center justify-center">
                        {distance > 0 ? (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-teal-600">{distance} km</div>
                            <div className="text-sm text-teal-600">Trajet GPS</div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <Navigation className="mx-auto mb-2" size={32} />
                            <div className="text-sm">Sélectionnez une destination</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-teal-300 rounded-lg p-4">
                    <h4 className="font-medium text-teal-800 mb-3">Détail du calcul</h4>
                    {(() => {
                      const calc = calculateLivraisonPrice(distance, selectedVehicle);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tarif de base:</span>
                            <span>{calc.basePrice.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance ({distance}km × 0.60€):</span>
                            <span>{calc.kmPrice.toFixed(2)}€</span>
                          </div>
                          {calc.vehicleSupplement > 0 && (
                            <div className="flex justify-between">
                              <span>Supplément véhicule:</span>
                              <span>{calc.vehicleSupplement.toFixed(2)}€</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-teal-200 pt-2">
                            <span>Sous-total:</span>
                            <span>{calc.subtotal.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commission app (15%):</span>
                            <span>{calc.commissionAmount.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between border-t border-teal-300 pt-2 font-bold text-teal-600">
                            <span>Total à payer:</span>
                            <span>{calc.total.toFixed(2)}€</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Choix du véhicule */}
                <div>
                  <h4 className="font-medium text-teal-800 mb-3">Choix du véhicule</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vehicleTypes.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedVehicle === vehicle.id
                            ? 'border-teal-500 bg-teal-100'
                            : 'border-gray-200 bg-white hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{vehicle.icon}</span>
                          {vehicle.supplement > 0 && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                              +{vehicle.supplement}€
                            </span>
                          )}
                        </div>
                        <h5 className="font-medium text-gray-800 text-sm mb-1">
                          {vehicle.name}
                        </h5>
                        <p className="text-xs text-gray-600 mb-1">
                          {vehicle.description}
                        </p>
                        <p className="text-xs text-teal-600 font-medium">
                          {vehicle.capacity}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">Options disponibles</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Livraison standard:</span>
                      <span className="font-semibold">2-4h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison express:</span>
                      <span className="font-semibold">1h (+10€)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créneau choisi:</span>
                      <span className="font-semibold">+5€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Produits frais:</span>
                      <span className="font-semibold">Inclus</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Navigation className="mr-2 text-gray-500" size={16} />
                      <span>Livraison à l'adresse exacte</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 text-gray-500" size={16} />
                      <span>Suivi en temps réel</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="mr-2 text-gray-500" size={16} />
                      <span>Assurance marchandises</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                disabled={distance === 0}
                className={`w-full py-3 rounded-lg font-medium text-lg flex items-center justify-center transition-colors ${
                  distance > 0 
                    ? 'bg-teal-600 text-white hover:bg-teal-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Truck className="mr-2" size={20} />
                {distance > 0 
                  ? `Commander une livraison pour ${calculateLivraisonPrice(distance, selectedVehicle).total.toFixed(2)}€`
                  : 'Sélectionnez une destination pour continuer'
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPromotions = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Gift className="mr-3 text-emerald-600" size={28} />
        Catalogue des promotions par magasin
      </h2>
      
      {/* Message d'attente pour l'intégration */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Settings className="text-blue-500 mr-3" size={48} />
          <FileText className="text-blue-500" size={48} />
        </div>
        <h3 className="text-xl font-semibold text-blue-800 mb-3">
          Intégration en cours
        </h3>
        <p className="text-blue-700 mb-4 max-w-2xl mx-auto">
          Cette section est en attente de l'intégration des catalogues publicitaires des enseignes par le webmaster. 
          Les catalogues promotionnels seront bientôt disponibles directement dans l'application.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-blue-600">
          <div className="flex items-center">
            <Calendar className="mr-1" size={16} />
            <span>Intégration prévue</span>
          </div>
          <div className="flex items-center">
            <Download className="mr-1" size={16} />
            <span>Catalogues PDF</span>
          </div>
          <div className="flex items-center">
            <Eye className="mr-1" size={16} />
            <span>Visualisation interactive</span>
          </div>
        </div>
      </div>

      {/* Aperçu des fonctionnalités à venir */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
            <FileText className="mr-2" size={20} />
            Catalogues PDF
          </h3>
          <ul className="space-y-2 text-sm text-emerald-700">
            <li>• Téléchargement direct des catalogues</li>
            <li>• Mise à jour automatique hebdomadaire</li>
            <li>• Archivage des promotions passées</li>
            <li>• Recherche par produit ou catégorie</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <Eye className="mr-2" size={20} />
            Visualisation Interactive
          </h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Feuilletage numérique des catalogues</li>
            <li>• Zoom sur les promotions</li>
            <li>• Ajout direct à la liste de courses</li>
            <li>• Comparaison des prix promotionnels</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Alertes Personnalisées
          </h3>
          <ul className="space-y-2 text-sm text-purple-700">
            <li>• Notifications pour vos produits favoris</li>
            <li>• Alertes prix et promotions</li>
            <li>• Rappels de fin de promotion</li>
            <li>• Suggestions basées sur vos achats</li>
          </ul>
        </div>
      </div>

      {/* Enseignes partenaires prévues */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Enseignes partenaires prévues</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {['Carrefour', 'Leclerc', 'Auchan', 'Monoprix', 'Casino', 'Intermarché', 'Super U', 'Cora'].map((store) => (
            <div key={store} className="bg-white border border-gray-300 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
              <h4 className="font-medium text-gray-800 text-sm">{store}</h4>
              <p className="text-xs text-gray-600 mt-1">Catalogue à venir</p>
            </div>
          ))}
        </div>
      </div>

      {/* Informations techniques */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Information technique</h4>
            <p className="text-sm text-yellow-700">
              Cette fonctionnalité nécessite l'intégration des API des enseignes partenaires et la mise en place 
              d'un système de synchronisation automatique des catalogues promotionnels. Le webmaster procédera 
              à cette intégration dans les prochaines semaines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceContent = () => {
    switch (currentService) {
      case 'shopping-list':
        return <ShoppingListManager onListValidated={handleListValidated} existingList={listToRectify} />;
      case 'scanner':
        return (
          <InStoreScanner 
            validatedList={validatedList} 
            onListUpdated={handleListUpdated}
            onNavigateToShoppingList={handleNavigateToShoppingList}
            onRectifyList={handleRectifyList}
          />
        );
      case 'ai-scanner':
        return <AIImageScanner onBack={onBack} />;
      case 'classic-scanner':
        return <ClassicBarcodeScanner onBack={onBack} />;
      case 'price-comparison':
        return <PriceComparator validatedList={validatedList} />;
      case 'donations':
        return <DonationsManager />;
      case 'transport-services':
        return renderTransportServices();
      case 'promotions':
        return renderPromotions();
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Service en développement</h2>
            <p className="text-gray-500 mb-6">Ce service sera bientôt disponible.</p>
            <button
              onClick={onBack}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Retour aux services
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderServiceContent()}
    </div>
  );
};

export default HouseholdServices;