import fetch from 'node-fetch';

async function clinicalHardeningAudit() {
  const timestamp = Date.now();
  const testEmail = `hardening_auditor_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting Clinical Hardening Audit (Port 3001)...`);
  
  try {
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    // Testing Case: Aspirin + Warfarin
    console.log("Analyzing 'Aspirin' + 'Warfarin' for medical terminology...");
    const medRes = await fetch('http://localhost:3001/api/medicine/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ primaryMedicine: "Aspirin", secondaryMedicine: "Warfarin" })
    });
    const data = await medRes.json();
    
    console.log("--- CLINICAL HARDENING AUDIT: ASPIRIN/WARFARIN ---");
    console.log("Explanation Preview:", data.explanation?.substring(0, 300));
    
    const hasMedicalTerms = data.explanation?.toLowerCase().includes('cyp') || 
                            data.explanation?.toLowerCase().includes('napqi') ||
                            data.explanation?.toLowerCase().includes('metabolite') ||
                            data.explanation?.toLowerCase().includes('isoenzyme') ||
                            data.explanation?.toLowerCase().includes('clearance');
    
    if (hasMedicalTerms) {
      console.log("\n✅ CLINICAL HARDENING SUCCESS: Technical terminology detected in output.");
    } else {
      console.error("\n❌ CLINICAL HARDENING FAILURE: Tone is too general.");
      console.log("Full Explanation:", data.explanation);
    }
    
  } catch (e) {
    console.error("Audit Fault:", e.message);
  }
}

clinicalHardeningAudit();
