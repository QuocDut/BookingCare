'use strict';
module.exports = (sequelize, DataTypes) => {
    const Patient = sequelize.define('Patient', {
        doctorId: DataTypes.INTEGER,
        statusId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        phone: DataTypes.STRING,
        dateBooking: DataTypes.STRING,
        timeBooking: DataTypes.STRING,
        email: DataTypes.STRING,
        gender: DataTypes.STRING,
        year: DataTypes.STRING,
        address: DataTypes.TEXT,
        description: DataTypes.TEXT,
        isSentForms:DataTypes.BOOLEAN,
        isTakeCare: DataTypes.BOOLEAN,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }, {});
    Patient.associate = function(models) {
        models.Patient.belongsTo(models.User, { foreignKey: 'doctorId' });
        models.Patient.belongsTo(models.Status, { foreignKey: 'statusId' });
        models.Patient.hasOne(models.ExtraInfo);
        models.Patient.hasMany(models.SupporterLog);
    };
    return Patient;
};
