var express = require("express");
var app= express();
var mongoose              = require("mongoose"),
	passport              = require("passport"),
	bodyParser            = require("body-parser"),
	User                  = require("./models/user"), 
	Stock                 = require("./models/stock"),
	Portfolio             = require("./models/portfolio"),
	flash                 = require("connect-flash"),
	LocalStrategy         = require("passport-local"),
	methodOverride         = require("method-override"),
	middleware            = require("./middleware"),
	passportLocalMongoose = require("passport-local-mongoose");
	
mongoose.connect("mongodb://localhost/TaxBlock");
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(require("express-session")({
	secret:"Rusty",
	resave:false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error       = req.flash("error");
	res.locals.success     = req.flash("success");
	next();
});

app.get("/",function (req,res){
	res.render("home");	
});

app.get("/buy",middleware.isLoggedIn,function(req,res){
	Stock.find({},function(err,allStocks){
		if(err)
			{
				console.log(err);
			}
		else
			{
				res.render("buy",{stocks:allStocks});
			}
	})
})

app.get("/newStock",function(req,res){
	res.render("newStock");
});

app.post("/newStock",function(req,res){
	Stock.create(req.body.stock,function(err,stock){
		if(err){
			console.log(err);
			return res.redirect("/newStock");
		}
		else 	
		{
			req.flash("success","Successfully added new Entry");
			stock.save();
			res.redirect("/");
		}
	});
});

app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	var newUser= new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			return res.redirect("/register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome to TaxBlock");
			res.redirect("/");
		});
	});
});


app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate("local",{
		successRedirect:"/buy",
		failureRedirect:"/login"
	}),function(req,res){
	//req.flash("error","incorrect username or password");
	res.redirect("/login");
})

//add to watchlist
app.post("/:user_id/watchlist/:stock_id",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.user_id,function(err,foundUser){
		if(err)
			{
				console.log(err);
			}
		else
			{
				Stock.findById(req.params.stock_id,function(err,addStock){
					if(err)
						console.log(err);
					else
					{
							foundUser.watchlist.push(addStock);	
							foundUser.save();
					}
				});
				
			}
	})
	
})

//display watchlist
app.get("/:user_id/watchlist",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.user_id).populate("watchlist").exec(function(err,foundUser){
		if(err)
			console.log(err);
		else
			{
				//console.log(foundUser);
				res.render("watchlist",{foundUser:foundUser});
			}
	});
});


//display buy page
app.get("/:user_id/buy/:stock_id",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.user_id,function(err,foundUser){
		Stock.findById(req.params.stock_id,function(err,stock){
			res.render("newPortfolio",{foundUser:foundUser,stock:stock});
		})
	})
});


//buy or update purchased stock
app.post("/:user_id/buy/:stock_id",middleware.isLoggedIn,function(req,res){
	
	User.findByIdAndUpdate(req.params.user_id,function(err,foundUser){
		if(err)
			{
				console.log(err);
			}
		else
			{
				Stock.findById(req.params.stock_id,function(err,addStock){
					if(err)
						console.log(err);
					else
						{
							var flag=false;
							Portfolio.find({username:foundUser.username},function(err,foundEntry)
										  {
								if(err)
									console.log(err);
								else if(foundEntry!=null)
								{
									foundEntry.forEach(function(entry){
										
									if(entry.stock.id==req.params.stock_id)
										{
											
											flag=true;
											var currQuantity=entry.quantity;
											console.log(currQuantity);
											entry.quantity=parseInt(currQuantity)+parseInt(req.body.quantity);
											entry.save();
											req.flash("success","Successfully Updated Stock Quantity");
											res.redirect("/buy");
										}
									})
								}
							})
							setTimeout(function(){
								if(flag==false)
							{
								var portfolio =new Portfolio();
							            portfolio.username=foundUser.username;
										portfolio.stock.id=req.params.stock_id;
										portfolio.stock.price=addStock.price;
										portfolio.stock.name=addStock.name;
										portfolio.stock.l52=addStock.l52;
										portfolio.stock.growth_1=addStock.growth_1;
										portfolio.stock.Mcap=addStock.Mcap;
										portfolio.stock.Evalue=addStock.Evalue;
										portfolio.stock.EPS5=addStock.EPS5;
										portfolio.stock.DtoE=addStock.DtoE;
										portfolio.stock.PtoG=addStock.PtoG;
										portfolio.quantity=req.body.quantity;
									Portfolio.create(portfolio,function(err,newportfolio){
								if(err)
									{
										console.log(err);
									}
								else
									{
										req.flash("success","Stock bought successfully");
										res.redirect("/buy");	
									}
							})
							}
							},500);
							
						}
				});
				
			}
	})
	
})

//display sell page
app.get("/:user_id/sell/:stock_id",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.user_id,function(err,foundUser){
		if(err)
			{
				console.log(err);
			}
		else
			{
				Stock.findById(req.params.stock_id,function(err,addStock){
					if(err)
						console.log(err);
					else
						{
							Portfolio.find({username:foundUser.username},function(err,foundEntry)
										  {
								if(err)
									console.log(err);
								else if(foundEntry!=null)
								{
									foundEntry.forEach(function(portfolio){
									if(portfolio.stock.id==req.params.stock_id)
										{
											res.render("sellPortfolio",{portfolio:portfolio});
											return;
										}
									})
								}
							})
						}
				});
				
			}
	})
});

//route for selling stock
app.put("/:user_id/buy/:stock_id",middleware.isLoggedIn,function(req,res){
	
	User.findById(req.params.user_id,function(err,foundUser){
		if(err)
			{
				console.log(err);
			}
		else
			{
				Stock.findById(req.params.stock_id,function(err,addStock){
					if(err)
						console.log(err);
					else
						{
							var flag=false;
							Portfolio.find({username:foundUser.username},function(err,foundEntry)
										  {
								if(err)
									console.log(err);
								else if(foundEntry!=null)
								{
									foundEntry.forEach(function(entry){
										
									if(entry.stock.id==req.params.stock_id)
										{
											flag=true;
											var currQuantity=entry.quantity;
											console.log(currQuantity);
											if(parseInt(req.body.quantity)<=parseInt(currQuantity))
											{
												entry.quantity=parseInt(currQuantity)-parseInt(req.body.quantity);
												entry.save();
												res.redirect("/buy");
											}
											else
											{
												req.flash("error","Please Input Valid Quantity");
												res.redirect("/"+req.params.user_id+"/sell/"+req.params.stock_id);
											}
										}
									})
								}
							})
							
							
						}
				});
				
			}
	})
	
})


//display user portfolios
app.get("/:user_id/bought",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.user_id,function(err,curr){
		if(err)
			console.log(err);
		else
			{
				Portfolio.find({username:curr.username},function(err,foundStocks){
		if(err)
			console.log(err);
		else
			{
				res.render("bought",{foundStocks:foundStocks});
			}

		});	
				
			}
		
	});
	
});




app.get("/logout",function(req,res){
	req.logout();
	//req.flash("success","Logged out successfully");
	res.redirect("/");
})

app.listen(3000,function(){
	console.log("TaxBlock app running")
});