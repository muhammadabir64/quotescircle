const router = require("express").Router();
const { page } = require("../controllers/page");

router.get("/:slug", page);


module.exports = router;