import fetch from 'node-fetch';

async function auditClinical() {
  const timestamp = Date.now();
  const testEmail = `auditor_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting Raw Neural Response Audit...`);
  
  try {
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    const medRes = await fetch('http://localhost:3001/api/medicine/check', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        primaryMedicine: "Aspirin",
        secondaryMedicine: "Warfarin"
      })
    });

    const data = await medRes.json();
    console.log("--- AUDIT RESULTS ---");
    console.log("Ingredients 1 Raw:", JSON.stringify(data.ingredients1));
    console.log("Ingredients 2 Raw:", JSON.stringify(data.ingredients2));
    console.log("Explanation Preview:", data.explanation?.substring(0, 100));
    
    if (data.explanation?.includes('simplified for you')) {
       console.log("⚠️ WARNING: Server triggered FALLBACK logic.");
    }
    
  } catch (e) {
    console.error("Audit Fault:", e.message);
  }
}

auditClinical();
