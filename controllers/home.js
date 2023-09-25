const { Quote, Author, Topic } = require("../models/Quote");
const { Op } = require("sequelize");

const home = async (req, res) => {
    const quotes = await Quote.findAll({
      order: [['id', 'DESC']],
      include: [
        {
          model: Author,
          attributes: ['name'],
        },
        {
          model: Topic,
          attributes: ['name', 'thumbnail'],
          through: { attributes: [] },
        },
      ],
    });
    const authors = await Author.findAll({
      order: [['id', 'DESC']],
      limit: 50
    });
    const topics = await Topic.findAll({
      order: [['id', 'DESC']],
      limit: 12,
      include: [{
        model: Quote,
        through: { attributes: [] }
      }]
    });
    const topics_length = await Topic.count();
    res.render("home.html", {quotes, authors, topics, topics_length});
}

const search_query = async (req, res) => {
  let query = req.body.query;
  if (!query || query.length < 3) {
    return res.json({status: "failed", msg: "search query must be at least 2 characters long"});
  }
  try {
    let is_found = await Quote.findAll({
      where: {
        [Op.or]: [
          { quote_text: { [Op.like]: `%${query}%` } },
          { '$author.name$': { [Op.like]: `%${query}%` } },
          { '$topics.name$': { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        { model: Author },
        { model: Topic }
      ]
    });
    if (is_found.length > 0) {
      return res.json({status: "success", data: is_found});
    } else {
      return res.json({status: "failed", msg: "no results found!"});
    }
  } catch (error) {
    console.error(error);
    return res.json({status: "failed", msg: "An error occurred while searching for quotes."});
  }
}


module.exports = {
    home,
    search_query
}