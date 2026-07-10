export interface PersonalInfo {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  bloodGroup: string;
  ethnicity: string;
}

export interface LifestyleInfo {
  smoking: 'never' | 'former' | 'current';
  alcohol: 'never' | 'occasional' | 'regular';
  exerciseFrequency: 'none' | '1-2' | '3-4' | '5+';
  sleepHours: number;
  diet: 'unhealthy' | 'balanced' | 'healthy';
  stressLevel: 'low' | 'moderate' | 'high';
  occupation: string;
  waterIntake: number;
}

export interface RelativeHistory {
  hasDiseases: string[];
  ageAtDiagnosis: string;
  status: 'living' | 'deceased' | 'unknown';
  causeOfDeath?: string;
}

export interface FamilyHistory {
  father: RelativeHistory;
  mother: RelativeHistory;
  brother: RelativeHistory;
  sister: RelativeHistory;
  grandfather: RelativeHistory;
  grandmother: RelativeHistory;
  children: RelativeHistory;
}

export interface ClinicalMetrics {
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  totalCholesterol: number;
  hdlCholesterol: number;
  ldlCholesterol: number;
  physicalActivityLevel: 'sedentary' | 'moderate' | 'active';
  mentalHealthStatus: 'good' | 'fair' | 'poor';
  pregnancyStatus: 'yes' | 'no' | 'not-applicable';
  vaccinationStatus: 'fully' | 'partially' | 'none';
}

export interface AssessmentData {
  id?: string;
  date?: string;
  personal: PersonalInfo;
  lifestyle: LifestyleInfo;
  medicalHistory: {
    conditions: string[];
    medications: string;
    allergies: string;
  };
  familyHistory: FamilyHistory;
  metrics: ClinicalMetrics;
}

export interface DiseaseRiskDetails {
  percentage: number;
  level: 'Low' | 'Moderate' | 'High';
  reasoning: string;
  factors: string[];
}

export interface RiskPredictionResult {
  id: string;
  date: string;
  overallScore: number;
  diseaseRisks: {
    diabetes: DiseaseRiskDetails;
    heartDisease: DiseaseRiskDetails;
    hypertension: DiseaseRiskDetails;
    stroke: DiseaseRiskDetails;
    cancer: DiseaseRiskDetails;
    obesity: DiseaseRiskDetails;
  };
  recommendations: {
    diet: string[];
    exercise: string[];
    screening: string[];
    lifestyle: string[];
    stress: string[];
    sleep: string[];
    vaccinations: string[];
    consultation: string[];
  };
  patientSummary: {
    name: string;
    age: number;
    gender: string;
    bmi: number;
    bmiCategory: string;
  };
}

export interface UserProfile {
  fullName: string;
  email: string;
  dob: string;
  gender: string;
  phone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    reminders: boolean;
  };
  theme: 'light' | 'dark';
}
