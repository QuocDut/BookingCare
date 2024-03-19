'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.bulkInsert('Specializations', [
            {
                name: 'Otolaryngology',
                image: 'otolaryngology.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Neurosurgery',
                image: 'neurosurgery.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Surgery',
                image: 'surgery.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Cardiology (Heart)',
                image: 'cardiology.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Medicine',
                image: 'medicine.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Transplant Hepatology',
                image: 'neurosurgery.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Plastic Surgery',
                image: 'otolaryngology.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },

        ], {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Specializations', null, {});
    }
};
