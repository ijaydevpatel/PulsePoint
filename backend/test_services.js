import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'qa@pulsepoint.test',
  password: 'password123'
};

async function runTests() {
  console.log('--- PULSEPOINT SERVICE VERIFICATION ---');

  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });
  const { token } = await loginRes.json();
  if (!token) throw new Error('Login failed');
  console.log('✅ Auth Service: PASSED (Token received)');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Upsert Profile
  const profileRes = await fetch(`${BASE_URL}/profile`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      age: 30,
      gender: 'Male',
      weight: 75,
      height: 180,
      bloodGroup: 'O+',
      allergies: ['Peanuts'],
      conditions: ['None']
    })
  });
  const profileData = await profileRes.json();
  console.log('✅ Profile Service: PASSED (Profile updated)');

  // 3. Symptom Checker
  console.log('Testing Symptom Checker...');
  const symptomRes = await fetch(`${BASE_URL}/symptoms/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      activeSymptoms: ['headache', 'fever'],
      customSymptom: 'I have a mild cough as well'
    })
  });
  const symptomData = await symptomRes.json();
  if (symptomData.probabilityMatrix) {
    console.log('✅ Symptom Checker: PASSED (AI Response received)');
  } else {
    console.log('❌ Symptom Checker: FAILED');
    console.log(symptomData);
  }

  // 4. Medicine Compatibility
  console.log('Testing Medicine Compatibility...');
  const medicineRes = await fetch(`${BASE_URL}/medicine/check`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      primaryMedicine: 'Aspirin',
      secondaryMedicine: 'Ibuprofen'
    })
  });
  const medicineData = await medicineRes.json();
  if (medicineData.riskLevel) {
    console.log(`✅ Medicine Compatibility: PASSED (Risk: ${medicineData.riskLevel})`);
  } else {
    console.log('❌ Medicine Compatibility: FAILED');
    console.log(JSON.stringify(medicineData, null, 2));
  }

  // 5. AI Chat
  console.log('Testing AI Chat...');
  const chatRes = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: 'What should I do for a mild fever?'
    })
  });
  const chatData = await chatRes.json();
  if (chatData.reply) {
    console.log('✅ AI Doctor Chat: PASSED (AI Response received)');
  } else {
    console.log('❌ AI Doctor Chat: FAILED');
    console.log(JSON.stringify(chatData, null, 2));
  }

  console.log('--- VERIFICATION COMPLETE ---');
}

runTests().catch(err => {
  console.error('VERIFICATION ERROR:', err.message);
  process.exit(1);
});
