import Profile from '../models/Profile.js';
import { sendSOSEmail } from '../utils/emailService.js';

// @desc    Trigger Emergency SOS Network protocols extracting pure profile biometrics
// @route   POST /api/emergency/trigger
// @access  Private
export const triggerEmergency = async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    // Pull full biometric profile and emergency payloads
    let profile = await Profile.findOne({ user: req.user._id });
    
    // Self-Healing SOS Handshake: If profile is missing, create a skeletal one to prevent UI block
    if (!profile) {
        console.warn('⚠️ [SOS_HEAL] Missing profile for user:', req.user._id, '- Creating skeletal context.');
        profile = await Profile.create({
            user: req.user._id,
            emergencyContact: { name: "System Emergency Contact", phone: "Not Set", relation: "Unknown" },
            // Basic fields can remain empty/defaults
        });
    }

    // Validation: Check if emergency contact is actually set by the user
    if (!profile.emergencyContact || !profile.emergencyContact.email) {
        return res.status(400).json({ 
            message: 'SOS Dispatch Blocked: No Emergency Contact Email found in your profile. Please update this in Settings before transmitting.' 
        });
    }

    // In a production system, this dispatches absolute webhook/Twilio logic hitting local EMS interfaces
    // For now we map the precise JSON payload intended for EMT reception:
    
    const sosAlertPayload = {
       recipient: profile.emergencyContact.name,
       contactNumber: profile.emergencyContact.phone,
       relation: profile.emergencyContact.relation,
       biometrics: { age: profile.age, gender: profile.gender, bloodGroup: profile.bloodGroup },
       anaphylacticHazards: profile.allergies,
       criticalConditions: profile.conditions,
       activePharmacology: profile.medications,
       dispatchCoordinates: coordinates || profile.location || "Coordinates Unknown"
    };

    console.warn('🚨 [SOS ALERT] NOTIFYING EMERGENCY CONTACT:', sosAlertPayload.recipient, `at ${sosAlertPayload.contactNumber}`);

    // Global High-Priority Dispatch
    if (profile.emergencyContact.email) {
        await sendSOSEmail(profile.emergencyContact.email, sosAlertPayload);
    }

    const hasCredentials = process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASS && process.env.SYSTEM_EMAIL_PASS !== 'mock_pass_override' && process.env.SYSTEM_EMAIL_PASS !== 'your_mailjet_secret_key';

    res.json({
      status: "DISPATCHED",
      version: "2.7.2-MAILJET-PRO",
      dispatchMode: hasCredentials ? "LIVE" : "SIMULATION",
      message: hasCredentials 
        ? `SOS Signal routed to emergency contact: ${sosAlertPayload.recipient}` 
        : `[SIMULATION] SOS Signal would be routed to: ${sosAlertPayload.recipient}. No SMTP credentials detected.`,
      payloadBroadcast: sosAlertPayload
    });

  } catch (error) {
    console.error("🚨 SOS_CRASH_V2.7:", error);
    res.status(500).json({ 
        message: 'Neural SOS Engine Fault [V2.7]', 
        error: error.message,
        details: "Identity Handshake Failure or SMTP Gateway Timeout."
    });
  }
};

export const getEmergencyStatus = async (req, res) => {
    const hasCredentials = process.env.SYSTEM_EMAIL && 
                           process.env.SYSTEM_EMAIL_PASS && 
                           process.env.SYSTEM_EMAIL !== 'your_mailjet_api_key' &&
                           process.env.SYSTEM_EMAIL_PASS !== 'your_mailjet_secret_key';

    res.json({
        dispatchMode: hasCredentials ? "LIVE" : "SIMULATION",
        gateway: "MAILJET-V3",
        active: hasCredentials
    });
};
