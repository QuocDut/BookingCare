import homeService from "./../services/homeService";
import userService from "./../services/userService";
import clinicService from "./../services/clinicService";
import specializationService from "./../services/specializationService";
import supporterService from "./../services/supporterService";
import doctorService from "./../services/doctorService";
import chatFBServie from "./../services/chatFBService";
import multer from "multer";

let getManageDoctor = async (req, res) => {
    let doctors = await userService.getInfoDoctors();
    return res.render("main/users/admins/manageDoctor.ejs", {
        user: req.user,
        doctors: doctors,
    });
};

let getManageClinic = async (req, res) => {
    let clinics = await homeService.getClinics();
    return res.render("main/users/admins/manageClinic.ejs", {
        user: req.user,
        clinics: clinics
    });
};

let getCreateDoctor = async (req, res) => {
    let clinics = await homeService.getClinics();
    let specializations = await homeService.getSpecializations();
    return res.render("main/users/admins/createDoctor.ejs", {
        user: req.user,
        clinics: clinics,
        specializations: specializations
    });
};
let postCreateDoctor = async (req, res) => {
    let doctor = {
        'name': req.body.name,
        'phone': req.body.phone,
        'email': req.body.email,
        'password': req.body.password,
        'clinicId': req.body.clinic,
        'specializationId': req.body.specialization,
        'address': req.body.address,
        'avatar': 'doctor.jpg',
        'description': req.body.description
    };
    try {
        await userService.createDoctor(doctor);
        return res.status(200).json({ message: 'success' })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err })
    }
};

let getCreateClinic = (req, res) => {
    return res.render("main/users/admins/createClinic.ejs", {
        user: req.user
    });
};


let postCreateClinic = (req, res) => {
    imageClinicUploadFile(req, res, async (err) => {
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
            let imageClinic = req.file;
            item.image = imageClinic.filename;
            let clinic = await clinicService.createNewClinic(item);
            return res.status(200).json({
                message: 'success',
                clinic: clinic
            });

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    });
};

let storageImageClinic = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/clinics");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let imageClinicUploadFile = multer({
    storage: storageImageClinic,
    limits: { fileSize: 1048576 * 20 }
}).single("image");

let postCreateClinicWithoutFile = async (req, res) => {
    try {
        let clinic = await clinicService.createNewClinic(req.body);
        return res.status(200).json({
            message: 'success',
            clinic: clinic
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let deleteClinicById = async (req, res) => {
    try {
        let clinic = await clinicService.deleteClinicById(req.body.id);
        return res.status(200).json({
            'message': 'success'
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getEditClinic = async (req, res) => {
    let clinic = await clinicService.getClinicById(req.params.id);
    return res.render("main/users/admins/editClinic.ejs", {
        user: req.user,
        clinic: clinic
    });
};

let putUpdateClinicWithoutFile = async (req, res) => {
    try {
        let clinic = await clinicService.updateClinic(req.body);
        return res.status(200).json({
            message: 'update success',
            clinic: clinic
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let putUpdateClinic = (req, res) => {
    imageClinicUploadFile(req, res, async (err) => {
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
            let imageClinic = req.file;
            item.image = imageClinic.filename;
            let clinic = await clinicService.updateClinic(item);
            return res.status(200).json({
                message: 'update clinic successful',
                clinic: clinic
            });

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    });
};

let getSpecializationPage = async (req, res) => {
    let specializations = await specializationService.getAllSpecializations();
    return res.render("main/users/admins/manageSpecialization.ejs", {
        user: req.user,
        specializations: specializations
    });
};

let deleteDoctorById = async (req, res) => {
    try {
        let doctor = await doctorService.deleteDoctorById(req.body.id);
        return res.status(200).json({
            'message': 'success'
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getEditDoctor = async (req, res) => {
    let doctor = await doctorService.getDoctorForEditPage(req.params.id);
    let clinics = await homeService.getClinics();
    let specializations = await homeService.getSpecializations();
    return res.render("main/users/admins/editDoctor.ejs", {
        user: req.user,
        doctor: doctor,
        clinics: clinics,
        specializations: specializations
    })
};

let putUpdateDoctorWithoutFile = async (req, res) => {
    try {
        let item = {
            id: req.body.id,
            name: req.body.nameDoctor,
            phone: req.body.phoneDoctor,
            address: req.body.addressDoctor,
            description: req.body.introEditDoctor,
            clinicId: req.body.clinicDoctor,
            specializationId: req.body.specializationDoctor
        };
        await doctorService.updateDoctorInfo(item);
        return res.status(200).json({
            message: 'update info doctor successful'
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json(e);
    }
};

let putUpdateDoctor = (req, res) => {
    imageDoctorUploadFile(req, res, async (err) => {
        if (err) {
            if (err.message) {
                return res.status(500).send(err.message);
            } else {
                return res.status(500).send(err);
            }
        }

        try {
            let item = {
                id: req.body.id,
                name: req.body.nameDoctor,
                phone: req.body.phoneDoctor,
                address: req.body.addressDoctor,
                description: req.body.introEditDoctor,
                clinicId: req.body.clinicDoctor,
                specializationId: req.body.specializationDoctor
            };
            let imageDoctor = req.file;
            item.avatar = imageDoctor.filename;
            let doctor = await doctorService.updateDoctorInfo(item);
            return res.status(200).json({
                message: 'update doctor info successful',
                doctor: doctor
            });

        } catch (e) {
            return res.status(500).send(e);
        }
    });
};

let storageImageDoctor = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/users");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let imageDoctorUploadFile = multer({
    storage: storageImageDoctor,
    limits: { fileSize: 1048576 * 20 }
}).single("avatar");

let getSupporterPage = async (req, res) => {
    let supporters = await supporterService.getAllSupporters();
    return res.render("main/users/admins/manageSupporter.ejs", {
        user: req.user,
        supporters: supporters
    })
};

let deleteSpecializationById = async (req, res) => {
    try {
        await specializationService.deleteSpecializationById(req.body.id);
        return res.status(200).json({
            message: 'delete specialization successful'
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }

};

let getManageBotPage = async (req, res) => {
    try {
        return res.send("Hello word. You'll need a witAI account. More info: please comment on my youtube channel.")
        // let entities = await chatFBServie.getWitEntitiesWithExpression();
        // let entityName = await chatFBServie.getWitEntities();
        // return res.render('main/users/admins/manageBot.ejs', {
        //     user: req.user,
        //     entities: entities,
        //     entityName: entityName
        // });
    } catch (e) {
        console.log(e);
    }

};

let deletePostById = async (req, res) => {
    try {
        await supporterService.deletePostById(req.body.id);
        return res.status(200).json({
            message: 'delete post successful'
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getEditPost = async (req, res) => {
    try {
        let clinics = await homeService.getClinics();
        let doctors = await userService.getInfoDoctors();
        let specializations = await homeService.getSpecializations();
        let post = await supporterService.getDetailPostPage(req.params.id);
        return res.render('main/users/admins/editPost.ejs', {
            clinics: clinics,
            doctors: doctors,
            specializations: specializations,
            user: req.user,
            post: post
        });

    } catch (e) {
        console.log(e);
    }
};

let putUpdatePost = async (req, res) => {
    try {
        let data = {
            id: req.body.id,
            title: req.body.titlePost,
            forDoctorId: req.body.forDoctorId,
            forClinicId: req.body.forClinicId,
            forSpecializationId: req.body.forSpecializationId,
            writerId: req.user.id,
            contentMarkdown: req.body.contentMarkdown,
            contentHTML: req.body.contentHTML,
            updatedAt: Date.now()
        };

        await supporterService.putUpdatePost(data);
        return res.status(200).json({
            message: 'update post successful'
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getManageCreateScheduleForDoctorsPage = async (req, res) => {
    try {
        return res.render('main/users/admins/manageScheduleForDoctors.ejs', {
            user: req.user,
        })
    } catch (e) {
        console.log(e);
    }

};

let getInfoStatistical = async (req, res) => {
    try {
        let month = req.body.month;
        let object = await userService.getInfoStatistical(month);
        return res.status(200).json(object);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

module.exports = {
    getManageDoctor: getManageDoctor,
    getCreateDoctor: getCreateDoctor,
    getEditClinic: getEditClinic,
    getManageClinic: getManageClinic,
    getCreateClinic: getCreateClinic,
    getSpecializationPage: getSpecializationPage,
    getEditDoctor: getEditDoctor,
    getSupporterPage: getSupporterPage,
    getManageBotPage: getManageBotPage,
    getEditPost: getEditPost,
    getManageCreateScheduleForDoctorsPage: getManageCreateScheduleForDoctorsPage,
    getInfoStatistical: getInfoStatistical,

    postCreateDoctor: postCreateDoctor,
    postCreateClinic: postCreateClinic,
    postCreateClinicWithoutFile: postCreateClinicWithoutFile,

    putUpdateClinicWithoutFile: putUpdateClinicWithoutFile,
    putUpdateClinic: putUpdateClinic,
    putUpdateDoctorWithoutFile: putUpdateDoctorWithoutFile,
    putUpdateDoctor: putUpdateDoctor,
    putUpdatePost: putUpdatePost,

    deleteClinicById: deleteClinicById,
    deleteDoctorById: deleteDoctorById,
    deleteSpecializationById: deleteSpecializationById,
    deletePostById: deletePostById
};
