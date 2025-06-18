const bcrypt = require('bcryptjs');
const { User, Tour, Booking, Review } = require('./models');
const sequelize = require('./config/database');

// Функция для генерации случайной даты в будущем
const getRandomFutureDate = (daysFromNow = 30, maxDaysFromNow = 180) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * (maxDaysFromNow - daysFromNow)) + daysFromNow;
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + randomDays);
  return futureDate;
};

// Функция для генерации случайной прошедшей даты
const getRandomPastDate = (daysAgo = 30, maxDaysAgo = 365) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * (maxDaysAgo - daysAgo)) + daysAgo;
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - randomDays);
  return pastDate;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Начинаем заполнение базы данных...');

    // Очищаем существующие данные
    await Review.destroy({ where: {}, force: true });
    await Booking.destroy({ where: {}, force: true });
    await Tour.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    console.log('🗑️ Очистили существующие данные');

    // 1. Создаем пользователей
    const users = [
      // Администратор
      {
        email: 'admin@nomadroute.kz',
        password: 'admin123',
        firstName: 'Асылбек',
        lastName: 'Назарбаев',
        role: 'admin',
        phone: '+7 701 234 5678',
        avatar: 'admin-avatar.jpg',
        isVerified: true,
        preferences: {
          notifications: true,
          language: 'ru'
        }
      },
      
      // Гиды
      {
        email: 'anna.guide@nomadroute.kz',
        password: 'guide123',
        firstName: 'Анна',
        lastName: 'Петрова',
        role: 'guide',
        phone: '+7 702 345 6789',
        avatar: 'anna.jpg',
        isVerified: true,
        preferences: {
          specialization: ['природа', 'горы', 'треккинг'],
          experience: 8,
          languages: ['русский', 'английский', 'казахский']
        }
      },
      {
        email: 'mikhail.guide@nomadroute.kz',
        password: 'guide123',
        firstName: 'Михаил',
        lastName: 'Смирнов',
        role: 'guide',
        phone: '+7 703 456 7890',
        avatar: 'mikhail.jpg',
        isVerified: true,
        preferences: {
          specialization: ['история', 'культура', 'город'],
          experience: 12,
          languages: ['русский', 'английский']
        }
      },
      {
        email: 'elena.guide@nomadroute.kz',
        password: 'guide123',
        firstName: 'Елена',
        lastName: 'Казакова',
        role: 'guide',
        phone: '+7 704 567 8901',
        avatar: 'elena.jpg',
        isVerified: true,
        preferences: {
          specialization: ['приключения', 'экстрим', 'фотография'],
          experience: 6,
          languages: ['русский', 'английский', 'немецкий']
        }
      },

      // Обычные пользователи
      {
        email: 'ivan.petrov@gmail.com',
        password: 'user123',
        firstName: 'Иван',
        lastName: 'Петров',
        role: 'user',
        phone: '+7 705 678 9012',
        isVerified: true,
        preferences: {
          interests: ['природа', 'фотография'],
          budget: 'medium'
        }
      },
      {
        email: 'maria.smirnova@gmail.com',
        password: 'user123',
        firstName: 'Мария',
        lastName: 'Смирнова',
        role: 'user',
        phone: '+7 706 789 0123',
        isVerified: true,
        preferences: {
          interests: ['культура', 'история'],
          budget: 'high'
        }
      },
      {
        email: 'alex.johnson@gmail.com',
        password: 'user123',
        firstName: 'Александр',
        lastName: 'Джонсон',
        role: 'user',
        phone: '+7 707 890 1234',
        isVerified: true,
        preferences: {
          interests: ['приключения', 'экстрим'],
          budget: 'high'
        }
      },
      {
        email: 'natasha.kim@gmail.com',
        password: 'user123',
        firstName: 'Наташа',
        lastName: 'Ким',
        role: 'user',
        phone: '+7 708 901 2345',
        isVerified: true,
        preferences: {
          interests: ['природа', 'релакс'],
          budget: 'low'
        }
      },
      {
        email: 'dmitri.volkov@gmail.com',
        password: 'user123',
        firstName: 'Дмитрий',
        lastName: 'Волков',
        role: 'user',
        phone: '+7 709 012 3456',
        isVerified: true,
        preferences: {
          interests: ['история', 'архитектура'],
          budget: 'medium'
        }
      }
    ];

    // Хешируем пароли перед созданием
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    const createdUsers = await User.bulkCreate(users, { 
      hooks: false // Отключаем хуки чтобы избежать двойного хэширования
    });
    console.log(`👥 Создано ${createdUsers.length} пользователей`);

    // Получаем гидов
    const guides = createdUsers.filter(user => user.role === 'guide');

    // 2. Создаем туры
    const tours = [
      {
        title: 'Поход к Кольсайским озерам',
        description: 'Незабываемое путешествие к трем жемчужинам Казахстана - Кольсайским озерам. Кристально чистая вода, горные пейзажи и свежий воздух ждут вас в этом удивительном месте.',
        shortDescription: 'Треккинг к трем горным озерам с потрясающими видами',
        price: 35000,
        duration: 2,
        maxGroupSize: 8,
        difficulty: 'moderate',
        category: 'природа',
        region: 'Алматинская область',
        season: ['spring', 'summer', 'autumn'],
        images: ['/uploads/tours/images-1750175308972-294962852.webp', '/uploads/tours/images-1750177988578-792732989.jpg', '/uploads/tours/images-1750185863226-684299165.jpg'],
        itinerary: {
          day1: {
            title: 'Первое озеро',
            activities: ['Переезд из Алматы', 'Треккинг к первому озеру', 'Установка лагеря', 'Рыбалка'],
            accommodation: 'Палатки у озера',
            meals: ['обед', 'ужин']
          },
          day2: {
            title: 'Второе и третье озера',
            activities: ['Подъем к второму озеру', 'Поход к третьему озеру', 'Фотосессия', 'Возвращение'],
            accommodation: null,
            meals: ['завтрак', 'обед']
          }
        },
        included: ['Транспорт', 'Гид', 'Питание', 'Снаряжение для кемпинга', 'Страховка'],
        excluded: ['Личные расходы', 'Сувениры', 'Алкогольные напитки'],
        requirements: ['Базовая физическая подготовка', 'Треккинговая обувь', 'Теплая одежда'],
        guideId: guides[0].id,
        startLocation: {
          name: 'Алматы, площадь Республики',
          coordinates: [76.9129, 43.2567]
        },
        locations: [
          {
            name: 'Первое Кольсайское озеро',
            coordinates: [78.3333, 42.9667],
            description: 'Самое доступное и большое из трех озер'
          },
          {
            name: 'Второе Кольсайское озеро',
            coordinates: [78.3167, 42.9833],
            description: 'Самое красивое озеро с бирюзовой водой'
          }
        ],
        tags: ['треккинг', 'озера', 'горы', 'природа', 'кемпинг']
      },

      {
        title: 'Большое Алматинское озеро и обсерватория',
        description: 'Однодневная экскурсия к знаменитому Большому Алматинскому озеру с посещением астрофизической обсерватории. Идеальный вариант для первого знакомства с горной природой Казахстана.',
        shortDescription: 'Горное озеро и звездная обсерватория в один день',
        price: 15000,
        duration: 1,
        maxGroupSize: 15,
        difficulty: 'easy',
        category: 'природа',
        region: 'Алматинская область',
        season: ['spring', 'summer', 'autumn'],
        images: ['/uploads/tours/avatar-1750188359556-682051753.jpg', '/uploads/tours/images-1750175308972-294962852.webp', '/uploads/tours/images-1750177988578-792732989.jpg'],
        itinerary: {
          day1: {
            title: 'БАО и обсерватория',
            activities: ['Переезд к озеру', 'Прогулка вокруг озера', 'Обед на природе', 'Посещение обсерватории', 'Возвращение'],
            accommodation: null,
            meals: ['обед']
          }
        },
        included: ['Транспорт', 'Гид', 'Обед', 'Входные билеты', 'Страховка'],
        excluded: ['Личные расходы', 'Дополнительное питание'],
        requirements: ['Удобная обувь', 'Солнцезащитные очки', 'Фотоаппарат'],
        guideId: guides[0].id,
        startLocation: {
          name: 'Алматы, площадь Республики',
          coordinates: [76.9129, 43.2567]
        },
        locations: [
          {
            name: 'Большое Алматинское озеро',
            coordinates: [76.9900, 43.0567],
            description: 'Горное озеро на высоте 2511 метров'
          },
          {
            name: 'Тянь-Шаньская астрономическая обсерватория',
            coordinates: [76.9667, 43.0500],
            description: 'Высокогорная обсерватория на высоте 2700 метров'
          }
        ],
        tags: ['однодневный', 'озеро', 'астрономия', 'горы', 'легкий']
      },

      {
        title: 'Исторический тур по Туркестану',
        description: 'Погрузитесь в богатую историю Казахстана в древнем городе Туркестан. Посетите мавзолей Ходжи Ахмеда Ясави, узнайте о Великом Шелковом пути и традициях казахского народа.',
        shortDescription: 'Путешествие по древней столице Казахстана',
        price: 45000,
        duration: 3,
        maxGroupSize: 12,
        difficulty: 'easy',
        category: 'культура',
        region: 'Туркестанская область',
        season: ['all'],
        images: ['/uploads/tours/images-1750185863226-684299165.jpg', '/uploads/tours/images-1750189057793-834424658.jpg', '/uploads/tours/images-1750234114477-690363336.jpg'],
        itinerary: {
          day1: {
            title: 'Прибытие в Туркестан',
            activities: ['Переезд в Туркестан', 'Заселение в отель', 'Обзорная экскурсия', 'Ужин в национальном ресторане'],
            accommodation: 'Отель Туркестан',
            meals: ['ужин']
          },
          day2: {
            title: 'Мавзолей и музеи',
            activities: ['Посещение мавзолея Ясави', 'Музей истории Туркестана', 'Мастер-класс по казахским ремеслам', 'Дегустация национальных блюд'],
            accommodation: 'Отель Туркестан',
            meals: ['завтрак', 'обед', 'ужин']
          },
          day3: {
            title: 'Археологические памятники',
            activities: ['Городище Культобе', 'Некрополь Алаша-хана', 'Покупка сувениров', 'Возвращение'],
            accommodation: null,
            meals: ['завтрак', 'обед']
          }
        },
        included: ['Транспорт', 'Проживание', 'Все питание', 'Гид', 'Входные билеты', 'Мастер-классы'],
        excluded: ['Личные расходы', 'Сувениры', 'Алкогольные напитки'],
        requirements: ['Удобная обувь для ходьбы', 'Головной убор', 'Уважение к религиозным традициям'],
        guideId: guides[1].id,
        startLocation: {
          name: 'Алматы, ж/д вокзал',
          coordinates: [76.9129, 43.2567]
        },
        locations: [
          {
            name: 'Мавзолей Ходжи Ахмеда Ясави',
            coordinates: [68.2500, 43.2967],
            description: 'Объект Всемирного наследия ЮНЕСКО XIV века'
          },
          {
            name: 'Городище Культобе',
            coordinates: [68.2667, 43.3000],
            description: 'Древнее поселение I-XV веков'
          }
        ],
        tags: ['история', 'культура', 'ЮНЕСКО', 'религия', 'археология']
      },

      {
        title: 'Каньон Чарын и Лунный каньон',
        description: 'Откройте для себя "Казахстанский Гранд-Каньон" - величественный Чарынский каньон и загадочный Лунный каньон. Незабываемые пейзажи и фотовозможности в одном туре.',
        shortDescription: 'Два самых красивых каньона Казахстана за один день',
        price: 20000,
        duration: 1,
        maxGroupSize: 10,
        difficulty: 'moderate',
        category: 'природа',
        region: 'Алматинская область',
        season: ['spring', 'summer', 'autumn'],
        images: ['/uploads/tours/images-1750234134666-446054157.jpg', '/uploads/tours/avatar-1750188359556-682051753.jpg', '/uploads/tours/images-1750175308972-294962852.webp'],
        itinerary: {
          day1: {
            title: 'Каньоны Чарын',
            activities: ['Ранний выезд из Алматы', 'Прогулка по Долине Замков', 'Спуск к реке Чарын', 'Обед на природе', 'Лунный каньон', 'Возвращение'],
            accommodation: null,
            meals: ['обед']
          }
        },
        included: ['Транспорт', 'Гид', 'Обед', 'Вода', 'Страховка'],
        excluded: ['Личные расходы', 'Дополнительное питание'],
        requirements: ['Удобная обувь', 'Головной убор', 'Солнцезащитный крем', 'Хорошая физическая форма'],
        guideId: guides[2].id,
        startLocation: {
          name: 'Алматы, площадь Республики',
          coordinates: [76.9129, 43.2567]
        },
        locations: [
          {
            name: 'Чарынский каньон',
            coordinates: [79.0333, 43.2167],
            description: 'Долина Замков - самая известная часть каньона'
          },
          {
            name: 'Лунный каньон',
            coordinates: [79.1000, 43.2500],
            description: 'Белые глиняные формации, напоминающие лунный пейзаж'
          }
        ],
        tags: ['каньон', 'природа', 'фотография', 'однодневный', 'пейзажи']
      },

      {
        title: 'Восхождение на пик Фурманова',
        description: 'Альпинистское приключение для опытных горовосходителей. Покорите четырехтысячник и насладитесь потрясающими видами на Тянь-Шань с высоты 4108 метров.',
        shortDescription: 'Альпинистское восхождение на четырехтысячник',
        price: 85000,
        duration: 5,
        maxGroupSize: 6,
        difficulty: 'hard',
        category: 'приключения',
        region: 'Алматинская область',
        season: ['summer'],
        images: ['/uploads/tours/images-1750177988578-792732989.jpg', '/uploads/tours/images-1750185863226-684299165.jpg', '/uploads/tours/images-1750189057793-834424658.jpg'],
        itinerary: {
          day1: {
            title: 'Переезд к базовому лагерю',
            activities: ['Переезд в ущелье Левый Талгар', 'Треккинг к базовому лагерю', 'Акклиматизация'],
            accommodation: 'Палатки',
            meals: ['обед', 'ужин']
          },
          day2: {
            title: 'Акклиматизационный выход',
            activities: ['Подъем на высоту 3500м', 'Отработка техники', 'Спуск в базовый лагерь'],
            accommodation: 'Палатки',
            meals: ['завтрак', 'обед', 'ужин']
          },
          day3: {
            title: 'Высотный лагерь',
            activities: ['Подъем в высотный лагерь (3800м)', 'Подготовка к восхождению'],
            accommodation: 'Палатки',
            meals: ['завтрак', 'обед', 'ужин']
          },
          day4: {
            title: 'День восхождения',
            activities: ['Ранний подъем', 'Восхождение на пик Фурманова', 'Спуск в базовый лагерь'],
            accommodation: 'Палатки',
            meals: ['завтрак', 'обед', 'ужин']
          },
          day5: {
            title: 'Возвращение',
            activities: ['Спуск к дороге', 'Переезд в Алматы'],
            accommodation: null,
            meals: ['завтрак', 'обед']
          }
        },
        included: ['Альпинистское снаряжение', 'Гид-инструктор', 'Все питание', 'Транспорт', 'Страховка'],
        excluded: ['Личное снаряжение', 'Личные расходы'],
        requirements: ['Опыт горовосхождений', 'Отличная физическая форма', 'Медицинская справка', 'Альпинистская страховка'],
        guideId: guides[2].id,
        startLocation: {
          name: 'Алматы, альпклуб',
          coordinates: [76.9129, 43.2567]
        },
        locations: [
          {
            name: 'Пик Фурманова',
            coordinates: [77.0833, 43.0500],
            description: 'Четырехтысячник в Заилийском Алатау'
          }
        ],
        tags: ['альпинизм', 'экстрим', 'горы', 'четырехтысячник', 'приключения']
      },

      {
        title: 'Озеро Балхаш и розовые фламинго',
        description: 'Уникальное путешествие к одному из крупнейших озер мира. Половина озера пресная, половина соленая. Наблюдение за фламинго и другими водоплавающими птицами.',
        shortDescription: 'Экотур к уникальному озеру с соленой и пресной водой',
        price: 38000,
        duration: 2,
        maxGroupSize: 12,
        difficulty: 'easy',
        category: 'природа',
        region: 'Карагандинская область',
        season: ['spring', 'summer', 'autumn'],
        images: ['/uploads/tours/images-1750189057793-834424658.jpg', '/uploads/tours/images-1750234114477-690363336.jpg', '/uploads/tours/images-1750234134666-446054157.jpg'],
        itinerary: {
          day1: {
            title: 'Прибытие к озеру',
            activities: ['Переезд к озеру Балхаш', 'Обзор уникальных свойств озера', 'Установка лагеря', 'Наблюдение за закатом'],
            accommodation: 'Юртовый лагерь',
            meals: ['обед', 'ужин']
          },
          day2: {
            title: 'Орнитологические наблюдения',
            activities: ['Ранние наблюдения за птицами', 'Фотосафари', 'Лодочная экскурсия', 'Возвращение'],
            accommodation: null,
            meals: ['завтрак', 'обед']
          }
        },
        included: ['Транспорт', 'Проживание в юртах', 'Все питание', 'Гид-орнитолог', 'Бинокли', 'Лодочная экскурсия'],
        excluded: ['Личные расходы', 'Профессиональная фототехника'],
        requirements: ['Удобная одежда', 'Головной убор', 'Солнцезащитный крем'],
        guideId: guides[0].id,
        startLocation: {
          name: 'Караганда, центр',
          coordinates: [73.1094, 49.8047]
        },
        locations: [
          {
            name: 'Озеро Балхаш',
            coordinates: [74.9833, 46.8333],
            description: 'Уникальное озеро с пресной и соленой водой'
          }
        ],
        tags: ['орнитология', 'озеро', 'экотур', 'фламинго', 'природа']
      },

      {
        title: 'Мангистау: марсианские пейзажи',
        description: 'Фантастическое путешествие по плато Устюрт и полуострову Мангышлак. Посетите Долину шаров, мечети Шопан-ата и Бекет-ата, насладитесь неземными пейзажами.',
        shortDescription: 'Космические пейзажи и древние святыни Мангистау',
        price: 95000,
        duration: 4,
        maxGroupSize: 8,
        difficulty: 'moderate',
        category: 'приключения',
        region: 'Мангистауская область',
        season: ['spring', 'autumn'],
        images: ['/uploads/tours/images-1750234114477-690363336.jpg', '/uploads/tours/images-1750234134666-446054157.jpg', '/uploads/tours/avatar-1750188359556-682051753.jpg'],
        itinerary: {
          day1: {
            title: 'Актау - Долина шаров',
            activities: ['Прилет в Актау', 'Переезд к Долине шаров', 'Исследование каменных сфер', 'Лагерь в пустыне'],
            accommodation: 'Палатки',
            meals: ['обед', 'ужин']
          },
          day2: {
            title: 'Мечеть Шопан-ата',
            activities: ['Посещение подземной мечети', 'Треккинг по каньонам', 'Наблюдение звезд'],
            accommodation: 'Палатки',
            meals: ['завтрак', 'обед', 'ужин']
          },
          day3: {
            title: 'Бекет-ата',
            activities: ['Паломничество к мечети Бекет-ата', 'Исследование пещер', 'Каспийское море'],
            accommodation: 'Гостевой дом',
            meals: ['завтрак', 'обед', 'ужин']
          },
          day4: {
            title: 'Возвращение',
            activities: ['Утренняя прогулка по побережью', 'Переезд в Актау', 'Вылет'],
            accommodation: null,
            meals: ['завтрак', 'обед']
          }
        },
        included: ['Авиаперелет', 'Транспорт 4WD', 'Все питание', 'Гид', 'Снаряжение', 'Входные билеты'],
        excluded: ['Личные расходы', 'Сувениры', 'Дополнительные экскурсии'],
        requirements: ['Хорошая физическая форма', 'Удобная обувь', 'Защита от солнца', 'Теплая одежда на ночь'],
        guideId: guides[2].id,
        startLocation: {
          name: 'Актау, аэропорт',
          coordinates: [51.0922, 43.8606]
        },
        locations: [
          {
            name: 'Долина шаров',
            coordinates: [51.5000, 44.0000],
            description: 'Уникальные каменные сферы в пустыне'
          },
          {
            name: 'Мечеть Бекет-ата',
            coordinates: [51.3000, 43.7000],
            description: 'Подземная мечеть суфийского святого'
          }
        ],
        tags: ['пустыня', 'геология', 'духовность', 'экстрим', 'уникальные пейзажи']
      }
    ];

    const createdTours = await Tour.bulkCreate(tours);
    console.log(`🏞️ Создано ${createdTours.length} туров`);

    // 3. Создаем бронирования
    const customers = createdUsers.filter(user => user.role === 'user');
    const bookings = [];

    // Генерируем случайные бронирования
    for (let i = 0; i < 15; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const tour = createdTours[Math.floor(Math.random() * createdTours.length)];
      
      const isCompleted = Math.random() > 0.4; // 60% шанс что тур завершен
      const startDate = isCompleted ? getRandomPastDate(30, 180) : getRandomFutureDate(30, 180);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + tour.duration);
      
      const participants = Math.floor(Math.random() * 4) + 1;
      const totalPrice = tour.price * participants;
      
      const statuses = isCompleted ? ['completed'] : ['pending', 'confirmed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      bookings.push({
        userId: customer.id,
        tourId: tour.id,
        startDate,
        endDate,
        participants,
        totalPrice,
        status,
        paymentStatus: status === 'completed' ? 'paid' : status === 'confirmed' ? 'paid' : 'pending',
        specialRequests: Math.random() > 0.7 ? 'Прошу учесть вегетарианское питание' : null
      });
    }

    const createdBookings = await Booking.bulkCreate(bookings);
    console.log(`📋 Создано ${createdBookings.length} бронирований`);

    // 4. Создаем отзывы для завершенных бронирований
    const completedBookings = createdBookings.filter(booking => booking.status === 'completed');
    const reviews = [];

    const reviewTemplates = [
      {
        rating: 5,
        title: 'Потрясающий тур!',
        comment: 'Невероятные впечатления! Гид был очень профессиональным, все организовано на высшем уровне. Пейзажи просто завораживают. Обязательно поеду еще раз!'
      },
      {
        rating: 5,
        title: 'Превзошло все ожидания',
        comment: 'Тур организован великолепно. Каждая минута была продумана. Особенно понравилось качество питания и профессионализм гида. Рекомендую всем!'
      },
      {
        rating: 4,
        title: 'Очень хороший тур',
        comment: 'Замечательное путешествие, много красивых мест. Единственный минус - немного устали от длинных переездов, но это мелочи по сравнению с полученными впечатлениями.'
      },
      {
        rating: 4,
        title: 'Понравилось!',
        comment: 'Хорошая организация, интересные места, приятная компания. Гид знает много интересных фактов. Немного не хватило времени на фотосессии.'
      },
      {
        rating: 3,
        title: 'Неплохо, но есть замечания',
        comment: 'В целом тур понравился, но были некоторые организационные моменты, которые можно улучшить. Места красивые, но ожидал большего от питания.'
      },
      {
        rating: 5,
        title: 'Лучший отпуск в жизни!',
        comment: 'Это было невероятно! Каждый день приносил новые открытия. Команда профессионалов, безукоризненная организация. Казахстан - удивительная страна!'
      }
    ];

    for (let booking of completedBookings) {
      if (Math.random() > 0.3) { // 70% шанс что оставили отзыв
        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
        reviews.push({
          userId: booking.userId,
          tourId: booking.tourId,
          bookingId: booking.id,
          rating: template.rating,
          title: template.title,
          comment: template.comment,
          isVerified: true,
          isPublished: true,
          likes: Math.floor(Math.random() * 10)
        });
      }
    }

    const createdReviews = await Review.bulkCreate(reviews);
    console.log(`⭐ Создано ${createdReviews.length} отзывов`);

    // Обновляем рейтинги туров
    for (let tour of createdTours) {
      const tourReviews = createdReviews.filter(review => review.tourId === tour.id);
      if (tourReviews.length > 0) {
        const averageRating = tourReviews.reduce((sum, review) => sum + review.rating, 0) / tourReviews.length;
        await tour.update({
          rating: Math.round(averageRating * 100) / 100,
          ratingCount: tourReviews.length
        });
      }
    }

    console.log('🎉 База данных успешно заполнена!');
    console.log('\n📊 Статистика:');
    console.log(`👥 Пользователи: ${createdUsers.length} (${guides.length} гидов, ${customers.length} клиентов, 1 админ)`);
    console.log(`🏞️ Туры: ${createdTours.length}`);
    console.log(`📋 Бронирования: ${createdBookings.length}`);
    console.log(`⭐ Отзывы: ${createdReviews.length}`);
    
    console.log('\n🔑 Тестовые аккаунты:');
    console.log('Админ: admin@nomadroute.kz / admin123');
    console.log('Гид: anna.guide@nomadroute.kz / guide123');
    console.log('Клиент: ivan.petrov@gmail.com / user123');

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
  }
};

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seedDatabase;