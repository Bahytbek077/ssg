
import { Place, PlaceCategory, SignalType, OnboardingStep } from './types';

export const MOCK_PLACES: (Place & { nameRu: string; descRu: string; addrRu: string })[] = [
  {
    id: '1',
    name: 'Chaykhana "Vostok"',
    nameRu: 'Чайхана "Восток"',
    category: PlaceCategory.FOOD,
    description: 'Central location, wide variety of pilaf and kebabs. Friendly staff.',
    descRu: 'Центральное расположение, большой выбор плова и шашлыков. Дружелюбный персонал.',
    lat: 50.4132,
    lng: 80.2520,
    tags: ['Halal', 'Budget', 'Central'],
    signals: [SignalType.HALAL_FRIENDLY, SignalType.STUDENT_FAVORITE],
    universityVerified: true,
    address: 'Abay Street 105',
    addrRu: 'ул. Абая 105'
  },
  {
    id: '2',
    name: 'Pharmacy No. 1 (24/7)',
    nameRu: 'Аптека №1 (24/7)',
    category: PlaceCategory.MEDICAL,
    description: 'Main city pharmacy, stocks most international medicine equivalents.',
    descRu: 'Главная аптека города, есть аналоги большинства международных лекарств.',
    lat: 50.4150,
    lng: 80.2480,
    tags: ['24/7', 'English-speaking'],
    signals: [SignalType.STUDENT_FAVORITE],
    universityVerified: true,
    address: 'Shakarim Avenue 12',
    addrRu: 'пр. Шакарима 12'
  },
  {
    id: '3',
    name: 'Indus Spice Hub',
    nameRu: 'Индус Спайс Хаб',
    category: PlaceCategory.FOOD,
    description: 'Small grocery store selling imported spices from India and Pakistan.',
    descRu: 'Небольшой магазин с импортными специями из Индии и Пакистана.',
    lat: 50.4100,
    lng: 80.2600,
    tags: ['Spices', 'Grocery', 'Imported'],
    signals: [SignalType.SPICE_LEVEL_HIGH, SignalType.HALAL_FRIENDLY],
    universityVerified: false,
    address: 'International Str 45',
    addrRu: 'ул. Интернациональная 45'
  },
  {
    id: '4',
    name: 'Central Mall Food Court',
    nameRu: 'Фуд-корт Центрального Молла',
    category: PlaceCategory.HANGOUT,
    description: 'Modern hangout spot with multiple fast food chains.',
    descRu: 'Современное место для встреч с множеством сетей фастфуда.',
    lat: 50.4165,
    lng: 80.2450,
    tags: ['Wi-Fi', 'Warm'],
    signals: [SignalType.QUIET_STUDY, SignalType.SOFT_WARNING],
    universityVerified: false,
    address: 'Zataevich Street 5',
    addrRu: 'ул. Затаевича 5'
  }
];

export const ONBOARDING_DATA: (OnboardingStep & { titleRu: string; contentRu: string[]; tasksRu: { text: string; completed: boolean }[] })[] = [
  {
    id: 'o1',
    period: 'Day 1-3',
    title: 'Landing & Essentials',
    titleRu: 'Прибытие и основы',
    content: [
      'Get your SIM card at the Central Mall (Beeline/Kcell recommended).',
      'Register your residence with the International Office immediately.',
      'Withdraw local currency (Tenge) at Kaspi ATMs.'
    ],
    contentRu: [
      'Купите SIM-карту в Центральном Молле (рекомендуется Beeline/Kcell).',
      'Немедленно зарегистрируйтесь в международном отделе.',
      'Снимите местную валюту (тенге) в банкоматах Kaspi.'
    ],
    tasks: [
      { text: 'Buy local SIM card', completed: false },
      { text: 'Visit International Office', completed: false },
      { text: 'Download Kaspi.kz app', completed: false }
    ],
    tasksRu: [
      { text: 'Купить местную SIM-карту', completed: false },
      { text: 'Посетить международный отдел', completed: false },
      { text: 'Скачать приложение Kaspi.kz', completed: false }
    ]
  }
];
