import db from "./../models";
import moment from "moment";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

let maxBooking = 5;
let getDetailClinicPage = (id, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinic = await db.Clinic.findOne({
                where: { id: id },
                attributes: [ 'id', 'name', 'image', 'address', 'phone', 'introductionHTML', 'description' ],
            });

            if(!clinic){
                reject(`Can't get clinic with id = ${id}`);
            }

            let doctors = await db.Doctor_User.findAll({
                where: { clinicId: id },
                attributes: [ 'clinicId' ],
                include: {
                    model: db.User,
                    attributes: [ 'id', 'name', 'avatar', 'address', 'description' ]
                }
            });

            await Promise.all(doctors.map(async (doctor) => {
                let schedules = await db.Schedule.findAll({
                    where: {
                        doctorId: doctor.User.id, date: date, sumBooking: { [Op.lt]: maxBooking }
                    },
                    attributes: [ 'id', 'date', 'time' ]
                });

                let dateNow = new Date();
                let currentDate = moment().format('DD/MM/YYYY');
                let currentHour = `${dateNow.getHours()}:${dateNow.getMinutes()}`;
                let timeNow = moment(`${currentDate} ${currentHour}`, "DD/MM/YYYY hh:mm").toDate();

                schedules.forEach((sch, index) => {
                    let startTime = sch.time.split('-')[0];
                    let timeSchedule = moment(`${sch.date} ${startTime}`, "DD/MM/YYYY hh:mm").toDate();
                    //isDisable nếu time hiện tại > time kế hoạch
                    sch.setDataValue('isDisable', timeNow > timeSchedule);

                });


                doctor.setDataValue('schedules', schedules);
            }));

            let places = await db.Place.findAll({
                attributes: ['id', 'name']
            });

            resolve({
                clinic: clinic,
                doctors: doctors,
                places: places
            });
        } catch (e) {
            reject(e);
        }
    });
};

let createNewClinic = (item) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinic = await db.Clinic.create(item);
            resolve(clinic);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteClinicById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.Clinic.destroy({
                where: { id: id }
            });

            let clinic = await db.Doctor_User.findAll({
                where: {
                    clinicId: id
                }
            });
            let arrId = [];
            clinic.map((x) => {
                arrId.push(x.id);
            });
            await db.Doctor_User.destroy({ where: { id: arrId } });

            resolve('delete successful')
        } catch (e) {
            reject(e);
        }
    });
};

let getClinicById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinic = await db.Clinic.findOne({
                where: { id: id },
            });
            resolve(clinic);
        } catch (e) {
            reject(e);
        }
    });
};

let updateClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinic = await db.Clinic.findOne({
                where: { id: data.id }
            });
            await clinic.update(data);
            resolve(true)
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    getDetailClinicPage: getDetailClinicPage,
    getClinicById: getClinicById,
    createNewClinic: createNewClinic,
    deleteClinicById: deleteClinicById,
    updateClinic: updateClinic
};