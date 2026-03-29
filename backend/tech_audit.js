import fetch from 'node-fetch';

async function TechnicalAudit() {
  const timestamp = Date.now();
  const testEmail = `tech_auditor_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting High-Density Technical Label Audit...`);
  
  try {
    const regRes = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    // Testing Case: Aspirin
    console.log("Analyzing 'Aspirin' technical data on Port 3002...");
    const medRes = await fetch('http://localhost:3002/api/medicine/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ primaryMedicine: "Aspirin", secondaryMedicine: "Warfarin" })
    });
    const data = await medRes.json();
    
    console.log("--- TECHNICAL ANALYSIS: ASPIRIN ---");
    console.log("Active Ingredient:", data.techIngredients1?.active);
    console.log("Binders:", data.techIngredients1?.inactive?.binders);
    console.log("Coatings:", data.techIngredients1?.inactive?.coatings);
    console.log("Additives:", data.techIngredients1?.inactive?.additives);
    
    const hasActive = data.techIngredients1?.active?.toLowerCase().includes('acetylsalicylic');
    const hasBinders = !!data.techIngredients1?.inactive?.binders;
    
    if (hasActive && hasBinders) {
      console.log("\n✅ TECHNICAL VERIFICATION SUCCESS: Label data extracted.");
    } else {
      console.error("\n❌ TECHNICAL VERIFICATION FAILURE: Incomplete rollout.");
      console.log("Full Data:", JSON.stringify(data.techIngredients1, null, 2));
    }
    
  } catch (e) {
    console.error("Audit Fault:", e.message);
  }
}

TechnicalAudit();
