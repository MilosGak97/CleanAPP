const Move = require('../models/move');

exports.anyPage = (req,res,next) => {
    res.send('404 Page not found');
}
