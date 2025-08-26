import React, { useState } from 'react';
import { 
  Scan, 
  QrCode, 
  Shield,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  Package,
  Clock,
  Warehouse,
  Heart,
  Globe,
  Bell,
  CheckCircle,
  Target,
  Zap,
  Timer,
  Calendar,
  Users,
  Building,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import StockManagementScanner from './StockManagementScanner';
import QRDistributionTracker from './QRDistributionTracker';
import FraudDetectionSystem from './FraudDetectionSystem';
import StockFlowManager from './StockFlowManager';

interface AssociationServicesProps {
  serviceId: string;
  onBack: () => void;
}

const AssociationServices: React.FC<AssociationServicesProps> = ({ serviceId, onBack }) => {
  const renderAlertsAndAnalytics = () => (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-orange-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Alertes et Analyse des Stocks</h1>
              <p className="text-orange-100 text-sm">Seuils critiques • Tendances • Prévisions IA • Demandes automatiques</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="font-medium">Système PEPS actif</div>
              <div className="text-orange-200">
                Surveillance temps réel
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        
        {/* COLONNE GAUCHE - Alertes Stocks Critiques */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-orange-800 mb-6 flex items-center">
            <AlertTriangle className="mr-3" size={24} />
            Alertes Stocks Critiques
          </h2>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">Système d'Alertes Automatiques</h3>
            <p className="text-orange-700 mb-4">
              Ce système surveille en permanence vos stocks et génère automatiquement des demandes 
              aux ménages lorsque le seuil critique de 6 articles est atteint.
            </p>
            
            <div className="grid md:grid-cols-1 gap-4">
              <div className="bg-white border border-orange-300 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">Fonctionnalités</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Surveillance temps réel des stocks</li>
                  <li>• Seuil critique configurable (défaut: 6 articles)</li>
                  <li>• Demandes automatiques aux 127 ménages</li>
                  <li>• Suivi des réponses et dons reçus</li>
                  <li>• Intégration complète avec le système PEPS</li>
                  <li>• Notifications push instantanées</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Alertes actives simulées */}
          <div className="space-y-4">
            <h3 className="font-semibold text-orange-800 mb-3">Alertes Actives (3)</h3>
            
            {[
              { product: 'Lait demi-écrémé 1L', stock: 4, threshold: 6, shortage: 8, priority: 'high' },
              { product: 'Pain de mie complet', stock: 2, threshold: 6, shortage: 6, priority: 'critical' },
              { product: 'Yaourts nature x8', stock: 5, threshold: 6, shortage: 3, priority: 'medium' }
            ].map((alert, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${
                alert.priority === 'critical' ? 'border-red-300 bg-red-50' :
                alert.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                'border-yellow-300 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className={`font-semibold ${
                      alert.priority === 'critical' ? 'text-red-800' :
                      alert.priority === 'high' ? 'text-orange-800' :
                      'text-yellow-800'
                    }`}>{alert.product}</h4>
                    <p className={`text-sm ${
                      alert.priority === 'critical' ? 'text-red-600' :
                      alert.priority === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      Stock: {alert.stock} / Seuil: {alert.threshold}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      alert.priority === 'critical' ? 'text-red-600' :
                      alert.priority === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      -{alert.shortage}
                    </div>
                    <div className={`text-xs ${
                      alert.priority === 'critical' ? 'text-red-600' :
                      alert.priority === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>manquant</div>
                  </div>
                </div>

                <button className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  alert.priority === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                  alert.priority === 'high' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                } text-white`}>
                  <Heart className="mr-2" size={16} />
                  Demande PEPS aux ménages ({alert.shortage} unités)
                </button>
              </div>
            ))}
          </div>

          {/* Historique des demandes */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Globe className="mr-2" size={18} />
              Demandes PEPS envoyées (5)
            </h3>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {[
                { product: 'Riz basmati 1kg', quantity: 10, date: '16/01', responses: 8 },
                { product: 'Conserve tomates', quantity: 15, date: '15/01', responses: 12 },
                { product: 'Pâtes spaghetti', quantity: 8, date: '14/01', responses: 6 },
                { product: 'Huile d\'olive', quantity: 5, date: '13/01', responses: 4 },
                { product: 'Céréales', quantity: 12, date: '12/01', responses: 9 }
              ].map((request, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-blue-800 text-sm">{request.product}</div>
                    <div className="text-xs text-blue-600">
                      {request.date}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-blue-700">
                      PEPS: {request.quantity} • 127 ménages
                    </div>
                    <div className="text-green-600 font-medium">
                      {request.responses} réponses
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE - Analytics et Prévisions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-indigo-800 mb-6 flex items-center">
            <TrendingDown className="mr-3" size={24} />
            Analytics & Prévisions IA
          </h2>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">Intelligence Artificielle Intégrée</h3>
            <p className="text-indigo-700 mb-4">
              Module d'analyse avancée des stocks avec tendances, prévisions et optimisation 
              basée sur l'intelligence artificielle et les données historiques.
            </p>
            
            <div className="grid md:grid-cols-1 gap-4">
              <div className="bg-white border border-indigo-300 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 mb-2">Capacités IA</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Prédiction des ruptures de stock (précision 94%)</li>
                  <li>• Optimisation automatique des commandes</li>
                  <li>• Analyse des tendances saisonnières</li>
                  <li>• Détection d'anomalies comportementales</li>
                  <li>• Recommandations personnalisées</li>
                  <li>• Planification intelligente des distributions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Métriques en temps réel */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Efficacité PEPS</h3>
              <p className="text-2xl font-bold text-green-600">96.2%</p>
              <p className="text-sm text-green-600">Rotation optimale</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Prévisions IA</h3>
              <p className="text-2xl font-bold text-blue-600">94.7%</p>
              <p className="text-sm text-blue-600">Précision</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Réduction gaspillage</h3>
              <p className="text-2xl font-bold text-purple-600">-23%</p>
              <p className="text-sm text-purple-600">Ce trimestre</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Temps de réponse</h3>
              <p className="text-2xl font-bold text-orange-600">2.4h</p>
              <p className="text-sm text-orange-600">Moyenne alertes</p>
            </div>
          </div>

          {/* Tendances et graphiques */}
          <div className="space-y-4">
            <h3 className="font-semibold text-indigo-800 mb-3">Tendances Détectées</h3>
            
            {[
              { 
                trend: 'Pic de demande prévu', 
                product: 'Produits laitiers', 
                prediction: '+35% dans 3 jours',
                confidence: 92,
                action: 'Recommandation: Augmenter les stocks',
                type: 'warning'
              },
              { 
                trend: 'Baisse saisonnière', 
                product: 'Conserves', 
                prediction: '-15% cette semaine',
                confidence: 87,
                action: 'Optimisation: Réduire les commandes',
                type: 'info'
              },
              { 
                trend: 'Anomalie détectée', 
                product: 'Pain frais', 
                prediction: 'Consommation inhabituelle',
                confidence: 78,
                action: 'Investigation: Vérifier les données',
                type: 'alert'
              }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                item.type === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                item.type === 'info' ? 'border-blue-300 bg-blue-50' :
                'border-red-300 bg-red-50'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className={`font-semibold text-sm ${
                      item.type === 'warning' ? 'text-yellow-800' :
                      item.type === 'info' ? 'text-blue-800' :
                      'text-red-800'
                    }`}>{item.trend}</h4>
                    <p className={`text-sm ${
                      item.type === 'warning' ? 'text-yellow-700' :
                      item.type === 'info' ? 'text-blue-700' :
                      'text-red-700'
                    }`}>{item.product}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      item.type === 'warning' ? 'text-yellow-600' :
                      item.type === 'info' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {item.prediction}
                    </div>
                    <div className={`text-xs ${
                      item.type === 'warning' ? 'text-yellow-600' :
                      item.type === 'info' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>Confiance: {item.confidence}%</div>
                  </div>
                </div>
                
                <div className={`text-xs ${
                  item.type === 'warning' ? 'text-yellow-700' :
                  item.type === 'info' ? 'text-blue-700' :
                  'text-red-700'
                } bg-white border rounded p-2 mt-2`}>
                  <Lightbulb className="inline mr-1" size={12} />
                  {item.action}
                </div>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                <Download className="mr-1" size={14} />
                Rapport IA
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                <Settings className="mr-1" size={14} />
                Config Seuils
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                <TrendingUp className="mr-1" size={14} />
                Prévisions
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                <RefreshCw className="mr-1" size={14} />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceContent = () => {
    switch (serviceId) {
      case 'stock-management':
        return <StockFlowManager />;
      
      case 'qr-distribution':
        return <QRDistributionTracker />;
      
      case 'fraud-detection':
        return <FraudDetectionSystem />;
      
      case 'alerts-analytics':
        return renderAlertsAndAnalytics();

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Service en développement</h2>
            <p className="text-gray-500 mb-6">Ce service sera bientôt disponible.</p>
            <button
              onClick={onBack}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
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

export default AssociationServices;