require("dotenv").config();

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const User = require("./models/User");

// ✅ First Names
const firstNamesMale = [
  "Rahul", "Amit", "Rohit", "Sagar", "Vikas", "Kiran",
  "Ajay", "Nikhil", "Pratik", "Swapnil", "Tejas", "Omkar",
  "Aditya", "Siddhesh", "Akash", "Yash", "Rohan", "Aniket",
  "Ganesh", "Harshal", "Mahesh", "Amol", "Deepak", "Sandeep",
  "Sunil", "Vishal", "Abhishek", "Shubham", "Tushar", "Manoj"
];

const firstNamesFemale = [
  "Priyanka", "Sneha", "Pooja", "Neha", "Anjali", "Meena",
  "Aarti", "Kavita", "Rutuja", "Shraddha", "Sakshi", "Komal",
  "Vaishnavi", "Prachi", "Tanvi", "Rashmi", "Sonali", "Dipali",
  "Sheetal", "Bhagyashree", "Pallavi", "Madhuri", "Swati",
  "Nikita", "Rani", "Manisha", "Seema", "Archana", "Sonal"
];

// ✅ Last Names (Common Indian/Maharashtrian)
const lastNames = [
  "Patil", "Jadhav", "Shinde", "Pawar", "Mane",
  "Kulkarni", "Deshmukh", "Chavan", "More",
  "Joshi", "Gaikwad", "Bhosale", "Kadam",
  "Thorat", "Salunkhe", "Jagtap", "Nalawade", "Ghadge"
];

async function cleanData() {
  try {
    console.log("🧹 Cleaning started...\n");

    const users = await User.find({ role: "USER" });

    let i = 1;

    for (let user of users) {

      // ✅ Random gender
      const gender = faker.helpers.arrayElement(["Male", "Female"]);

      // ✅ Generate dynamic Indian name
      const firstName = gender === "Male"
        ? faker.helpers.arrayElement(firstNamesMale)
        : faker.helpers.arrayElement(firstNamesFemale);

      const lastName = faker.helpers.arrayElement(lastNames);

      const fullName = `${firstName} ${lastName}`;

      // ✅ Clean email
      const cleanName = fullName.toLowerCase().replace(/\s+/g, ".");
      const newEmail = `${cleanName}${i}${Math.floor(Math.random() * 1000)}@gmail.com`;

      // ✅ Indian phone number (10-digit starting with 9)
      const newPhone = "9" + Math.floor(100000000 + Math.random() * 9000000000);

      // ✅ Update user
      await User.findByIdAndUpdate(user._id, {
        email: newEmail,
        phone: newPhone,
        "profile.full_name": fullName,
        "profile.gender": gender
      });

      console.log(`✅ Updated: ${fullName} → ${newEmail}`);

      i++;
    }

    console.log("\n🎉 All users cleaned successfully!");

    await mongoose.disconnect();
    process.exit();

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected\n");
    cleanData();
  })
  .catch(err => console.error(err));