const router = require("express").Router();
const { home, search_query } = require("../controllers/home");

router.get("/", home);
router.post("/search_query", search_query);


module.exports = router;