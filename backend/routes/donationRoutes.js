const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const donationController = require("../controllers/donation.controller");

router.get(
    "/search/:phone",
    auth,
    donationController.searchDonor
);

router.get(
    "/",
    auth,
    donationController.getDonations
);

router.post(
    "/",
    auth,
    donationController.recordDonation
);

module.exports = router;