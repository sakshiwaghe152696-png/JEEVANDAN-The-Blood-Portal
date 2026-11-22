const client = require("../utils/twilio");
const Notification = require("../models/Notification");

const sendSMS = async (userId, phone, message) => {
  try {

    // Convert Indian numbers to E.164 format
    let formattedPhone = phone.toString().trim();

    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`;
    }

    console.log("Sending SMS to:", formattedPhone);

    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: formattedPhone,
    });

    await Notification.create({
      user_id: userId,
      title: "Emergency Blood Request",
      message,
      type: "DONOR_EMERGENCY",
      channel: "SMS",
      priority: "CRITICAL",
      is_sent: true,
      reference_id: sms.sid,
    });

    return sms;

  } catch (err) {

    console.error("SMS Error:", err.message);

    await Notification.create({
      user_id: userId,
      title: "Emergency Blood Request",
      message,
      type: "DONOR_EMERGENCY",
      channel: "SMS",
      priority: "CRITICAL",
      is_sent: false,
    });

    throw err;
  }
};

module.exports = {
  sendSMS,
};