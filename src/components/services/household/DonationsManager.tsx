import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Download, 
  Calendar, 
  Euro, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  Search,
  TrendingUp,
  Gift,
  Receipt,
  Building,
  User,
  Package,
  Bell,
  Eye
} from 'lucide-react';
import DatabaseService, { DonationPackage } from '../../../data/database';

interface YearlyTaxSummary {
  year: number;
  totalDonations: number;
  totalDeductions: number;
  numberOfPackages: number;
}

const DonationsManager: React.FC = () => {
  const [donations, setDonations] = useState<DonationPackage[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'received' | 'validated' | 'receipt_available'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showYearlySummary, setShowYearlySummary] = useState(true);

  // Charger les dons depuis la base de données
  useEffect(() => {
    const householdDonations = DatabaseService.getDonationPackagesByHousehold('household_001');
    setDonations(householdDonations);
  }, []);

  // Simuler quelques dons pour la démo
  useEffect(() => {
    const existingDonations = DatabaseService.getDonationPackages();
    if (existingDonations.length === 0) {
      // Créer des dons de démonstration
      const mockDonations: DonationPackage[] = [
        {
          id: 'donation_demo_001',
          householdId: 'household_001',
          householdName: 'Famille Martin',
          associationId: 'assoc_001',
          associationName: 'Restos du Cœur Marseille',
          items: [
            {
              id: 'item_001',
              productId: 'prod_010',
              quantity: 3,
              unitPrice: 3.29,
              totalValue: 9.87
            },
            {
              id: 'item_002',
              productId: 'prod_018',
              quantity: 5,
              unitPrice: 1.29,
              totalValue: 6.45
            }
          ],
          totalValue: 16.32,
          taxDeduction: 10.77,
          status: 'receipt_available',
          createdAt: new Date('2024-01-15T14:30:00'),
          receivedAt: new Date('2024-01-16T09:15:00'),
          validatedAt: new Date('2024-01-17T10:00:00'),
          receiptGeneratedAt: new Date('2024-01-18T08:00:00'),
          receiptNumber: 'RDC-2024-001',
          storeName: 'Carrefour Marseille Centre',
          storeAddress: '123 Avenue de la République, 13001 Marseille'
        },
        {
          id: 'donation_demo_002',
          householdId: 'household_001',
          householdName: 'Famille Martin',
          associationId: 'assoc_002',
          associationName: 'Secours Populaire Marseille',
          items: [
            {
              id: 'item_003',
              productId: 'prod_006',
              quantity: 6,
              unitPrice: 1.09,
              totalValue: 6.54
            },
            {
              id: 'item_004',
              productId: 'prod_019',
              quantity: 3,
              unitPrice: 3.19,
              totalValue: 9.57
            }
          ],
          totalValue: 16.11,
          taxDeduction: 10.63,
          status: 'validated',
          createdAt: new Date('2024-01-10T16:45:00'),
          receivedAt: new Date('2024-01-12T11:30:00'),
          validatedAt: new Date('2024-01-13T14:20:00'),
          storeName: 'Leclerc Marseille Est',
          storeAddress: '456 Boulevard National, 13003 Marseille'
        },
        {
          id: 'donation_demo_003',
          householdId: 'household_001',
          householdName: 'Famille Martin',
          associationId: 'assoc_003',
          associationName: 'Banque Alimentaire PACA',
          items: [
            {
              id: 'item_005',
              productId: 'prod_013',
              quantity: 2,
              unitPrice: 3.19,
              totalValue: 6.38
            },
            {
              id: 'item_006',
              productId: 'prod_016',
              quantity: 3,
              unitPrice: 3.19,
              totalValue: 9.57
            }
          ],
          totalValue: 15.95,
          taxDeduction: 10.53,
          status: 'pending',
          createdAt: new Date('2024-01-08T10:20:00'),
          storeName: 'Auchan Marseille Nord',
          storeAddress: '789 Route de Lyon, 13015 Marseille'
        }
      ];

      mockDonations.forEach(donation => {
        DatabaseService.saveDonationPackage(donation);
      });

      setDonations(mockDonations);
    }
  }, []);

  const calculateYearlySummary = (year: number): YearlyTaxSummary => {
    const yearDonations = donations.filter(d => d.createdAt.getFullYear() === year);
    const totalDonations = yearDonations.reduce((sum, d) => sum + d.totalValue, 0);
    const totalDeductions = yearDonations.reduce((sum, d) => sum + d.taxDeduction, 0);
    const numberOfPackages = yearDonations.length;

    return {
      year,
      totalDonations,
      totalDeductions,
      numberOfPackages
    };
  };

  const filteredDonations = donations.filter(donation => {
    const matchesYear = donation.createdAt.getFullYear() === selectedYear;
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      donation.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.associationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.items.some(item => {
        const product = DatabaseService.getProduct(item.productId);
        return product?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    
    return matchesYear && matchesStatus && matchesSearch;
  });

  const yearlySummary = calculateYearlySummary(selectedYear);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'received': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'validated': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'receipt_available': return 'text-teal-600 bg-teal-100 border-teal-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente de réception';
      case 'received': return 'Reçu par l\'association';
      case 'validated': return 'Validé - Reçu en génération';
      case 'receipt_available': return 'Reçu fiscal disponible';
      default: return 'Statut inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'received': return <Package size={14} />;
      case 'validated': return <CheckCircle size={14} />;
      case 'receipt_available': return <FileText size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const handleDownloadReceipt = (donation: DonationPackage) => {
    if (donation.status !== 'receipt_available') {
      alert('Le reçu fiscal n\'est pas encore disponible');
      return;
    }

    try {
      const receiptContent = DatabaseService.generateReceiptForDonation(donation.id);
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-fiscal-${donation.receiptNumber || donation.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors du téléchargement du reçu: ' + error);
    }
  };

  const handleDownloadYearlyReceipts = () => {
    const availableReceipts = filteredDonations.filter(d => d.status === 'receipt_available');

    if (availableReceipts.length === 0) {
      alert('Aucun reçu fiscal disponible pour cette année');
      return;
    }

    const allReceiptsContent = `
MES REÇUS FISCAUX ANNUELS - ${selectedYear}

RÉSUMÉ:
- Nombre de colis donnés: ${yearlySummary.numberOfPackages}
- Montant total des dons: ${yearlySummary.totalDonations.toFixed(2)}€
- Déductions fiscales totales: ${yearlySummary.totalDeductions.toFixed(2)}€

REÇUS FISCAUX INCLUS:
${availableReceipts.map(donation => `
═══════════════════════════════════════════════════════════════
${DatabaseService.generateReceiptForDonation(donation.id)}
═══════════════════════════════════════════════════════════════
`).join('\n')}

INFORMATIONS IMPORTANTES:
- Conservez ces reçus pendant 4 ans minimum
- Joignez-les à votre déclaration d'impôts si contrôle
- Déduction maximale: 66% du montant des dons
- Plafond: 20% du revenu imposable
    `.trim();

    const blob = new Blob([allReceiptsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-recus-fiscaux-${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewDonationDetails = (donation: DonationPackage) => {
    const itemsDetails = donation.items.map(item => {
      const product = DatabaseService.getProduct(item.productId);
      return `- ${product?.name || 'Produit inconnu'} (x${item.quantity}): ${item.totalValue.toFixed(2)}€`;
    }).join('\n');

    alert(`
DÉTAILS DU DON

Association: ${donation.associationName}
Date: ${donation.createdAt.toLocaleDateString('fr-FR')}
Magasin: ${donation.storeName}

Articles donnés:
${itemsDetails}

Valeur totale: ${donation.totalValue.toFixed(2)}€
Déduction fiscale: ${donation.taxDeduction.toFixed(2)}€

Statut: ${getStatusText(donation.status)}
${donation.receiptNumber ? `Numéro de reçu: ${donation.receiptNumber}` : ''}
    `);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec résumé annuel */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Heart className="mr-3 fill-current" size={32} />
            <div>
              <h1 className="text-2xl font-bold">Mes Dons Solidaires & Reçus Fiscaux</h1>
              <p className="text-emerald-100">Historique complet et déductions fiscales</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{yearlySummary.totalDonations.toFixed(2)}€</div>
            <div className="text-emerald-100">Total dons {selectedYear}</div>
          </div>
        </div>

        {showYearlySummary && (
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Package className="mr-2" size={20} />
                <span className="font-medium">Nombre de colis donnés</span>
              </div>
              <div className="text-2xl font-bold">{yearlySummary.numberOfPackages}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Euro className="mr-2" size={20} />
                <span className="font-medium">Déductions fiscales</span>
              </div>
              <div className="text-2xl font-bold">{yearlySummary.totalDeductions.toFixed(2)}€</div>
            </div>
          </div>
        )}
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="received">Reçu</option>
                <option value="validated">Validé</option>
                <option value="receipt_available">Reçu disponible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Magasin, association, produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadYearlyReceipts}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="mr-2" size={16} />
            Mes reçus annuels {selectedYear}
          </button>
        </div>

        {/* Historique des dons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Calendar className="mr-2" size={20} />
            Historique des dons ({filteredDonations.length})
          </h3>

          {filteredDonations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Heart className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Aucun don trouvé</p>
              <p className="text-gray-500 text-sm">Modifiez vos filtres ou effectuez des dons</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDonations.map((donation) => (
                <div key={donation.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
                  {/* En-tête du don */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                        <Receipt className="text-emerald-600" size={24} />
                      </div>
                
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {donation.createdAt.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h4>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <Building className="mr-1" size={14} />
                          <span className="mr-4">{donation.storeName}</span>
                          <User className="mr-1" size={14} />
                          <span>{donation.associationName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {donation.totalValue.toFixed(2)}€
                      </div>
                      <div className="text-sm text-gray-600">Valeur du don</div>
                    </div>
                  </div>

                  {/* Répartition des coûts */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Heart className="text-emerald-600 mr-2 fill-current" size={16} />
                        <span className="font-medium text-emerald-800">Valeur du don</span>
                      </div>
                      <div className="text-xl font-bold text-emerald-600">
                        {donation.totalValue.toFixed(2)}€
                      </div>
                      <div className="text-xs text-emerald-600">
                        {donation.items.length} articles donnés
                      </div>
                    </div>

                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="text-teal-600 mr-2" size={16} />
                        <span className="font-medium text-teal-800">Déduction fiscale</span>
                      </div>
                      <div className="text-xl font-bold text-teal-600">
                        -{donation.taxDeduction.toFixed(2)}€
                      </div>
                      <div className="text-xs text-teal-600">
                        66% du don
                      </div>
                    </div>
                  </div>

                  {/* Détail des articles donnés */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Gift className="mr-2" size={16} />
                      Articles donnés ({donation.items.length})
                    </h5>
                    <div className="grid md:grid-cols-2 gap-2">
                      {donation.items.map((item) => {
                        const product = DatabaseService.getProduct(item.productId);
                        return (
                          <div key={item.id} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <div>
                              <span className="font-medium text-emerald-800">
                                {product?.name || 'Produit inconnu'}
                              </span>
                              <span className="text-emerald-600 text-sm ml-2">(x{item.quantity})</span>
                            </div>
                            <span className="font-bold text-emerald-600">{item.totalValue.toFixed(2)}€</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Statut et actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center ${getStatusColor(donation.status)}`}>
                        {getStatusIcon(donation.status)}
                        <span className="ml-1">{getStatusText(donation.status)}</span>
                      </span>
                      
                      {donation.validatedAt && (
                        <span className="text-sm text-gray-600">
                          Validé le {donation.validatedAt.toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDonationDetails(donation)}
                        className="flex items-center px-3 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
                      >
                        <Eye className="mr-1" size={14} />
                        Détails
                      </button>

                      {donation.status === 'receipt_available' && (
                        <button
                          onClick={() => handleDownloadReceipt(donation)}
                          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                        >
                          <Download className="mr-2" size={16} />
                          Télécharger le reçu fiscal
                        </button>
                      )}
                      
                      {donation.status === 'pending' && (
                        <div className="flex items-center text-orange-600 text-sm">
                          <Bell className="mr-1" size={14} />
                          Notification envoyée à l'association
                        </div>
                      )}
                      
                      {donation.status === 'validated' && (
                        <div className="flex items-center text-emerald-600 text-sm">
                          <Clock className="mr-1" size={14} />
                          Reçu en cours de génération (24h)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informations légales */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
          <FileText className="mr-2" size={20} />
          Informations fiscales importantes
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-emerald-700">
          <div>
            <h4 className="font-medium mb-2">Déduction fiscale</h4>
            <ul className="space-y-1">
              <li>• 66% du montant des dons est déductible</li>
              <li>• Plafond: 20% du revenu imposable</li>
              <li>• Report possible sur 5 ans si dépassement</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Conservation des reçus</h4>
            <ul className="space-y-1">
              <li>• Conserver les reçus pendant 4 ans</li>
              <li>• Joindre à la déclaration si contrôle</li>
              <li>• Téléchargement automatique disponible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsManager;