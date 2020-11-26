const express = require("express");

const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");


const bcrypt = require("bcrypt");
const User = require("./models/User");


const app = express();

// mongdb cloud connection is here
mongoose
  .connect("mongodb://rihan:rihan123@ds123971.mlab.com:23971/arslan", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to mongodb cloud! :)");
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
app.use(express.urlencoded({ extened: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");



// route for serving frontend files
app
  .get("/", (req, res) => {
    res.render("index");
  })
  .get("/login", (req, res) => {
    res.render("login");
  })
  .get("/register", (req, res) => {
    res.render("register");
  })

  .get("/home", (req, res) => {
    res.render("home");
  });

// route for handling post requirests
app
  .post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExits = await User.findOne({ email });

    if (!doesUserExits) {
      res.send("invalid username or password");
      return;
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) {
      res.send("invalid useranme or password");
      return;
    }

    const newuser= req.body.email;
  
    jwt.sign({newuser}, 'secretkey', { expiresIn: '1000s' }, (err, token) => {
      res.send(token)
    });
    

    
  })
  .post("/register", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExitsAlreay = await User.findOne({ email });

    if (doesUserExitsAlreay) {
      res.send("A user with that email already exits please try another one!");
      return;
    }

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword });

    latestUser
      .save()
      .then(() => {
        
        res.redirect("home")
      })
      .catch((err) => console.log(err));

    
  });

//logout
app.get("/logout", (req, res) => {
  
  res.redirect("/login");
});



function verifyToken(req, res, next) {
  
  const bearerHeader = req.headers['authorization'];
  
  if(typeof bearerHeader !== 'undefined') {
    
    const bearer = bearerHeader.split(' ');
    
    const bearerToken = bearer[1];
    
    req.token = bearerToken;
    
    next();
  } else {
    
    res.sendStatus(403);
  }

}





// server config
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
