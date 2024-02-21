import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import dotenv from "dotenv";
import { now } from '../helpers/helper.moment.js';

dotenv.config()

export const Produits = Configs.define('__tbl_produits', {
    uuid: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
    },
    produit: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
    },
    idcategory: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    idsouscategory: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 0
    },
    prix: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: process.env.APPESCAPESTRING
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
    status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Produits.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Produits` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

