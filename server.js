const express = require("express");
const session = require("express-session");
const cookieSession = require("cookie-session");
const flash = require("connect-flash");
const nunjucks = require("nunjucks");
const sequelize = require("./database.js");

// routers
const homeRoutes = require("./routes/home");
const quoteRoutes = require("./routes/quote");
const authorRoutes = require("./routes/author");
const topicRoutes = require("./routes/topic");
const pagesRoutes = require("./routes/page");
const adminRoutes = require("./routes/admin");

const User = require("./models/User");
const Page = require("./models/Page");
const Settings = require('./models/Settings');
const SocialID = require('./models/SocialID');

const PORT = process.env.PORT || 3000;
const app = express();
nunjucks.configure("views", {
    express: app,
    autoescape: true
});

app.set("view engine", "html");
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/media", express.static(__dirname + "/media"));
app.use(cookieSession({
  name: "session",
  keys: ["Im5464asdadsadads7fyasd"]
}));
app.use(session({
  secret: "ArtFDCUt18PI3656d34y9K",
  resave: true,
  saveUninitialized: false
}));
app.use(flash());
app.use(async (req, res, next) => {
  app.locals.flash = req.flash();
  app.locals.user = req.session.user;
  app.locals.pages = await Page.findAll();
  app.locals.settings = await Settings.findOne();
  app.locals.socialIDs = await SocialID.findAll({
    order: [['id', 'DESC']]
  });
  try{
    const data = await User.findByPk(req.session.user);
    app.locals.user_data = data.dataValues;
  }catch{
    console.log("user isn't authorized");
  }
  next();
});
app.use((req, res, next) => {
  if (req.path === "/logout") {
    req.session = null;
    res.clearCookie("session");
    res.clearCookie("session.sig");
  }
  next();
});

// routes
app.use("", homeRoutes);
app.use("", quoteRoutes);
app.use("", authorRoutes);
app.use("", topicRoutes);
app.use("", pagesRoutes);
app.use("/admin", adminRoutes);

// syncing database
sequelize.sync().then(() => {
  console.log("database syncing.....");
}).catch((error) => {
  console.log(error);
});
try{
  // connecting with database
  sequelize.authenticate();
  console.log("database connection has been established");
}catch(error){
  console.error("unable to connect database:", error);
}
// make the server run
app.listen(PORT, () => {
  console.log(`server is listening at http://localhost:${PORT}`);
});