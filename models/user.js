var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	watchlist: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Stock"
      }
   ],
	bought: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Stock"
      }
   ],
	sold: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Stock"
      }
   ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);