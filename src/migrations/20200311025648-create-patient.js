'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Patients', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            doctorId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            statusId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            phone: {
                type: Sequelize.STRING
            },
            dateBooking: {
                type: Sequelize.STRING
            },
            timeBooking: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            gender: {
                type: Sequelize.STRING
            },
            year: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.TEXT
            },
            description: {
                type: Sequelize.TEXT
            },
            isSentForms: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isTakeCare: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Patients');
    }
};