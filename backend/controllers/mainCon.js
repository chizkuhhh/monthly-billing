const path = require("path");

const getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
};

module.exports = {
    getHomePage
}