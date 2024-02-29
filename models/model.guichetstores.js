import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import { now, nowInUnix } from '../helpers/helper.moment.js';
import dotenv from 'dotenv';

dotenv.config()

const { ESCAPESTRING } = process.env;

export const GStores = Configs.define('__tbl_gstores', {
    transaction: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    items: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
    },
    createdon: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: now({ options: {} })
    },
    updatedon: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: now({ options: {} })
    },
    createdby: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    idguichet: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
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

GStores.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `GStores` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

