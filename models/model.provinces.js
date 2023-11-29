import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import dotenv from "dotenv";
import { now } from '../helpers/helper.moment.js';

dotenv.config()

export const Provinces = Configs.define('__tbl_provinces', {
    province: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
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

Provinces.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Provinces` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

