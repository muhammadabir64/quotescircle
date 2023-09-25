const { Quote, Author, Topic } = require("../models/Quote");

const topics = async (req, res) => {
    const topics = await Topic.findAll({
      order: [['id', 'DESC']],
      include: [{
        model: Quote,
        through: { attributes: [] }
      }]
    });
    res.render("topics.html", {topics});
}

const topic_quotes = async (req, res) => {
  const topicName = req.query.name;
  const quotes = await Quote.findAll({
    include: [
      {
        model: Topic,
        where: { name: topicName }
      },
      Author
    ]
  });
  res.render("topic_quotes.html", {topicName, quotes});
}

module.exports = {
    topics,
    topic_quotes
}