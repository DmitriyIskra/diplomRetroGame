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
export function* characterGenerator(allowedTypes, maxLevel) {
  const randomlevel = Math.floor(Math.random() * maxLevel + 1);
  const randomIndexCharacter = Math.floor(Math.random() * allowedTypes.length);

  yield new allowedTypes[randomIndexCharacter](randomlevel);

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
