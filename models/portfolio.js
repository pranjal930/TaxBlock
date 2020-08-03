var mongoose = require("mongoose");
var PortfolioSchema = new mongoose.Schema({
	username:String,
	stock:{
		id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Stock"
      },
		name     :String,
		price    : String,
		l52 :String,
		growth_1 :String,
		Mcap     : String,
		Evalue   :String,
		EPS5     :String,
		DtoE     :String,
		PtoG     :String	
	},
	quantity:{type:Number,default:0}
	
});

module.exports = mongoose.model("Portfolio",PortfolioSchema);