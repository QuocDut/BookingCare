'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.bulkInsert('Places', [
            {
                name: 'New York City',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Los Angeles County',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Chicago',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Childress, Texas',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Norton, Kan.',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Places', null, {});
    }
};
