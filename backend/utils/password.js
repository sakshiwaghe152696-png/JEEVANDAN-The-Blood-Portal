const bcrypt = require("bcryptjs");

exports.compare = (plain, hash) => bcrypt.compare(plain, hash);
exports.hash = (plain) => bcrypt.hash(plain, 10);