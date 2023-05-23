import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Magician from './characters/magician';
import Swordsman from './characters/swordsman';
import Undead from './characters/undead';
import Vampire from './characters/vampire';
import { generateTeam } from './generators';
import GameState from './GameState';
import GamePlay from './GamePlay';
import ComputerLogic from './computerLogic';

const playerClasses = [Bowman, Swordsman, Magician];
const enemyClasses = [Daemon, Undead, Vampire];

// оставляет лишнее выделение после ошибки о невозможности ходо

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.computerLogic = null;
    this.gameState = null;
    this.stateService = stateService;
    this.counterLevel = 0;
    this.lastIndex = null;
    this.placesForPlayer = null;
    this.placesForEnemy = null;
    this.cellsForSteps = new Set();
    this.cellsForAttack = new Set();
    this.activeCharacter = null;
    this.targetCharacter = null;
    this.gameStop = false;
  }

  init() {
    this.gamePlay.drawUi('prairie');

    this.computerLogic = new ComputerLogic(
      this.gamePlay,
      this.toNull.bind(this),
      this.levelUp.bind(this),
    );

    this.gameState = new GameState();
    this.gameState.activeTheme = 'prairie';

    // Генерация персонажей и позиций для отрисовки
    this.generateTeamsAndPositions();

    // Отрисовка
    this.gamePlay.redrawPositions(this.arrayPositionedCharacter);

    // Добавление в логику компьютера персонажей и позиций
    this.computerLogic.init(this.arrayPositionedCharacter);

    // Какой игрок сейчас ходит
    GameState.from({ gamer: 'player' });

    // Сохраняем уровень
    this.gameState.level = 1;

    this.addListeners();
    
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  addListeners() { // <- что это за метод и где это нужно сделать решите сами
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
  }

  onCellClick(index) {
    // Блокировка поля
    if (this.gameStop) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.deselectCell(index);
      return;
    }

    // Объект выбранного персонажа (для старта игры когда персонаж еще не выбран)
    if (this.gamePlay.cells[index].children.length > 0) {
      const temporary = this.arrayPositionedCharacter.find((el) => el.position === index);
      if (this.validateCharacter(temporary.character)) {
        this.activeCharacter = temporary;
      }
    }

    // Если в ячейке враг мы его отбираем, и будем также использовать для валидации
    if (this.gamePlay.cells[index].children.length > 0) {
      const temporaryForEnemy = this.arrayPositionedCharacter.find((el) => el.position === index);
      if (temporaryForEnemy.character.gamer === 'enemy') {
        this.targetCharacter = temporaryForEnemy;
      } else {
        this.targetCharacter = null;
      }
    }

    // При старте игры когда пероснаж не выбран при клике на пустую ячейку
    //  ничего не должно происходить, не должно выдавать ошибок
    if (!this.targetCharacter
       && !this.activeCharacter
        && this.gamePlay.cells[index].children.length === 0) {
      return;
    } if (this.targetCharacter
       && !this.activeCharacter
        && this.gamePlay.cells[index].children.length > 0) {
      GamePlay.showError('Вы не можете управлять персонажем противника');
    }

    // Перемещение персонажа
    if ((this.lastIndex || this.lastIndex === 0)
     && [...this.cellsForSteps].includes(index)
     && this.gamePlay.cells[index].children.length === 0
     && GameState.queue.gamer === 'player') {
      this.gamePlay.deselectCell(this.lastIndex);
      this.gamePlay.selectCell(index); // после хода выделение исчезает

      this.activeCharacter.position = index; // изменение позиции выбранного персонажа в объекте
      this.gamePlay.redrawPositions(this.arrayPositionedCharacter); // перерисовка поля

      this.cellsForSteps.clear();
      this.cellsForAttack.clear();
      // пересобираем ячейки досступные для хода, после хода
      this.generateArrayForSteps(
        index,
        this.activeCharacter.character.step,
        this.gamePlay.boardSize,
      );
      // пересобираем ячейки досступные для атаки после хода
      this.generateArrayForAttack(
        index,
        this.activeCharacter.character.stepAttack,
        this.gamePlay.boardSize,
      );

      GameState.from({ gamer: 'enemy' });

      this.computerLogic.stepCharacter();

      this.levelUp();                                  // Персонаж выбран
    } else if ((this.lastIndex || this.lastIndex === 0)
    && this.gamePlay.cells[index].children.length === 0 // ячейка не содержит персонаж
    && ![...this.cellsForSteps].includes(index)) {
      GamePlay.showError('Вы не можете идти сюда, это слишком далеко для одного хода');
    }

    // Атака на противника
    // Если персонаж выбран и ячейка по которой был клик есть
    //  в списке для атаки и персонаж в ней враг
    if ((this.lastIndex || this.lastIndex === 0) 
    && [...this.cellsForAttack].includes(index) 
    && this.targetCharacter && GameState.queue.gamer === 'player') {
       // выщитываем урон
      const damage = Math.round(Math.max(this.activeCharacter.character.attack - this.targetCharacter.character.defence, this.activeCharacter.character.attack * 0.1));

      (async () => {
        await this.gamePlay.showDamage(index, damage); // функция для визуализации урона

        this.targetCharacter.character.health -= damage; // вычитаем из жизни атакуемого епрсонажа урон
        if (this.targetCharacter.character.health > 0) { // если жизни еще остались
          this.gamePlay.redrawPositions(this.arrayPositionedCharacter);
          this.targetCharacter = null; // обнуляем выбранный вражесский персонаж
          GameState.from({ gamer: 'enemy' });
          this.computerLogic.stepCharacter();
        } else if (this.targetCharacter.character.health <= 0) { // если жизни закончились
          // В общем массиве находим индекс персонажа который был повержен
          const indexCharacter = this.arrayPositionedCharacter.findIndex((item) => item.position === this.targetCharacter.position);
          this.arrayPositionedCharacter.splice(indexCharacter, 1); // удаляем поверженый персонаж из общего массива
          this.gamePlay.redrawPositions(this.arrayPositionedCharacter); // перерисовываем

          // Находим индекс персонажа в массиве персонажей компьютера
          const indexCharacterComp = this.computerLogic.arrayCharacters.findIndex((item) => item.position === this.targetCharacter.position);

          if (indexCharacterComp || indexCharacterComp === 0) {
            this.computerLogic.arrayCharacters.splice(indexCharacterComp, 1);
          }

          this.targetCharacter = null; // обнуляем выбранный вражесский персонаж

          GameState.from({ gamer: 'enemy' }); // меняем gamer

          if (this.computerLogic.arrayCharacters.length > 0) {
            this.computerLogic.stepCharacter();
          }

          this.levelUp();
        }
      })();
    }

    // Выделение выбранного персонажа цветом, если персонаж еще не выбран
    if ((this.lastIndex || this.lastIndex === 0) && !this.targetCharacter) { // Персонаж уже был выбран и в ячейке по которой произошел клик нет врага
      this.gamePlay.deselectCell(this.lastIndex);
      this.gamePlay.selectCell(index);
      this.lastIndex = index;

      this.generateArrayForSteps(index, this.activeCharacter.character.step, this.gamePlay.boardSize); // Собираем ячейки досступные для хода если выбирается другой персонаж
      this.generateArrayForAttack(index, this.activeCharacter.character.stepAttack, this.gamePlay.boardSize); // Собираем ячейки досступные для атаки если выбирается другой персонаж
    } else if (!this.lastIndex && !this.targetCharacter) {
      this.gamePlay.selectCell(index);
      this.lastIndex = index;

      this.generateArrayForSteps(index, this.activeCharacter.character.step, this.gamePlay.boardSize); // Собираем ячейки досступные для хода
      this.generateArrayForAttack(index, this.activeCharacter.character.stepAttack, this.gamePlay.boardSize); // Собираем ячейки досступные для атаки
    }

    // Ошибка если произошел клик по врагу который находится вне зоны досягаемости и персонаж выбран
    if (this.activeCharacter && this.targetCharacter && ![...this.cellsForAttack].includes(index)) {
      GamePlay.showError('Враг слишком далеко');
      this.targetCharacter = null;
    }

    // TODO: react to click
  }

  onCellEnter(index) {
    // Объект персонажа находящегося в ячейке на которую наведен курсор (если он там есть)
    const character = this.arrayPositionedCharacter.find((el) => el.position === index);

    // Блокировка поля
    if (this.gameStop) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.deselectCell(index);

      return;
    }

    // Вывод сообщения о персонаже
    if (this.gamePlay.cells[index].children.length > 0) {
      const message = this.generateMessageForTitle(character.character);
      this.gamePlay.showCellTooltip(message, index);

      this.gamePlay.setCursor('pointer');
    }

    // Курсор недопустимое действие при наведении на клетку куда нельзя шагать (ячейка не входит в допустимые)
    if (![...this.cellsForSteps].includes(index) // ячейка не входит в допустимые
    && this.gamePlay.cells[index].children.length === 0 // ячейка пустая
    && (this.lastIndex || this.lastIndex === 0)) { // персонаж выбран
      this.gamePlay.setCursor('not-allowed');
    }// Подсвечивание ячеек и изменение курсора доступных для выбора
    else if ([...this.cellsForSteps].includes(index) && this.gamePlay.cells[index].children.length === 0 && (this.lastIndex || this.lastIndex === 0)) {
      this.gamePlay.selectCell(index, 'green');
      this.gamePlay.setCursor('pointer');
      this.lastIndexEnter = index;
    }

    // Смена курсора на недопустимое действие при наведении на противника за пределами досягаемости
    if ((this.lastIndex || this.lastIndex === 0) // Персонаж выбран
    && ![...this.cellsForAttack].includes(index) // Враг за пределами допустимых ячеек
    && this.lastIndex !== index // Это не наш выбранный персонаж
    && this.gamePlay.cells[index].children.length > 0 // В ячейке есть враг
    && character.character.gamer !== 'player') { // В ячейке персонаж врага
      this.gamePlay.setCursor('not-allowed');
    }// Подсвечивание ячеек и изменение курсора доступных для атаки
    else if ([...this.cellsForAttack].includes(index)
    && this.gamePlay.cells[index].children.length > 0
    && character.character.gamer !== 'player') {
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor('crosshair');
      this.lastIndexEnter = index;
    }
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // Блокировка поля
    if (this.gameStop) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.deselectCell(index);
      return;
    }

    const character = this.arrayPositionedCharacter.find((el) => el.position === index); // персонаж который находится в покинутой ячейке

    this.gamePlay.setCursor('auto');

    if (this.gamePlay.cells[index].children.length > 0) {
      this.gamePlay.hideCellTooltip(index);
    }

    if ((this.lastIndexEnter || this.lastIndexEnter === 0) // прошлая ячейка на которой был курсор содержит значение или 0
    && this.gamePlay.cells[index].children.length === 0) { // ячейка не содержит персонаж
      this.gamePlay.deselectCell(index);
    }

    if (character && character.character.gamer === 'enemy') {
      this.gamePlay.deselectCell(index);
    }
    // TODO: react to mouse leave
  }

  newGame() {
    this.toNull();

    this.gameStop = false;

    this.counterLevel = 0;

    this.gamePlay.drawUi('prairie');

    this.generateTeamsAndPositions();

    // Отрисовка
    this.gamePlay.redrawPositions(this.arrayPositionedCharacter);

    // Добавление в логику компьютера персонажей и позиций
    this.computerLogic.init(this.arrayPositionedCharacter);

    // Какой игрок сейчас ходит
    GameState.from({ gamer: 'player' });

    // Присваиваем первый уровень
    this.gameState.level = 1;
  }


  // Поднимаем уровень и выполняем сопутствующие действия
  levelUp() {
    const charactersPlayer = this.arrayPositionedCharacter.filter((item) => item.character.gamer === 'player');
    const charactersEnemy = this.arrayPositionedCharacter.filter((item) => item.character.gamer === 'enemy');

    const themes = ['prairie', 'desert', 'arctic', 'mountain'];

    // Начало блокировки поля и всех действий при конце игры
    if ((charactersEnemy.length === 0 || charactersPlayer.length === 0) && this.counterLevel === 3) {
      this.gameStop = true;
      this.gamePlay.cells.forEach((item) => {
        if (item.matches('.selected-yellow')) {
          item.classList.remove('selected-yellow');
        }

        charactersEnemy.length === 0 ? this.gameState.playerBalls += 1 : this.enemyBalls += 1;
      });
      return;
    }

    // Меняем параметры
    if (charactersEnemy.length === 0 && charactersPlayer.length > 0) {
      // console.log('player win')

      this.gameState.playerBalls += 1;

      this.toNull(); // Обнуляем игрока player

      this.counterLevel += 1; // повышаем уровень игры

      // Количество игроков (рандом)
      // рандомное число для формирования колличества персонажей для каждой команды (не общее)
      // !!!!!!!!!!!!!!!!!! МИНИМАЛЬНОЕ КОЛИЧЕСТВО ДОЛЖНО БЫТЬ РАВНО ОСТАТКУ ПЕРСОНАЖЕЙ
      const randonAmountCharacters = Math.floor(Math.random() * (this.placesForPlayer.length - charactersPlayer.length + 1) + charactersPlayer.length);
      
      // const randonAmountCharacters = 2; // можно выбрать чтоб быстрей потестить
      const addCharacters = randonAmountCharacters - charactersPlayer.length;

      // Команды игроков
      this.gameState.teamPlayer = null;
      charactersPlayer.push({ classes: playerClasses }); // добавляем массив классов
      if (addCharacters > 0) { // Если нужно добавить персонажей, формируем их
        this.gameState.teamPlayer = generateTeam(playerClasses, this.counterLevel, addCharacters); // персонажи новые поэтому 1й уровень
        const result = generateTeam(charactersPlayer, this.counterLevel, charactersPlayer.length - 1); // Формируем персонажи те чтовыжили

        result.characters.forEach((item) => this.gameState.teamPlayer.characters.push(item)); // Пушим в teamPlayer
        // this.gameState.teamPlayer.characters.push()
      } else {
        this.gameState.teamPlayer = generateTeam(charactersPlayer, this.counterLevel, charactersPlayer.length - 1); // Формируем персонажи те чтовыжили
      }

      this.gameState.teamEnemy = null;
      this.gameState.teamEnemy = generateTeam(enemyClasses, this.counterLevel + 1, randonAmountCharacters); // как в рандом, так и формируем

      // Уникальные позиции для расстановки
      const positionsForPlayer = this.placementPositionGenerator(this.placesForPlayer, randonAmountCharacters);
      const positionsForEnemy = this.placementPositionGenerator(this.placesForEnemy, randonAmountCharacters);

      // Массив для отрисовки
      this.arrayPositionedCharacter = null;
      this.arrayPositionedCharacter = this.genArrayPositionedCharacter(this.gameState.teamPlayer, this.gameState.teamEnemy, positionsForPlayer, positionsForEnemy);

      // Обнуляем параметры логики компьютера
      this.computerLogic.cellsForSteps.clear();
      this.computerLogic.cellsForAttack.clear();
      this.attackedСharacter = null;

      // Передаем новый набор персонажей с новыми стартовыми позициями
      this.computerLogic.init(this.arrayPositionedCharacter);

      // от уровня игры меняем поле

      // отрисовка поля
      this.gamePlay.drawUi(themes[this.counterLevel]);

      // Отрисовка персонажей
      this.gamePlay.redrawPositions(this.arrayPositionedCharacter);

      // Сохраняем текущую тему
      this.gameState.activeTheme = themes[this.counterLevel];

      // Сохраняем новый уровень
      this.gameState.level = this.gameState.level + 1;

      // Какой игрок сейчас ходит
      GameState.from({ gamer: 'player' });
    } else if (charactersEnemy.length > 0 && charactersPlayer.length === 0) {
      // console.log('enemy win')

      this.gameState.enemyBalls += 1;

      this.counterLevel += 1; // повышаем уровень игры

      // Количество игроков (рандом)
      // рандомное число для формирования колличества персонажей для каждой команды (не общее)
      // !!!!!!!!!!!!!!!!!! МИНИМАЛЬНОЕ КОЛИЧЕСТВО ДОЛЖНО БЫТЬ РАВНО ОСТАТКУ ПЕРСОНАЖЕЙ
      const randonAmountCharacters = Math.floor(Math.random() * (this.placesForPlayer.length - charactersPlayer.length + 1) + charactersPlayer.length);
      // const randonAmountCharacters = 2; // можно выбрать чтоб быстрей потестить
      const addCharacters = randonAmountCharacters - charactersEnemy.length; // сколько персонажей добавить к выжившим

      // Команды игроков
      this.gameState.teamEnemy = null;
      charactersEnemy.push({ classes: enemyClasses }); // добавляем массив классов
      if (addCharacters > 0) { // Если нужно добавить персонажей, формируем их
        this.gameState.teamEnemy = generateTeam(enemyClasses, this.counterLevel, addCharacters); // персонажи новые поэтому 1й уровень
        const result = generateTeam(charactersEnemy, this.counterLevel, charactersEnemy.length - 1); // Формируем персонажи те чтовыжили

        result.characters.forEach((item) => this.gameState.teamEnemy.characters.push(item)); // Пушим в teamPlayer
      } else {
        this.gameState.teamEnemy = generateTeam(charactersEnemy, this.counterLevel, charactersEnemy.length - 1); // Формируем персонажи те чтовыжили
      }

      this.gameState.teamPlayer = null;
      this.gameState.teamPlayer = generateTeam(playerClasses, this.counterLevel + 1, randonAmountCharacters); // как в рандом, так и формируем

      // Уникальные позиции для расстановки
      const positionsForPlayer = this.placementPositionGenerator(this.placesForPlayer, randonAmountCharacters);
      const positionsForEnemy = this.placementPositionGenerator(this.placesForEnemy, randonAmountCharacters);

      // Массив для отрисовки
      this.arrayPositionedCharacter = null;
      this.arrayPositionedCharacter = this.genArrayPositionedCharacter(this.gameState.teamPlayer, this.gameState.teamEnemy, positionsForPlayer, positionsForEnemy);

      // Обнуляем параметры логики компьютера
      this.computerLogic.cellsForSteps.clear();
      this.computerLogic.cellsForAttack.clear();
      this.attackedСharacter = null;

      // Передаем новый набор персонажей с новыми стартовыми позициями
      this.computerLogic.init(this.arrayPositionedCharacter);

      // от уровня игры меняем поле
      // if(this.counterLevel < 4) { // Если this.counterLevel превышает количество тем, поле не меняем
      this.gamePlay.drawUi(themes[this.counterLevel]);
      // }

      this.gameState.activeTheme = themes[this.counterLevel];

      // Сохраняем новый уровень
      this.gameState.level = this.gameState.level + 1;

      // Отрисовка
      this.gamePlay.redrawPositions(this.arrayPositionedCharacter);

      // Какой игрок сейчас ходит
      GameState.from({ gamer: 'player' });
    }
  }

  // Обнуляет все параметры при смерти персонажа player
  toNull() { 
    this.lastIndex = null;
    this.cellsForSteps.clear();
    this.cellsForAttack.clear();
    this.activeCharacter = null;
    this.targetCharacter = null;
  }

  generateArrayForSteps(indexCell, steps, borderSize) {
    this.cellsForSteps.clear();

    for (let i = 1; i <= steps; i += 1) {
      let result = indexCell + borderSize * i;
      if (result < 8 ** 2) {
        this.cellsForSteps.add(result); // ячейки вниз

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForSteps.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForSteps.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell - borderSize * i;
      if (result >= 0) {
        this.cellsForSteps.add(result); // ячейки вверх

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForSteps.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForSteps.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell + i;
      if (result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {
        this.cellsForSteps.add(result); // ячейки вправо
      }

      result = indexCell - i;
      if (result >= this.calcFiniteIndexSIde(indexCell, borderSize)[0]) {
        this.cellsForSteps.add(result); // ячейки влево
      }
    }
  }

  generateArrayForAttack(indexCell, steps, borderSize) {
    this.cellsForAttack.clear();

    for (let i = 1; i <= steps; i += 1) {
      let result = indexCell + borderSize * i;
      if (result < 8 ** 2) {
        this.cellsForAttack.add(result); // ячейки вниз

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForAttack.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForAttack.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell - borderSize * i;
      if (result >= 0) {
        this.cellsForAttack.add(result); // ячейки вверх

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForAttack.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForAttack.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell + i;
      if (result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {
        this.cellsForAttack.add(result); // ячейки вправо
      }

      result = indexCell - i;
      if (result >= this.calcFiniteIndexSIde(indexCell, borderSize)[0]) {
        this.cellsForAttack.add(result); // ячейки влево
      }
    }
  }

  // Вычисляет самый крайний левый индекс в ряду
  calcFiniteIndexSIde(index, boardSize) {
    let left = index; // самая левая ячейка в ряду
    let right = index; // самая правая ячейка в ряду

    for (let i = 0; i < boardSize; i += 1) {
      if (left % boardSize !== 0) {
        left -= 1;
      }

      if ((right - (boardSize - 1)) % boardSize !== 0) {
        right += 1;
      }
    }

    return [left, right];
  }

  // Проверяем своего ли персонажа выбрал игрок
  validateCharacter(character) { 
    // игрок может выбрать персонажа только если сейчас его ход
    if (GameState.queue.gamer === 'player') { 
      return playerClasses.some((item) => new item().type === character.type);
    }

    // if(GameState.queue.gamer === 'enemy') {
    //   return enemyClasses.some( item => item.type === character.type);
    // }
  }

  // Создаем массив персонажей и позиций для this.gamePlay.redrawPositions(tu)
  genArrayPositionedCharacter(teamPlayer, teamEnemy, positionsForPlayer, positionsForEnemy) { 
    const arr = [];

    for (let i = 0; i <= positionsForPlayer.length - 1; i += 1) {
      arr.push(new PositionedCharacter(teamPlayer.characters[i], positionsForPlayer[i]));
    }

    for (let i = 0; i <= positionsForEnemy.length - 1; i += 1) {
      arr.push(new PositionedCharacter(teamEnemy.characters[i], positionsForEnemy[i]));
    }

    return arr;
  }

  // рандомные позиции для расстановки, в зависимости от количества персонажей
  placementPositionGenerator(places, amountCharacters) { 
    const positions = new Set();

    for (let i = 0; positions.size <= amountCharacters - 1; i += 1) {
      const rundomNum = Math.floor(Math.random() * places.length);

      positions.add(places[rundomNum]);
    }

    return Array.from(positions);
  }

  generatePlaces(team, boardSize) { // Генерация доступных позиций для игрока или врага
    const acc = [];
    if (team === 'player') {
      for (let i = 0; i <= boardSize * (boardSize - 1); i += boardSize) {
        acc.push(i);
        acc.push(i + 1);
      }
      return acc;
    }

    for (let i = 0; i <= boardSize * (boardSize - 1); i += boardSize) {
      acc.push(i + (boardSize - 1));
      acc.push(i + (boardSize - 2));
    }

    return acc;
  }

  generateMessageForTitle(character) { // Создает сообщение с информацией о персонаже для title
    const message = `\u{1F396}${character.level} \u{2694}${character.attack} \u{1F6E1}${character.defence} \u{2764}${character.health}`;

    return message;
  }

  generateTeamsAndPositions() {
    // Доступные позиции для игроков на поле для статрта
    this.placesForPlayer = this.generatePlaces('player', this.gamePlay.boardSize);
    this.placesForEnemy = this.generatePlaces('enemy', this.gamePlay.boardSize);

    // Количество игроков (рандом)
    // рандомное число для формирования колличества персонажей для каждой команды (не общее)
    // const randonAmountCharacters = Math.floor(Math.random() * this.placesForPlayer.length + 1);
    const randonAmountCharacters = 2; // можно выбрать чтоб быстрей потестить
    // Команды игроков
    this.gameState.teamPlayer = generateTeam(playerClasses, 1, randonAmountCharacters);
    this.gameState.teamEnemy = generateTeam(enemyClasses, 1, randonAmountCharacters);

    // Уникальные позиции для расстановки
    const positionsForPlayer = this.placementPositionGenerator(this.placesForPlayer, randonAmountCharacters);
    const positionsForEnemy = this.placementPositionGenerator(this.placesForEnemy, randonAmountCharacters);

    // Массив для отрисовки
    this.arrayPositionedCharacter = this.genArrayPositionedCharacter(this.gameState.teamPlayer, this.gameState.teamEnemy, positionsForPlayer, positionsForEnemy);
  }

  saveGame() {
    this.gameState.charactersAndPositions = this.arrayPositionedCharacter;
    this.gameState.level = this.counterLevel;
    this.stateService.save(this.gameState);
  }

  loadGame() {
    this.gameStop = false;

    const result = this.stateService.load();

    this.arrayPositionedCharacter = result.charactersAndPositions;
    this.counterLevel = result.level;
    this.gamePlay.playerBalls = result.playerBalls;
    this.gamePlay.enemyBalls = result.enemyBalls;

    this.gamePlay.drawUi(result.activeTheme);
    this.gamePlay.redrawPositions(this.arrayPositionedCharacter);

    // Доделать остальное в том числе и комп (додобавить везде необхъодимые данные)
    // Добавление в логику компьютера персонажей и позиций
    this.computerLogic.init(this.arrayPositionedCharacter);

    // Какой игрок сейчас ходит
    GameState.from({ gamer: 'player' });
  }
}

// debugger;
