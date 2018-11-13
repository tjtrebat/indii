const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  next();
});

UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
