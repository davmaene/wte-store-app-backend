import dotenv from 'dotenv';
import { Services } from '../services/services.all.js';
import { Config } from '../models/model.configs.js';

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

export const addPersentToPrice = ({ persent, price }) => {

    persent = parseFloat(persent)
    price = parseFloat(price)

    return (price + (price * (persent / 100)))
}

export const unityMesure = [
    {
        id: 1,
        unity: "Pièce"
    },
    {
        id: 2,
        unity: "Unité"
    },
    {
        id: 3,
        unity: "Litre"
    },
    {
        id: 4,
        unity: "Kits"
    },
    {
        id: 5,
        unity: "Rouleaux"
    },
    {
        id: 6,
        unity: "Boite"
    },
    {
        id: 7,
        unity: "Mètre"
    },
    {
        id: 8,
        unity: "Gallon"
    },
    {
        id: 9,
        unity: "Boitte"
    },
    {
        id: 10,
        unity: "Paires"
    }
]

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

    const province = model && model['__tbl_province'] ? model['__tbl_province'] : {};
    const territoire = model && model['__tbl_territory'] ? model['__tbl_territory'] : {};
    const village = model && model['__tbl_village'] ? model['__tbl_village'] : {};
    const roles = model && model['__tbl_roles'] ? model['__tbl_roles'] : {};

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
        province: (province['province'] ?? ESCAPESTRING),
        territoire: (territoire['territoire'] ?? ESCAPESTRING),
        village: (village ? village['village'] : ESCAPESTRING),
        roles: roles.map(r => r && r['id'])
    }
};

export const replacerProduit = ({ items, idproduit, item }) => {
    const index = Array.from(items).findIndex(produit => produit['idproduit'] === idproduit);

    if (index !== -1) {
        items[index] = { ...items[index], ...item };
    }
    return items;
}

export const findUnityMesure = ({ idunity }) => {
    const items = unityMesure
    let item = {};
    const index = Array.from(items).findIndex(produit => produit['id'] === idunity);

    if (index !== -1) item = items[index]
    return item;
}

export const converterDevise = async ({ amount, currency }) => {
    const configs = await Config.findAll({
        order: [['id', 'DESC']],
        limit: 1
        // where: {
        //     id: 1
        // }
    })
    if (configs.length > 0) {
        const { id, taux_change, commission_price } = configs[0]
        const tauxDeChange = taux_change || 3000;
        currency = currency.toUpperCase()
        if (currency === 'USD') {
            return { code: 200, message: `Amount converted from USD to CDF with tx(${tauxDeChange})`, data: { currency, amount: amount * tauxDeChange } };
        } else if (currency === 'CDF') {
            return { code: 200, message: 'Currency is still CDF', data: { currency, amount } };
        } else {
            return { code: 500, message: 'Not supported currency !', data: { currency, amount } };
        }
    } else {
        return { code: 500, message: 'Error occured ! we can not find Configs :::', data: { currency, amount } };
    }
}