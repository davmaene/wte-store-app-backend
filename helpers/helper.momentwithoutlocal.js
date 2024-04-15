import moment from "moment";

// moment.locale("fr");

export const endOfDayInUnix = () => {
    return moment().endOf('day').unix();
};

export const startOfDayInUnix = () => {
    return moment().startOf('day').unix();
};