'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Clinics', [
            {
                name: 'FreeD.O.M. Clinic',
                address: '1056 SW 1st Ave, Ocala, FL 34471, United States',
                image: 'usa-az.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Mayo Clinic Health System',
                address: '32 N Main St, Sherburn, MN 56171, United States',
                image: 'mayo-clinic-health-system.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'USA Campbell Clinics',
                address: ', West Hollywood, CA 90046, United States',
                image: 'campbell-clinic.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Stanton Road Clinic',
                address: '575 Stanton Rd, Mobile, AL 36617, United States',
                image: 'cleveland-clinic-usa.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Health & Wellness Clinic USA',
                address: '304, Coral Gables, FL 33134, United States',
                image: 'clinic-Ft-McCoy.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Clinics', null, {});
    }
};
