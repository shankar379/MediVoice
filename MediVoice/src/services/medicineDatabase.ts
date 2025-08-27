import { MedicineInfo, MedicineSearchResult } from '../types';

// Comprehensive Medicine Database
export const medicineDatabase: MedicineInfo[] = [
  {
    id: '1',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    brandNames: ['Crocin', 'Dolo', 'Calpol', 'Tylenol'],
    description: 'Paracetamol is a pain reliever and fever reducer. It is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.',
    uses: [
      'Fever reduction',
      'Pain relief (headache, toothache, muscle pain)',
      'Arthritis pain',
      'Back pain',
      'Cold and flu symptoms'
    ],
    dosage: {
      adults: '500-1000mg every 4-6 hours, maximum 4000mg per day',
      children: '10-15mg per kg body weight every 4-6 hours',
      elderly: '500-1000mg every 6-8 hours, maximum 3000mg per day'
    },
    sideEffects: [
      'Nausea',
      'Stomach upset',
      'Liver problems (with overdose)',
      'Allergic reactions (rare)'
    ],
    precautions: [
      'Do not exceed recommended dose',
      'Avoid alcohol while taking',
      'Consult doctor if pregnant or breastfeeding',
      'Check with doctor if you have liver disease'
    ],
    interactions: [
      'Warfarin (blood thinner)',
      'Alcohol',
      'Other pain medications'
    ],
    category: 'Analgesic/Antipyretic',
    prescriptionRequired: false,
    imageUrl: 'https://example.com/paracetamol.jpg'
  },
  {
    id: '2',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Brufen', 'Advil', 'Motrin', 'Nurofen'],
    description: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation caused by many conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.',
    uses: [
      'Pain relief',
      'Fever reduction',
      'Inflammation reduction',
      'Arthritis',
      'Menstrual cramps'
    ],
    dosage: {
      adults: '200-400mg every 4-6 hours, maximum 1200mg per day',
      children: '5-10mg per kg body weight every 6-8 hours',
      elderly: '200-400mg every 6-8 hours, maximum 800mg per day'
    },
    sideEffects: [
      'Stomach upset',
      'Heartburn',
      'Dizziness',
      'Stomach ulcers (long-term use)',
      'Increased blood pressure'
    ],
    precautions: [
      'Take with food',
      'Avoid if you have stomach ulcers',
      'Consult doctor if you have heart problems',
      'Do not take if allergic to aspirin'
    ],
    interactions: [
      'Aspirin',
      'Blood pressure medications',
      'Diuretics',
      'Lithium'
    ],
    category: 'NSAID',
    prescriptionRequired: false
  },
  {
    id: '3',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brandNames: ['Omez', 'Prilosec', 'Losec'],
    description: 'Omeprazole is a proton pump inhibitor that decreases stomach acid production. It is used to treat acid reflux, ulcers, and other stomach acid-related conditions.',
    uses: [
      'Acid reflux (GERD)',
      'Stomach ulcers',
      'Duodenal ulcers',
      'Zollinger-Ellison syndrome',
      'Heartburn relief'
    ],
    dosage: {
      adults: '20-40mg once daily, 30 minutes before breakfast',
      children: 'Not recommended for children under 1 year',
      elderly: '20mg once daily, may need dose adjustment'
    },
    sideEffects: [
      'Headache',
      'Diarrhea',
      'Stomach pain',
      'Nausea',
      'Vitamin B12 deficiency (long-term use)'
    ],
    precautions: [
      'Take on empty stomach',
      'Do not crush or chew capsules',
      'Consult doctor if pregnant',
      'Long-term use may affect bone health'
    ],
    interactions: [
      'Iron supplements',
      'Vitamin B12',
      'Blood thinners',
      'Antifungal medications'
    ],
    category: 'Proton Pump Inhibitor',
    prescriptionRequired: true
  },
  {
    id: '4',
    name: 'Cetirizine',
    genericName: 'Cetirizine',
    brandNames: ['Zyrtec', 'Alerid', 'Cetrizine'],
    description: 'Cetirizine is an antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, and sneezing.',
    uses: [
      'Allergic rhinitis',
      'Hay fever',
      'Hives',
      'Itching',
      'Allergic skin reactions'
    ],
    dosage: {
      adults: '10mg once daily',
      children: '5mg once daily (6-12 years), 2.5mg twice daily (2-5 years)',
      elderly: '10mg once daily, may need dose adjustment'
    },
    sideEffects: [
      'Drowsiness',
      'Dry mouth',
      'Headache',
      'Fatigue',
      'Dizziness'
    ],
    precautions: [
      'May cause drowsiness',
      'Avoid alcohol',
      'Consult doctor if you have kidney problems',
      'Not recommended for children under 2 years'
    ],
    interactions: [
      'Alcohol',
      'Other sedating medications',
      'Theophylline'
    ],
    category: 'Antihistamine',
    prescriptionRequired: false
  },
  {
    id: '5',
    name: 'Metformin',
    genericName: 'Metformin',
    brandNames: ['Glucophage', 'Glycomet', 'Metformin'],
    description: 'Metformin is an oral diabetes medicine that helps control blood sugar levels. It works by helping your body respond better to insulin.',
    uses: [
      'Type 2 diabetes',
      'Polycystic ovary syndrome (PCOS)',
      'Prediabetes',
      'Weight management in diabetes'
    ],
    dosage: {
      adults: '500-2000mg daily in divided doses, with meals',
      children: 'Not recommended for children under 10 years',
      elderly: 'Start with lower dose, may need adjustment'
    },
    sideEffects: [
      'Nausea',
      'Diarrhea',
      'Stomach upset',
      'Metallic taste',
      'Lactic acidosis (rare but serious)'
    ],
    precautions: [
      'Take with food',
      'Start with low dose',
      'Monitor blood sugar regularly',
      'Avoid alcohol',
      'Stay hydrated'
    ],
    interactions: [
      'Alcohol',
      'Contrast dye for imaging',
      'Other diabetes medications',
      'Diuretics'
    ],
    category: 'Biguanide',
    prescriptionRequired: true
  },
  {
    id: '6',
    name: 'Amlodipine',
    genericName: 'Amlodipine',
    brandNames: ['Norvasc', 'Amlong', 'Amlodipine'],
    description: 'Amlodipine is a calcium channel blocker used to treat high blood pressure and chest pain (angina). It works by relaxing blood vessels.',
    uses: [
      'High blood pressure (hypertension)',
      'Chest pain (angina)',
      'Coronary artery disease'
    ],
    dosage: {
      adults: '5-10mg once daily',
      children: 'Not recommended for children',
      elderly: '2.5-5mg once daily, may need dose adjustment'
    },
    sideEffects: [
      'Swelling in ankles/feet',
      'Dizziness',
      'Headache',
      'Flushing',
      'Fatigue'
    ],
    precautions: [
      'Take at same time daily',
      'Monitor blood pressure',
      'Avoid grapefruit juice',
      'Consult doctor if pregnant'
    ],
    interactions: [
      'Grapefruit juice',
      'Other blood pressure medications',
      'Simvastatin',
      'Digoxin'
    ],
    category: 'Calcium Channel Blocker',
    prescriptionRequired: true
  },
  {
    id: '7',
    name: 'Azithromycin',
    genericName: 'Azithromycin',
    brandNames: ['Zithromax', 'Zithral', 'Azithromycin'],
    description: 'Azithromycin is an antibiotic used to treat various bacterial infections including respiratory infections, skin infections, and sexually transmitted diseases.',
    uses: [
      'Respiratory infections',
      'Skin infections',
      'Ear infections',
      'Sexually transmitted diseases',
      'Traveler\'s diarrhea'
    ],
    dosage: {
      adults: '500mg on day 1, then 250mg daily for 4 more days',
      children: '10mg per kg on day 1, then 5mg per kg daily for 4 more days',
      elderly: 'Same as adults, may need dose adjustment for kidney problems'
    },
    sideEffects: [
      'Nausea',
      'Diarrhea',
      'Stomach pain',
      'Headache',
      'Dizziness'
    ],
    precautions: [
      'Take on empty stomach',
      'Complete full course',
      'Avoid alcohol',
      'Consult doctor if you have heart problems'
    ],
    interactions: [
      'Antacids',
      'Blood thinners',
      'Other antibiotics',
      'Heart medications'
    ],
    category: 'Macrolide Antibiotic',
    prescriptionRequired: true
  },
  {
    id: '8',
    name: 'Pantoprazole',
    genericName: 'Pantoprazole',
    brandNames: ['Pantop', 'Protonix', 'Pantoprazole'],
    description: 'Pantoprazole is a proton pump inhibitor that reduces stomach acid production. It is used to treat acid-related stomach and throat problems.',
    uses: [
      'Acid reflux (GERD)',
      'Stomach ulcers',
      'Esophagitis',
      'Zollinger-Ellison syndrome',
      'Prevention of stress ulcers'
    ],
    dosage: {
      adults: '40mg once daily, 30 minutes before breakfast',
      children: 'Not recommended for children under 5 years',
      elderly: '40mg once daily, may need dose adjustment'
    },
    sideEffects: [
      'Headache',
      'Diarrhea',
      'Nausea',
      'Stomach pain',
      'Vitamin B12 deficiency (long-term use)'
    ],
    precautions: [
      'Take on empty stomach',
      'Do not crush tablets',
      'Consult doctor if pregnant',
      'Long-term use may affect bone health'
    ],
    interactions: [
      'Iron supplements',
      'Vitamin B12',
      'Blood thinners',
      'Antifungal medications'
    ],
    category: 'Proton Pump Inhibitor',
    prescriptionRequired: true
  }
];

// Search function for medicines
export const searchMedicines = (query: string): MedicineSearchResult[] => {
  const searchTerm = query.toLowerCase().trim();
  const results: MedicineSearchResult[] = [];

  medicineDatabase.forEach(medicine => {
    let relevance = 0;
    let matchType: 'exact' | 'partial' | 'generic' | 'brand' = 'partial';

    // Check exact name match
    if (medicine.name.toLowerCase() === searchTerm) {
      relevance = 100;
      matchType = 'exact';
    }
    // Check generic name match
    else if (medicine.genericName.toLowerCase().includes(searchTerm)) {
      relevance = 90;
      matchType = 'generic';
    }
    // Check brand names
    else if (medicine.brandNames.some(brand => brand.toLowerCase().includes(searchTerm))) {
      relevance = 85;
      matchType = 'brand';
    }
    // Check partial name match
    else if (medicine.name.toLowerCase().includes(searchTerm)) {
      relevance = 80;
      matchType = 'partial';
    }
    // Check uses/category
    else if (medicine.uses.some(use => use.toLowerCase().includes(searchTerm)) ||
             medicine.category.toLowerCase().includes(searchTerm)) {
      relevance = 60;
      matchType = 'partial';
    }

    if (relevance > 0) {
      results.push({
        medicine,
        relevance,
        matchType
      });
    }
  });

  // Sort by relevance (highest first)
  return results.sort((a, b) => b.relevance - a.relevance);
};

// Get medicine by ID
export const getMedicineById = (id: string): MedicineInfo | undefined => {
  return medicineDatabase.find(medicine => medicine.id === id);
};

// Get medicines by category
export const getMedicinesByCategory = (category: string): MedicineInfo[] => {
  return medicineDatabase.filter(medicine => 
    medicine.category.toLowerCase().includes(category.toLowerCase())
  );
};

// Get all categories
export const getAllCategories = (): string[] => {
  const categories = medicineDatabase.map(medicine => medicine.category);
  return [...new Set(categories)];
}; 