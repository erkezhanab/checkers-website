"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ru" | "kz";

export interface T {
  nav: {
    play: string; learn: string; leaderboard: string; history: string; shop: string; pro: string;
    signIn: string; signOut: string; viewProfile: string;
  };
  home: {
    subtitle: string; tutorial: string;
    redWins: string; blackWins: string; draw: string;
    playAgain: string; newSetup: string; moveHistory: string;
    viewAnalysis: string; upgradeForAi: string;
  };
  history: {
    title: string; gamesPlayed: string; noGames: string;
    signInTitle: string; signInDesc: string;
    proTitle: string; proDesc: string; upgradeBtn: string;
    win: string; loss: string; draw: string;
    moves: string; vsAi: string; vsFriend: string;
  };
  setup: {
    title: string; subtitle: string;
    gameMode: string; difficulty: string; yourColor: string; options: string;
    vsAi: string; twoPlayers: string; online: string;
    easy: string; medium: string; hard: string;
    blackFirst: string; redSecond: string;
    blitzMode: string; blitzDesc: string; blitzPro: string;
    hardRequiresPro: string; startGame: string;
    createRoom: string; orJoin: string; join: string;
    roomCodePlaceholder: string; invalidCode: string; supabaseRequired: string;
    roomCreated: string; shareCode: string; copyCode: string; waitingOpponent: string;
    hardProFeature: string; blitzProFeature: string; isProFeature: string; upgrade: string;
  };
  game: {
    redWins: string; blackWins: string; draw: string;
    aiThinking: string; blackTurn: string; redTurn: string;
    black: string; red: string; captured: string;
    newGame: string; youPlayAs: string; ai: string;
  };
  learn: {
    title: string; subtitle: string;
    stepWord: string; ofWord: string;
    resetStep: string; nextStep: string; finishTutorial: string;
    alreadyTitle: string; alreadyDesc: string; tutorialCompleted: string;
    playVsAi: string; redoTutorial: string;
    allDoneTitle: string; allDoneDesc1: string; allDoneDesc2: string;
    savedToProfile: string;
  };
  shop: {
    title: string; subtitle: string;
    proRequired: string; proAccount: string;
    preview: string; upgradeToUnlock: string; unlockWithPro: string;
    skinSaved: string; playWith: string;
  };
  pro: {
    badge: string; title: string; subtitle: string;
    free: string; forever: string; best: string;
    unlockPro: string;
    welcomePro: string; alreadyPro: string; startPlaying: string; allFeaturesDesc: string;
    freeFeatures: string[];
    proFeatureLabels: string[];
    choosePlan: string; unlockInstantly: string;
    currentPlan: string; noPayment: string;
    youArePro: string; enjoyGame: string; visitShop: string;
  };
  coach: {
    title: string; analyzing: string; keyMoments: string;
    geminiReviewing: string; moreHidden: string; upgradeForAnalysis: string;
    switchToRuleBased: string; switchToGemini: string;
    reviewMoments: string; move: string; free: string;
    poweredByClaude: string; poweredByGemini: string;
    tryClaude: string; tryGemini: string;
    noInsights: string; gameAnalysis: string;
  };
  timer: { blitzMode: string };
  profile: {
    myAccount: string; email: string; plan: string;
    joined: string; record: string; signOut: string;
  };
  leaderboard: {
    title: string; playersRanked: string; searchPlayers: string;
    allCities: string; noPlayersFound: string; rating: string;
    unavailable: string; connectSupabase: string;
  };
  skins: Record<string, { name: string; desc: string }>;
  learnSteps: Array<{ title: string; instructions: string; hint: string; success: string }>;
  auth: {
    login: {
      title: string; subtitle: string;
      email: string; password: string;
      signIn: string; signingIn: string; retryIn: string;
      noAccount: string; signUp: string;
      enterEmail: string; enterPassword: string;
      wrongCredentials: string; emailNotConfirmed: string;
      tooManyAttempts: string; userNotFound: string; networkError: string;
      didntGetEmail: string; clickToResend: string; emailResent: string;
    };
    signup: {
      title: string; subtitle: string;
      username: string; city: string; email: string; password: string;
      createAccount: string; creatingAccount: string; retryIn: string;
      alreadyHaveAccount: string; signIn: string;
      ruleLength: string; ruleUppercase: string; ruleNumber: string;
      accountCreated: string; confirmationSent: string; checkInbox: string; goToLogin: string;
      emailRequired: string; emailInvalidAt: string; emailInvalidDomain: string;
      usernameRequired: string; usernameMinLength: string; usernameMaxLength: string; usernameInvalidChars: string;
      passwordWeak: string; emailAlreadyRegistered: string;
      invalidEmail: string; passwordTooWeak: string; rateLimited: string;
    };
  };
}

const TRANSLATIONS: Record<Lang, T> = {
  en: {
    nav: {
      play: "Play", learn: "Learn", leaderboard: "Leaderboard", history: "History", shop: "Shop", pro: "Pro",
      signIn: "Sign in", signOut: "Sign out", viewProfile: "View profile",
    },
    home: {
      subtitle: "Classic draughts · AI coaching · Online multiplayer",
      tutorial: "New to checkers? Take the interactive tutorial →",
      redWins: "Red wins!", blackWins: "Black wins!", draw: "Draw!",
      playAgain: "Play Again", newSetup: "New Setup", moveHistory: "Move History",
      viewAnalysis: "View AI analysis in History →", upgradeForAi: "Upgrade to Pro for AI analysis →",
    },
    history: {
      title: "Game History", gamesPlayed: "{n} games played", noGames: "No games yet. Play your first game!",
      signInTitle: "Sign in to view history", signInDesc: "Your game history is saved to your account.",
      proTitle: "Pro feature", proDesc: "Upgrade to Pro to view your game history.", upgradeBtn: "Upgrade to Pro",
      win: "Win ✓", loss: "Loss ✗", draw: "Draw", moves: "moves",
      vsAi: "vs AI", vsFriend: "vs Friend",
    },
    setup: {
      title: "New Game", subtitle: "Choose your settings",
      gameMode: "Game Mode", difficulty: "Difficulty", yourColor: "Your Color", options: "Options",
      vsAi: "vs AI", twoPlayers: "2 Players", online: "Online",
      easy: "Easy", medium: "Medium", hard: "Hard",
      blackFirst: "Black (first)", redSecond: "Red (second)",
      blitzMode: "⚡ Blitz Mode", blitzDesc: "3 minutes per player", blitzPro: "Pro only — upgrade to unlock",
      hardRequiresPro: "Hard mode requires", startGame: "Start Game",
      createRoom: "Create Room", orJoin: "or join", join: "Join",
      roomCodePlaceholder: "ROOM CODE", invalidCode: "Enter a 6-character room code.",
      supabaseRequired: "Online play requires Supabase. Add your credentials to .env.local.",
      roomCreated: "Your room is created! 🎉", shareCode: "Share this code with your friend",
      copyCode: "Copy Code", waitingOpponent: "Waiting for opponent...",
      hardProFeature: "Hard difficulty", blitzProFeature: "Blitz mode",
      isProFeature: "is a Pro feature.", upgrade: "Upgrade →",
    },
    game: {
      redWins: "Red wins! 🎉", blackWins: "Black wins! 🎉", draw: "Draw!",
      aiThinking: "AI is thinking...", blackTurn: "Black's turn", redTurn: "Red's turn",
      black: "Black", red: "Red", captured: "captured",
      newGame: "New Game", youPlayAs: "You play as", ai: "AI",
    },
    learn: {
      title: "Learn Checkers", subtitle: "Interactive step-by-step tutorial",
      stepWord: "Step", ofWord: "of",
      resetStep: "Reset this step", nextStep: "Next Step", finishTutorial: "Finish Tutorial",
      alreadyTitle: "You already know this!",
      alreadyDesc: "You've mastered the basics. Ready to put your skills to the test?",
      tutorialCompleted: "Tutorial Completed ✓",
      playVsAi: "Play vs AI", redoTutorial: "Redo Tutorial",
      allDoneTitle: "Tutorial Complete!",
      allDoneDesc1: "You completed {n} of {total} exercises.",
      allDoneDesc2: "You know all the rules. Ready to test your skills?",
      savedToProfile: "Saved to your profile ✓",
    },
    shop: {
      title: "Skin Shop", subtitle: "Customize your board and pieces",
      proRequired: "Pro skins require a", proAccount: "Pro account",
      preview: "Preview", upgradeToUnlock: "Upgrade to unlock", unlockWithPro: "Unlock with Pro",
      skinSaved: "Skin saved!", playWith: "Play with",
    },
    pro: {
      badge: "Pro Plan",
      title: "Take your game to the next level",
      subtitle: "Unlock Gemini AI coaching, custom skins, and unlimited history.",
      free: "Free", forever: "/forever", best: "BEST",
      unlockPro: "Unlock Pro",
      welcomePro: "Welcome to Pro! All features unlocked ⭐",
      alreadyPro: "You're already a Pro member!",
      startPlaying: "Start Playing",
      allFeaturesDesc: "Hard AI, all skins, and online multiplayer are now available.",
      freeFeatures: [
        "Play vs AI (Easy & Medium)",
        "Player vs Player (same screen)",
        "Basic AI Coach (3 insights)",
        "Global Leaderboard",
        "Light / Dark theme",
      ],
      proFeatureLabels: [
        "AI vs Hard difficulty",
        "Gemini-powered deep analysis",
        "All piece skins unlocked",
        "Online multiplayer rooms",
        "Priority coach insights",
      ],
      choosePlan: "Choose your plan", unlockInstantly: "Unlock all features instantly",
      currentPlan: "Current Plan", noPayment: "No payment required · Instant access",
      youArePro: "You are Pro!", enjoyGame: "All features unlocked. Enjoy the game!", visitShop: "Visit Shop",
    },
    coach: {
      title: "AI Coach", analyzing: "Analyzing your game…",
      keyMoments: "{n} key moments found",
      geminiReviewing: "Gemini is reviewing your game…",
      moreHidden: "{n} more insights hidden",
      upgradeForAnalysis: "Upgrade to Pro for full analysis + Gemini AI",
      switchToRuleBased: "Switch to rule-based analysis",
      switchToGemini: "Switch to Gemini analysis",
      reviewMoments: "Review these moments to improve your game!",
      move: "Move #", free: "Free",
      poweredByClaude: "Powered by Claude", poweredByGemini: "Powered by Gemini",
      tryClaude: "Try Claude instead", tryGemini: "Try Gemini instead",
      noInsights: "No insights available", gameAnalysis: "Game Analysis",
    },
    timer: { blitzMode: "Blitz Mode" },
    profile: {
      myAccount: "My Account", email: "Email", plan: "Plan",
      joined: "Joined", record: "Record", signOut: "Sign out",
    },
    leaderboard: {
      title: "Leaderboard", playersRanked: "{n} players ranked",
      searchPlayers: "Search players...", allCities: "All Cities",
      noPlayersFound: "No players found", rating: "rating",
      unavailable: "Leaderboard unavailable",
      connectSupabase: "Connect Supabase to see the global leaderboard. Add your credentials to .env.local.",
    },
    skins: {
      classic: { name: "Classic",       desc: "The original checkers look." },
      ocean:   { name: "Ocean",         desc: "Deep sea blues and teals." },
      forest:  { name: "Forest",        desc: "Earthy greens and browns." },
      gold:    { name: "Gold & Silver", desc: "Premium metallic finish." },
      crystal: { name: "Crystal",       desc: "Translucent purple and cyan." },
      neon:    { name: "Neon Night",    desc: "Glowing neon on dark board." },
    },
    learnSteps: [
      {
        title: "Moving a Piece",
        instructions: "Pieces move diagonally forward only. Click the black piece, then click one of the glowing dots to move it.",
        hint: "Click the black piece first — glowing dots will show where you can go.",
        success: "Perfect! You moved diagonally forward. That's all a basic piece can do.",
      },
      {
        title: "Capturing an Opponent",
        instructions: "Jump OVER a red piece to capture it! When a capture is available you MUST take it.",
        hint: "Click the black piece — it has one move that jumps over the red piece.",
        success: "Excellent! You captured a red piece by jumping over it!",
      },
      {
        title: "Chain Captures",
        instructions: "You can capture multiple pieces in a single turn by chaining jumps! Capture both red pieces.",
        hint: "Click the black piece. It can jump twice in one move — take them both!",
        success: "Incredible! A double capture in one move — that's advanced play!",
      },
      {
        title: "Becoming a King",
        instructions: "When a piece reaches the opponent's back row (row 0, the very top), it becomes a King ♛ and can move in all 4 directions!",
        hint: "The black piece is one step from the top. Move it diagonally to either corner — it will be crowned.",
        success: "👑 You have a King! Notice the crown symbol — Kings can now move backwards too.",
      },
      {
        title: "King Power",
        instructions: "A King can move AND capture in all 4 diagonal directions — including backwards. Capture the red piece that is behind the king.",
        hint: "The black King is at the center. The red piece is below it. Jump over it!",
        success: "Kings dominate the board — guard them and use them to control both directions!",
      },
    ],
    auth: {
      login: {
        title: "Welcome back", subtitle: "Sign in to your account",
        email: "Email", password: "Password",
        signIn: "Sign in", signingIn: "Signing in…", retryIn: "Try again in {n}s",
        noAccount: "No account?", signUp: "Sign up",
        enterEmail: "Please enter your email.", enterPassword: "Please enter your password.",
        wrongCredentials: "Wrong email or password. Please try again.",
        emailNotConfirmed: "Please confirm your email first. Check your inbox for the confirmation link.",
        tooManyAttempts: "Too many login attempts. Please wait a minute and try again.",
        userNotFound: "No account found with this email. Did you mean to sign up?",
        networkError: "Network error. Check your connection and try again.",
        didntGetEmail: "Didn't get the email? Check your spam folder or",
        clickToResend: "click here to resend it",
        emailResent: "Confirmation email resent! Check your inbox.",
      },
      signup: {
        title: "Create account", subtitle: "Join the checkers community",
        username: "Username", city: "City", email: "Email", password: "Password",
        createAccount: "Create account", creatingAccount: "Creating account…", retryIn: "Try again in {n}s",
        alreadyHaveAccount: "Already have an account?", signIn: "Sign in",
        ruleLength: "At least 8 characters",
        ruleUppercase: "At least 1 uppercase letter (A–Z)",
        ruleNumber: "At least 1 number (0–9)",
        accountCreated: "Account created!", confirmationSent: "We sent a confirmation link to",
        checkInbox: "Check your inbox (and spam folder) and click the link to activate your account.",
        goToLogin: "Go to Login",
        emailRequired: "Email is required.", emailInvalidAt: "Email must contain @.",
        emailInvalidDomain: "Email must have a valid domain (e.g. gmail.com).",
        usernameRequired: "Username is required.",
        usernameMinLength: "Username must be at least 3 characters.",
        usernameMaxLength: "Username must be 20 characters or less.",
        usernameInvalidChars: "Username can only contain letters, numbers, and underscores.",
        passwordWeak: "Password must be at least 8 characters and include an uppercase letter and a number.",
        emailAlreadyRegistered: "This email is already registered. Please sign in instead.",
        invalidEmail: "Please enter a valid email address.",
        passwordTooWeak: "Password is too weak. Please follow the requirements below.",
        rateLimited: "Too many attempts. Please wait a moment and try again.",
      },
    },
  },

  ru: {
    nav: {
      play: "Играть", learn: "Учиться", leaderboard: "Таблица", history: "История", shop: "Магазин", pro: "Про",
      signIn: "Войти", signOut: "Выйти", viewProfile: "Профиль",
    },
    home: {
      subtitle: "Классические шашки · ИИ коуч · Мультиплеер",
      tutorial: "Новичок? Пройди интерактивный туториал →",
      redWins: "Красные победили!", blackWins: "Чёрные победили!", draw: "Ничья!",
      playAgain: "Ещё раз", newSetup: "Новая настройка", moveHistory: "История ходов",
      viewAnalysis: "Посмотреть анализ ИИ в Истории →", upgradeForAi: "Улучшите до Pro для анализа ИИ →",
    },
    history: {
      title: "История игр", gamesPlayed: "{n} игр сыграно", noGames: "Игр пока нет. Сыграйте первую игру!",
      signInTitle: "Войдите чтобы увидеть историю", signInDesc: "История игр сохраняется в аккаунте.",
      proTitle: "Функция Pro", proDesc: "Улучшите до Pro для просмотра истории игр.", upgradeBtn: "Улучшить до Pro",
      win: "Победа ✓", loss: "Поражение ✗", draw: "Ничья", moves: "ходов",
      vsAi: "против ИИ", vsFriend: "против друга",
    },
    setup: {
      title: "Новая игра", subtitle: "Выберите настройки",
      gameMode: "Режим игры", difficulty: "Сложность", yourColor: "Ваш цвет", options: "Параметры",
      vsAi: "Против ИИ", twoPlayers: "2 игрока", online: "Онлайн",
      easy: "Лёгкий", medium: "Средний", hard: "Сложный",
      blackFirst: "Чёрные (первые)", redSecond: "Красные (вторые)",
      blitzMode: "⚡ Блиц режим", blitzDesc: "3 минуты на игрока", blitzPro: "Только Про — обновитесь",
      hardRequiresPro: "Сложный требует", startGame: "Начать игру",
      createRoom: "Создать комнату", orJoin: "или присоединиться", join: "Войти",
      roomCodePlaceholder: "КОД КОМНАТЫ", invalidCode: "Введите 6-значный код комнаты.",
      supabaseRequired: "Онлайн игра требует Supabase. Добавьте ключи в .env.local.",
      roomCreated: "Ваша комната создана! 🎉", shareCode: "Поделитесь этим кодом с другом",
      copyCode: "Скопировать код", waitingOpponent: "Ожидание соперника...",
      hardProFeature: "Сложный уровень", blitzProFeature: "Блиц режим",
      isProFeature: "— функция Про.", upgrade: "Обновить →",
    },
    game: {
      redWins: "Красные победили! 🎉", blackWins: "Чёрные победили! 🎉", draw: "Ничья!",
      aiThinking: "ИИ думает...", blackTurn: "Ход чёрных", redTurn: "Ход красных",
      black: "Чёрные", red: "Красные", captured: "захвачено",
      newGame: "Новая игра", youPlayAs: "Вы играете за", ai: "ИИ",
    },
    learn: {
      title: "Изучить шашки", subtitle: "Интерактивный пошаговый туториал",
      stepWord: "Шаг", ofWord: "из",
      resetStep: "Сбросить шаг", nextStep: "Следующий шаг", finishTutorial: "Завершить",
      alreadyTitle: "Вы уже знаете это!",
      alreadyDesc: "Вы освоили основы. Готовы проверить навыки?",
      tutorialCompleted: "Туториал завершён ✓",
      playVsAi: "Играть против ИИ", redoTutorial: "Пройти снова",
      allDoneTitle: "Туториал завершён!",
      allDoneDesc1: "Вы выполнили {n} из {total} упражнений.",
      allDoneDesc2: "Вы знаете все правила. Готовы проверить навыки?",
      savedToProfile: "Сохранено в профиль ✓",
    },
    shop: {
      title: "Магазин обликов", subtitle: "Настройте доску и фигуры",
      proRequired: "Про облики требуют", proAccount: "аккаунт Про",
      preview: "Предпросмотр", upgradeToUnlock: "Обновить для разблокировки", unlockWithPro: "Разблокировать с Про",
      skinSaved: "Облик сохранён!", playWith: "Играть с",
    },
    pro: {
      badge: "Про план",
      title: "Выведите игру на новый уровень",
      subtitle: "Разблокируйте ИИ тренера Gemini, кастомные облики и историю.",
      free: "Бесплатно", forever: "/навсегда", best: "ЛУЧШЕЕ",
      unlockPro: "Разблокировать Про",
      welcomePro: "Добро пожаловать в Про! Все функции разблокированы ⭐",
      alreadyPro: "Вы уже являетесь участником Про!",
      startPlaying: "Начать играть",
      allFeaturesDesc: "Сложный ИИ, все облики и онлайн-мультиплеер теперь доступны.",
      freeFeatures: [
        "Против ИИ (Лёгкий и Средний)",
        "Игрок против игрока (один экран)",
        "Базовый ИИ коуч (3 совета)",
        "Глобальный рейтинг",
        "Светлая / Тёмная тема",
      ],
      proFeatureLabels: [
        "ИИ на сложном уровне",
        "Глубокий анализ Gemini",
        "Все облики фигур разблокированы",
        "Онлайн мультиплеер",
        "Приоритетные советы тренера",
      ],
      choosePlan: "Выберите план", unlockInstantly: "Мгновенно разблокируйте все функции",
      currentPlan: "Текущий план", noPayment: "Оплата не требуется · Мгновенный доступ",
      youArePro: "Вы Pro!", enjoyGame: "Все функции разблокированы. Наслаждайтесь игрой!", visitShop: "В магазин",
    },
    coach: {
      title: "ИИ Тренер", analyzing: "Анализирую вашу игру...",
      keyMoments: "{n} ключевых момента найдено",
      geminiReviewing: "Gemini просматривает вашу игру…",
      moreHidden: "{n} советов скрыто",
      upgradeForAnalysis: "Обновитесь до Про для полного анализа + Gemini",
      switchToRuleBased: "Переключить на анализ правил",
      switchToGemini: "Переключить на анализ Gemini",
      reviewMoments: "Изучите эти моменты, чтобы улучшить игру!",
      move: "Ход #", free: "Бесплатно",
      poweredByClaude: "На базе Claude", poweredByGemini: "На базе Gemini",
      tryClaude: "Попробовать Claude", tryGemini: "Попробовать Gemini",
      noInsights: "Анализ недоступен", gameAnalysis: "Анализ игры",
    },
    timer: { blitzMode: "Блиц режим" },
    profile: {
      myAccount: "Мой аккаунт", email: "Email", plan: "Тариф",
      joined: "Дата", record: "Статистика", signOut: "Выйти",
    },
    leaderboard: {
      title: "Таблица лидеров", playersRanked: "{n} игроков в рейтинге",
      searchPlayers: "Поиск игроков...", allCities: "Все города",
      noPlayersFound: "Игроки не найдены", rating: "рейтинг",
      unavailable: "Рейтинг недоступен",
      connectSupabase: "Подключите Supabase для просмотра рейтинга. Добавьте ключи в .env.local.",
    },
    skins: {
      classic: { name: "Классик",              desc: "Оригинальный вид шашек." },
      ocean:   { name: "Океан",                desc: "Глубоководные синие и бирюзовые." },
      forest:  { name: "Лес",                  desc: "Земляные зелёные и коричневые." },
      gold:    { name: "Золото и Серебро",     desc: "Премиум металлический финиш." },
      crystal: { name: "Кристалл",             desc: "Полупрозрачный фиолетовый и голубой." },
      neon:    { name: "Неоновая Ночь",        desc: "Светящийся неон на тёмной доске." },
    },
    learnSteps: [
      {
        title: "Ход фигурой",
        instructions: "Фигуры ходят только по диагонали вперёд. Нажмите на чёрную фигуру, затем на одну из светящихся точек.",
        hint: "Сначала нажмите на чёрную фигуру — светящиеся точки покажут возможные ходы.",
        success: "Отлично! Вы сделали диагональный ход вперёд. Это всё, что умеет обычная фигура.",
      },
      {
        title: "Взятие фигуры",
        instructions: "Перепрыгните через красную фигуру, чтобы захватить её! При возможности взятия вы ОБЯЗАНЫ его сделать.",
        hint: "Нажмите на чёрную фигуру — у неё есть ход через красную.",
        success: "Превосходно! Вы захватили красную фигуру, перепрыгнув через неё!",
      },
      {
        title: "Цепное взятие",
        instructions: "За один ход можно захватить несколько фигур, объединяя прыжки! Захватите обе красные фигуры.",
        hint: "Нажмите на чёрную фигуру. Она может прыгнуть дважды — берите обе!",
        success: "Невероятно! Двойное взятие за один ход — это уже мастерство!",
      },
      {
        title: "Превращение в дамку",
        instructions: "Когда фигура достигает крайней строки соперника (строка 0), она становится Дамкой ♛ и может ходить во все 4 стороны!",
        hint: "Чёрная фигура в одном шаге от верха. Ходите по диагонали в любой угол — она будет коронована.",
        success: "👑 У вас дамка! Обратите внимание на символ короны — дамки могут ходить назад.",
      },
      {
        title: "Сила дамки",
        instructions: "Дамка может ходить И брать во всех 4 диагональных направлениях — включая назад. Захватите красную фигуру позади дамки.",
        hint: "Чёрная дамка в центре. Красная фигура ниже неё. Перепрыгните через неё!",
        success: "Дамки господствуют на доске — берегите их и контролируйте оба направления!",
      },
    ],
    auth: {
      login: {
        title: "С возвращением", subtitle: "Войдите в свой аккаунт",
        email: "Email", password: "Пароль",
        signIn: "Войти", signingIn: "Вход…", retryIn: "Попробуйте через {n}с",
        noAccount: "Нет аккаунта?", signUp: "Зарегистрироваться",
        enterEmail: "Введите email.", enterPassword: "Введите пароль.",
        wrongCredentials: "Неверный email или пароль. Попробуйте снова.",
        emailNotConfirmed: "Сначала подтвердите email. Проверьте входящие.",
        tooManyAttempts: "Слишком много попыток. Подождите минуту и попробуйте снова.",
        userNotFound: "Аккаунт с таким email не найден. Хотите зарегистрироваться?",
        networkError: "Ошибка сети. Проверьте подключение и попробуйте снова.",
        didntGetEmail: "Не получили письмо? Проверьте спам или",
        clickToResend: "нажмите для повторной отправки",
        emailResent: "Письмо отправлено повторно! Проверьте входящие.",
      },
      signup: {
        title: "Создать аккаунт", subtitle: "Присоединитесь к сообществу",
        username: "Имя пользователя", city: "Город", email: "Email", password: "Пароль",
        createAccount: "Создать аккаунт", creatingAccount: "Создание аккаунта…", retryIn: "Попробуйте через {n}с",
        alreadyHaveAccount: "Уже есть аккаунт?", signIn: "Войти",
        ruleLength: "Минимум 8 символов",
        ruleUppercase: "Хотя бы 1 заглавная буква (A–Z)",
        ruleNumber: "Хотя бы 1 цифра (0–9)",
        accountCreated: "Аккаунт создан!", confirmationSent: "Ссылка подтверждения отправлена на",
        checkInbox: "Проверьте входящие (и спам) и нажмите ссылку для активации аккаунта.",
        goToLogin: "Перейти к входу",
        emailRequired: "Email обязателен.", emailInvalidAt: "Email должен содержать @.",
        emailInvalidDomain: "Email должен иметь корректный домен (например gmail.com).",
        usernameRequired: "Имя пользователя обязательно.",
        usernameMinLength: "Минимум 3 символа.",
        usernameMaxLength: "Максимум 20 символов.",
        usernameInvalidChars: "Только буквы, цифры и нижнее подчёркивание.",
        passwordWeak: "Пароль должен быть не менее 8 символов с заглавной буквой и цифрой.",
        emailAlreadyRegistered: "Этот email уже зарегистрирован. Войдите вместо этого.",
        invalidEmail: "Введите корректный email.",
        passwordTooWeak: "Пароль слишком слабый. Следуйте требованиям ниже.",
        rateLimited: "Слишком много попыток. Подождите немного.",
      },
    },
  },

  kz: {
    nav: {
      play: "Ойнау", learn: "Үйрену", leaderboard: "Рейтинг", history: "Тарих", shop: "Дүкен", pro: "Про",
      signIn: "Кіру", signOut: "Шығу", viewProfile: "Профиль",
    },
    home: {
      subtitle: "Классикалық шашка · ЖИ коучы · Онлайн ойын",
      tutorial: "Жаңадансыз ба? Интерактивті сабақты алыңыз →",
      redWins: "Қызылдар жеңді!", blackWins: "Қаралар жеңді!", draw: "Тең!",
      playAgain: "Қайталау", newSetup: "Жаңа параметрлер", moveHistory: "Жүрістер тарихы",
      viewAnalysis: "ЖИ талдауын Тарихта көру →", upgradeForAi: "ЖИ талдауы үшін Pro-ға жаңартыңыз →",
    },
    history: {
      title: "Ойын тарихы", gamesPlayed: "{n} ойын ойналды", noGames: "Әзірше ойындар жоқ. Бірінші ойыныңызды ойнаңыз!",
      signInTitle: "Тарихты көру үшін кіріңіз", signInDesc: "Ойын тарихы аккаунтыңызға сақталады.",
      proTitle: "Pro мүмкіндігі", proDesc: "Тарихты көру үшін Pro-ға жаңартыңыз.", upgradeBtn: "Pro-ға жаңарту",
      win: "Жеңіс ✓", loss: "Жеңіліс ✗", draw: "Тең", moves: "жүріс",
      vsAi: "ЖИ-ға қарсы", vsFriend: "Досқа қарсы",
    },
    setup: {
      title: "Жаңа ойын", subtitle: "Параметрлерді таңдаңыз",
      gameMode: "Ойын режимі", difficulty: "Қиындық", yourColor: "Сіздің түсіңіз", options: "Параметрлер",
      vsAi: "ЖИ-ға қарсы", twoPlayers: "2 ойыншы", online: "Онлайн",
      easy: "Оңай", medium: "Орта", hard: "Қиын",
      blackFirst: "Қара (бірінші)", redSecond: "Қызыл (екінші)",
      blitzMode: "⚡ Блиц режимі", blitzDesc: "Ойыншыға 3 минут", blitzPro: "Тек Про — жаңартыңыз",
      hardRequiresPro: "Қиын режим талап етеді", startGame: "Ойынды бастау",
      createRoom: "Бөлме жасау", orJoin: "немесе қосылу", join: "Қосылу",
      roomCodePlaceholder: "БӨЛ МЕ КОД", invalidCode: "6 таңбалы код енгізіңіз.",
      supabaseRequired: "Онлайн ойын Supabase-ті талап етеді. .env.local файлына кілттерді қосыңыз.",
      roomCreated: "Бөлмеңіз жасалды! 🎉", shareCode: "Бұл кодты досыңызбен бөлісіңіз",
      copyCode: "Кодты көшіру", waitingOpponent: "Бәсекелес күтілуде...",
      hardProFeature: "Қиын режим", blitzProFeature: "Блиц режимі",
      isProFeature: "Про мүмкіндігі.", upgrade: "Жаңарту →",
    },
    game: {
      redWins: "Қызылдар жеңді! 🎉", blackWins: "Қаралар жеңді! 🎉", draw: "Тең!",
      aiThinking: "ЖИ ойлануда...", blackTurn: "Қараның кезегі", redTurn: "Қызылдың кезегі",
      black: "Қара", red: "Қызыл", captured: "жойылды",
      newGame: "Жаңа ойын", youPlayAs: "Сіз ойнайсыз", ai: "ЖИ",
    },
    learn: {
      title: "Шашқа үйрену", subtitle: "Интерактивті қадамдық сабақ",
      stepWord: "Қадам", ofWord: "/",
      resetStep: "Қадамды қайтару", nextStep: "Келесі қадам", finishTutorial: "Сабақты аяқтау",
      alreadyTitle: "Сіз мұны білесіз!",
      alreadyDesc: "Негіздерді меңгердіңіз. Дағдыларыңызды сынауға дайынсыз ба?",
      tutorialCompleted: "Сабақ аяқталды ✓",
      playVsAi: "ЖИ-ға қарсы ойнау", redoTutorial: "Қайталау",
      allDoneTitle: "Сабақ аяқталды!",
      allDoneDesc1: "Сіз {n}/{total} жаттығуды орындадыңыз.",
      allDoneDesc2: "Барлық ережелерді білесіз. Дағдыларыңызды сынауға дайынсыз ба?",
      savedToProfile: "Профильге сақталды ✓",
    },
    shop: {
      title: "Сыртқы дүкен", subtitle: "Тақтаны және фигураларды реттеңіз",
      proRequired: "Про сыртқылар талап етеді", proAccount: "Про аккаунт",
      preview: "Алдын ала қарау", upgradeToUnlock: "Жаңарту үшін ашу", unlockWithPro: "Про-мен ашу",
      skinSaved: "Сыртқы сақталды!", playWith: "Ойнау:",
    },
    pro: {
      badge: "Про жоспар",
      title: "Ойынды жаңа деңгейге шығарыңыз",
      subtitle: "Gemini ЖИ жаттықтырушысын, арнайы сыртқыларды ашыңыз.",
      free: "Тегін", forever: "/мәңгілік", best: "ЕҢ ЖАҚСЫ",
      unlockPro: "Про-ны ашу",
      welcomePro: "Про-ға қош келдіңіз! Барлық мүмкіндіктер ашылды ⭐",
      alreadyPro: "Сіз бұрыннан Про мүшесісіз!",
      startPlaying: "Ойынды бастау",
      allFeaturesDesc: "Қиын ЖИ, барлық сыртқылар және онлайн мультиплеер қазір қолжетімді.",
      freeFeatures: [
        "ЖИ-ға қарсы (Оңай және Орта)",
        "Ойыншы мен ойыншы (бір экран)",
        "Базалық ЖИ коучы (3 кеңес)",
        "Жаһандық рейтинг",
        "Ашық / Күңгірт тақырып",
      ],
      proFeatureLabels: [
        "ЖИ қиын деңгейде",
        "Gemini терең талдауы",
        "Барлық фигура сыртқылары ашылған",
        "Онлайн мультиплеер бөлмелері",
        "Басымдықты коуч кеңестері",
      ],
      choosePlan: "Жоспарыңызды таңдаңыз", unlockInstantly: "Барлық мүмкіндіктерді бірден ашыңыз",
      currentPlan: "Ағымдағы жоспар", noPayment: "Төлем қажет емес · Бірден қол жетімді",
      youArePro: "Сіз Pro!", enjoyGame: "Барлық мүмкіндіктер ашылды. Ойынды тамашалаңыз!", visitShop: "Дүкенге өту",
    },
    coach: {
      title: "ЖИ Жаттықтырушы", analyzing: "Ойыныңызды талдап жатырмын...",
      keyMoments: "{n} негізгі сәт табылды",
      geminiReviewing: "Gemini ойыныңызды тексеруде…",
      moreHidden: "{n} кеңес жасырылды",
      upgradeForAnalysis: "Толық талдау + Gemini ЖИ үшін Про-ға жаңартыңыз",
      switchToRuleBased: "Ережелік талдауға ауысу",
      switchToGemini: "Gemini талдауына ауысу",
      reviewMoments: "Ойыныңызды жақсарту үшін осы сәттерді зерттеңіз!",
      move: "Жүріс #", free: "Тегін",
      poweredByClaude: "Claude негізінде", poweredByGemini: "Gemini негізінде",
      tryClaude: "Claude қолданып көру", tryGemini: "Gemini қолданып көру",
      noInsights: "Талдау қол жетімді емес", gameAnalysis: "Ойын талдауы",
    },
    timer: { blitzMode: "Блиц режимі" },
    profile: {
      myAccount: "Менің аккаунтым", email: "Email", plan: "Тариф",
      joined: "Күні", record: "Статистика", signOut: "Шығу",
    },
    leaderboard: {
      title: "Рейтинг кестесі", playersRanked: "{n} ойыншы рейтингте",
      searchPlayers: "Ойыншыларды іздеу...", allCities: "Барлық қалалар",
      noPlayersFound: "Ойыншылар табылмады", rating: "рейтинг",
      unavailable: "Рейтинг қолжетімсіз",
      connectSupabase: "Рейтингті көру үшін Supabase-ті қосыңыз. .env.local файлына кілттерді қосыңыз.",
    },
    skins: {
      classic: { name: "Классик",               desc: "Шашканың түпнұсқа көрінісі." },
      ocean:   { name: "Мұхит",                 desc: "Терең теңіз көк және жасыл түстері." },
      forest:  { name: "Орман",                 desc: "Жердің жасыл және қоңыр түстері." },
      gold:    { name: "Алтын және Күміс",      desc: "Премиум металл жабыны." },
      crystal: { name: "Кристалл",              desc: "Мөлдір күлгін және көгілдір." },
      neon:    { name: "Неон Түні",             desc: "Қараңғы тақтадағы жарқыраған неон." },
    },
    learnSteps: [
      {
        title: "Фигураны жылжыту",
        instructions: "Фигуралар тек диагональды алға жылжиды. Қара фигураны басыңыз, содан кейін жарқыраған нүктені басыңыз.",
        hint: "Алдымен қара фигураны басыңыз — жарқыраған нүктелер жүруге болатын жерлерді көрсетеді.",
        success: "Тамаша! Диагональды алға жылжыдыңыз. Қарапайым фигура тек осыны жасай алады.",
      },
      {
        title: "Қарсыласты алу",
        instructions: "Оны алу үшін қызыл фигураның үстінен секіріңіз! Алу мүмкіндігі болса, МІНДЕТТІ түрде жасаңыз.",
        hint: "Қара фигураны басыңыз — оның қызыл фигура үстінен секіретін бір жүрісі бар.",
        success: "Керемет! Қызыл фигураны оның үстінен секіріп алдыңыз!",
      },
      {
        title: "Тізбекті алу",
        instructions: "Бір жүрісте секірулерді байланыстырып бірнеше фигураны ала аласыз! Екі қызыл фигураны да алыңыз.",
        hint: "Қара фигураны басыңыз. Ол екі рет секіре алады — екеуін де алыңыз!",
        success: "Керемет! Бір жүрісте қос алу — бұл жоғары деңгейлі ойын!",
      },
      {
        title: "Дамкаға айналу",
        instructions: "Фигура қарсыластың соңғы жолына жеткенде (0 жол), ол ♛ Дамкаға айналады және 4 бағытта жылжи алады!",
        hint: "Қара фигура жоғарыдан бір қадамда. Диагональды кез келген бұрышқа жылжытыңыз — тәж кигізіледі.",
        success: "👑 Сізде дамка бар! Тәж белгісіне назар аударыңыз — дамкалар артқа да жылжи алады.",
      },
      {
        title: "Дамка күші",
        instructions: "Дамка 4 диагональды бағытта — артқа да қоса — жылжи ЖӘНЕ ала алады. Дамканың артындағы қызыл фигураны алыңыз.",
        hint: "Қара дамка ортада. Қызыл фигура одан төменде. Оның үстінен секіріңіз!",
        success: "Дамкалар тақтаны басқарады — оларды қорғаңыз және екі бағытты да бақылаңыз!",
      },
    ],
    auth: {
      login: {
        title: "Қош келдіңіз", subtitle: "Аккаунтыңызға кіріңіз",
        email: "Email", password: "Құпиясөз",
        signIn: "Кіру", signingIn: "Кіруде…", retryIn: "{n}с кейін қайта көріңіз",
        noAccount: "Аккаунт жоқ па?", signUp: "Тіркелу",
        enterEmail: "Email енгізіңіз.", enterPassword: "Құпиясөз енгізіңіз.",
        wrongCredentials: "Қате email немесе құпиясөз. Қайта көріңіз.",
        emailNotConfirmed: "Алдымен emailді растаңыз. Кіріс жәшігін тексеріңіз.",
        tooManyAttempts: "Тым көп әрекет. Бір минут күтіп, қайта көріңіз.",
        userNotFound: "Бұл email-мен аккаунт табылмады. Тіркелгіңіз келе ме?",
        networkError: "Желі қатесі. Қосылымды тексеріп, қайта көріңіз.",
        didntGetEmail: "Хат алмадыңыз ба? Спамды тексеріңіз немесе",
        clickToResend: "қайта жіберу үшін басыңыз",
        emailResent: "Хат қайта жіберілді! Кіріс жәшігін тексеріңіз.",
      },
      signup: {
        title: "Аккаунт жасау", subtitle: "Қауымдастыққа қосылыңыз",
        username: "Пайдаланушы аты", city: "Қала", email: "Email", password: "Құпиясөз",
        createAccount: "Аккаунт жасау", creatingAccount: "Аккаунт жасалуда…", retryIn: "{n}с кейін қайта көріңіз",
        alreadyHaveAccount: "Аккаунтыңыз бар ма?", signIn: "Кіру",
        ruleLength: "Кемінде 8 таңба",
        ruleUppercase: "Кемінде 1 бас әріп (A–Z)",
        ruleNumber: "Кемінде 1 сан (0–9)",
        accountCreated: "Аккаунт жасалды!", confirmationSent: "Растау сілтемесі жіберілді",
        checkInbox: "Кіріс жәшігін (және спамды) тексеріп, белсендіру үшін сілтемені басыңыз.",
        goToLogin: "Кіру бетіне өту",
        emailRequired: "Email міндетті.", emailInvalidAt: "Email @ белгісін қамтуы керек.",
        emailInvalidDomain: "Email дұрыс домені болуы керек (мысалы gmail.com).",
        usernameRequired: "Пайдаланушы аты міндетті.",
        usernameMinLength: "Кемінде 3 таңба болуы керек.",
        usernameMaxLength: "Ең көбі 20 таңба.",
        usernameInvalidChars: "Тек әріптер, сандар және астын сызу.",
        passwordWeak: "Құпиясөзде кемінде 8 таңба, бас әріп және сан болуы керек.",
        emailAlreadyRegistered: "Бұл email тіркелген. Кіріңіз.",
        invalidEmail: "Дұрыс email енгізіңіз.",
        passwordTooWeak: "Құпиясөз тым әлсіз. Талаптарды орындаңыз.",
        rateLimited: "Тым көп әрекет. Аздап күтіңіз.",
      },
    },
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: TRANSLATIONS.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored && stored in TRANSLATIONS) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
