import Sequelize from 'sequelize';
import { Configs } from '../configs/configs.js';
import dotenv from 'dotenv';
import { Users } from './model.users.js';
import { Roles } from './model.roles.js';

dotenv.config()

const { ESCAPESTRING } = process.env;

export const Hasrole = Configs.define('__tbl_relations', {
    // userid: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //         model: Users,
    //         key: 'id'
    //     }
    // },
    // roleid: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //         model: Roles,
    //         key: 'id'
    //     }
    // },
    TblRoleId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    TblUserId: {
        type: Sequelize.INTEGER,
        allowNull: false
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

Hasrole.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `Hasrole Users` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });

