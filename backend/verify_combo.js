import fetch from 'node-fetch';

async function testCombination() {
  const timestamp = Date.now();
  const testEmail = `combo_tester_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting Combination Drug Ingredient Audit...`);
  
  try {
    // 1. Register/Auth
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    if (!token) throw new Error("Auth Failed");

    // 2. Test Multi-Ingredient Drug: Excedrin (Acetaminophen, Aspirin, Caffeine)
    // and Combiflam (Ibuprofen + Paracetamol)
    console.log("Analyzing 'Excedrin' + 'Combiflam' (Multi-ingredient test)...");
    const medRes = await fetch('http://localhost:3001/api/medicine/check', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        primaryMedicine: "Excedrin",
        secondaryMedicine: "Combiflam"
      })
    });

    const data = await medRes.json();
    console.log("--- INGREDIENT AUDIT ---");
    console.log("Ingredients 1 (Excedrin):", JSON.stringify(data.ingredients1));
    console.log("Ingredients 2 (Combiflam):", JSON.stringify(data.ingredients2));
    
    const excedrinCount = data.ingredients1?.length || 0;
    const combiflamCount = data.ingredients2?.length || 0;
    
    if (excedrinCount >= 2 && combiflamCount >= 2) {
      console.log("✅ SUCCESS: Multi-ingredient expansion verified.");
    } else {
      console.error("❌ FAILURE: Missing components detected.");
      console.log("Full Data:", JSON.stringify(data, null, 2));
    }
    
  } catch (e) {
    console.error("Simulation Fault:", e.message);
  }
}

testCombination();
