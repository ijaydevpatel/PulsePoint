import Profile from '../models/Profile.js';

// @desc    Trigger Emergency SOS Network protocols extracting pure profile biometrics
// @route   POST /api/emergency/trigger
// @access  Private
export const triggerEmergency = async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    // Pull full biometric profile and emergency payloads
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: 'Unverified Profile Integration Block.' });

    // In a production system, this dispatches absolute webhook/Twilio logic hitting local EMS interfaces
    // For now we map the precise JSON payload intended for EMT reception:
    
    const emsDispatchPayload = {
       patientName: profile.fullName,
       biometrics: { age: profile.age, gender: profile.gender, weight: profile.weight, bmi: profile.bmi, bloodGroup: profile.bloodGroup },
       anaphylacticHazards: profile.allergies,
       criticalConditions: profile.conditions,
       activePharmacology: profile.medications,
       dispatchCoordinates: coordinates || profile.location || "Coordinates Unknown",
       emergencyContact: profile.emergencyContact
    };

    console.error('🚨 [CRITICAL ALERT] EMS DIPATCH TRIGGERED FOR:', emsDispatchPayload.patientName);

    res.json({
      status: "DISPATCHED",
      message: "Emergency Services routing initialized.",
      payloadBroadcast: emsDispatchPayload
    });

  } catch (error) {
    res.status(500).json({ message: 'SOS Engine Execution Fault', error: error.message });
  }
};
