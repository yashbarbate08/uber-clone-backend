const user = require("../Models/user.model");

module.exports.createUser = async ({ fullname, email, password }) => {
  if (!fullname?.firstname || !email || !password) {
    throw new Error("All Fields are required");
  }

  const user = await user.create({
    fullname,
    email,
    password,
  });

  return user;
};