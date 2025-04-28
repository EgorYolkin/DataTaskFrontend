import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import translationRU from './locales/ru/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
    ru: {translation: translationRU},
    en: {translation: translationEN}
};

if (localStorage.getItem("language") === null) {
    localStorage.setItem("language", "en");
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ru',
        fallbackLng: 'en',
        interpolation: {escapeValue: false}
    });

let lng = localStorage.getItem("language")
if (lng !== null) {
    i18n.changeLanguage(lng);
}

export default i18n;