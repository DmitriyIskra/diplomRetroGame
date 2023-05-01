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
import cursors from './cursors';
import calcTileType from './utils'
import ComputerLogic from './computerLogic';


const playerClasses = [Bowman, Swordsman, Magician];
const enemyClasses = [Daemon, Undead, Vampire];



export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.computerLogic = null;
    this.stateService = stateService;
    this.lastIndex = null;
    this.cellsForSteps = new Set();
    this.cellsForAttack = new Set();
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.computerLogic = new ComputerLogic(this.gamePlay)
    // Доступные позиции для игроков на поле для статрта
    this.placesForPlayer = this.generatePlaces('player', this.gamePlay.boardSize);
    this.placesForEnemy = this.generatePlaces('enemy', this.gamePlay.boardSize);

    // Количество игроков (рандом)
    const randonAmountCharacters = Math.floor(Math.random() * this.placesForPlayer.length + 1); // рандомное число для формирования колличества персонажей

    // Команды игроков
    this.teamPlayer = generateTeam(playerClasses, 1, randonAmountCharacters);
    this.teamEnemy = generateTeam(enemyClasses, 1, randonAmountCharacters);

    // Уникальные позиции для расстановки
    const positionsForPlayer = this.placementPositionGenerator(this.placesForPlayer, randonAmountCharacters);
    const positionsForEnemy = this.placementPositionGenerator(this.placesForEnemy, randonAmountCharacters);

    // Массив для отрисовки
    this.arrayPositionedCharacter = this.genArrayPositionedCharacter(this.teamPlayer, this.teamEnemy, positionsForPlayer, positionsForEnemy);

    // Отрисовка
    this.gamePlay.redrawPositions(this.arrayPositionedCharacter);

    // Какой игрок сейчас ходит
    GameState.from({gamer: 'player'});

    this.addListeners()
    
    this.computerLogic.init(this.arrayPositionedCharacter);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }


  addListeners() { // <- что это за метод и где это нужно сделать решите сами    
        this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
        this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this)); 
        this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this))
  }

  onCellClick(index) {
    // Объект выбранного персонажа
    const character = this.arrayPositionedCharacter.find((el) => el.position === index);

    // При старте игры когда пероснаж не выбран при клике на пустую ячейку ничего не должно происходить, не должно выдавать ошибок
    if(!this.lastIndex && this.gamePlay.cells[index].children.length === 0) {
      return;
    }

    // Перемещение персонажа
    if(this.lastIndex && [...this.cellsForSteps].includes(index) && this.gamePlay.cells[index].children.length === 0) {
      let character = this.arrayPositionedCharacter.find((el) => el.position === this.lastIndex); // отбор выбранного персонажа
      character.position = index; // изменение позиции выбранного персонажа в объекте
      this.gamePlay.redrawPositions(this.arrayPositionedCharacter); // перерисовка поля

      this.gamePlay.deselectCell(this.lastIndex); /// ???????????????????
      this.gamePlay.deselectCell(index);

      this.generateArrayForSteps(index, character.character.step, this.gamePlay.boardSize); // пересобираем ячейки досступные для хода, после хода
      this.generateArrayForAttack(index, character.character.stepAttack, this.gamePlay.boardSize); // пересобираем ячейки досступные для атаки после хода

      this.computerLogic.stepCharacter(this.gamePlay.boardSize, this.gamePlay.cells, this.arrayPositionedCharacter);
      character = null
      this.cellsForSteps.clear()
      this.cellsForAttack.clear()
      this.lastIndex = null;
      return;
    }

    // Ошибка если произошел клик по ячейке которая находится вне зоны досягаемости
    if(this.lastIndex // Персонаж выбран
    && this.gamePlay.cells[index].children.length === 0 // ячейка не содержит персонаж
    && ![...this.cellsForSteps].includes(index)) { // ячейка за пределами зоны куда может шагать персонаж
      GamePlay.showError('Вы не можете идти сюда, это слишком далеко для одного хода');
      this.gamePlay.selectCell(this.lastIndex);
      return;
    }

    // Выделение выбранного персонажа цветом 
    if(this.validateCharacter(character.character)) {
      this.gamePlay.selectCell(index);
      this.lastIndex = index;

      this.generateArrayForSteps(index, character.character.step, this.gamePlay.boardSize); // Собираем ячейки досступные для хода
      this.generateArrayForAttack(index, character.character.stepAttack, this.gamePlay.boardSize); // Собираем ячейки досступные для атаки
    } else if(!this.lastIndex) { // ошибка если персонаж не был выбран, а пользователь кликнул по персонажу компьютера
      GamePlay.showError('Вы не можете управлять персонажем противника');
    }

    // Ошибка если произошел клик по врагу который находится вне зоны досягаемости и персонаж выбран
    if(this.lastIndex && ![...this.cellsForAttack].includes(index) && character.character.gamer === 'enemy') {
      GamePlay.showError('Враг слишком далеко');
      this.gamePlay.selectCell(this.lastIndex);
    }

    
    // TODO: react to click
  }

  onCellEnter(index) {
    // Объект персонажа находящегося в ячейке на которую наведен курсор (если он там есть)
    const character = this.arrayPositionedCharacter.find((el) => el.position === index);

    // Вывод сообщения о персонаже
    if(this.gamePlay.cells[index].children.length > 0) { 
      const message = this.generateMessageForTitle(character.character);
      this.gamePlay.showCellTooltip(message, index);

      this.gamePlay.setCursor('pointer');
    }



    // Курсор недопустимое действие при наведении на клетку куда нельзя шагать (ячейка не входит в допустимые)
    if(![...this.cellsForSteps].includes(index) // ячейка не входит в допустимые
    && this.gamePlay.cells[index].children.length === 0 // ячейка пустая
    && this.lastIndex) { // персонаж выбран
      this.gamePlay.setCursor('not-allowed');
    }// Подсвечивание ячеек и изменение курсора доступных для выбора
    else if([...this.cellsForSteps].includes(index) && this.gamePlay.cells[index].children.length === 0) {
      this.gamePlay.selectCell(index, 'green');
      this.gamePlay.setCursor('pointer');
      this.lastIndexEnter = index;
    }

    

    // Смена курсора на недопустимое действие при наведении на противника за пределами досягаемости
    if(this.lastIndex // Персонаж выбран
    && ![...this.cellsForAttack].includes(index) // Враг за пределами допустимых ячеек
    && this.lastIndex !== index // Это не наш выбранный персонаж
    && this.gamePlay.cells[index].children.length > 0 // В ячейке есть враг
    &&character.character.gamer !== 'player') { // В ячейке персонаж врага
      this.gamePlay.setCursor('not-allowed');
    }// Подсвечивание ячеек и изменение курсора доступных для атаки
    else if([...this.cellsForAttack].includes(index) 
    && this.gamePlay.cells[index].children.length > 0 
    && character.character.gamer !== 'player') {
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor('crosshair');
      this.lastIndexEnter = index;
    }
    // TODO: react to mouse enter
  }
  
  onCellLeave(index) {
    let character = this.arrayPositionedCharacter.find((el) => el.position === index); // персонаж который находится в покинутой ячейке

    this.gamePlay.setCursor('auto');

    if(this.gamePlay.cells[index].children.length > 0) {
      this.gamePlay.hideCellTooltip(index);
    }

    if((this.lastIndexEnter || this.lastIndexEnter === 0) // прошлая ячейка на которой был курсор содержит значение или 0
    && this.gamePlay.cells[index].children.length === 0 ) { // ячейка не содержит персонаж
      this.gamePlay.deselectCell(this.lastIndexEnter);
    }

    if(character && character.character.gamer === 'enemy') {
      this.gamePlay.deselectCell(this.lastIndexEnter);
    }
    // TODO: react to mouse leave
  }

  generateArrayForSteps(indexCell, steps, borderSize) {
    this.cellsForSteps.clear();

    for(let i = 1; i <= steps; i += 1) {
      let result = indexCell + borderSize * i;
      if(result < 8 ** 2) {   
        this.cellsForSteps.add(result); // ячейки вниз
        
        if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForSteps.add(result + i); // диагональ вниз и вправо
        }

        if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForSteps.add(result - i); // диагональ вниз и влево
        }
      }
      
      result = indexCell - borderSize * i;
      if(result >= 0) {     
        this.cellsForSteps.add(result); // ячейки вверх

        if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForSteps.add(result + i); // диагональ вниз и вправо
        }

        if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForSteps.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell + i;
      if(result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {   
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

    for(let i = 1; i <= steps; i += 1) {
      let result = indexCell + borderSize * i;
      if(result < 8 ** 2) {   
        this.cellsForAttack.add(result); // ячейки вниз
        
        if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForAttack.add(result + i); // диагональ вниз и вправо
        }

        if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForAttack.add(result - i); // диагональ вниз и влево
        }
      }
      
      result = indexCell - borderSize * i;
      if(result >= 0) {     
        this.cellsForAttack.add(result); // ячейки вверх

        if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForAttack.add(result + i); // диагональ вниз и вправо
        }

        if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForAttack.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell + i;
      if(result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {   
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

    for(let i = 0; i < boardSize; i += 1) {  
      if(left % boardSize !== 0) {
        left -= 1;
      }

      if((right - (boardSize - 1)) % boardSize !== 0) {
        right += 1;
      }
    }

    return [left, right]
  }

  validateCharacter(character) { // Проверяем своего ли персонажа выбрал игрок
    if(GameState.queue.gamer === 'player') {
      return playerClasses.some( item => new item().type === character.type);
    }

    // if(GameState.queue.gamer === 'enemy') {
    //   return enemyClasses.some( item => item.type === character.type);
    // }
  }

  genArrayPositionedCharacter(teamPlayer, teamEnemy, positionsForPlayer, positionsForEnemy) { // Создаем массив персонажей и позиций для this.gamePlay.redrawPositions(tu)
    const arr = [];

    for (let i = 0; i <= positionsForPlayer.length - 1; i += 1) {
      arr.push(new PositionedCharacter(teamPlayer.characters[i], positionsForPlayer[i]));
    }

    for (let i = 0; i <= positionsForEnemy.length - 1; i += 1) {
      arr.push(new PositionedCharacter(teamEnemy.characters[i], positionsForEnemy[i]));
    }

    return arr;
  }

  placementPositionGenerator(places, amountCharacters) { // рандомные позиции для расстановки, в зависимости от количества персонажей
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
}


  // В enter
  // if(this.lastCharacter && this.gamePlay.cells[index].children.length === 0) {
    //   let resultValidate = this.validateCell(this.lastIndex, this.lastCharacter.step, this.gamePlay.boardSize, index);
    //   console.log(this.lastIndex)
    //   console.log(this.lastCharacter.step)
    //   console.log(this.gamePlay.boardSize)
    //   console.log(index)
    //   if(resultValidate) {
    //     this.gamePlay.selectCell(index, 'green');
    //     this.lastIndexEnter = index;
    //     this.gamePlay.setCursor('pointer');
    //   }
    // }  

// validateCell(cell, possibleStep, sizeBoard, cellOver) {

//   let itemTR = cellOver;
//   let itemTL = cellOver;
//   let itemBL = cellOver;
//   let itemBR = cellOver;
//   let itemT = cellOver;
//   let itemL = cellOver;
//   let itemR = cellOver;
//   let itemB = cellOver;

//   let result = null;

//   for( let i = 1; i <= possibleStep; i += 1) {
//     itemTR = itemTR + sizeBoard - 1; // Проверка диагонали вверх вправо
//     if(itemTR === cell) {
//       console.log('itemTR')
//       result = true;
//     }

//     itemTL = itemTL + sizeBoard + 1;
//     if(itemTL === cell) {
//       console.log('itemTL')
//       result = true;
//     }

//     itemBL = itemBL - sizeBoard + 1;
//     if(itemBL === cell) {
//       console.log('itemBL')
//       result = true;
//     }

//     itemBR = itemBR - sizeBoard - 1;
//     if(itemBR === cell) {
//       console.log('itemBR')
//       result = true;
//     }

//     itemT += sizeBoard;
//     if(itemT === cell) {
//       console.log('itemT')
//       result = true;
//     }

//     itemB -= sizeBoard;
//     if(itemB === cell) {
//       console.log('itemB')
//       result = true;
//     }

//     itemL += 1; // находим каждый раз левый и правый край для каждого конкретного случая и добавляем эти праметры в условия
//     if(itemL === cell) {
//       console.log('itemL')
//       result = true;
//     }

//     itemR -= 1;
//     if(itemR === cell) {
//       console.log('itemR')
//       result = true;
//     }
//   }

//   return result;
// }




// let possibleCellsForMove = new Set();
//     let board;
//       for(let i = 1; i <= possibleStep; i += 1){
//         board = sizeBoard * i;

//         for(let i = 0; i <= possibleStep; i += 1) {
//           let result = cell - i;
//           if(result >= 0 && result !== cell) {
//             possibleCellsForMove.add(result);
//           }

//           result = cell - board - i;
//           if(result >= 0 && result !== cell) {
//             possibleCellsForMove.add(result);
//           }

//           result = cell - board + i;
//           if(result >= 0 && result !== cell) {
//             possibleCellsForMove.add(result);
//           }


//           result = cell + i;
//           if(result >= 0 && result !== cell) {
//             possibleCellsForMove.add(result);
//           }

//           result = cell + board - i;
//           if(result >= 0 && result !== cell) {
//             possibleCellsForMove.add(result);
//           }

//           result = cell + board + i;
//           if(result >= 0 && result !== cell) {
//             possibleCellsForMove.add(result);
//           }


//         }
//       }

// Array.from(possibleCellsForMove)


// Ходим
// Мечники/Скелеты - 4 клетки в любом направлении
// !Лучники/Вампиры - 2 клетки в любом направлении
// !Маги/Демоны - 1 клетка в любом направлении

// Атакуем
// Мечники/Скелеты - могут атаковать только соседнюю клетку
// !Лучники/Вампиры - на ближайшие 2 клетки
// !Маги/Демоны - на ближайшие 4 клетки
