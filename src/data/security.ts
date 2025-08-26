// Système de sécurité et validation selon les spécifications PRD
export interface SecurityConfig {
  passwordMinLength: number;
  passwordRequirements: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    specialChars: boolean;
  };
  twoFactorRequired: string[]; // Rôles nécessitant 2FA
  sessionTimeout: number; // en minutes
  maxLoginAttempts: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SecurityManager {
  private static config: SecurityConfig = {
    passwordMinLength: 8,
    passwordRequirements: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      specialChars: true
    },
    twoFactorRequired: ['social_worker', 'association'],
    sessionTimeout: 30,
    maxLoginAttempts: 3
  };

  // Validation des mots de passe selon les règles PRD
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Longueur minimale
    if (password.length < this.config.passwordMinLength) {
      errors.push(`Le mot de passe doit contenir au moins ${this.config.passwordMinLength} caractères`);
    }

    // Majuscule requise
    if (this.config.passwordRequirements.uppercase && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    // Minuscule requise
    if (this.config.passwordRequirements.lowercase && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    // Chiffre requis
    if (this.config.passwordRequirements.numbers && !/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    // Caractère spécial requis
    if (this.config.passwordRequirements.specialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Vérifications de sécurité supplémentaires
    if (password.length > 0 && password.length < 12) {
      warnings.push('Un mot de passe de 12 caractères ou plus est recommandé');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Vérifier si 2FA est requis pour un rôle
  static isTwoFactorRequired(role: string): boolean {
    return this.config.twoFactorRequired.includes(role);
  }

  // Générer un code 2FA
  static generateTwoFactorCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validation des documents pour les bénéficiaires
  static validateBeneficiaryDocuments(documents: Array<{
    type: string;
    content: string;
    uploadedAt: Date;
  }>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const requiredDocuments = [
      'identity_card',
      'proof_of_residence',
      'income_statement',
      'family_composition'
    ];

    // Vérifier que tous les documents requis sont présents
    requiredDocuments.forEach(docType => {
      const hasDocument = documents.some(doc => doc.type === docType);
      if (!hasDocument) {
        errors.push(`Document manquant: ${this.getDocumentTypeName(docType)}`);
      }
    });

    // Vérifier la fraîcheur des documents (moins de 3 mois)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    documents.forEach(doc => {
      if (doc.uploadedAt < threeMonthsAgo) {
        warnings.push(`Document potentiellement obsolète: ${this.getDocumentTypeName(doc.type)}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static getDocumentTypeName(type: string): string {
    const names: { [key: string]: string } = {
      'identity_card': 'Pièce d\'identité',
      'proof_of_residence': 'Justificatif de domicile',
      'income_statement': 'Justificatif de revenus',
      'family_composition': 'Composition familiale'
    };
    return names[type] || type;
  }

  // Chiffrement simple pour les données sensibles (simulation)
  static encryptSensitiveData(data: string): string {
    // En production, utiliser un vrai chiffrement AES-256
    return btoa(data); // Base64 pour la démonstration
  }

  static decryptSensitiveData(encryptedData: string): string {
    // En production, utiliser un vrai déchiffrement AES-256
    return atob(encryptedData);
  }

  // Audit trail pour les actions sensibles
  static logSecurityEvent(
    userId: string,
    action: string,
    details: any,
    ipAddress: string = '127.0.0.1'
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      details,
      ipAddress,
      userAgent: navigator.userAgent
    };

    // En production, envoyer vers un système de logs sécurisé
    console.log('🔒 SECURITY LOG:', logEntry);
    
    // Stocker localement pour la démonstration
    const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    existingLogs.push(logEntry);
    localStorage.setItem('securityLogs', JSON.stringify(existingLogs));
  }

  // Obtenir les logs de sécurité
  static getSecurityLogs(userId?: string): any[] {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    
    if (userId) {
      return logs.filter((log: any) => log.userId === userId);
    }
    
    return logs;
  }
}