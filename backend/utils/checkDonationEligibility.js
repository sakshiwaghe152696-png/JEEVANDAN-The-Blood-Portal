const DonorMedicalProfile = require("../models/DonorMedicalProfile");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");

exports.checkEligibilityAndNotify = async () => {
  try {
    const donors = await DonorMedicalProfile.find();
    const today = new Date();

    for (const donor of donors) {

      // Get latest completed donation
      const lastDonation = await Donation.findOne({
        donor_id: donor.donor_id,
        status: "Completed"
      }).sort({ donationDate: -1 });

      // If donor never donated
      if (!lastDonation) {

        donor.last_donation_date = null;
        donor.is_eligible = true;
        await donor.save();

        await Notification.deleteMany({
          user_id: donor.donor_id,
          type: "ELIGIBILITY_REMINDER"
        });

        continue;
      }

      const lastDate = new Date(lastDonation.donationDate);

      // Keep Medical Profile synchronized
      donor.last_donation_date = lastDate;

      const nextEligibleDate = new Date(lastDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

      const isEligibleNow = today >= nextEligibleDate;

      donor.is_eligible = isEligibleNow;
      await donor.save();

      if (isEligibleNow) {

        const existing = await Notification.findOne({
          user_id: donor.donor_id,
          type: "ELIGIBILITY_REMINDER"
        });

        if (!existing) {
          await Notification.create({
            user_id: donor.donor_id,
            title: "🩸 You're Eligible to Donate Again!",
            message: "It's been 90 days since your last donation. You can donate again now.",
            type: "ELIGIBILITY_REMINDER",
            channel: "DASHBOARD"
          });
        }

      } else {

        // Remove old reminder after new donation
        await Notification.deleteMany({
          user_id: donor.donor_id,
          type: "ELIGIBILITY_REMINDER"
        });

      }
    }

    console.log("✅ Eligibility check completed");

  } catch (error) {
    console.error("❌ Eligibility check error:", error);
  }
};