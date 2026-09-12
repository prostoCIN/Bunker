export interface TraitDefinition {
  category: "profession" | "biology" | "health" | "hobby" | "luggage" | "fact" | "special";
  categoryName: string;
  icon: string;
  value: string;
  description: string;
}

export const PROFESSIONS: { value: string; description: string }[] = [
  { value: "Хірург-травматолог", description: "Досвід складних операцій у польових умовах." },
  { value: "Інженер-електрик", description: "Здатний налагодити автономні електромережі та генератори." },
  { value: "Агроном-рослинник", description: "Спеціаліст з гідропоніки та вирощування їжі в закритому ґрунті." },
  { value: "Спецпризначенець ЗСУ", description: "Володіє навичками ближнього бою, тактичної оборони та зброї." },
  { value: "Вчитель початкових класів", description: "Педагог та психолог, вміє навчати та знімати паніку в групі." },
  { value: "Сантехнік-гідравлік", description: "Ремонтує водогін, каналізацію та системи очищення води." },
  { value: "Програміст embedded-систем", description: "Пише прошивки для контролерів та сенсорів бункера." },
  { value: "Біохімік / Фармацевт", description: "Створює ліки з підручних хімікатів та аналізує зараження." },
  { value: "Будівельник-монолітник", description: "Знає опір матеріалів, вміє укріплювати стіни та шлюзи." },
  { value: "Професійний кухар", description: "Вміє економно розподіляти пайки та готувати їстівні страви з усього." },
  { value: "Військовий психолог", description: "Спеціалізується на запобіганні конфліктам в замкненому просторі." },
  { value: "Механік дизельних двигунів", description: "Рятує генератори життєзабезпечення від поломок." },
];

export const BIOLOGY: { value: string; description: string }[] = [
  { value: "Чоловік, 25 років, репродуктивний", description: "Фізично міцний, немає генетичних вад." },
  { value: "Жінка, 23 роки, репродуктивна", description: "Здорова, готова продовжувати рід для колонії." },
  { value: "Чоловік, 34 роки, репродуктивний", description: "Атлетична статура, висока витривалість." },
  { value: "Жінка, 29 років, репродуктивна", description: "Високий імунітет, ідеальні показники здоров'я." },
  { value: "Чоловік, 48 років, безплідний", description: "Великий життєвий досвід, але не залишить нащадків." },
  { value: "Жінка, 42 роки, безплідна", description: "Досвідчена, стійка до стресу, без репродуктивного потенціалу." },
  { value: "Чоловік, 19 років, репродуктивний", description: "Юний, швидка регенерація, швидка адаптація." },
  { value: "Жінка, 26 років, вагітна (2-й місяць)", description: "Носить майбутнього первістка бункера, потребує додаткового піклування." },
];

export const HEALTH: { value: string; description: string }[] = [
  { value: "Абсолютно здоровий", description: "Жодних хронічних хвороб чи прихованих патологій." },
  { value: "Бронхіальна астма (легка форма)", description: "Потребує чистого фільтрованого повітря без пилу." },
  { value: "Цукровий діабет 2 типу", description: "Потребує контролю дієти та помірних вуглеводів." },
  { value: "Короткозорість (-3.5)", description: "Носить окуляри, при їх втраті бачить значно гірше." },
  { value: "Клаустрофобія (боязнь замкненого простору)", description: "У вузьких відсіках бункера можливі панічні атаки." },
  { value: "Ідеальний вроджений імунітет", description: "Не схильний до інфекційних захворювань." },
  { value: "Глухота на одне вухо", description: "Трохи гірше орієнтується на звук, в усьому іншому здоровий." },
  { value: "Безсоння та тривожний розлад", description: "Потребує тиші для сну або заспокійливих чаїв." },
];

export const HOBBIES: { value: string; description: string }[] = [
  { value: "Практична стрільба та догляд за зброєю", description: "У разі зовнішнього нападу може взяти до рук автомат." },
  { value: "Виживання в дикій природі (бушкрафт)", description: "Вміє добувати вогонь, фільтрувати воду і ставити пастки." },
  { value: "Радіоаматорство (Ham Radio)", description: "Вміє ловити сигнали SOS та збирати антени." },
  { value: "Гра на акустичній гітарі", description: "Підтримує моральний дух команди в похмурі вечори." },
  { value: "Теслярство та робота по дереву", description: "Майструє меблі, стелажі та укріплення." },
  { value: "Травництво та народна медицина", description: "Знає цілющі властивості сушених трав і грибів." },
  { value: "Бойове самбо / рукопашний бій", description: "Вміє нейтралізувати дебошира без зброї." },
  { value: "Електроніка та паяння мікросхем", description: "Здатний полагодити рацію або зламану плату." },
];

export const LUGGAGE: { value: string; description: string }[] = [
  { value: "Польовий набір хірургічних інструментів", description: "Стерильні скальпелі, затискачі, шовний матеріал." },
  { value: "Герметичний мішок насіння овочів (10 кг)", description: "Пшениця, соя, томати та зелень для гідропоніки." },
  { value: "Захищений військовий дозиметр-радіометр", description: "Вимірює рівень гамма та бета випромінювання." },
  { value: "Коробка сильних антибіотиків широкого спектру", description: "Вистачить на курс лікування для 8 осіб." },
  { value: "Армійський ящик інструментів та запчастин", description: "Гайкові ключі, плоскогубці, болгарка, ізоляційна стрічка." },
  { value: "Мисливська рушниця з 30 набоями", description: "Вогнепальна зброя для захисту периметра бункера." },
  { value: "Гірський велосипед з причепом", description: "Безшумний транспорт для майбутніх вилазок назовні." },
  { value: "Портативний сонячний акумулятор (Powerbank 100Ah)", description: "Здатний живити рації та медичні прилади." },
];

export const FACTS: { value: string; description: string }[] = [
  { value: "Служив на підводному човні 6 місяців", description: "Звик жити в замкненому просторі без сонячного світла." },
  { value: "Судимий за хакерство у 2020 році", description: "Зламав базу даних держструктури, шукав правду." },
  { value: "Має чорний пояс з тхеквондо", description: "Залізна дисципліна та блискавична реакція." },
  { value: "Єдиний, хто вижив в авіакатастрофі в горах", description: "Провів 3 тижні на морозі, має незламну волю." },
  { value: "Знає 5 іноземних мов", description: "Англійська, німецька, китайська, іспанська, арабська." },
  { value: "Врятував двох дітей з охопленого полум'ям будинку", description: "Готовий ризикувати життям заради інших." },
  { value: "Має вегетаріанську дієту протягом 10 років", description: "Легко переносить відсутність м'ясних консервів." },
  { value: "Виріс у родині спадкових фермерів", description: "З дитинства працює з ґрунтом, технікою та тваринами." },
];

export const SPECIAL_ACTIONS: { value: string; description: string }[] = [
  { value: "Право другого голосу", description: "Один раз за гру ваш голос на голосуванні рахується як два." },
  { value: "Обмін багажем", description: "Ви можете примусово обмінятися карткою багажу з будь-яким гравцем." },
  { value: "Шпигунський погляд", description: "Таємно подивіться одну закриту карту будь-якого гравця." },
  { value: "Лікувальна сироватка", description: "Анулює будь-яку хворобу або дефект здоров'я (собі чи союзнику)." },
  { value: "Герметичний шлюз (+1 місце)", description: "Збільшує місткість бункера на +1 особу у фіналі гри." },
  { value: "Імунітет від вигнання", description: "Один раз за гру ви можете скасувати результати голосування проти вас." },
];

export interface PlayerCharacterCard {
  id: string;
  category: "profession" | "biology" | "health" | "hobby" | "luggage" | "fact" | "special";
  categoryName: string;
  icon: string;
  value: string;
  description: string;
  isRevealedToAll: boolean;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCharacterCards(): PlayerCharacterCard[] {
  const prof = getRandomItem(PROFESSIONS);
  const bio = getRandomItem(BIOLOGY);
  const health = getRandomItem(HEALTH);
  const hobby = getRandomItem(HOBBIES);
  const luggage = getRandomItem(LUGGAGE);
  const fact = getRandomItem(FACTS);
  const special = getRandomItem(SPECIAL_ACTIONS);

  return [
    {
      id: "card_prof",
      category: "profession",
      categoryName: "Професія",
      icon: "💼",
      value: prof.value,
      description: prof.description,
      isRevealedToAll: false,
    },
    {
      id: "card_bio",
      category: "biology",
      categoryName: "Біологія",
      icon: "🧬",
      value: bio.value,
      description: bio.description,
      isRevealedToAll: false,
    },
    {
      id: "card_health",
      category: "health",
      categoryName: "Здоров'я",
      icon: "🩺",
      value: health.value,
      description: health.description,
      isRevealedToAll: false,
    },
    {
      id: "card_hobby",
      category: "hobby",
      categoryName: "Хобі та навички",
      icon: "🎯",
      value: hobby.value,
      description: hobby.description,
      isRevealedToAll: false,
    },
    {
      id: "card_luggage",
      category: "luggage",
      categoryName: "Багаж",
      icon: "🎒",
      value: luggage.value,
      description: luggage.description,
      isRevealedToAll: false,
    },
    {
      id: "card_fact",
      category: "fact",
      categoryName: "Факт з біографії",
      icon: "📜",
      value: fact.value,
      description: fact.description,
      isRevealedToAll: false,
    },
    {
      id: "card_special",
      category: "special",
      categoryName: "Спеціальна дія",
      icon: "🃏",
      value: special.value,
      description: special.description,
      isRevealedToAll: false,
    },
  ];
}
