import axios from 'axios';

// For disease information, using the free Disease.sh API
const DISEASE_API_URL = 'https://disease.sh/v3/covid-19/countries';

// Function to process disease-related text queries
export const processTextQuery = async (query) => {
  try {
    // Normalize the query to lowercase
    const normalizedQuery = query.toLowerCase();
    
    // Check if query is related to a disease
    if (normalizedQuery.includes('covid') || normalizedQuery.includes('coronavirus')) {
      // Get global COVID data
      const response = await axios.get('https://disease.sh/v3/covid-19/all');
      
      return {
        message: `Here's the latest information about COVID-19 globally:
        • Total cases: ${response.data.cases.toLocaleString()}
        • Total deaths: ${response.data.deaths.toLocaleString()}
        • Total recovered: ${response.data.recovered.toLocaleString()}
        • Active cases: ${response.data.active.toLocaleString()}`,
        diseaseInfo: {
          name: 'COVID-19 (Coronavirus Disease)',
          description: 'COVID-19 is an infectious disease caused by the SARS-CoV-2 virus that can cause respiratory illness with symptoms such as fever, cough, and shortness of breath.',
          symptoms: [
            'Fever or chills',
            'Cough',
            'Shortness of breath',
            'Fatigue',
            'Muscle or body aches',
            'Headache',
            'Loss of taste or smell',
            'Sore throat',
            'Congestion or runny nose',
            'Nausea or vomiting',
            'Diarrhea'
          ],
          causes: [
            'Infection with the SARS-CoV-2 virus',
            'Spread through respiratory droplets',
            'Close contact with infected individuals'
          ],
          treatments: [
            'Rest and hydration',
            'Over-the-counter medications for fever and pain',
            'Antiviral medications (for severe cases)',
            'Oxygen therapy (for severe cases)'
          ],
          preventions: [
            'Vaccination',
            'Wearing masks in crowded areas',
            'Frequent handwashing',
            'Social distancing',
            'Avoiding close contact with sick individuals'
          ],
          image: 'https://www.cdc.gov/coronavirus/2019-ncov/images/COVID-19-SM-1200x675.jpg'
        }
      };
    } else if (normalizedQuery.includes('flu') || normalizedQuery.includes('influenza')) {
      return {
        message: 'Here\'s information about Influenza (Flu)',
        diseaseInfo: {
          name: 'Influenza (Flu)',
          description: 'Influenza is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs.',
          symptoms: [
            'Fever or feeling feverish/chills',
            'Cough',
            'Sore throat',
            'Runny or stuffy nose',
            'Muscle or body aches',
            'Headaches',
            'Fatigue (tiredness)',
            'Some people may have vomiting and diarrhea, though this is more common in children than adults'
          ],
          causes: [
            'Influenza viruses (Type A, B, C, and D)',
            'Spread through respiratory droplets',
            'Contact with contaminated surfaces'
          ],
          treatments: [
            'Rest and hydration',
            'Over-the-counter pain relievers',
            'Antiviral medications (if prescribed)',
            'Fever reducers'
          ],
          preventions: [
            'Annual flu vaccination',
            'Frequent handwashing',
            'Avoiding close contact with sick individuals',
            'Covering coughs and sneezes',
            'Staying home when sick'
          ],
          image: 'https://www.cdc.gov/flu/images/h1n1/3D_Influenza_transparent_key_pieslice_lrg.gif'
        }
      };
    } else if (normalizedQuery.includes('malaria')) {
      return {
        message: 'Here\'s information about Malaria',
        diseaseInfo: {
          name: 'Malaria',
          description: 'Malaria is a serious disease caused by a parasite that is transmitted by the bite of infected female Anopheles mosquitoes.',
          symptoms: [
            'Fever',
            'Chills',
            'Sweating',
            'Headache',
            'Nausea and vomiting',
            'Body aches',
            'General malaise',
            'Fatigue'
          ],
          causes: [
            'Plasmodium parasites (P. falciparum, P. vivax, P. ovale, P. malariae, and P. knowlesi)',
            'Transmitted through mosquito bites',
            'Rarely through infected blood transfusions or shared needles'
          ],
          treatments: [
            'Antimalarial drugs',
            'Supportive care',
            'Fever management',
            'Ensuring adequate hydration',
            'Treatment based on the specific Plasmodium species'
          ],
          preventions: [
            'Mosquito nets',
            'Insect repellent',
            'Antimalarial drugs (for prevention when traveling)',
            'Wearing long-sleeved clothing',
            'Avoiding outdoor activities during peak mosquito times'
          ],
          image: 'https://www.cdc.gov/parasites/malaria/images/Malaria_LifeCycle.jpg'
        }
      };
    } else if (normalizedQuery.includes('diabetes')) {
      return {
        message: 'Here\'s information about Diabetes',
        diseaseInfo: {
          name: 'Diabetes Mellitus',
          description: 'Diabetes is a chronic disease that occurs when the pancreas does not produce enough insulin or when the body cannot effectively use the insulin it produces.',
          symptoms: [
            'Increased thirst and urination',
            'Increased hunger',
            'Fatigue',
            'Blurred vision',
            'Unexplained weight loss',
            'Slow-healing sores',
            'Frequent infections',
            'Numbness or tingling in hands or feet'
          ],
          causes: [
            'Type 1: Autoimmune reaction (body attacks insulin-producing cells)',
            'Type 2: Insulin resistance and inadequate insulin production',
            'Gestational: Hormonal changes during pregnancy',
            'Genetic factors',
            'Environmental factors'
          ],
          treatments: [
            'Insulin therapy (for Type 1 and some Type 2)',
            'Oral medications (for Type 2)',
            'Regular blood sugar monitoring',
            'Healthy diet',
            'Regular exercise',
            'Maintaining a healthy weight',
            'Regular medical check-ups'
          ],
          preventions: [
            'Maintain a healthy weight',
            'Regular physical activity',
            'Eating a balanced diet',
            'Avoiding tobacco use',
            'Regular health check-ups',
            'Medication adherence for those at high risk'
          ],
          image: 'https://www.niddk.nih.gov/-/media/Images/Health-Information/Diabetes/landing-page/diabetes-infographic-900x900.jpg'
        }
      };
    } else if (normalizedQuery.includes('hypertension') || normalizedQuery.includes('high blood pressure')) {
      return {
        message: 'Here\'s information about Hypertension (High Blood Pressure)',
        diseaseInfo: {
          name: 'Hypertension (High Blood Pressure)',
          description: 'Hypertension is a condition in which the blood pressure in the arteries is persistently elevated. It often has no symptoms but can lead to serious health problems.',
          symptoms: [
            'Usually asymptomatic (no symptoms)',
            'In severe cases: headaches',
            'Shortness of breath',
            'Nosebleeds',
            'Chest pain',
            'Visual changes',
            'Dizziness'
          ],
          causes: [
            'Primary hypertension: No identifiable cause (90-95% of cases)',
            'Secondary hypertension: Caused by underlying conditions',
            'Genetic factors',
            'Advanced age',
            'Obesity',
            'Physical inactivity',
            'High sodium diet',
            'Excessive alcohol consumption',
            'Stress'
          ],
          treatments: [
            'Lifestyle modifications',
            'Blood pressure medications',
            'Regular monitoring',
            'Treating underlying causes',
            'Dietary changes (DASH diet)'
          ],
          preventions: [
            'Regular exercise',
            'Healthy diet low in sodium',
            'Limiting alcohol consumption',
            'Maintaining a healthy weight',
            'Not smoking',
            'Managing stress',
            'Regular health check-ups'
          ],
          image: 'https://www.cdc.gov/dhdsp/images/high-blood-pressure.jpg'
        }
      };
    } else {
      // General response if no specific disease is identified
      return {
        message: `I'd be happy to help with your health question: "${query}". If you're asking about a specific disease, please mention its name, and I'll provide detailed information about symptoms, causes, treatments, and prevention methods.`,
      };
    }
  } catch (error) {
    console.error('Error processing text query:', error);
    return {
      message: 'I apologize, but I encountered an error processing your request. Please try again or ask a different question.',
    };
  }
};

// Function to process image uploads (mock implementation)
export const processImageUpload = async (image) => {
  try {
    // In a real implementation, you would send the image to a server for processing
    // For now, we'll return a mock response based on the image file size
    
    // Create a mock analysis based on image size
    const fileSize = image.size;
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple mock logic to determine the "disease" based on file size
    if (fileSize < 100000) { // Small image
      return {
        message: "Based on the image you've shared, I've identified possible signs of a skin condition. Please consult with a dermatologist for proper diagnosis.",
        diseaseInfo: {
          name: 'Possible Dermatitis',
          description: "Dermatitis is inflammation of the skin, typically characterized by itchiness, redness, and a rash. It's not contagious or life-threatening, but can be uncomfortable.",
          symptoms: [
            'Redness',
            'Itching',
            'Dry skin',
            'Swelling',
            'Rash',
            'Blisters that may ooze or crust over'
          ],
          causes: [
            'Contact with allergens or irritants',
            'Genetic factors',
            'Environmental factors',
            'Immune system dysfunction'
          ],
          treatments: [
            'Avoiding triggers',
            'Moisturizing regularly',
            'Topical corticosteroids',
            'Antihistamines for itching',
            'Phototherapy'
          ],
          preventions: [
            'Identifying and avoiding triggers',
            'Regular moisturization',
            'Using mild soaps and detergents',
            'Wearing protective clothing when handling irritants'
          ],
          image: 'https://www.aad.org/public/diseases/eczema/types/atopic-dermatitis/symptoms'
        }
      };
    } else if (fileSize < 500000) { // Medium image
      return {
        message: "I've analyzed the image and detected possible signs of a respiratory condition. A healthcare provider should be consulted for proper evaluation.",
        diseaseInfo: {
          name: 'Possible Respiratory Condition',
          description: 'Respiratory conditions affect the airways and other structures of the lung, often causing difficulty breathing.',
          symptoms: [
            'Shortness of breath',
            'Chest tightness or pain',
            'Chronic cough',
            'Mucus production',
            'Wheezing',
            'Fatigue'
          ],
          causes: [
            'Smoking',
            'Air pollution',
            'Genetic factors',
            'Infections',
            'Occupational exposure to irritants'
          ],
          treatments: [
            'Bronchodilators',
            'Inhaled corticosteroids',
            'Oxygen therapy',
            'Pulmonary rehabilitation',
            'Lifestyle changes'
          ],
          preventions: [
            'Not smoking',
            'Avoiding air pollution',
            'Vaccination against respiratory infections',
            'Regular exercise',
            'Proper management of allergies'
          ],
          image: 'https://www.nhlbi.nih.gov/sites/default/files/styles/16x9_crop/public/2017-12/lung-airways.jpg'
        }
      };
    } else { // Large image
      return {
        message: "Thank you for sharing this image. I've identified possible signs of a cardiovascular condition. Please consult with a cardiologist for proper evaluation.",
        diseaseInfo: {
          name: 'Possible Cardiovascular Condition',
          description: 'Cardiovascular conditions affect the heart and blood vessels, potentially impacting blood circulation throughout the body.',
          symptoms: [
            'Chest pain or discomfort',
            'Shortness of breath',
            'Fatigue',
            'Rapid or irregular heartbeat',
            'Dizziness or lightheadedness',
            'Swelling in the legs, ankles, or feet'
          ],
          causes: [
            'High blood pressure',
            'High cholesterol',
            'Smoking',
            'Diabetes',
            'Family history',
            'Age',
            'Unhealthy diet',
            'Physical inactivity',
            'Obesity',
            'Stress'
          ],
          treatments: [
            'Medications',
            'Lifestyle changes',
            'Medical procedures or surgery',
            'Cardiac rehabilitation',
            'Regular monitoring'
          ],
          preventions: [
            'Healthy diet',
            'Regular physical activity',
            'Maintaining a healthy weight',
            'Not smoking',
            'Managing stress',
            'Limiting alcohol consumption',
            'Regular health check-ups'
          ],
          image: 'https://www.nhlbi.nih.gov/sites/default/files/styles/16x9_crop/public/2021-04/heart-illustration.jpg'
        }
      };
    }
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      message: 'I apologize, but I encountered an error analyzing the image. Please try uploading it again or describe your symptoms in a message.'
    };
  }
};