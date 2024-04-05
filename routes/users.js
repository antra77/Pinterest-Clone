const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
require('dotenv').config(); // Load environment variables from .env file

mongoose.connect(process.env.MONGODB_URI);

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  password: String,
  email: String,
  profileImage: String,
  contact: Number,
  boards: { type: Array, default: [] },
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
