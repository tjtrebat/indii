const db = require("../models");

module.exports = {
  createComment: function (comment) {
    return db.Comment.create(comment);
  }
};
