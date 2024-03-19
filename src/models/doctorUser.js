'use strict';
module.exports = (sequelize, DataTypes) => {
    const Doctor_User = sequelize.define('Doctor_User', {
        doctorId: DataTypes.INTEGER,
        clinicId: DataTypes.INTEGER,
        specializationId: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }, {});
    Doctor_User.associate = function(models) {
        models.Doctor_User.belongsTo(models.User, { foreignKey: 'doctorId' });
    };
    return Doctor_User;
};
