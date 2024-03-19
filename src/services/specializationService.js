import db from "./../models";

let getSpecializationById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let specialization = await db.Specialization.findOne({
                where: { id: id },
                attributes: [ 'id', 'name', 'image', 'description' ],
            });
            if(!specialization) {
                reject("Can't get specialization-id: "+id);
            }
            let post = await db.Post.findOne({
                where: { forSpecializationId: id },
                attributes: [ 'id', 'title', 'contentHTML' ]
            });

            let places = await db.Place.findAll({
                attributes: ['id', 'name']
            });

            resolve({
                specialization: specialization,
                post: post,
                places: places
            });
        } catch (err) {
            reject(err);
        }
    })
};

let getAllSpecializations = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let listSpecializations = await db.Specialization.findAll({
                attributes: [ 'id', 'name' ],
                order: [
                    [ 'name', 'ASC' ]
                ],
            });
            resolve(listSpecializations);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteSpecializationById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.Specialization.destroy({
                where: { id: id }
            });
            let infos = await db.Doctor_User.findAll({
                where: {
                    specializationId: id
                }
            });
            let arrId = [];
            infos.forEach((x) => {
                arrId.push(x.id);
            });
            await db.Doctor_User.destroy({ where: { id: arrId } });
            resolve(true);

        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    getSpecializationById: getSpecializationById,
    getAllSpecializations: getAllSpecializations,
    deleteSpecializationById: deleteSpecializationById
};
