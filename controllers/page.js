const Page = require("../models/Page");

const page = async (req, res) => {
    const page = await Page.findOne({ where: { slug: req.params.slug } });
    if (!page) {
        return res.redirect("/");
    }
    res.render("pages.html", {page});
}

module.exports = {
    page
}