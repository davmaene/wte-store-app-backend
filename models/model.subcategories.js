import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import { now, nowInUnix } from '../helpers/helper.moment.js';
import dotenv from 'dotenv';

dotenv.config()

const { ESCAPESTRING } = process.env;

export const Subcategories = Configs.define('__tbl_subcategories', {
    subcategory: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    idcategory: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

Subcategories.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `Subcategories` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

