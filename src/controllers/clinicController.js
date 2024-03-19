import clinicService from "./../services/clinicService";

let getInfoClinicById = async (req, res) => {
    try {
        let clinic = await clinicService.getClinicById(req.body.id);
        return res.status(200).json({
            message: 'get info clinic successful',
            clinic: clinic
        })
    } catch (e) {
        return res.status(500).json(e);
    }
};
module.exports = {
    getInfoClinicById: getInfoClinicById
};
