var mongoose = require("mongoose");
var StockSchema = new mongoose.Schema({
	name     :String,
	price    : String,
	l52 :String,
	growth_1 :String,
	Mcap     : String,
	Evalue   :String,
	EPS5     :String,
	DtoE     :String,
	PtoG     :String	
	
});

module.exports = mongoose.model("Stock",StockSchema);