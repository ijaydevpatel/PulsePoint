import fetch from 'node-fetch';

async function homeopathyAudit() {
  const timestamp = Date.now();
  const testEmail = `homeopathy_auditor_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting Homeopathic Clinical Audit (Port 3001)...`);
  
  try {
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    // Testing Case: Belladonna + Aspidosperma
    console.log("Analyzing 'Belladonna' + 'Aspidosperma' (Homeopathic Shift)...");
    const medRes = await fetch('http://localhost:3001/api/medicine/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ primaryMedicine: "Belladonna", secondaryMedicine: "Aspidosperma" })
    });
    const data = await medRes.json();
    
    console.log("--- HOMEOPATHIC AUDIT: BELLADONNA / ASPIDOSPERMA ---");
    console.log("Explanation:", data.explanation?.substring(0, 500));
    console.log("Active 1:", data.techIngredients1?.active);
    console.log("Pathway:", data.metabolicPathway);
    
    const isHomeopathic = data.metabolicPathway?.toLowerCase().includes('vital force') || 
                          data.explanation?.toLowerCase().includes('materia medica') ||
                          data.explanation?.toLowerCase().includes('potency');
    
    const hasWrongPharmacology = data.explanation?.toLowerCase().includes('cyp450') || 
                                  data.explanation?.toLowerCase().includes('liver enzyme');
    
    if (isHomeopathic && !hasWrongPharmacology) {
      console.log("\n✅ HOMEOPATHIC AUDIT SUCCESS: Modality Gating is active.");
    } else {
      console.error("\n❌ HOMEOPATHIC AUDIT FAILURE: Check clinical tone.");
    }
    
  } catch (e) {
    console.error("Audit Fault:", e.message);
  }
}

homeopathyAudit();
