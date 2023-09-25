const router = require("express").Router();
const { quote_view, downloader, vote } = require("../controllers/quote");

router.get("/quote", quote_view);
router.get("/downloader", downloader);
router.post("/vote", vote);


module.exports = router;