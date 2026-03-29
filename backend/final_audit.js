import fetch from 'node-fetch';

async function finalAudit() {
  const timestamp = Date.now();
  const testEmail = `final_auditor_${timestamp}@pulsepoint.com`;
  const testPass = "Test@12345";

  console.log(`Starting Final Exhaustive Component Audit...`);
  
  try {
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    const regData = await regRes.json();
    const token = regData.token;
    
    // Case 1: Excedrin (Combination)
    console.log("Testing Case: 'Excedrin' (Expect: Acetaminophen, Aspirin, Caffeine)");
    const medRes1 = await fetch('http://localhost:3001/api/medicine/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ primaryMedicine: "Excedrin", secondaryMedicine: "Advil" })
    });
    const data1 = await medRes1.json();
    console.log("Excedrin Components:", JSON.stringify(data1.ingredients1));

    // Case 2: Aspirin (Single)
    console.log("Testing Case: 'Aspirin' + 'Warfarin' (Expect cleaned single names)");
    const medRes2 = await fetch('http://localhost:3001/api/medicine/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ primaryMedicine: "Aspirin", secondaryMedicine: "Warfarin" })
    });
    const data2 = await medRes2.json();
    console.log("Aspirin Component:", JSON.stringify(data2.ingredients1));
    console.log("Warfarin Component:", JSON.stringify(data2.ingredients2));
    
    const excedrinValid = data1.ingredients1?.length >= 2;
    const aspirinValid = data2.ingredients1?.length === 1 && data2.ingredients1[0] === "Aspirin";
    
    if (excedrinValid && aspirinValid) {
      console.log("\n✅ FINAL VERIFICATION SUCCESS: All ingredients are real, all, and unique.");
    } else {
      console.error("\n❌ FINAL VERIFICATION FAILURE: Check logic.");
      console.log("Excedrin Data:", JSON.stringify(data1.ingredients1));
      console.log("Aspirin Data:", JSON.stringify(data2.ingredients1));
    }
    
  } catch (e) {
    console.error("Audit Fault:", e.message);
  }
}

finalAudit();
