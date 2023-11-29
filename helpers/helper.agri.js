import dotenv from 'dotenv';
import { Services } from '../sevices/allservices.services.js';
import { errorText, groupArrayByPairs, inProgressText, thankyoumessage, waitingText } from './helper.helper.js';
import { onOneCallForWeather } from '../sevices/weather.services.js';
import { IA } from '../sevices/ia.services.js';
import { Conversations } from '../sevices/chat.services.js';
dotenv.config()

const { APITELEGRAMMEBOT, APPNAME } = process.env;

export const motsAgriculture = [
  "Terre",
  "Cultiver",
  "Récolter",
  "Plantes",
  "Cultures",
  "Semences",
  "Agriculteur",
  "Champ",
  "Labourer",
  "Engrais",
  "Irrigation",
  "Pesticides",
  "Herbes",
  "Riziculture",
  "Horticulture",
  "Élevage",
  "Vaches",
  "Poules",
  "Porcs",
  "Moutons",
  "Abeilles",
  "Apiculture",
  "Serre",
  "Jardinage",
  "Arboriculture",
  "Fertilisation",
  "Traiter",
  "Moisson",
  "Tracteur",
  "Système d'irrigation",
  "Agroalimentaire",
  "Agroécologie",
  "Biologique",
  "Agroforesterie",
  "Pépinière",
  "Sélection génétique",
  "Ressources naturelles",
  "Préserver la biodiversité",
  "Rural",
  "Agro-industrie"
];

export const __commnandes = {
  "start": "start",
  "weather": "weather",
  "market": "market"
};

export const motsDeSalutation = [
  'Bonjour',
  'Salut',
  'Coucou',
  'Bonsoir',
  'Bonne journée',
  'Bonne soirée',
  'Bonne nuit',
  'Salutations',
  'Bienvenue',
  'Au revoir',
  'À bientôt',
  'À plus tard',
  'À tout à l\'heure',
  'À demain',
  'Bon weekend',
  'Joyeux anniversaire',
  'Félicitations',
  'Bon courage',
  'Bon appétit',
  'Bonne chance'
];

export const commandes = [
  // {
  //     command: "localisation",
  //     description: "Commencer la localisation de l'utilisateur"
  // },
  {
    command: "start",
    description: "Commencer une nouvelle conversation !"
  },
  // { 
  //     command: "weather",
  //     description: "Informations sur la météo agricole !"
  // },
  // { 
  //     command: "market",
  //     description: "Informations sur les prix des produits agricoles du marché !"
  // }
];

export const checkIfIsTheCommande = ({ commande }) => {
  try {
    const cmd = commande.toLowerCase().substring(1) || ""; // commande.toLowerCase()
    // const reg = new RegExp(cmmd)
    return {
      iscommande: commandes.some((cmmd) => (cmmd['command']).includes(cmd)),
      commande: cmd
    }
  } catch (error) {
    return {
      iscommande: false,
      commande: ""
    }
  }
};

export const checkIfThisIsTheWordIsAgriWord = ({ keyword }) => {
  return motsAgriculture.some(v => keyword.toLowerCase().includes(v.toLowerCase()))
};

export const checkIfIsTheSalutation = ({ keyword }) => {
  return motsDeSalutation.some(v => keyword.toLowerCase().includes(v.toLowerCase()))
};

export const handleCommande = ({ bot, commande, idsender, chat }) => {
  const { first_name, last_name, type, id } = chat;
  const _startOptions = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Prix du marché', callback_data: 'prices_market', color: "green" }],
        [{ text: 'Météo agricole', callback_data: 'weather_agricultural' }],
        [{ text: 'Conseils agricole', callback_data: 'advice_agricultural' }],
        [{ text: 'Achats des produits agricoles', callback_data: 'buying_agricultural_products' }]
      ],
    },
  };
  switch (commande) {
    case __commnandes['weather']:
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Pour mon champs', callback_data: 'aschampslocation', color: "green" }],
            [{ text: 'Pour ma position actuelle', callback_data: 'ascurrentlocation' }]
          ],
        },
      };

      bot.sendMessage(idsender, 'Vous avez demander de voir la météo, veuillez séléctionner une option : ', options);
      break;
    case __commnandes['start']:

      bot.sendMessage(idsender, `Bonjour ${first_name} ${last_name}, je suis ${APPNAME} j'ai été conçu pour vous assister. Quelle est votre préocupation aujourd'hui ? choisissez une option pour continuer`, _startOptions)
      break;

    default:
      bot.sendMessage(idsender, `Fonctionnalité actuellement non pris en charge, réessayer un peu plus tard !`, _startOptions);
      break;
  }
};

export const handleSubButtonCliCked = ({ bot, prefix, chatID, messageID, casecommande }) => {
  const qdata = casecommande.substring(casecommande.indexOf("."), casecommande.lastIndexOf(".") + 1);

  if (casecommande.includes("sub_province")) {

    const idprovince = casecommande.substring(casecommande.lastIndexOf("_") + 1);

    Services.onListAllTerritoireByProvince({
      inputs: { idprovince },
      callBack: (err, done) => {
        if (done) {
          const { data, message, code } = done;
          if (code === 200) {
            const { liste } = data;
            const formated = liste.map(p => {
              return { text: p && p['territoire'], callback_data: `sub_territoires_${qdata}_${p && p['id']}` }
            })
            const __options_territoires = {
              reply_markup: {
                inline_keyboard: [...groupArrayByPairs({
                  array: formated
                })],
              },
            };

            bot.editMessageText(`Veuillez séléctinner un territoire : `, {
              ...__options_territoires,
              chat_id: chatID,
              message_id: messageID
            });

          } else {
            bot.editMessageText("Nous sommes désolé un problème viens de se produire lors de traietement des informations, veuillez s'il vous plait réessayer plus tard !", {
              chat_id: chatID,
              message_id: messageID
            })
          }
        }
      }
    })
  }

  if (casecommande.includes("sub_culture")) {
    const idculture = casecommande.substring(casecommande.lastIndexOf("_") + 1);
    Services.onSelectCultureById({
      inputs: { idculture },
      callBack: (err, done) => {
        if (done) {
          const { code, message, data } = done;
          const { id, cultures } = data;
          IA.onNewChat({
            inputs: { user: chatID, content: `Conseils agricole pour ${cultures} en RDC, comment planter et dans dans quelle saison ` }, callback: (err, done) => {
              const { data, code } = done;
              const { text, finish_reason, index, logprobs } = data[0];
              bot.editMessageText(`Conseils agricole pour ${cultures} \n ${text} \n${thankyoumessage}`, {
                chat_id: chatID,
                message_id: messageID
              })
            }
          })
        } else {
          bot.editMessageText(errorText, {
            chat_id: chatID,
            message_id: messageID
          })
        }
      }
    })
    // Services.onListAllTerritoireByProvince({
    //   inputs: { idprovince },
    //   callBack: (err, done) => {
    //     if (done) {
    //       const { data, message, code } = done;
    //       if (code === 200) {
    //         const { liste } = data;
    //         const formated = liste.map(p => {
    //           return { text: p && p['territoire'], callback_data: `sub_territoire_${qdata}_${p && p['id']}` }
    //         })
    //         const __options_territoires = {
    //           reply_markup: {
    //             inline_keyboard: [...groupArrayByPairs({
    //               array: formated
    //             })],
    //           },
    //         };

    //         bot.editMessageText(`Veuillez séléctinner un territoire : `, {
    //           ...__options_territoires,
    //           chat_id: chatID,
    //           message_id: messageID
    //         });

    //       } else {
    //         bot.editMessageText("Nous sommes désolé un problème viens de se produire lors de traietement des informations, veuillez s'il vous plait réessayer plus tard !", {
    //           chat_id: chatID,
    //           message_id: messageID
    //         })
    //       }
    //     }
    //   }
    // })
  }

  if (casecommande.includes("sub_territoires")) {
    const idterritoire = casecommande.substring(casecommande.lastIndexOf("_") + 1);
    Services.onListAllVillageByTerritoire({
      inputs: { idterritoire },
      callBack: (err, done) => {
        if (done) {
          const { data, message, code } = done;
          if (code === 200) {
            const { liste } = data;
            const formated = liste.map(p => {
              return { text: p && p['village'], callback_data: `sub_villages_${qdata}_${p && p['id']}` }
            })
            const __options_villages = {
              reply_markup: {
                inline_keyboard: [...groupArrayByPairs({
                  array: formated
                })],
              },
            };

            bot.editMessageText(`Veuillez séléctinner un village : `, {
              ...__options_villages,
              chat_id: chatID,
              message_id: messageID
            });

          } else {
            bot.editMessageText("Nous sommes désolé un problème viens de se produire lors de traietement des informations, veuillez s'il vous plait réessayer plus tard !", {
              chat_id: chatID,
              message_id: messageID
            })
          }
        }
      }
    })
  }

  if (casecommande.includes("sub_villages")) {

    const idvillage = casecommande.substring(casecommande.lastIndexOf("_") + 1);

    if (/weather_agricultural/.test(qdata)) {
      bot.editMessageText(inProgressText, {
        chat_id: chatID,
        message_id: messageID
      })
      Services.onSelectVillageById({
        inputs: { idvillage },
        callBack: (err, done) => {
          if (done) {
            const { code, message, data } = done;
            if (code === 200) {
              const { village, latitude, longitude } = data;

              onOneCallForWeather({
                lat: latitude,
                lon: longitude
              }, (rejected, resolved) => {
                if (resolved) {
                  // console.log(resolved);
                  bot.editMessageText(`Dans le village de ${village} il y a une probabilité de ${resolved && resolved['data'] && resolved['data']['description']} aujourd'hui. ${thankyoumessage}`, {
                    chat_id: chatID,
                    message_id: messageID
                  })
                } else {
                  bot.editMessageText(errorText, {
                    chat_id: chatID,
                    message_id: messageID
                  })
                }
              })
            } else {
              bot.editMessageText(errorText, {
                chat_id: chatID,
                message_id: messageID
              })
            }
          } else {
            bot.editMessageText(errorText, {
              chat_id: chatID,
              message_id: messageID
            })
          }
        }
      })
    }

    if (/prices_market/.test(qdata)) {
      bot.editMessageText(`Nous travaillons sur le bot, cette fonctionnalité sera operationelle sous peu ! 😊`, {
        chat_id: chatID,
        message_id: messageID
      })
    }

    if (/advice_agricultural/.test(qdata)) {
      bot.editMessageText(`Nous travaillons sur le bot, cette fonctionnalité sera operationelle sous peu ! 😊`, {
        chat_id: chatID,
        message_id: messageID
      })
    }
  }
};

export const handleButtonCliCked = async ({ bot, prefix, chatID, messageID, qdata }) => {
  // prfix => 1: provinces, 2: territoire, 3: villages, 4: cultures
  switch (prefix) {
    case 1:
      // console.log("This message will modified @", d);
      Services.onListAllProvinces({
        inputs: {},
        callBack: (err, done) => {
          if (done) {
            const { data, message, code } = done;
            if (code === 200) {
              const { liste } = data;
              const formated = liste.map(p => {
                return { text: p && p['province'], callback_data: `sub_province_${qdata}_${p && p['id']}` }
              })

              const __options_provinces = {
                reply_markup: {
                  inline_keyboard: [...groupArrayByPairs({ array: formated })],
                },
              };

              bot.editMessageText("Veuillez séléctinner une province : ", {
                ...__options_provinces,
                chat_id: chatID,
                message_id: messageID
              });

            } else {
              bot.editMessageText(errorText, {
                chat_id: chatID,
                message_id: messageID
              })
            }
          }
        }
      })
      break;

    case 2:
      Services.onListAllTerritoireByProvince({
        inputs: { idprovince },
        callBack: (err, done) => {
          if (done) {
            const { data, message, code } = done;
            if (code === 200) {
              const { liste } = data;
              const formated = liste.map(p => {
                return { text: p && p['province'], callback_data: `sub_territoire_${qdata}_${p && p['id']}` }
              })

              const __options_territoires = {
                reply_markup: {
                  inline_keyboard: [...groupArrayByPairs({
                    array: formated
                  })],
                },
              };

              bot.editMessageText("Veuillez séléctinner une province : ", {
                ...__options_territoires,
                chat_id: chatID,
                message_id: messageID
              });

            } else {
              bot.editMessageText(errorText, {
                chat_id: chatID,
                message_id: messageID
              })
            }
          }
        }
      })
      break;

    case 4:
      Services.onListAllCultures({
        inputs: {},
        callBack: (err, done) => {
          if (done) {
            const { data, message, code } = done;
            if (code === 200) {
              const { liste } = data;
              const formated = liste.map(p => {
                return [{ text: p && p['cultures'], callback_data: `sub_culture_${qdata}_${p && p['id']}` }]
              })

              const __options_cultures = {
                reply_markup: {
                  inline_keyboard: [...formated],
                },
              };

              bot.editMessageText("Veuillez séléctinner un produit : ", {
                ...__options_cultures,
                chat_id: chatID,
                message_id: messageID
              });

            } else {
              bot.editMessageText(errorText, {
                chat_id: chatID,
                message_id: messageID
              })
            }
          }
        }
      })
      break;

    default:
      bot.editMessageText(`Nous travaillons sur le bot, cette fonctionnalité sera operationelle sous peu ! 😊'`, {
        chat_id: chatID,
        message_id: messageID
      })
      break;
  }
}