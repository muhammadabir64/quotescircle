const router = require("express").Router();
const { authors, author_quotes } = require("../controllers/author");

router.get("/authors", authors);
router.get("/author", author_quotes);


module.exports = router;