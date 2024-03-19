require("dotenv").config();
import homeService from "./../services/homeService";
import specializationService from "./../services/specializationService";
import doctorService from "./../services/doctorService";
import userService from "./../services/userService";
import supporterService from "./../services/supporterService";
import clinicService from "./../services/clinicService";
import elasticService from "./../services/syncsElaticService";
import patientService from "./../services/patientService";
import moment from "moment";
// striptags to remove HTML
import striptags from "striptags";

import multer from "multer";

let LIMIT_POST = 5;

const statusPendingId = 3;
const statusFailedId = 2;
const statusSuccessId = 1;
const statusNewId = 4;

let getHomePage = async (req, res) => {
    try {
        let specializations = await homeService.getSpecializations();
        let clinics = await homeService.getClinics();
        let doctors = await userService.getInfoDoctors();
        let posts = await homeService.getPosts(LIMIT_POST);
        return res.render("main/homepage/homepage.ejs", {
            user: req.user,
            specializations: specializations,
            clinics: clinics,
            doctors: doctors,
            posts: posts,
            pageId: process.env.PAGE_ID
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getUserPage = (req, res) => {
    let currentMonth = new Date().getMonth() +1 ;
    res.render("main/users/home.ejs", {
        user: req.user,
        currentMonth: currentMonth
    });
};

let getDetailSpecializationPage = async (req, res) => {
    try {
        let object = await specializationService.getSpecializationById(req.params.id);
        // using date to get schedule of doctors
        let currentDate = moment().format('DD/MM/YYYY');
        let doctors = await doctorService.getDoctorsForSpecialization(req.params.id, currentDate);
        let sevenDaySchedule = [];
        for (let i = 0; i < 5; i++) {
            let date = moment(new Date()).add(i, 'days').locale('en').format('dddd - DD/MM/YYYY');
            sevenDaySchedule.push(date);
        }

        let listSpecializations = await specializationService.getAllSpecializations();
        return res.render("main/homepage/specialization.ejs", {
            specialization: object.specialization,
            post: object.post,
            doctors: doctors,
            places: object.places,
            sevenDaySchedule: sevenDaySchedule,
            listSpecializations: listSpecializations
        });

    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getDetailDoctorPage = async (req, res) => {
    try {
        let currentDate = moment().format('DD/MM/YYYY');
        let sevenDaySchedule = [];
        for (let i = 0; i < 5; i++) {
            let date = moment(new Date()).add(i, 'days').locale('en').format('dddd - DD/MM/YYYY');
            sevenDaySchedule.push(date);
        }

        let object = await doctorService.getDoctorWithSchedule(req.params.id, currentDate);

        let places = await doctorService.getPlacesForDoctor();
        let postDoctor = await doctorService.getPostForDoctor(req.params.id);


        return res.render("main/homepage/doctor.ejs", {
            doctor: object.doctor,
            sevenDaySchedule: sevenDaySchedule,
            postDoctor: postDoctor,
            specialization: object.specialization,
            places: places,
            clinic: object.clinic
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getBookingPage = (req, res) => {
    res.render("main/homepage/bookingPage.ejs")
};


let getDetailPostPage = async (req, res) => {
    try {
        let post = await supporterService.getDetailPostPage(req.params.id);
        res.render("main/homepage/post.ejs", {
            post: post
        })
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getDetailClinicPage = async (req, res) => {
    try {
        let currentDate = moment().format('DD/MM/YYYY');
        let sevenDaySchedule = [];
        for (let i = 0; i < 5; i++) {
            let date = moment(new Date()).add(i, 'days').locale('en').format('dddd - DD/MM/YYYY');
            sevenDaySchedule.push(date);
        }
        let object = await clinicService.getDetailClinicPage(req.params.id, currentDate);

        res.render("main/homepage/clinic.ejs", {
            clinic: object.clinic,
            doctors: object.doctors,
            sevenDaySchedule: sevenDaySchedule,
            places: object.places
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getContactPage = (req, res) => {
    return res.render('main/homepage/contact.ejs');
};

let getPostsWithPagination = async (req, res) => {
    let role = 'nope';
    let object = await supporterService.getPostsPagination(1, +process.env.LIMIT_GET_POST, role);
    return res.render("main/homepage/allPostsPagination.ejs", {
        posts: object.posts,
        total: object.total,
        striptags: striptags
    })
};

let getPostSearch = async (req, res) => {
    let search = req.query.keyword;
    let results = await elasticService.findPostsByTerm(search);
    return res.render('main/homepage/searchPost.ejs', {
        search: search,
        posts: results.hits.hits
    });
};

let getInfoBookingPage = async (req, res) => {
    try {
        let patientId = req.params.id;
        let patient = await patientService.getInfoBooking(patientId);
        return res.render('main/homepage/infoBooking.ejs', {
            patient: patient
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let postBookingDoctorPageWithoutFiles = async (req, res) => {
    try {
        let item = req.body;
        item.statusId = statusNewId;
        item.historyBreath = req.body.breath;
        item.moreInfo = req.body.extraOldForms;
        if (item.places === 'none') item.placeId = 0;
        item.placeId = item.places;
        item.createdAt = Date.now();

        let patient = await patientService.createNewPatient(item);
        return res.status(200).json({
            status: 1,
            message: 'success',
            patient: patient
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let postBookingDoctorPageNormal = (req, res) => {
    imageImageOldForms(req, res, async (err) => {
        if (err) {
            console.log(err);
            if (err.message) {
                console.log(err.message);
                return res.status(500).send(err.message);
            } else {
                console.log(err);
                return res.status(500).send(err);
            }
        }

        try {

            let item = req.body;
            let imageOldForm = req.files;
            let image = {};
            imageOldForm.forEach((x, index) => {
                image[index] = x.filename;
            });

            item.statusId = statusNewId;
            item.historyBreath = req.body.breath;
            item.moreInfo = req.body.extraOldForms;
            if (item.places === 'none') item.placeId = 0;
            item.placeId = item.places;
            item.oldForms = JSON.stringify(image);
            item.createdAt = Date.now();

            let patient = await patientService.createNewPatient(item);
            return res.status(200).json({
                status: 1,
                message: 'success',
                patient: patient
            })

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    });
};

let storageImageOldForms = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/patients");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let imageImageOldForms = multer({
    storage: storageImageOldForms,
    limits: { fileSize: 1048576 * 20 }
}).array("oldForms");

let getDetailPatientBooking = async (req, res) => {
    try {
        let patient = await patientService.getDetailPatient(req.body.patientId);
        return res.status(200).json(patient);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getFeedbackPage = async (req, res) => {
    try {
        let doctor = await doctorService.getDoctorForFeedbackPage(req.params.id);
        return res.render("main/homepage/feedback.ejs", {
            doctor: doctor
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let postCreateFeedback = async (req, res) => {
    try {
        let feedback = await doctorService.createFeedback(req.body.data);
        return res.status(200).json({
            message: "send feedback success",
            feedback: feedback
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getPageForPatients = (req, res) => {
    return res.render("main/homepage/forPatients.ejs");
};

let getPageForDoctors = (req, res) => {
    return res.render("main/homepage/forDoctors.ejs");
};

let postSearchHomePage = async (req, res) => {
    try {
        let result = await homeService.postSearchHomePage(req.body.keyword);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getPageAllClinics = async (req, res) => {
    try{
        let clinics = await homeService.getDataPageAllClinics();

        return res.render("main/homepage/allClinics.ejs",{
            clinics: clinics
        })
    }catch (e) {
        console.log(e);
    }
};

let getPageAllDoctors = async (req, res)=>{
    try{
        let doctors = await homeService.getDataPageAllDoctors();
        return res.render("main/homepage/allDoctors.ejs",{
            doctors: doctors
        })
    }catch (e) {
        console.log(e);
    }
};

let getPageAllSpecializations =async (req, res)=>{
    try{
        let specializations = await homeService.getDataPageAllSpecializations();
        return res.render("main/homepage/allSpecializations.ejs",{
            specializations: specializations
        })
    }catch (e) {
        console.log(e);
    }
};


module.exports = {
    getHomePage: getHomePage,
    getUserPage: getUserPage,
    getDetailSpecializationPage: getDetailSpecializationPage,
    getDetailDoctorPage: getDetailDoctorPage,
    getBookingPage: getBookingPage,
    getDetailPostPage: getDetailPostPage,
    getDetailClinicPage: getDetailClinicPage,
    getContactPage: getContactPage,
    getPostsWithPagination: getPostsWithPagination,
    getPostSearch: getPostSearch,
    getInfoBookingPage: getInfoBookingPage,
    postBookingDoctorPageWithoutFiles: postBookingDoctorPageWithoutFiles,
    postBookingDoctorPageNormal: postBookingDoctorPageNormal,
    getDetailPatientBooking: getDetailPatientBooking,
    getFeedbackPage: getFeedbackPage,
    postCreateFeedback: postCreateFeedback,
    getPageForPatients: getPageForPatients,
    getPageForDoctors: getPageForDoctors,
    postSearchHomePage: postSearchHomePage,
    getPageAllClinics: getPageAllClinics,
    getPageAllDoctors: getPageAllDoctors,
    getPageAllSpecializations: getPageAllSpecializations
};
