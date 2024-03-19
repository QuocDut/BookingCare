import {check} from 'express-validator';
import {tranRegister} from "../../lang/en";
import userService from "./../services/userService";

let validateRegisterUser = [
    check("email")
        .not().isEmpty().withMessage(tranRegister.email_require)
        .trim().isEmail().withMessage(tranRegister.email_incorrect)
        .custom((value) => {
            return new Promise(async (resolve, reject) => {
                let isExits = await userService.findUserByEmail(value);
                if (isExits) {
                    reject(tranRegister.email_exist);
                }
                resolve(true);
            });
        }),

    check("password", tranRegister.password_incorrect)
        .isLength({min: 6})
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}$/),

    check("password_confirm", tranRegister.password_confirm)
        .custom((value, {req}) => {
            return value === req.body.password
        }),

    check("gender", tranRegister.gender_incorrect)
        .isIn(["male", "female"]),

    check("dob", tranRegister.dob_incorrect)
        .isInt({gt: 0, lt: 32}),

    check("mob", tranRegister.mob_incorrect)
        .isInt({gt: 0, lt: 13}),

    check("yob", tranRegister.yob_incorrect)
        .isInt({gt: 1979, lt: new Date().getFullYear() + 1})
];

let validateSetNewPassword = [
    check("email")
        .not().isEmpty().withMessage(tranRegister.email_require)
        .trim().isEmail().withMessage(tranRegister.email_incorrect),

    check("password", tranRegister.password_incorrect)
        .isLength({ min: 6 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}$/),

    check("confirmPassword", tranRegister.password_confirm)
        .custom((value, {req}) => {
            return value === req.body.password
        }),
];


module.exports = {
    validateRegisterUser: validateRegisterUser,
    validateSetNewPassword: validateSetNewPassword
};
