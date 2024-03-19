'use strict';
module.exports = (sequelize, DataTypes) => {
    const SupporterLog = sequelize.define('SupporterLog', {
        supporterId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        content: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    }, {});
    SupporterLog.associate = function(models) {
        models.SupporterLog.belongsTo(models.Patient, { foreignKey: 'patientId' });
        models.SupporterLog.belongsTo(models.User, { foreignKey: 'supporterId' });
    };
    return SupporterLog;
};
