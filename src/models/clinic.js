'use strict';
module.exports = (sequelize, DataTypes) => {
    const Clinic = sequelize.define('Clinic', {
        name: DataTypes.STRING,
        phone: DataTypes.STRING,
        address: DataTypes.STRING,
        introductionHTML: DataTypes.TEXT,
        introductionMarkdown: DataTypes.TEXT,
        description: DataTypes.TEXT,
        image: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }, {});
    Clinic.associate = function(models) {
        models.Clinic.hasOne(models.Post);
    };
    return Clinic;
};
