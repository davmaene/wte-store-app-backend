import moment from "moment";

moment.locale("fr");

export const now = ({ options }) => {
    options = options ? options : {}
    return moment().format("LTS, L")
};

export const nowPlusDays = ({ options: { days } }) => {
    return moment().add(days, 'days').format("LTS, L")
};

export const nowInUnix = ({ options }) => {
    options = options ? options : {}
    return moment().endOf('day').unix(); // je prend le temps de la fin de journee
};

// export const endOfDayInUnix = () => {
//     return moment().endOf('day').unix();
// };

// export const startOfDayInUnix = () => {
//     return moment().startOf('day').unix();
// };

export const daysPerTypeSouscription = ({ type }) => {
    let days = 0;
    switch (parseInt(type)) {
        case 1:
            return days = 30;
            break;
        case 2:
            return days = 60;
            break;
        case 3:
            return days = 90;
            break;
        case 4:
            return days = 365;
            break;
        default:
            return days = 30;
            break;
    }
};

export const addDaysThenReturnUnix = ({ days }) => {
    switch (parseInt(days)) {
        case 1:
            days = 30;
            break;
        case 2:
            days = 60;
            break;
        case 3:
            days = 90;
            break;
        case 4:
            days = 365;
            break;
        default:
            days = 30;
            break;
    }
    const daysplus = moment().add(parseInt(days), 'days').unix();
    return daysplus;
};

export const dateFormated = ({ longDate }) => {
    return moment(longDate).format("L")
};

export const unixToDate = ({ unix }) => {
    const date = new Date(unix * 1000);

    const options = {
        year: 'numeric', month: 'long', day: 'numeric', // Format de la date
        hour: 'numeric', minute: 'numeric', second: 'numeric', // Format de l'heure
        timeZone: 'UTC' // Fuseau horaire, si nécessaire
    };

    return date.toLocaleString('fr-FR', options);
}