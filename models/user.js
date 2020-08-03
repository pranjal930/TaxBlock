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
	transaction: [
      {
         stock:{
			 id:{
				 type: mongoose.Schema.Types.ObjectId,
         	 ref: "Stock"
			 },
			 name:String
		 },
		  process:String,
		  quantity:{type:Number,default:0}
      }
   ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);