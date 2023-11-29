import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import { now, nowInUnix } from '../helpers/helper.moment.js';
import dotenv from 'dotenv';

dotenv.config()

const { ESCAPESTRING } = process.env;

export const Categories = Configs.define('__tbl_categories', {
    category: {
        type: Sequelize.STRING,
        allowNull: false,
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

Categories.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `Categories` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

