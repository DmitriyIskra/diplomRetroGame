import Team from './Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
function upgradingCharacter(character, length) {
  for( let i = 2; i <= length; i += 1 ) { // Будет увеличивать парамеиры пока не текущий уровень + 1
    // Изменяем параметры нужное колличество раз
    character.attack = +Math.max(character.attack, character.attack * (80 + character.health) / 100).toFixed(2);
    character.defence = +Math.max(character.defence, character.defence * (80 + character.health) / 100).toFixed(2);
    character.health = character.health + 80 <= 100 ? character.health + 80 : 100;
    character.level += 1;
  };

  return character;
}

export function* characterGenerator(allowedTypes, maxLevel) {
  let character;

  // Создание персонажей сохранивших жизнь и победивших
  if(allowedTypes[0]?.position) { // Если в объекте присутствует position
    let classCharacter;
    for( let i = 0; i < allowedTypes.length - 1; i += 1) { // Перебирем персонажей
      switch (allowedTypes[i].character.type) { // когда тип активного персонажа соответствует одному из ниже перечисленных...
        case 'bowman':
          classCharacter = allowedTypes[allowedTypes.length - 1].classes.find( item => item.name === 'Bowman');
          character = new classCharacter(1);
          character.health = allowedTypes[i].character.health; // Меняем уровень жизней на актуальный
          character = upgradingCharacter(character, allowedTypes[i].character.level + 1);
          break;
        case 'daemon':
          classCharacter = allowedTypes[allowedTypes.length - 1].classes.find( item => item.name === 'Daemon');
          character = new classCharacter(1);
          character.health = allowedTypes[i].character.health; // Меняем уровень жизней на актуальный
          character = upgradingCharacter(character, allowedTypes[i].character.level + 1);
          break;
        case 'magician':
          classCharacter = allowedTypes[allowedTypes.length - 1].classes.find( item => item.name === 'Magician');
          character = new classCharacter(1);
          character.health = allowedTypes[i].character.health; // Меняем уровень жизней на актуальный
          character = upgradingCharacter(character, allowedTypes[i].character.level + 1);
          break;
        case 'swordsman':
          classCharacter = allowedTypes[allowedTypes.length - 1].classes.find( item => item.name === 'Swordsman');
          character = new classCharacter(1);
          character.health = allowedTypes[i].character.health; // Меняем уровень жизней на актуальный
          character = upgradingCharacter(character, allowedTypes[i].character.level + 1);
          break;
        case 'undead':
          classCharacter = allowedTypes[allowedTypes.length - 1].classes.find( item => item.name === 'Undead');
          character = new classCharacter(1);
          character.health = allowedTypes[i].character.health; // Меняем уровень жизней на актуальный
          character = upgradingCharacter(character, allowedTypes[i].character.level + 1);
          break;
        case 'vampire':
          classCharacter = allowedTypes[allowedTypes.length - 1].classes.find( item => item.name === 'Vampire');
          character = new classCharacter(1);
          character.health = allowedTypes[i].character.health; // Меняем уровень жизней на актуальный
          character = upgradingCharacter(character, allowedTypes[i].character.level + 1);
          break;
      } 
    }
  } else {
    // Создание новых персонажей в добавок к сохранившим жизнь и победившим
    const randomlevel = Math.floor(Math.random() * maxLevel + 1);
    const randomIndexCharacter = Math.floor(Math.random() * allowedTypes.length);
    console.log(randomlevel)
    if(randomlevel > 1) { // Если максимальный уровень передан больше 1
      // увеличиваем параметры по формулам, а в levelUp этого делать не нужно
      character = new allowedTypes[randomIndexCharacter](1); // Создаем
      character = upgradingCharacter(character, randomlevel);  // Повышаем

      
    } else {
      character = new allowedTypes[randomIndexCharacter](randomlevel); // создаем если передан или сгенирирован уровень 1
    }

  }

  yield character;

  // TODO: write logic here
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const characters = [];

  for (let i = 0; i < characterCount; i += 1) {
    const generator = characterGenerator(allowedTypes, maxLevel);
    characters.push(generator.next().value);
  }

  const team = new Team(characters);
  return team;
  // TODO: write logic here
}

// debugger;