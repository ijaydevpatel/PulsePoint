async function runAudit() {
    console.log('🚀 Starting Raw API Intelligence Audit (Aspirin + Warfarin)...');
    try {
        const response = await fetch('http://localhost:3001/api/medicine/check', {
            method: 'POST',
            body: JSON.stringify({
                primaryMedicine: 'Aspirin',
                secondaryMedicine: 'Warfarin'
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errText}`);
        }
        
        const data = await response.json();
        console.log('\n--- 🧪 AUDIT RESULTS ---');
        console.log(`Modality: ${data.isHomeopathic ? 'HOMEOPATHIC' : 'ALLOPATHIC'}`);
        console.log(`Active 1: ${data.techIngredients1?.active}`);
        console.log(`Binders 1: ${data.techIngredients1?.inactive?.binders}`);
        console.log(`Active 2: ${data.techIngredients2?.active}`);
        console.log(`Binders 2: ${data.techIngredients2?.inactive?.binders}`);
        console.log(`Explanation Length: ${data.explanation?.length} chars`);
        console.log(`Metabolic Pathway: ${data.metabolicPathway}`);
        console.log(`Risk Gauge: ${data.riskLevel} (${data.riskPercentage}%)`);

        const isComplete = !data.techIngredients1?.inactive?.binders?.toLowerCase().includes('n/a') && 
                          data.explanation?.length > 300;

        if (isComplete) {
            console.log('\n✅ AUDIT SUCCESS: Clinical density is RESTORED.');
        } else {
            console.log('\n❌ AUDIT FAILURE: Data is still generic or incomplete.');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Audit Failed:', error.message);
    }
}

runAudit();
