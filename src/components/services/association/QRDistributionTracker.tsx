import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  User, 
  Calendar, 
  MapPin, 
  Package, 
  CheckCircle, 
  Clock, 
  Eye, 
  Download, 
  Filter, 
  Search, 
  Building, 
  Phone, 
  Mail, 
  FileText, 
  Truck, 
  AlertTriangle,
  Archive,
  Users,
  BarChart3
} from 'lucide-react';

interface DistributionRecord {
  id: string;
  qrCode: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPhone: string;
  beneficiaryAddress: string;
  distributionDate: Date;
  operatorName: string;
  operatorId: string;
  items: {
    productName: string;
    quantity: number;
    location: string;
  }[];
  totalItems: number;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  verificationStatus: 'verified' | 'pending' | 'failed';
  notes?: string;
}

const QRDistributionTracker: React.FC = () => {
  const [distributions, setDistributions] = useState<DistributionRecord[]>([
    {
      id: 'dist_001',
      qrCode: 'QR-2024-001-001',
      beneficiaryId: 'ben_001',
      beneficiaryName: 'Marie Dubois',
      beneficiaryPhone: '06 12 34 56 78',
      beneficiaryAddress: '123 Rue de la Paix, 13001 Marseille',
      distributionDate: new Date('2024-01-17T14:30:00'),
      operatorName: 'Sophie Laurent',
      operatorId: 'op_001',
      items: [
        { productName: 'Lait demi-écrémé 1L', quantity: 4, location: 'Réfrigérateur A' },
        { productName: 'Riz basmati 1kg', quantity: 2, location: 'Entrepôt A' },
        { productName: 'Conserve tomates', quantity: 3, location: 'Entrepôt B' }
      ],
      totalItems: 9,
      gpsCoordinates: { lat: 43.2965, lng: 5.3698 },
      verificationStatus: 'verified',
      notes: 'Distribution normale, bénéficiaire satisfait'
    },
    {
      id: 'dist_002',
      qrCode: 'QR-2024-002-001',
      beneficiaryId: 'ben_002',
      beneficiaryName: 'Ahmed Hassan',
      beneficiaryPhone: '06 98 76 54 32',
      beneficiaryAddress: '456 Avenue des Fleurs, 13003 Marseille',
      distributionDate: new Date('2024-01-17T15:45:00'),
      operatorName: 'Pierre Martin',
      operatorId: 'op_002',
      items: [
        { productName: 'Pâtes spaghetti', quantity: 5, location: 'Entrepôt A' },
        { productName: 'Yaourts nature x8', quantity: 2, location: 'Réfrigérateur B' }
      ],
      totalItems: 7,
      gpsCoordinates: { lat: 43.3047, lng: 5.3925 },
      verificationStatus: 'verified'
    },
    {
      id: 'dist_003',
      qrCode: 'QR-2024-003-001',
      beneficiaryId: 'ben_003',
      beneficiaryName: 'Sophie Martin',
      beneficiaryPhone: '06 55 44 33 22',
      beneficiaryAddress: '789 Boulevard du Soleil, 13008 Marseille',
      distributionDate: new Date('2024-01-17T16:20:00'),
      operatorName: 'Marie Dubois',
      operatorId: 'op_003',
      items: [
        { productName: 'Pain de mie complet', quantity: 2, location: 'Réserve' },
        { productName: 'Huile d\'olive', quantity: 1, location: 'Entrepôt A' }
      ],
      totalItems: 3,
      gpsCoordinates: { lat: 43.2733, lng: 5.3927 },
      verificationStatus: 'pending',
      notes: 'Vérification GPS en cours'
    },
    {
      id: 'dist_004',
      qrCode: 'QR-2024-001-002',
      beneficiaryId: 'ben_001',
      beneficiaryName: 'Marie Dubois',
      beneficiaryPhone: '06 12 34 56 78',
      beneficiaryAddress: '123 Rue de la Paix, 13001 Marseille',
      distributionDate: new Date('2024-01-16T10:15:00'),
      operatorName: 'Sophie Laurent',
      operatorId: 'op_001',
      items: [
        { productName: 'Lait demi-écrémé 1L', quantity: 2, location: 'Réfrigérateur A' },
        { productName: 'Céréales', quantity: 1, location: 'Entrepôt A' }
      ],
      totalItems: 3,
      gpsCoordinates: { lat: 43.2965, lng: 5.3698 },
      verificationStatus: 'verified'
    }
  ]);

  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('all');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState<DistributionRecord | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Extraire les bénéficiaires et opérateurs uniques
  const uniqueBeneficiaries = Array.from(new Set(distributions.map(d => d.beneficiaryName)))
    .map(name => {
      const dist = distributions.find(d => d.beneficiaryName === name);
      return { id: dist?.beneficiaryId || '', name };
    });

  const uniqueOperators = Array.from(new Set(distributions.map(d => d.operatorName)))
    .map(name => {
      const dist = distributions.find(d => d.operatorName === name);
      return { id: dist?.operatorId || '', name };
    });

  const filteredDistributions = distributions.filter(dist => {
    const matchesBeneficiary = selectedBeneficiary === 'all' || dist.beneficiaryId === selectedBeneficiary;
    const matchesOperator = selectedOperator === 'all' || dist.operatorId === selectedOperator;
    const matchesStatus = selectedStatus === 'all' || dist.verificationStatus === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      dist.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const now = new Date();
      const distDate = dist.distributionDate;
      
      switch (dateFilter) {
        case 'today':
          matchesDate = distDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = distDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = distDate >= monthAgo;
          break;
      }
    }
    
    return matchesBeneficiary && matchesOperator && matchesStatus && matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'pending': return 'En cours';
      case 'failed': return 'Échec';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'failed': return <AlertTriangle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const handleExportData = () => {
    const csvContent = [
      'Date,QR Code,Bénéficiaire,Téléphone,Opérateur,Articles,Statut,Notes',
      ...filteredDistributions.map(dist => [
        dist.distributionDate.toLocaleDateString('fr-FR'),
        dist.qrCode,
        dist.beneficiaryName,
        dist.beneficiaryPhone,
        dist.operatorName,
        dist.totalItems,
        getStatusText(dist.verificationStatus),
        dist.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distributions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <QrCode className="mr-3" size={28} />
            <div>
              <h1 className="text-xl font-bold">Distribution QR Géolocalisée</h1>
              <p className="text-blue-100 text-sm">Traçabilité complète • Historique détaillé • Vérification GPS</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Download className="mr-2" size={16} />
              Exporter CSV
            </button>
            
            <div className="text-right text-sm">
              <div className="font-medium">{distributions.length} distributions</div>
              <div className="text-blue-200">
                {distributions.filter(d => d.verificationStatus === 'verified').length} vérifiées
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et statistiques */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Total distributions</h3>
            <p className="text-2xl font-bold text-blue-600">{distributions.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Vérifiées GPS</h3>
            <p className="text-2xl font-bold text-green-600">
              {distributions.filter(d => d.verificationStatus === 'verified').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">En cours</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {distributions.filter(d => d.verificationStatus === 'pending').length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Articles distribués</h3>
            <p className="text-2xl font-bold text-purple-600">
              {distributions.reduce((sum, d) => sum + d.totalItems, 0)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="text-gray-400" size={16} />
            <select
              value={selectedBeneficiary}
              onChange={(e) => setSelectedBeneficiary(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les bénéficiaires</option>
              {uniqueBeneficiaries.map(ben => (
                <option key={ben.id} value={ben.id}>{ben.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="text-gray-400" size={16} />
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les opérateurs</option>
              {uniqueOperators.map(op => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={16} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="verified">Vérifiées</option>
              <option value="pending">En cours</option>
              <option value="failed">Échecs</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={16} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des distributions */}
      <div className="p-4">
        {filteredDistributions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <QrCode className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Aucune distribution trouvée</p>
            <p className="text-gray-500 text-sm">Modifiez vos filtres de recherche</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDistributions.map(distribution => (
              <div 
                key={distribution.id} 
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <QrCode className="mr-3 text-blue-600" size={24} />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {distribution.qrCode}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {distribution.distributionDate.toLocaleDateString('fr-FR')} à {distribution.distributionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm border flex items-center ${getStatusColor(distribution.verificationStatus)}`}>
                        {getStatusIcon(distribution.verificationStatus)}
                        <span className="ml-1">{getStatusText(distribution.verificationStatus)}</span>
                      </span>
                      
                      <button
                        onClick={() => setSelectedDistribution(distribution)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Informations bénéficiaire */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <User className="mr-1" size={16} />
                        Bénéficiaire
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium text-blue-900">{distribution.beneficiaryName}</div>
                        <div className="flex items-center text-blue-700">
                          <Phone className="mr-1" size={12} />
                          <span>{distribution.beneficiaryPhone}</span>
                        </div>
                        <div className="flex items-start text-blue-700">
                          <MapPin className="mr-1 mt-0.5" size={12} />
                          <span className="text-xs">{distribution.beneficiaryAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Articles distribués */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="font-medium text-green-800 mb-2 flex items-center">
                        <Package className="mr-1" size={16} />
                        Colis ({distribution.totalItems} articles)
                      </h4>
                      <div className="space-y-1 text-sm">
                        {distribution.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-green-700">
                            <span className="truncate">{item.productName}</span>
                            <span className="font-medium">x{item.quantity}</span>
                          </div>
                        ))}
                        {distribution.items.length > 3 && (
                          <div className="text-xs text-green-600 italic">
                            +{distribution.items.length - 3} autres articles
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Opérateur et vérification */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                        <Building className="mr-1" size={16} />
                        Distribution
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-purple-700">
                          <Users className="mr-1" size={12} />
                          <span className="font-medium">{distribution.operatorName}</span>
                        </div>
                        <div className="flex items-center text-purple-700">
                          <MapPin className="mr-1" size={12} />
                          <span className="text-xs">
                            GPS: {distribution.gpsCoordinates.lat.toFixed(4)}, {distribution.gpsCoordinates.lng.toFixed(4)}
                          </span>
                        </div>
                        {distribution.notes && (
                          <div className="text-xs text-purple-600 italic mt-2">
                            {distribution.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {selectedDistribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Détails de la distribution
              </h3>
              <button
                onClick={() => setSelectedDistribution(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* En-tête QR */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <QrCode className="mr-3 text-blue-600" size={32} />
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900">{selectedDistribution.qrCode}</h4>
                      <p className="text-sm text-blue-700">
                        {selectedDistribution.distributionDate.toLocaleDateString('fr-FR')} à {selectedDistribution.distributionDate.toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm border flex items-center ${getStatusColor(selectedDistribution.verificationStatus)}`}>
                    {getStatusIcon(selectedDistribution.verificationStatus)}
                    <span className="ml-1">{getStatusText(selectedDistribution.verificationStatus)}</span>
                  </span>
                </div>
              </div>

              {/* Informations complètes */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Bénéficiaire</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom:</strong> {selectedDistribution.beneficiaryName}</div>
                    <div><strong>Téléphone:</strong> {selectedDistribution.beneficiaryPhone}</div>
                    <div><strong>Adresse:</strong> {selectedDistribution.beneficiaryAddress}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Opérateur</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom:</strong> {selectedDistribution.operatorName}</div>
                    <div><strong>Coordonnées GPS:</strong></div>
                    <div className="ml-4">
                      Lat: {selectedDistribution.gpsCoordinates.lat.toFixed(6)}<br/>
                      Lng: {selectedDistribution.gpsCoordinates.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles détaillés */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Articles distribués ({selectedDistribution.totalItems})</h4>
                <div className="space-y-2">
                  {selectedDistribution.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-600">{item.location}</div>
                      </div>
                      <div className="font-bold text-blue-600">x{item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedDistribution.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Notes</h4>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                    {selectedDistribution.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRDistributionTracker;