import { AssessmentData, RiskPredictionResult, DiseaseRiskDetails } from '../types';

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateRisk(data: AssessmentData): RiskPredictionResult {
  const { personal, lifestyle, medicalHistory, familyHistory, metrics } = data;
  
  const bmi = calculateBMI(personal.weight, personal.height);
  const bmiCat = getBMICategory(bmi);

  const hasFamilyHistoryOf = (disease: string): { found: boolean; details: string[] } => {
    const relatives = Object.entries(familyHistory);
    const affected: string[] = [];
    relatives.forEach(([relation, history]) => {
      if (history.hasDiseases.includes(disease)) {
        const name = relation.charAt(0).toUpperCase() + relation.slice(1);
        affected.push(`${name} (diag. age: ${history.ageAtDiagnosis || 'N/A'})`);
      }
    });
    return { found: affected.length > 0, details: affected };
  };

  // 1. DIABETES RISK
  let diabetesScore = 10;
  const diabetesFactors: string[] = [];
  if (personal.age > 45) { diabetesScore += 15; diabetesFactors.push('Age over 45 years'); }
  if (bmi >= 30) { diabetesScore += 30; diabetesFactors.push(`Obese BMI (${bmi})`); }
  else if (bmi >= 25) { diabetesScore += 15; diabetesFactors.push(`Overweight BMI (${bmi})`); }
  if (lifestyle.exerciseFrequency === 'none') { diabetesScore += 15; diabetesFactors.push('Sedentary lifestyle'); }
  if (metrics.bloodSugar >= 126) { diabetesScore += 35; diabetesFactors.push(`Diabetic blood sugar (${metrics.bloodSugar} mg/dL)`); }
  else if (metrics.bloodSugar >= 100) { diabetesScore += 20; diabetesFactors.push(`Prediabetic blood sugar (${metrics.bloodSugar} mg/dL)`); }
  const diabetesFam = hasFamilyHistoryOf('Diabetes');
  if (diabetesFam.found) { diabetesScore += 20; diabetesFactors.push(`Family history: ${diabetesFam.details.join(', ')}`); }

  // 2. HEART DISEASE RISK
  let heartScore = 8;
  const heartFactors: string[] = [];
  if (lifestyle.smoking === 'current') { heartScore += 25; heartFactors.push('Current smoker'); }
  if (metrics.totalCholesterol >= 240) { heartScore += 20; heartFactors.push(`High cholesterol (${metrics.totalCholesterol} mg/dL)`); }
  if (metrics.systolicBP >= 140 || metrics.diastolicBP >= 90) { heartScore += 20; heartFactors.push('Hypertension BP'); }
  const heartFam = hasFamilyHistoryOf('Heart Disease');
  if (heartFam.found) { heartScore += 20; heartFactors.push(`Family history: ${heartFam.details.join(', ')}`); }

  // 3. HYPERTENSION RISK
  let bpScore = 12;
  const bpFactors: string[] = [];
  if (metrics.systolicBP >= 140 || metrics.diastolicBP >= 90) { bpScore += 35; bpFactors.push('Elevated BP readings'); }
  if (lifestyle.stressLevel === 'high') { bpScore += 10; bpFactors.push('High chronic stress'); }
  const bpFam = hasFamilyHistoryOf('Hypertension');
  if (bpFam.found) { bpScore += 18; bpFactors.push(`Family history: ${bpFam.details.join(', ')}`); }

  // 4. STROKE RISK
  let strokeScore = 5;
  const strokeFactors: string[] = [];
  if (metrics.systolicBP >= 140 || metrics.diastolicBP >= 90) { strokeScore += 30; strokeFactors.push('Uncontrolled hypertension'); }
  if (lifestyle.smoking === 'current') { strokeScore += 15; strokeFactors.push('Current smoking'); }
  const strokeFam = hasFamilyHistoryOf('Stroke');
  if (strokeFam.found) { strokeScore += 15; strokeFactors.push(`Family history: ${strokeFam.details.join(', ')}`); }

  // 5. CANCER RISK
  let cancerScore = 8;
  const cancerFactors: string[] = [];
  if (lifestyle.smoking === 'current') { cancerScore += 30; cancerFactors.push('Active smoking'); }
  const cancerFam = hasFamilyHistoryOf('Cancer');
  if (cancerFam.found) { cancerScore += 25; cancerFactors.push(`Family history: ${cancerFam.details.join(', ')}`); }

  // 6. OBESITY RISK
  let obesityScore = 10;
  const obesityFactors: string[] = [];
  if (bmi >= 30) { obesityScore += 50; obesityFactors.push(`Obese BMI (${bmi})`); }
  else if (bmi >= 25) { obesityScore += 25; obesityFactors.push(`Overweight BMI (${bmi})`); }
  if (lifestyle.diet === 'unhealthy') { obesityScore += 15; obesityFactors.push('Unhealthy diet'); }

  const clamp = (val: number) => Math.min(Math.max(val, 5), 98);
  diabetesScore = clamp(diabetesScore);
  heartScore = clamp(heartScore);
  bpScore = clamp(bpScore);
  strokeScore = clamp(strokeScore);
  cancerScore = clamp(cancerScore);
  obesityScore = clamp(obesityScore);

  const scores = [diabetesScore, heartScore, bpScore, strokeScore, cancerScore, obesityScore];
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const overallScore = Math.round((maxScore * 0.6) + (avgScore * 0.4));

  const getLevel = (s: number): 'Low' | 'Moderate' | 'High' => s < 30 ? 'Low' : s < 65 ? 'Moderate' : 'High';

  const recs = {
    diet: ['Adopt a low-glycemic, fiber-rich diet. Limit processed sugars and sodium.'],
    exercise: ['Aim for 150 minutes of moderate-intensity exercise per week.'],
    screening: ['Schedule routine wellness tests (annual glucose and blood pressure checks).'],
    lifestyle: ['Maintain a smoke-free and balanced lifestyle.'],
    stress: ['Practice daily stress management (breathing, meditation).'],
    sleep: ['Aim for 7-9 hours of sleep per night.'],
    vaccinations: ['Keep vaccines (flu, boosters) up to date.'],
    consultation: ['Discuss this risk report during your next physical with a physician.']
  };

  return {
    id: data.id || Math.random().toString(36).substring(2, 9),
    date: data.date || new Date().toLocaleDateString(),
    overallScore,
    diseaseRisks: {
      diabetes: { percentage: diabetesScore, level: getLevel(diabetesScore), reasoning: `Diabetes risk is ${getLevel(diabetesScore).toLowerCase()}.`, factors: diabetesFactors },
      heartDisease: { percentage: heartScore, level: getLevel(heartScore), reasoning: `Heart disease risk is ${getLevel(heartScore).toLowerCase()}.`, factors: heartFactors },
      hypertension: { percentage: bpScore, level: getLevel(bpScore), reasoning: `Hypertension risk is ${getLevel(bpScore).toLowerCase()}.`, factors: bpFactors },
      stroke: { percentage: strokeScore, level: getLevel(strokeScore), reasoning: `Stroke risk is ${getLevel(strokeScore).toLowerCase()}.`, factors: strokeFactors },
      cancer: { percentage: cancerScore, level: getLevel(cancerScore), reasoning: `Cancer risk is ${getLevel(cancerScore).toLowerCase()}.`, factors: cancerFactors },
      obesity: { percentage: obesityScore, level: getLevel(obesityScore), reasoning: `Obesity risk is ${getLevel(obesityScore).toLowerCase()}.`, factors: obesityFactors }
    },
    recommendations: recs,
    patientSummary: { name: personal.fullName, age: personal.age, gender: personal.gender, bmi, bmiCategory: bmiCat }
  };
}
