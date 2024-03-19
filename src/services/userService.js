import bcrypt from "bcryptjs";
import db from "./../models";
import helper from "../helper/client";
import elastic from "./../config/elastic";
import _ from "lodash";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

import moment from "moment";

let salt = 7;
let createDoctor = (doctor) => {
    doctor.roleId = 2;
    doctor.password = bcrypt.hashSync(doctor.password, salt);
    return new Promise((async (resolve, reject) => {
        let newDoctor = await db.User.create(doctor);
        let item = {
            doctorId: newDoctor.id,
            clinicId: doctor.clinicId,
            specializationId: doctor.specializationId
        };
        await db.Doctor_User.create(item);

        //create doctor elastic

        resolve(newDoctor)
    }));
};

let getInfoDoctors = () => {
    return new Promise((async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 2 },
                include: [
                    { model: db.Doctor_User, required: false },
                    { model: db.Patient, required: false, where: { statusId: 1 } }
                ]
            });
            await Promise.all(doctors.map(async (doctor) => {
                if (doctor.Doctor_User) {
                    let clinic = await helper.getClinicById(doctor.Doctor_User.clinicId);
                    let specialization = await helper.getSpecializationById(doctor.Doctor_User.specializationId);
                    let countBooking = doctor.Patients.length;
                    doctor.setDataValue('clinicName', clinic.name);
                    doctor.setDataValue('specializationName', specialization.name);
                    doctor.setDataValue('countBooking', countBooking);
                } else {
                    doctor.setDataValue('clinicName', "null");
                    doctor.setDataValue('specializationName', "null");
                    doctor.setDataValue('countBooking', 0);
                }
                return doctor;
            }));
            resolve(doctors);
        } catch (e) {
            reject(e);
        }

    }));
};

let findUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: email },
            });
            resolve(user);
        } catch (e) {
            reject(e);
        }
    });
};

let comparePassword = (password, user) => {
    return bcrypt.compare(password, user.password);
};

let findUserById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: id },
                attributes: [ 'id', 'name', 'avatar', 'roleId', 'isActive' ]
            });
            resolve(user);
        } catch (e) {
            reject(e);
        }
    });
};

function stringToDate(_date, _format, _delimiter) {
    let formatLowerCase = _format.toLowerCase();
    let formatItems = formatLowerCase.split(_delimiter);
    let dateItems = _date.split(_delimiter);
    let monthIndex = formatItems.indexOf("mm");
    let dayIndex = formatItems.indexOf("dd");
    let yearIndex = formatItems.indexOf("yyyy");
    let month = parseInt(dateItems[monthIndex]);
    month -= 1;
    return new Date(dateItems[yearIndex], month, dateItems[dayIndex]);

}

let getInfoStatistical = (month) => {
    return new Promise(async (resolve, reject) => {
        try {
            let startDate = Date.parse(stringToDate(`01/${month}/2020`, "dd/MM/yyyy", "/"));
            let endDate = Date.parse(stringToDate(`31/${month}/2020`, "dd/MM/yyyy", "/"));

            let patients = await db.Patient.findAndCountAll({
                attributes: [ 'id','doctorId' ],
                where: {
                    createdAt: {
                        [Op.between]: [ startDate, endDate ],
                    },
                }
            });

            let doctors = await db.User.findAndCountAll({
                attributes: [ 'id' ],
                where: {
                    roleId: 2,
                    createdAt: {
                        [Op.between]: [ startDate, endDate ],
                    }
                }
            });

            let posts = await db.Post.findAndCountAll({
                attributes: [ 'id','writerId' ],
                where: {
                    forClinicId: -1,
                    forSpecializationId: -1,
                    forDoctorId: -1,
                    createdAt: {
                        [Op.between]: [ startDate, endDate ],
                    }
                }
            });

            let bestDoctor = '';

            if(+patients.count > 0){
                let bestDoctorIdArr = _(patients.rows)
                .groupBy('doctorId')
                .map((v, doctorId) => ({
                    doctorId,
                    patientId: _.map(v, 'id')
                }))
                .value();
                let doctorObject = _.maxBy(bestDoctorIdArr, function(o) {
                    return o.patientId.length;
                });
                 bestDoctor = await db.User.findOne({
                    where: {
                        id: doctorObject.doctorId
                    },
                    attributes: ['id', 'name']
                });
                bestDoctor.setDataValue("count", doctorObject.patientId.length);
            }

            let bestSupporter = '';
            if(+posts.count > 0){
                let bestSupporterIdArr = _(posts.rows)
                .groupBy('writerId')
                .map((v, writerId) => ({
                    writerId,
                    postId: _.map(v, 'id')
                }))
                .value();
                let supporterObject = _.maxBy(bestSupporterIdArr, function(o) {
                    return o.postId.length;
                });
                 bestSupporter = await db.User.findOne({
                    where: {
                        id: supporterObject.writerId
                    },
                    attributes: ['id', 'name']
                });
                bestSupporter.setDataValue("count", supporterObject.postId.length);
            }

            resolve({
                patients: patients,
                doctors: doctors,
                posts: posts,
                bestDoctor: bestDoctor,
                bestSupporter: bestSupporter
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getInfoDoctorChart = (month) => {
    return new Promise(async (resolve, reject) => {
        try{
            let startDate = Date.parse(stringToDate(`01/${month}/2020`, "dd/MM/yyyy", "/"));
            let endDate = Date.parse(stringToDate(`31/${month}/2020`, "dd/MM/yyyy", "/"));
            let patients = await db.Patient.findAndCountAll({
                attributes: [ 'id','doctorId','statusId','isSentForms' ],
                where: {
                    createdAt: {
                        [Op.between]: [ startDate, endDate ],
                    },
                }
            });
            resolve({patients: patients})
        }catch (e) {
            reject(e);
        }
    });
};

let createAllDoctorsSchedule = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let timeArr = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
                '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
            ]
            let threeDaySchedules = [];
            for (let i = 0; i < 3; i++) {
                let date = moment(new Date()).add(i, 'days').locale('en').format('DD/MM/YYYY');
                threeDaySchedules.push(date);
            }

            let doctors = await db.User.findAll({
                where: {
                    roleId: 2
                },
                attributes: ['id', 'name'],
                raw: true
            });

            //only create once
            let isCreatedBefore = false;

            //only check the first doctor with date and time
            let check = await db.Schedule.findAll({
                where: {
                    doctorId: doctors[0].id,
                    date: threeDaySchedules[0],
                    time: timeArr[0]
                }
            })

            if(check && check.length > 0) isCreatedBefore = true;

            if(!isCreatedBefore){
                if (doctors && doctors.length > 0) {
                    await Promise.all(
                        doctors.map((doctor) => {
                            threeDaySchedules.map(day => {
                                timeArr.map(async (time) => {
                                    let schedule = {
                                        doctorId: doctor.id,
                                        date: day,
                                        time: time,
                                        maxBooking: 2,
                                        sumBooking: 0
                                    }
                                    await db.Schedule.create(schedule);
                                })
                            })
                        })
                    )
                }
                resolve("Appointments are created successful (in 3 days). Please check your database (schedule table)")
            }else {
                resolve("Appointments are duplicated. Please check your database (schedule table)")
            }
        } catch (e) {
            reject(e);
        }
    });
}

let getAllDoctorsSchedule = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let schedules = await db.Schedule.findAll({
                attributes: ['doctorId', 'date', 'time'],
                raw: true
            });
            resolve(schedules)
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    createDoctor: createDoctor,
    getInfoDoctors: getInfoDoctors,
    findUserByEmail: findUserByEmail,
    findUserById: findUserById,
    comparePassword: comparePassword,
    getInfoStatistical: getInfoStatistical,
    getInfoDoctorChart: getInfoDoctorChart,
    createAllDoctorsSchedule: createAllDoctorsSchedule,
    getAllDoctorsSchedule: getAllDoctorsSchedule
};
