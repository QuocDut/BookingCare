module.exports = function (req, res, next) {
    if (req.session.role === 'ADMIN') {
        next();
    } else {
       res.redirect('/login');
    }
};
