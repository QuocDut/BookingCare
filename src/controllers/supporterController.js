require('dotenv').config();
import homeService from "../services/homeService";
import userService from "../services/userService";
import supporterService from "../services/supporterService";
import patientService from "../services/patientService";

const statusNewId = 4;
const statusPendingId = 3;
const statusFailedId = 2;
const statusSuccessId = 1;


let getNewPatients = (req, res) => {
    //render data = js/ getForPatientsTabs
    return res.render('main/users/admins/managePatient.ejs', {
        user: req.user
    })
};

let getAllPosts = async (req, res) => {
    try {
        let posts = await supporterService.getAllPosts();
        return res.status(200).json({ "data": posts })
    } catch (e) {
        return res.status(500).json(e);
    }
};

let getCreatePost = async (req, res) => {
    let clinics = await homeService.getClinics();
    let doctors = await userService.getInfoDoctors();
    let specializations = await homeService.getSpecializations();
    return res.render('main/users/admins/createPost.ejs', {
        user: req.user,
        clinics: clinics,
        doctors: doctors,
        specializations: specializations
    });
};

let postCreatePost = async (req, res) => {
    try {
        let item = req.body;
        item.writerId = req.user.id;
        item.createdAt = Date.now();
        let post = await supporterService.postCreatePost(item);
        return res.status(200).json({
            status: 1,
            message: post
        })
    } catch (e) {
        return res.status(500).json(e);
    }
};

let getManagePosts = async (req, res) => {
    try {
        let role = "";
        if(req.user){
            if(req.user.roleId === 1) role = "admin";
        }
        let object = await supporterService.getPostsPagination(1, +process.env.LIMIT_GET_POST, role);
        return res.render('main/users/admins/managePost.ejs', {
            user: req.user,
            posts: object.posts,
            total: object.total
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getPostsPagination = async (req, res) => {
    try {
        let page = +req.query.page;
        let limit = +process.env.LIMIT_GET_POST;
        if (!page) {
            page = 1;
        }
        let object = await supporterService.getPostsPagination(page, limit);
        return res.status(200).json(object);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getForPatientsTabs = async (req, res) => {
    try {
        let object = await patientService.getForPatientsTabs();
        return res.status(200).json({
            'message': 'success',
            'object': object
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let postChangeStatusPatient = async (req, res) => {
    try {
        let id = req.body.patientId;
        let status = req.body.status;
        let statusId = '';
        let content = '';
        if (status === 'pending') {
            statusId = statusPendingId;
            content = "New appointments have been received";
        } else if (status === 'failed') {
            statusId = statusFailedId;
            if (req.body.reason) {
                content = `Cancel with reason - ${req.body.reason}`;
            }

        } else if (status === 'confirmed') {
            statusId = statusSuccessId;
            content = "The appointment has been successfully booked";
        }


        let data = {
            id: id,
            statusId: statusId,
            updatedAt: Date.now()
        };

        let logs = {
            supporterId: req.user.id,
            patientId: id,
            content: content
        };

        let patient = await patientService.changeStatusPatient(data, logs);
        return res.status(200).json({
            'message': 'success',
            'patient': patient
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getManageCustomersPage = async (req, res) => {
    try {
        let comments = await patientService.getComments();
        return res.render("main/users/admins/manageCustomer.ejs", {
            user: req.user,
            comments: comments
        });
    } catch (e) {
        console.log(e)
    }
};

let getLogsPatient = async (req, res) => {
    try {
        let logs = await patientService.getLogsPatient(req.body.patientId);
        return res.status(200).json(logs);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let postDoneComment = async (req, res) => {
    try {
        let comment = await supporterService.doneComment(req.body.commentId);
        return res.status(200).json(comment);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};
module.exports = {
    getNewPatients: getNewPatients,
    getManagePosts: getManagePosts,
    getCreatePost: getCreatePost,
    postCreatePost: postCreatePost,
    getAllPosts: getAllPosts,
    getPostsPagination: getPostsPagination,
    getForPatientsTabs: getForPatientsTabs,
    postChangeStatusPatient: postChangeStatusPatient,
    getManageCustomersPage: getManageCustomersPage,
    getLogsPatient: getLogsPatient,
    postDoneComment: postDoneComment
};
