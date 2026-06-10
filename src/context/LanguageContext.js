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
        // Navbar
        dashboard:    'Dashboard',
        vocabulary:   "Lug'at",
        statistics:   'Statistika',
        tests:        'Testlar',
        ai:           'AI Tutor',
        profile:      'Profil',
        settings:     'Sozlamalar',
        logout:       'Chiqish',
        notifications:'Bildirishnomalar',
        // Settings
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
        // Dashboard
        hello:        'Salom',
        dailyStreak:  'Kunlik streak',
        streakDays:   'kun ketma-ket',
        dailyGoal:    'Kunlik maqsad',
        done:         '✅ Bajarildi!',
        remaining:    (n) => `${n} ta qoldi`,
        xpUntil:      (n) => `${n} XP gacha`,
        maxLevel:     'Max level! 🏆',
        myResults:    'Natijalarim',
        testsCount:   (n) => `${n} ta test`,
        aiServices:   'AI Xizmatlar',
        aiTeacher:    'AI Muallim',
        aiTeacherSub: 'Essay tekshiruv, speaking mashq, grammatika — istalgan vaqt istalgan mavzu',
        startChat:    'Suhbat boshlash',
        sections:     "Bo'limlar",
        vocabSub:     "So'zlarni saqlash va takrorlash",
        statsSub:     'Progress va zaif tomonlar',
        testsSub:     'Mock testlarni boshlash',
        levelTitles:  ['Beginner', 'Beginner+', 'Intermediate', 'Advanced', 'Expert'],
        dailyPlan:    'Kunlik Reja',
        dailyPlanSub: "AI sizga shaxsiy reja tuzadi",
    },
    ru: {
        // Navbar
        dashboard:    'Главная',
        vocabulary:   'Словарь',
        statistics:   'Статистика',
        tests:        'Тесты',
        ai:           'AI Репетитор',
        profile:      'Профиль',
        settings:     'Настройки',
        logout:       'Выйти',
        notifications:'Уведомления',
        // Settings
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
        // Dashboard
        hello:        'Привет',
        dailyStreak:  'Серия дней',
        streakDays:   'дней подряд',
        dailyGoal:    'Цель на день',
        done:         '✅ Выполнено!',
        remaining:    (n) => `Осталось ${n}`,
        xpUntil:      (n) => `До ${n} XP`,
        maxLevel:     'Макс. уровень! 🏆',
        myResults:    'Мои результаты',
        testsCount:   (n) => `${n} тестов`,
        aiServices:   'AI Сервисы',
        aiTeacher:    'AI Репетитор',
        aiTeacherSub: 'Проверка эссе, практика speaking, грамматика — в любое время',
        startChat:    'Начать чат',
        sections:     'Разделы',
        vocabSub:     'Сохранение и повторение слов',
        statsSub:     'Прогресс и слабые стороны',
        testsSub:     'Начать пробные тесты',
        levelTitles:  ['Новичок', 'Новичок+', 'Средний', 'Продвинутый', 'Эксперт'],
        dailyPlan:    'План на день',
        dailyPlanSub: 'AI составит персональный план',
    },
    en: {
        // Navbar
        dashboard:    'Dashboard',
        vocabulary:   'Vocabulary',
        statistics:   'Statistics',
        tests:        'Tests',
        ai:           'AI Tutor',
        profile:      'Profile',
        settings:     'Settings',
        logout:       'Log out',
        notifications:'Notifications',
        // Settings
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
        // Dashboard
        hello:        'Hello',
        dailyStreak:  'Daily streak',
        streakDays:   'days in a row',
        dailyGoal:    'Daily goal',
        done:         '✅ Done!',
        remaining:    (n) => `${n} left`,
        xpUntil:      (n) => `Until ${n} XP`,
        maxLevel:     'Max level! 🏆',
        myResults:    'My Results',
        testsCount:   (n) => `${n} tests`,
        aiServices:   'AI Services',
        aiTeacher:    'AI Tutor',
        aiTeacherSub: 'Essay review, speaking practice, grammar — anytime, any topic',
        startChat:    'Start chat',
        sections:     'Sections',
        vocabSub:     'Save and review words',
        statsSub:     'Progress and weak areas',
        testsSub:     'Start mock tests',
        levelTitles:  ['Beginner', 'Beginner+', 'Intermediate', 'Advanced', 'Expert'],
        dailyPlan:    'Daily Plan',
        dailyPlanSub: 'AI creates your personal plan',
    },
};