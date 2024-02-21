import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import dotenv from "dotenv";
import { now } from '../helpers/helper.moment.js';

dotenv.config()

export const Guichets = Configs.define('__tbl_guichets', {
    uuid: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
    },
    guichet: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
    },
    idresponsable: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
    },
    adresse: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
    },
    idprovince: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    idterritoire: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    createdon: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: now({ options: {} })
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Guichets.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Guichets` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

