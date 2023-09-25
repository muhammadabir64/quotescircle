const router = require("express").Router();
const { auth, auth_handler, image_fetcher, quote_fetcher, dashboard, quotes, quotes_add, quotes_add_handler, quotes_edit, quotes_edit_handler, quotes_delete, authors, authors_add, authors_edit, authors_delete, topics, topics_add, topics_add_handler, topics_delete, pages, pages_add, pages_edit, pages_delete, users, user_add, user_edit, user_delete, settings, settings_handler, social_handler, social_remove } = require("../controllers/admin");
const dotenv = require("dotenv").config();
const { upload } = require("../helper");

const login_required = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    next();
}
const login_prohibited = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
}

router.get(`/${process.env.ADMIN_AUTH_URL}`, login_prohibited, auth);
router.post(`/${process.env.ADMIN_AUTH_URL}`, auth_handler);
router.post("/image_fetcher", image_fetcher);
router.get("/quote_fetcher", quote_fetcher);
router.get("/dashboard", login_required, dashboard);
router.get("/quotes", login_required, quotes);
router.get("/quotes_add", login_required, quotes_add);
router.post("/quotes_add_handler", login_required, quotes_add_handler);
router.get("/quotes_edit", login_required, quotes_edit);
router.post("/quotes_edit_handler", login_required, quotes_edit_handler);
router.post("/quotes_delete", login_required, quotes_delete);
router.get("/authors", login_required, authors);
router.post("/authors_add", login_required, authors_add);
router.post("/authors_edit", login_required, authors_edit);
router.post("/authors_delete", login_required, authors_delete);
router.get("/topics", login_required, topics);
router.get("/topics_add", login_required, topics_add);
router.post("/topics_add_handler", login_required, topics_add_handler);
router.post("/topics_delete", login_required, topics_delete);
router.get("/pages", login_required, pages);
router.post("/pages_add", login_required, pages_add);
router.post("/pages_edit", login_required, pages_edit);
router.post("/pages_delete", login_required, pages_delete);
router.get("/users", login_required, users);
router.post("/user_add", login_required, user_add);
router.post("/user_edit", login_required, user_edit);
router.post("/user_delete", login_required, user_delete);
router.get("/settings", login_required, settings);
router.post("/settings_handler", login_required, upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "header_bg", maxCount: 1 }
  ]), settings_handler);
router.post("/social_handler", login_required, social_handler);
router.get("/social_remove", login_required, social_remove);


module.exports = router;