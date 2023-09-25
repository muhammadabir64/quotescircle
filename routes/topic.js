const router = require("express").Router();
const { topics, topic_quotes } = require("../controllers/topic");

router.get("/topics", topics);
router.get("/topic", topic_quotes);


module.exports = router;