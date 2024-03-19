// import {ROLES} from "../utils/roles";
//
// const getRedirectUrl = (role) => {
//     switch (role) {
//         case ROLES.Admin:
//             return '/admin-dashboard';
//         case ROLES.Customer:
//             return '/customer-dashboard';
//         default:
//             return '/';
//     }
// };
//
// const checkRole = (req, res, next) => {
//     if (!req.user.role) {
//         return res.redirect('/login')
//     }
//     switch (req.user) {
//         case Ro
//
//     }
//
//     getRedirectUrl(req.user.local.role);
//     return next()
// };
// export {getRedirectUrl}