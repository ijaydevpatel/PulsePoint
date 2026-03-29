import fetch from 'node-fetch';

async function finalHandoverAudit() {
  const timestamp = Date.now();
  const testEmail = `handover_auditor_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting Final Production Handover Audit (Port 3001)...`);
  
  try {
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    // Testing Case: Aspirin
    console.log("Analyzing 'Aspirin' on Port 3001...");
    const medRes = await fetch('http://localhost:3001/api/medicine/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ primaryMedicine: "Aspirin", secondaryMedicine: "Warfarin" })
    });
    const data = await medRes.json();
    
    console.log("--- PRODUCTION AUDIT: ASPIRIN ---");
    console.log("Active Ingredient:", data.techIngredients1?.active);
    console.log("Binders:", data.techIngredients1?.inactive?.binders);
    
    const hasActive = data.techIngredients1?.active?.toLowerCase().includes('acetylsalicylic');
    
    if (hasActive) {
      console.log("\n✅ PRODUCTION HANDOVER SUCCESS: Live data verified on Port 3001.");
    } else {
      console.error("\n❌ PRODUCTION HANDOVER FAILURE: Fallback detected.");
      console.log("Full Response:", JSON.stringify(data, null, 2));
    }
    
  } catch (e) {
    console.error("Audit Fault:", e.message);
  }
}

finalHandoverAudit();
