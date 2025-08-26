import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  Package,
  QrCode,
  Phone,
  Mail,
  FileText,
  Building,
  Globe
} from 'lucide-react';

interface FraudAlert {
  id: string;
  type: 'duplicate_qr' | 'location_mismatch' | 'time_anomaly' | 'quantity_suspicious' | 'identity_fraud' | 'pattern_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  involvedEntities: {
    beneficiaryId?: string;
    beneficiaryName?: string;
    operatorId?: string;
    operatorName?: string;
    qrCode?: string;
    associationId?: string;
  };
  evidence: {
    gpsCoordinates?: { lat: number; lng: number };
    expectedLocation?: string;
    timeStamp?: Date;
    duplicateAttempts?: number;
    suspiciousPattern?: string;
  };
  riskScore: number; // 0-100
  investigationNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface SecurityMetrics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  falsePositives: number;
  criticalAlerts: number;
  averageResolutionTime: number; // en heures
  fraudPrevented: number; // nombre de fraudes évitées
  systemReliability: number; // pourcentage
}

const FraudDetectionSystem: React.FC = () => {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    {
      id: 'fraud_001',
      type: 'duplicate_qr',
      severity: 'high',
      title: 'Tentative d\'utilisation multiple du QR Code',
      description: 'Le QR code QR-2024-001-003 a été scanné 3 fois en 2 heures par des opérateurs différents',
      detectedAt: new Date('2024-01-17T14:30:00'),
      status: 'investigating',
      involvedEntities: {
        beneficiaryId: 'ben_001',
        beneficiaryName: 'Marie Dubois',
        qrCode: 'QR-2024-001-003'
      },
      evidence: {
        duplicateAttempts: 3,
        timeStamp: new Date('2024-01-17T14:30:00')
      },
      riskScore: 85,
      investigationNotes: 'Vérification en cours avec les opérateurs concernés'
    },
    {
      id: 'fraud_002',
      type: 'location_mismatch',
      severity: 'critical',
      title: 'Géolocalisation incohérente',
      description: 'Distribution effectuée à 15km de l\'association déclarée',
      detectedAt: new Date('2024-01-17T16:45:00'),
      status: 'active',
      involvedEntities: {
        beneficiaryId: 'ben_002',
        beneficiaryName: 'Ahmed Hassan',
        operatorId: 'op_002',
        operatorName: 'Pierre Martin',
        qrCode: 'QR-2024-002-002'
      },
      evidence: {
        gpsCoordinates: { lat: 43.1234, lng: 5.1234 },
        expectedLocation: 'Restos du Cœur Marseille Centre'
      },
      riskScore: 95
    },
    {
      id: 'fraud_003',
      type: 'time_anomaly',
      severity: 'medium',
      title: 'Distribution en dehors des heures d\'ouverture',
      description: 'QR code utilisé à 23h45, en dehors des heures d\'ouverture de l\'association',
      detectedAt: new Date('2024-01-16T23:45:00'),
      status: 'resolved',
      involvedEntities: {
        beneficiaryId: 'ben_003',
        beneficiaryName: 'Sophie Martin',
        operatorId: 'op_001',
        operatorName: 'Sophie Laurent'
      },
      evidence: {
        timeStamp: new Date('2024-01-16T23:45:00')
      },
      riskScore: 65,
      resolvedBy: 'Admin Sécurité',
      resolvedAt: new Date('2024-01-17T09:00:00'),
      investigationNotes: 'Distribution d\'urgence autorisée par le responsable'
    },
    {
      id: 'fraud_004',
      type: 'quantity_suspicious',
      severity: 'medium',
      title: 'Quantité anormalement élevée',
      description: 'Distribution de 50 articles pour un foyer de 2 personnes',
      detectedAt: new Date('2024-01-17T11:20:00'),
      status: 'investigating',
      involvedEntities: {
        beneficiaryId: 'ben_001',
        beneficiaryName: 'Marie Dubois'
      },
      evidence: {
        suspiciousPattern: 'Quantité 5x supérieure à la moyenne'
      },
      riskScore: 70
    },
    {
      id: 'fraud_005',
      type: 'identity_fraud',
      severity: 'critical',
      title: 'Suspicion d\'usurpation d\'identité',
      description: 'Même numéro de téléphone utilisé pour 3 bénéficiaires différents',
      detectedAt: new Date('2024-01-17T13:15:00'),
      status: 'active',
      involvedEntities: {
        beneficiaryName: 'Multiples identités suspectes'
      },
      evidence: {
        suspiciousPattern: 'Téléphone: 06 XX XX XX XX utilisé par 3 profils'
      },
      riskScore: 90
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const securityMetrics: SecurityMetrics = {
    totalAlerts: fraudAlerts.length,
    activeAlerts: fraudAlerts.filter(a => a.status === 'active').length,
    resolvedAlerts: fraudAlerts.filter(a => a.status === 'resolved').length,
    falsePositives: fraudAlerts.filter(a => a.status === 'false_positive').length,
    criticalAlerts: fraudAlerts.filter(a => a.severity === 'critical').length,
    averageResolutionTime: 4.2,
    fraudPrevented: 12,
    systemReliability: 94.7
  };

  const filteredAlerts = fraudAlerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.involvedEntities.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.involvedEntities.qrCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesType && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-300';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'false_positive': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'duplicate_qr': return 'QR Dupliqué';
      case 'location_mismatch': return 'Géolocalisation';
      case 'time_anomaly': return 'Horaire Suspect';
      case 'quantity_suspicious': return 'Quantité Anormale';
      case 'identity_fraud': return 'Usurpation';
      case 'pattern_anomaly': return 'Comportement Suspect';
      default: return 'Autre';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'investigating': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'false_positive': return 'Faux positif';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle size={14} />;
      case 'investigating': return <Eye size={14} />;
      case 'resolved': return <CheckCircle size={14} />;
      case 'false_positive': return <XCircle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const handleUpdateAlertStatus = (alertId: string, newStatus: FraudAlert['status']) => {
    setFraudAlerts(alerts => alerts.map(alert => {
      if (alert.id === alertId) {
        const updatedAlert = { 
          ...alert, 
          status: newStatus,
          resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
          resolvedBy: newStatus === 'resolved' ? 'Opérateur Sécurité' : undefined
        };
        return updatedAlert;
      }
      return alert;
    }));
  };

  const handleExportReport = () => {
    const reportContent = [
      'RAPPORT DE SÉCURITÉ - DÉTECTION DE FRAUDES',
      `Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      '',
      'MÉTRIQUES GLOBALES:',
      `- Total alertes: ${securityMetrics.totalAlerts}`,
      `- Alertes actives: ${securityMetrics.activeAlerts}`,
      `- Alertes critiques: ${securityMetrics.criticalAlerts}`,
      `- Fraudes évitées: ${securityMetrics.fraudPrevented}`,
      `- Fiabilité système: ${securityMetrics.systemReliability}%`,
      '',
      'DÉTAIL DES ALERTES:',
      ...filteredAlerts.map(alert => [
        `ID: ${alert.id}`,
        `Type: ${getTypeLabel(alert.type)}`,
        `Sévérité: ${alert.severity.toUpperCase()}`,
        `Statut: ${getStatusText(alert.status)}`,
        `Score de risque: ${alert.riskScore}/100`,
        `Détecté le: ${alert.detectedAt.toLocaleDateString('fr-FR')}`,
        `Titre: ${alert.title}`,
        `Description: ${alert.description}`,
        alert.involvedEntities.beneficiaryName ? `Bénéficiaire: ${alert.involvedEntities.beneficiaryName}` : '',
        alert.involvedEntities.qrCode ? `QR Code: ${alert.involvedEntities.qrCode}` : '',
        alert.investigationNotes ? `Notes: ${alert.investigationNotes}` : '',
        '---'
      ].filter(Boolean).join('\n'))
    ].join('\n');

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-securite-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Sécurité Avancée - Détection de Fraudes</h1>
              <p className="text-red-100 text-sm">Surveillance IA • Détection d'anomalies • Protection système</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportReport}
              className="flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Download className="mr-2" size={16} />
              Rapport
            </button>
            
            <div className="text-right text-sm">
              <div className="font-medium">{securityMetrics.activeAlerts} alertes actives</div>
              <div className="text-red-200">
                Fiabilité: {securityMetrics.systemReliability}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques de sécurité */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Alertes Critiques</h3>
            <p className="text-2xl font-bold text-red-600">{securityMetrics.criticalAlerts}</p>
            <p className="text-sm text-red-600">Intervention immédiate</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">En Investigation</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {fraudAlerts.filter(a => a.status === 'investigating').length}
            </p>
            <p className="text-sm text-yellow-600">Analyse en cours</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Fraudes Évitées</h3>
            <p className="text-2xl font-bold text-green-600">{securityMetrics.fraudPrevented}</p>
            <p className="text-sm text-green-600">Ce mois</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Fiabilité Système</h3>
            <p className="text-2xl font-bold text-blue-600">{securityMetrics.systemReliability}%</p>
            <p className="text-sm text-blue-600">Précision IA</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher une alerte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-gray-400" size={16} />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Toutes sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Tous statuts</option>
              <option value="active">Actives</option>
              <option value="investigating">En cours</option>
              <option value="resolved">Résolues</option>
              <option value="false_positive">Faux positifs</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="text-gray-400" size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Tous types</option>
              <option value="duplicate_qr">QR Dupliqué</option>
              <option value="location_mismatch">Géolocalisation</option>
              <option value="time_anomaly">Horaire Suspect</option>
              <option value="quantity_suspicious">Quantité Anormale</option>
              <option value="identity_fraud">Usurpation</option>
              <option value="pattern_anomaly">Comportement Suspect</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="p-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Shield className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Aucune alerte trouvée</p>
            <p className="text-gray-500 text-sm">Modifiez vos filtres de recherche</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden ${
                  alert.severity === 'critical' ? 'border-l-red-500' :
                  alert.severity === 'high' ? 'border-l-orange-500' :
                  alert.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <AlertTriangle className={`mr-3 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} size={24} />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {alert.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Détecté le {alert.detectedAt.toLocaleDateString('fr-FR')} à {alert.detectedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs border flex items-center ${getStatusColor(alert.status)}`}>
                        {getStatusIcon(alert.status)}
                        <span className="ml-1">{getStatusText(alert.status)}</span>
                      </span>
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Score de risque */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                        <BarChart3 className="mr-1" size={16} />
                        Score de Risque
                      </h4>
                      <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getRiskScoreColor(alert.riskScore)}`}>
                        {alert.riskScore}/100
                      </div>
                    </div>

                    {/* Entités impliquées */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                        <User className="mr-1" size={16} />
                        Entités Impliquées
                      </h4>
                      <div className="space-y-1 text-sm">
                        {alert.involvedEntities.beneficiaryName && (
                          <div><strong>Bénéficiaire:</strong> {alert.involvedEntities.beneficiaryName}</div>
                        )}
                        {alert.involvedEntities.operatorName && (
                          <div><strong>Opérateur:</strong> {alert.involvedEntities.operatorName}</div>
                        )}
                        {alert.involvedEntities.qrCode && (
                          <div><strong>QR Code:</strong> {alert.involvedEntities.qrCode}</div>
                        )}
                      </div>
                    </div>

                    {/* Type et preuves */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                        <Package className="mr-1" size={16} />
                        Type et Preuves
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Type:</strong> {getTypeLabel(alert.type)}</div>
                        {alert.evidence.duplicateAttempts && (
                          <div><strong>Tentatives:</strong> {alert.evidence.duplicateAttempts}</div>
                        )}
                        {alert.evidence.suspiciousPattern && (
                          <div><strong>Motif:</strong> {alert.evidence.suspiciousPattern}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {alert.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                      <button
                        onClick={() => handleUpdateAlertStatus(alert.id, 'investigating')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        Enquêter
                      </button>
                      <button
                        onClick={() => handleUpdateAlertStatus(alert.id, 'resolved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Résoudre
                      </button>
                      <button
                        onClick={() => handleUpdateAlertStatus(alert.id, 'false_positive')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Faux Positif
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Détails de l'alerte de sécurité
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* En-tête alerte */}
              <div className={`border-l-4 rounded-lg p-4 ${
                selectedAlert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                selectedAlert.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                selectedAlert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold">{selectedAlert.title}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(selectedAlert.status)}`}>
                      {getStatusText(selectedAlert.status)}
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-2">{selectedAlert.description}</p>
                <div className="text-xs text-gray-600">
                  ID: {selectedAlert.id} • Score de risque: {selectedAlert.riskScore}/100
                </div>
              </div>

              {/* Détails techniques */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Informations Générales</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {getTypeLabel(selectedAlert.type)}</div>
                    <div><strong>Détecté le:</strong> {selectedAlert.detectedAt.toLocaleDateString('fr-FR')} à {selectedAlert.detectedAt.toLocaleTimeString('fr-FR')}</div>
                    <div><strong>Statut:</strong> {getStatusText(selectedAlert.status)}</div>
                    {selectedAlert.resolvedBy && (
                      <div><strong>Résolu par:</strong> {selectedAlert.resolvedBy}</div>
                    )}
                    {selectedAlert.resolvedAt && (
                      <div><strong>Résolu le:</strong> {selectedAlert.resolvedAt.toLocaleDateString('fr-FR')}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Entités Impliquées</h4>
                  <div className="space-y-2 text-sm">
                    {selectedAlert.involvedEntities.beneficiaryName && (
                      <div><strong>Bénéficiaire:</strong> {selectedAlert.involvedEntities.beneficiaryName}</div>
                    )}
                    {selectedAlert.involvedEntities.operatorName && (
                      <div><strong>Opérateur:</strong> {selectedAlert.involvedEntities.operatorName}</div>
                    )}
                    {selectedAlert.involvedEntities.qrCode && (
                      <div><strong>QR Code:</strong> {selectedAlert.involvedEntities.qrCode}</div>
                    )}
                    {selectedAlert.involvedEntities.associationId && (
                      <div><strong>Association:</strong> {selectedAlert.involvedEntities.associationId}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preuves */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Preuves et Données</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {selectedAlert.evidence.gpsCoordinates && (
                      <div>
                        <strong>Coordonnées GPS:</strong> 
                        Lat: {selectedAlert.evidence.gpsCoordinates.lat.toFixed(6)}, 
                        Lng: {selectedAlert.evidence.gpsCoordinates.lng.toFixed(6)}
                      </div>
                    )}
                    {selectedAlert.evidence.expectedLocation && (
                      <div><strong>Lieu attendu:</strong> {selectedAlert.evidence.expectedLocation}</div>
                    )}
                    {selectedAlert.evidence.duplicateAttempts && (
                      <div><strong>Tentatives multiples:</strong> {selectedAlert.evidence.duplicateAttempts}</div>
                    )}
                    {selectedAlert.evidence.timeStamp && (
                      <div><strong>Horodatage:</strong> {selectedAlert.evidence.timeStamp.toLocaleString('fr-FR')}</div>
                    )}
                    {selectedAlert.evidence.suspiciousPattern && (
                      <div><strong>Motif suspect:</strong> {selectedAlert.evidence.suspiciousPattern}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes d'investigation */}
              {selectedAlert.investigationNotes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Notes d'Investigation</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                    {selectedAlert.investigationNotes}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedAlert.status === 'active' && (
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleUpdateAlertStatus(selectedAlert.id, 'investigating');
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Commencer l'enquête
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateAlertStatus(selectedAlert.id, 'resolved');
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Marquer comme résolu
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateAlertStatus(selectedAlert.id, 'false_positive');
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Faux positif
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudDetectionSystem;