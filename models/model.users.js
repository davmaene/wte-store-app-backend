import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import { now, nowInUnix } from '../helpers/helper.moment.js';
import dotenv from 'dotenv';

dotenv.config()

const { ESCAPESTRING } = process.env;

export const Users = Configs.define('__tbl_users', {
    uuid: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ESCAPESTRING
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: `defaultavatar.png`
    },
    nom: {
        type: Sequelize.STRING,
        allowNull: false
    },
    postnom: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prenom: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ESCAPESTRING
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ESCAPESTRING
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true
    },
    adresse: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ESCAPESTRING
    },
    idprovince: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    idterritoire: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    idvillage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    idguichet: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    genre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ESCAPESTRING
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    isvalidated: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    verificationcode: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    createdon: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: now({ options: {} })
    },
    lastlogin: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ESCAPESTRING
    },
    createdonunix: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: nowInUnix({ options: {} })
    }
}, {
    timestamps: false,
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['phone', 'email']
        }
    ]
});

Users.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Users` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

