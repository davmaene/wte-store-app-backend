import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import { now, nowInUnix } from '../helpers/helper.moment.js';
import dotenv from 'dotenv';

dotenv.config()

const { ESCAPESTRING } = process.env;

export const Ventes = Configs.define('__tbl_ventes', {
    uuid: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ESCAPESTRING
    },
    taransaction: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "0"
    },
    idproduit: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    prixvente: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "USD"
    },
    createdby: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createdonunix: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: nowInUnix({ options: {} })
    },
    createdon: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: now({ options: {} })
    },
    idguichet: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1 // 1: confirmed 2: canceled
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Ventes.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `Ventes` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

