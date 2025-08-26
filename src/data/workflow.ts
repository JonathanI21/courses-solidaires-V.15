// Système de workflow pour gérer les processus métier
export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: Date;
  data?: any;
  actor: 'system' | 'household' | 'association' | 'social_worker' | 'beneficiary';
}

export interface DonationWorkflow {
  id: string;
  donationId: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface BeneficiaryValidationWorkflow {
  id: string;
  beneficiaryId: string;
  socialWorkerId: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'active' | 'completed' | 'rejected';
  documents: {
    id: string;
    type: string;
    status: 'uploaded' | 'validated' | 'rejected';
    uploadedAt: Date;
    validatedAt?: Date;
  }[];
  createdAt: Date;
  completedAt?: Date;
}

export class WorkflowEngine {
  // Workflow pour les dons
  static createDonationWorkflow(donationId: string): DonationWorkflow {
    return {
      id: `workflow_donation_${Date.now()}`,
      donationId,
      steps: [
        {
          id: 'scan_product',
          name: 'Scanner le produit en magasin',
          status: 'pending',
          actor: 'household'
        },
        {
          id: 'ai_recognition',
          name: 'Reconnaissance IA (prix, catégorie)',
          status: 'pending',
          actor: 'system'
        },
        {
          id: 'select_association',
          name: 'Sélection association locale',
          status: 'pending',
          actor: 'household'
        },
        {
          id: 'notify_association',
          name: 'Notification à l\'association',
          status: 'pending',
          actor: 'system'
        },
        {
          id: 'association_scan',
          name: 'Scan de réception par l\'association',
          status: 'pending',
          actor: 'association'
        },
        {
          id: 'stock_update',
          name: 'Mise à jour stock FIFO',
          status: 'pending',
          actor: 'system'
        }
      ],
      currentStep: 0,
      status: 'active',
      createdAt: new Date()
    };
  }

  // Workflow pour la validation des bénéficiaires
  static createBeneficiaryValidationWorkflow(beneficiaryId: string, socialWorkerId: string): BeneficiaryValidationWorkflow {
    return {
      id: `workflow_validation_${Date.now()}`,
      beneficiaryId,
      socialWorkerId,
      steps: [
        {
          id: 'upload_documents',
          name: 'Envoi des documents',
          status: 'pending',
          actor: 'beneficiary'
        },
        {
          id: 'notify_social_worker',
          name: 'Notification travailleur social',
          status: 'pending',
          actor: 'system'
        },
        {
          id: 'manual_validation',
          name: 'Validation manuelle obligatoire',
          status: 'pending',
          actor: 'social_worker'
        },
        {
          id: 'decision',
          name: 'Décision (Approuvé/Rejeté)',
          status: 'pending',
          actor: 'social_worker'
        },
        {
          id: 'generate_qr_or_reject',
          name: 'Génération QR Code ou demande modifications',
          status: 'pending',
          actor: 'system'
        }
      ],
      currentStep: 0,
      status: 'active',
      documents: [],
      createdAt: new Date()
    };
  }

  static advanceWorkflow(workflow: DonationWorkflow | BeneficiaryValidationWorkflow, stepData?: any): void {
    if (workflow.currentStep < workflow.steps.length) {
      const currentStep = workflow.steps[workflow.currentStep];
      currentStep.status = 'completed';
      currentStep.timestamp = new Date();
      currentStep.data = stepData;

      workflow.currentStep++;

      if (workflow.currentStep < workflow.steps.length) {
        workflow.steps[workflow.currentStep].status = 'in_progress';
      } else {
        workflow.status = 'completed';
        workflow.completedAt = new Date();
      }
    }
  }

  static failWorkflow(workflow: DonationWorkflow | BeneficiaryValidationWorkflow, reason: string): void {
    const currentStep = workflow.steps[workflow.currentStep];
    currentStep.status = 'failed';
    currentStep.timestamp = new Date();
    currentStep.data = { reason };
    workflow.status = 'failed';
  }
}