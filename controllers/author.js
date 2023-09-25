const { Quote, Author } = require("../models/Quote");

const authors = async (req, res) => {
    const authors = await Author.findAll({
      order: [['id', 'DESC']]
    });
    res.render("authors.html", {authors});
}

const author_quotes = async (req, res) => {
  const authorName = req.query.name;
  const quotes = await Quote.findAll({
    include: [
      {
        model: Author,
        where: { name: authorName }
      }
    ]
  });
  res.render("author_quotes.html", {authorName, quotes});  
}


module.exports = {
    authors,
    author_quotes
}