'use strict';
module.exports = (sequelize, DataTypes) => {
    const ExtraInfo = sequelize.define('ExtraInfo', {
        patientId: DataTypes.INTEGER,
        historyBreath: DataTypes.TEXT,
        placeId: DataTypes.INTEGER,
        oldForms: DataTypes.TEXT,
        sendForms: DataTypes.TEXT,
        moreInfo: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    }, {});
    ExtraInfo.associate = function(models) {
        models.ExtraInfo.belongsTo(models.Patient, { foreignKey: 'patientId' });
        models.ExtraInfo.belongsTo(models.Place, { foreignKey: 'placeId' });
    };
    return ExtraInfo;
};
