const bcrypt = require("bcryptjs");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv").config();
const User = require("../models/User");
const { Quote, Author, Topic } = require("../models/Quote");
const Page = require("../models/Page");
const Settings = require('../models/Settings');
const SocialID = require('../models/SocialID');
const { generatequoteimage } = require("../helper");

const auth = (req, res) => {
  let auth_msg = req.flash("auth_msg");
  res.render("admin/auth.html", {auth_msg, url: `/admin/${process.env.ADMIN_AUTH_URL}`});
}

const auth_handler = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        req.flash("auth_msg", "Invalid email or password");
        return res.redirect(`/admin/${process.env.ADMIN_AUTH_URL}`);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.flash("auth_msg", "Invalid email or password");
        return res.redirect(`/admin/${process.env.ADMIN_AUTH_URL}`);
      }
      req.session.user = user.id;
      res.redirect(`/admin/dashboard`);
    } catch (error) {
        req.flash("auth_msg", "An error occurred while trying to authentication! please contact your administrator.");
        return res.redirect(`/${process.env.ADMIN_AUTH_URL}`);
    }
}

const image_fetcher = async (req, res) => {
  const query = req.body.query;
  const url = `https://pixabay.com/api/?key=${process.env.PIXABAY_API}&q=${encodeURIComponent(query)}&image_type=photo&orientation=square`;
  axios.get(url)
    .then(function(response) {
      res.send(response.data);
    })
    .catch(function(error) {
      console.log(error);
      res.send('Error occurred while fetching images');
    });
}

const quote_fetcher = async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://quotes15.p.rapidapi.com/quotes/random/',
    params: {language_code: 'en'},
    headers: {
      'X-RapidAPI-Key': process.env.QUOTE_API,
      'X-RapidAPI-Host': 'quotes15.p.rapidapi.com'
    }
  };
  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    return res.send('Error fetching quotes');
  }
}

const dashboard = async (req, res) => {
  const totalQuotes = await Quote.count();
  const totalAuthors = await Author.count();
  const totalTopics = await Topic.count();
  const totalUsers = await User.count();
  const totalPages = await Page.count();
  const totalVotes = await Quote.sum('total_votes');
  const totalDownloads = await Quote.sum('total_downloads');
  const mostVotedQuotes = await Quote.findAll({
    order: [['total_votes', 'DESC']],
    limit: 10
  });
  const mostDownloadedQuotes = await Quote.findAll({
    order: [['total_downloads', 'DESC']],
    limit: 10
  });
  res.render("admin/dashboard.html", {totalQuotes, totalAuthors, totalTopics, totalUsers, totalPages, totalVotes, totalDownloads, mostVotedQuotes, mostDownloadedQuotes});
}

const quotes = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_quotes === 1){
    const quotes = await Quote.findAll({
      order: [['id', 'DESC']]
    });
    return res.render("admin/quotes.html", {quotes});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const quotes_add = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_quotes === 1){
    const topics = await Topic.findAll({
      order: [['id', 'DESC']]
    });
    return res.render("admin/quotes_add.html", {topics});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const quotes_add_handler = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if (user.dataValues.permission_quotes === 1) {
    try {
      const { quote_text, author, external_links, image_url, "topics[]": topicIds } = req.body;
      const img_process = await generatequoteimage(image_url, quote_text);
      const [authorInstance] = await Author.findOrCreate({
        where: { name: author },
      });
        Quote.create({
          quote_file: img_process,
          quote_text,
          external_links,
          authorId: authorInstance.id,
        }).then((quoteInstance) => {
          // Add topics to quote instance
          const topicInstances = Promise.all(topicIds.map((topicId) =>
            Topic.findOrCreate({
              where: { id: topicId },
            })
          ));
          return topicInstances.then((topics) => {
            return quoteInstance.addTopics(topics.map(([topicInstance]) => topicInstance));
          });
        }).then(() => {
          return res.redirect("/admin/quotes");
        }).catch((error) => {
          console.error(error);
          return res.redirect("/admin/quotes_add");
        });

    } catch (error) {
      console.error(error);
      return res.redirect("/admin/quotes_add");
    }
  } else {
    return res.redirect("/admin/dashboard");
  }
};
const quotes_edit = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_quotes === 1){
    const quote = await Quote.findByPk(req.query.id, {
      include: [
        {
          model: Author,
          attributes: ["id", "name"]
        },
        {
          model: Topic,
          attributes: ["id", "name"]
        }
      ]
    });
    const topics = await Topic.findAll({
      order: [['id', 'DESC']]
    });
    return res.render("admin/quotes_edit.html", {quote, topics});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const quotes_edit_handler = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_quotes === 1){
    const { quote_id, quote_file, quote_text, author_id, author_name, external_links, image_url, "topics[]": topicIds } = req.body;
    const quoteInstance = await Quote.findByPk(quote_id);
    await quoteInstance.setTopics([]);
    await Author.update({name: author_name}, {where: { id: author_id }});
    await Quote.update({quote_text, external_links}, {where: { id: quote_id }});
    for (const topicId of topicIds) {
      const topic = await Topic.findByPk(topicId);
      if (topic) {
        await quoteInstance.addTopics(topic);
      }
    }
    if(image_url){
      const img_process = await generatequoteimage(image_url, quote_text);
      const update_new_img = await Quote.update({quote_file: img_process}, {where: {id: quote_id}});
      fs.unlinkSync("./media/quotes/"+quote_file);
    }
    return res.redirect(`/admin/quotes_edit?id=${quote_id}`);
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const quotes_delete = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_quotes === 1){
    await Quote.destroy({where: {id: req.body.id} });
    fs.unlinkSync("./media/quotes/"+req.body.quote_file);
    return res.redirect("/admin/quotes");
  }else{
    return res.redirect("/admin/dashboard");
  }
}

const authors = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_authors === 1){
    const authors = await Author.findAll({
      order: [['id', 'DESC']]
    });
    return res.render("admin/authors.html", {authors});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const authors_add = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_authors === 1){
    const { name } = req.body;
    await Author.create({ name });
    return res.redirect("/admin/authors");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const authors_edit = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_authors === 1){
    const { id, name } = req.body;
    await Author.update({ name }, {where: {id: id}});
    return res.redirect("/admin/authors");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const authors_delete = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_authors === 1){
    await Author.destroy({where: {id: req.body.id} });
    return res.redirect("/admin/authors");
  }else{
    return res.redirect("/admin/dashboard");
  }
}

const topics = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_topics === 1){
    const topics = await Topic.findAll({
      order: [['id', 'DESC']],
      include: [{
        model: Quote,
        through: { attributes: [] }
      }]
    });
    const topicsWithCounts = await Promise.all(
      topics.map(async (topic) => {
        const quoteCount = await topic.countQuotes();
        return { ...topic.toJSON(), quoteCount };
      })
    );
    return res.render("admin/topics.html", {topics: topicsWithCounts});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const topics_add = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_topics === 1){
    return res.render("admin/topics_add.html");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const topics_add_handler = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_topics === 1){
    const { name, thumbnail } = req.body;
    const response = await axios.get(thumbnail, { responseType: 'arraybuffer' });
    const filename = thumbnail.split('/').pop();
    const filepath = path.join(__dirname, '..', 'media', 'topics', filename);
    fs.writeFileSync(filepath, response.data);
    await Topic.create({ name, thumbnail: filename });
    return res.redirect("/admin/topics");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const topics_delete = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_topics === 1){
    await Topic.destroy({where: {id: req.body.id} });
    fs.unlinkSync("./media/topics/"+req.body.thumbnail);
    return res.redirect("/admin/topics");
  }else{
    return res.redirect("/admin/dashboard");
  }
}

const pages = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_pages === 1){
    const pages = await Page.findAll();
    return res.render("admin/pages.html", {pages});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const pages_add = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_pages === 1){
    const { title, slug, content } = req.body;
    await Page.create({ title, slug, content });
    return res.redirect("/admin/pages");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const pages_edit = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_pages === 1){
    const { id, title, slug, content } = req.body;
    await Page.update({ title, slug, content }, {where: {id: id}});
    return res.redirect("/admin/pages");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const pages_delete = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_pages === 1){
    await Page.destroy({where: {id: req.body.id}});
    return res.redirect("/admin/pages");
  }else{
    return res.redirect("/admin/dashboard");
  }
}

const users = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_users === 1){
    const users = await User.findAll({
      order: [['id', 'DESC']]
    });
    return res.render("admin/users.html", {users});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const user_add = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_users === 1){
    const { email, password, permission_quotes, permission_authors, permission_topics, permission_pages, permission_users, permission_settings } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword, permission_quotes, permission_authors, permission_topics, permission_pages, permission_users, permission_settings });
    console.log(req.body);
    return res.redirect("/admin/users");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const user_edit = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_users === 1){
    const { id, email, password, permission_quotes, permission_authors, permission_topics, permission_pages, permission_users, permission_settings } = req.body;
    const permissionQuotes = permission_quotes === "on" ? 1 : 0;
    const permissionAuthors = permission_authors === "on" ? 1 : 0;
    const permissionTopics = permission_topics === "on" ? 1 : 0;
    const permissionPages = permission_pages === "on" ? 1 : 0;
    const permissionUsers = permission_users === "on" ? 1 : 0;
    const permissionSettings = permission_settings === "on" ? 1 : 0;
    await User.update({
      email,
      password: password ? await bcrypt.hash(password, 10) : undefined,
      permission_quotes: permissionQuotes,
      permission_authors: permissionAuthors,
      permission_topics: permissionTopics,
      permission_pages: permissionPages,
      permission_users: permissionUsers,
      permission_settings: permissionSettings
    }, {where: {id: id}});
    return res.redirect("/admin/users");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const user_delete = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_users === 1){
    await User.destroy({where: {id: req.body.id}});
    return res.redirect("/admin/users");
  }else{
    return res.redirect("/admin/dashboard");
  }
}

const settings = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_settings === 1){
    const data = await Settings.findOne();
    const socialIDs = await SocialID.findAll({
      order: [['id', 'DESC']]
    });
    return res.render("admin/settings.html", {data, socialIDs});
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const settings_handler = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_settings === 1){
    const { logo, favicon, header_bg } = req.files || {};
    const { header_slogan, header_text, copyright, ga_id, seo_author, seo_description, seo_keywords, logo_val, favicon_val, header_bg_val } = req.body;
    const faviconName = favicon ? favicon[0].filename : favicon_val;
    await Settings.update({ 
      logo: logo ? logo[0].filename : logo_val,
      favicon: faviconName, 
      header_bg: header_bg ? header_bg[0].filename : header_bg_val,
      header_slogan, 
      header_text, 
      copyright, 
      ga_id, 
      seo_author, 
      seo_description, 
      seo_keywords 
    }, {where: {id:1}});
    return res.redirect("/admin/settings");
  } else {
    return res.redirect("/admin/dashboard");
  }
};

const social_handler = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_settings === 1){
    const { platform, url } = req.body;
    await SocialID.create({ platform, url });
    return res.redirect("/admin/settings");
  }else{
    return res.redirect("/admin/dashboard");
  }
}
const social_remove = async (req, res) => {
  const user = await User.findByPk(req.session.user);
  if(user.dataValues.permission_settings === 1){
    await SocialID.destroy({ where: {id: req.query.id} });
    return res.redirect("/admin/settings");
  }else{
    return res.redirect("/admin/dashboard");
  }
}

module.exports = {
  auth,
  auth_handler,
  image_fetcher,
  quote_fetcher,
  dashboard,
  quotes,
  quotes_add,
  quotes_add_handler,
  quotes_edit,
  quotes_edit_handler,
  quotes_delete,
  authors,
  authors_add,
  authors_edit,
  authors_delete,
  topics,
  topics_add,
  topics_add_handler,
  topics_delete,
  pages,
  pages_add,
  pages_edit,
  pages_delete,
  users,
  user_add,
  user_edit,
  user_delete,
  settings,
  settings_handler,
  social_handler,
  social_remove
}