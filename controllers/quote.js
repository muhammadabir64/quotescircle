const { Quote, Author, Topic } = require("../models/Quote");

const quote_view = async (req, res) => {
    const quote_id = req.query.q;
    const quote = await Quote.findOne({
      where: { id: quote_id },
      include: [
        {
          model: Author,
          attributes: ['name'],
        },
        {
          model: Topic,
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });
    res.render("quote.html", { quote });
};

const downloader = async (req, res) => {
  const file = await Quote.findByPk(req.query.id);
  const update_counter = await Quote.update({total_downloads: file.total_downloads + 1}, {where: {id: req.query.id}});
  const imageFilePath = "./media/quotes/"+file.quote_file;
  res.download(imageFilePath);
}

const vote = async (req, res) => {
  const { id, vote } = req.body;
  const quote = await Quote.findByPk(id);
  const current_vote = quote.total_votes;
  console.log(req.body);
  if(vote === "true"){
    const downcount = current_vote-1;
    const downgrade_votes = await Quote.update({total_votes: downcount}, {where: {id: id}});
    return res.json({"status": 0, "total_votes": downcount});
  }else{
    const upcount = current_vote+1;
    const upgrade_votes = await Quote.update({total_votes: upcount}, {where: {id: id}});
    return res.json({"status": 1, "total_votes": upcount});
  }
};


module.exports = {
    quote_view,
    downloader,
    vote
}