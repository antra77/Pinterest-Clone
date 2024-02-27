var express = require("express");
var router = express.Router();
const userModal = require("./users");
const postModal = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModal.authenticate()));

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/home", isLoggedIn, async function (req, res, next) {
  const user = await userModal.findOne({
    username: req.session.passport.user,
  });
  const post = await postModal.find().populate("user");
  res.render("home", { user, post });
});

router.get("/create", isLoggedIn, async function (req, res, next) {
  const user = await userModal.findOne({
    username: req.session.passport.user,
  });
  res.render("create");
});

router.post(
  "/createpost",
  isLoggedIn,
  upload.single("filename"),
  async function (req, res, next) {
    const user = await userModal.findOne({
      username: req.session.passport.user,
    });
    const post = await postModal.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename,
    });
    user.post.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/register", async function (req, res, next) {
  res.render("register");
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModal
    .findOne({ username: req.session.passport.user })
    .populate("post");
  res.render("profile", { user });
});

router.get("/show/posts", isLoggedIn, async function (req, res, next) {
  const user = await userModal
    .findOne({ username: req.session.passport.user })
    .populate("post");
  res.render("show", { user });
});

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await userModal.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);
router.post("/register", function (req, res, next) {
  const data = new userModal({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname
  });

  userModal.register(data, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
