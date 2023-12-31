import dotenv from 'dotenv';
import { Services } from '../services/services.all.js';

dotenv.config();

const { ESCAPESTRING } = process.env;

export const groupArrayByPairs = ({ array }) => {
    const groupedArray = [];
    for (let i = 0; i < array.length; i += 2) {
        if (i + 2 < array.length) {
            groupedArray.push([array[i], array[i + 1]]); //array[i + 3], array[i + 2]
        } else {
            groupedArray.push([array[i]]);
        }
    }
    return groupedArray;
};

export const waitingText = `Un instant ... ✍️`;
export const inProgressText = `Un instant votre requête est en cours de traietement ... ✍️`;
export const errorText = ` Une erreur de traitement vient de se produire. Nous sommes désolé pour le désagrement, veuillez réessayer un peu plus tard ! `;
export const thankyoumessage = `Merci de nous faire confiance, si vous  avez d'autres préocupation n'hésitez pas de demander.`;
export const welcomemessage = `Bonjour, je suis `;

export const truncatestring = ({ string, separator }) => {
    return string.substring(0, string.lastIndexOf(separator))
};

export const capitalizeWords = ({ text }) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatUserModel = ({ model }) => {

    const province = model && model['__tbl_province'];
    const territoire = model && model['__tbl_territory'];
    const village = model && model['__tbl_village'];
    const roles = model && model['__tbl_roles'];

    delete model['__tbl_roles']
    delete model['__tbl_province']
    delete model['__tbl_territory']
    delete model['__tbl_village']
    delete model['idprovince']
    delete model['idterritoire']
    delete model['idvillage']
    delete model['password']
    delete model['status']
    delete model['isvalidated']
    delete model['verificationcode']

    return {
        ...model,
        province: province['province'] ?? ESCAPESTRING,
        territoire: territoire['territoire'] ?? ESCAPESTRING,
        village: (village ? village['village'] : ESCAPESTRING),
        roles: roles.map(r => r && r['id'])
    }
};