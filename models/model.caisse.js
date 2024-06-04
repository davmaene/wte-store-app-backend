import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import { now, nowInUnix } from '../helpers/helper.moment.js';
import dotenv from 'dotenv';

dotenv.config()

const { ESCAPESTRING } = process.env;

export const Caisses = Configs.define('__tbl_caisses', {
    amount: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "CDF"
    },
    createdon: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: now({ options: {} })
    },
    lastupdatedby: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    updatedon: {
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

Caisses.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `Caisses` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

