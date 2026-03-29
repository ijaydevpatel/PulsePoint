import fetch from 'node-fetch';

async function MixtralAudit() {
  const timestamp = Date.now();
  const testEmail = `mixtral_auditor_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting Final Mixtral-8x7b Clinical Audit (Port 3003)...`);
  
  try {
    const regRes = await fetch('http://localhost:3003/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    // Testing Case: Excedrin
    console.log("Analyzing 'Excedrin' with Mixtral (Technical Decomposition)...");
    const medRes = await fetch('http://localhost:3003/api/medicine/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ primaryMedicine: "Excedrin", secondaryMedicine: "Advil" })
    });
    const data = await medRes.json();
    
    console.log("--- MIXTRAL TECHNICAL AUDIT: EXCEDRIN ---");
    console.log("Active Ingredient:", data.techIngredients1?.active);
    console.log("Binders:", data.techIngredients1?.inactive?.binders);
    console.log("Coatings:", data.techIngredients1?.inactive?.coatings);
    
    const hasCombine = data.techIngredients1?.active?.toLowerCase().includes('acetaminophen') && 
                       data.techIngredients1?.active?.toLowerCase().includes('aspirin');
    
    if (hasCombine) {
      console.log("\n✅ MIXTRAL AUDIT SUCCESS: Combined technical ingredients identified.");
    } else {
      console.error("\n❌ MIXTRAL AUDIT FAILURE: Check model output.");
      console.log("Full Data 1:", JSON.stringify(data.techIngredients1, null, 2));
    }
    
  } catch (e) {
    console.error("Audit Fault:", e.message);
  }
}

MixtralAudit();
