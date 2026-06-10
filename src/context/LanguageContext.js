import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(localStorage.getItem('app_language') || 'uz');

    const changeLang = (newLang) => {
        localStorage.setItem('app_language', newLang);
        setLang(newLang);
    };

    return (
        <LanguageContext.Provider value={{ lang, changeLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLang() {
    return useContext(LanguageContext);
}

export const translations = {
    uz: {
        dashboard:    'Dashboard',
        vocabulary:   "Lug'at",
        statistics:   'Statistika',
        tests:        'Testlar',
        ai:           'AI Tutor',
        profile:      'Profil',
        settings:     'Sozlamalar',
        logout:       'Chiqish',
        notifications:'Bildirishnomalar',
        language:     'Til',
        save:         'Saqlash',
        saved:        '✅ Sozlamalar saqlandi!',
        deleteAcc:    "Akkauntni o'chirish",
        deleteDesc:   "Bu amalni qaytarib bo'lmaydi",
        delete:       "O'chirish",
        dangerZone:   '⚠️ Xavfli zona',
        emailNotif:   'Email bildirishnomalar',
        emailDesc:    'Yangi testlar va natijalar haqida',
        telegramNotif:'Telegram bildirishnomalar',
        telegramDesc: 'Bot orqali xabar olish',
        dailyReminder:'Kunlik eslatmalar',
        dailyDesc:    "Har kuni o'qishga undash",
    },
    ru: {
        dashboard:    'Главная',
        vocabulary:   'Словарь',
        statistics:   'Статистика',
        tests:        'Тесты',
        ai:           'AI Репетитор',
        profile:      'Профиль',
        settings:     'Настройки',
        logout:       'Выйти',
        notifications:'Уведомления',
        language:     'Язык',
        save:         'Сохранить',
        saved:        '✅ Настройки сохранены!',
        deleteAcc:    'Удалить аккаунт',
        deleteDesc:   'Это действие необратимо',
        delete:       'Удалить',
        dangerZone:   '⚠️ Опасная зона',
        emailNotif:   'Email уведомления',
        emailDesc:    'О новых тестах и результатах',
        telegramNotif:'Telegram уведомления',
        telegramDesc: 'Получать сообщения через бота',
        dailyReminder:'Ежедневные напоминания',
        dailyDesc:    'Мотивация учиться каждый день',
    },
    en: {
        dashboard:    'Dashboard',
        vocabulary:   'Vocabulary',
        statistics:   'Statistics',
        tests:        'Tests',
        ai:           'AI Tutor',
        profile:      'Profile',
        settings:     'Settings',
        logout:       'Log out',
        notifications:'Notifications',
        language:     'Language',
        save:         'Save',
        saved:        '✅ Settings saved!',
        deleteAcc:    'Delete account',
        deleteDesc:   'This action cannot be undone',
        delete:       'Delete',
        dangerZone:   '⚠️ Danger zone',
        emailNotif:   'Email notifications',
        emailDesc:    'About new tests and results',
        telegramNotif:'Telegram notifications',
        telegramDesc: 'Receive messages via bot',
        dailyReminder:'Daily reminders',
        dailyDesc:    'Motivation to study every day',
    },
};