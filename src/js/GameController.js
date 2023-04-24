import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Magician from './characters/magician';
import Swordsman from './characters/swordsman';
import Undead from './characters/undead';
import Vampire from './characters/vampire';
import {generateTeam} from './generators';

const playerClasses = [Bowman, Swordsman, Magician];
const enemyClasses = [Daemon, Undead, Vampire];


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }
 
  init() {
    this.gamePlay.drawUi('prairie')
                                                            // Доступные позиции для игроков на поле для статрта
    this.placesForPlayer = this.generatePlaces('player', this.gamePlay.boardSize);
    this.placesForEnemy = this.generatePlaces('enemy', this.gamePlay.boardSize);
                                                              // Количество игроков (рандом)
    let randonAmountCharacters = Math.floor(Math.random() * this.placesForPlayer.length + 1); // рандомное число для формирования колличества персонажей
                                                              // Команды игроков
    this.teamPlayer = generateTeam(playerClasses, 1, randonAmountCharacters);
    this.teamEnemy = generateTeam(enemyClasses, 1, randonAmountCharacters);
                                                              // Уникальные позиции для расстановки
    const positionsForPlayer = this.placementPositionGenerator(this.placesForPlayer, randonAmountCharacters);
    const positionsForEnemy = this.placementPositionGenerator(this.placesForEnemy, randonAmountCharacters);
                                                              //Массив для отрисовки
    const arrayPositionedCharacter = this.genArrayPositionedCharacter(this.teamPlayer, this.teamEnemy, positionsForPlayer, positionsForEnemy);
                                                // Отрисовка
    this.gamePlay.redrawPositions(arrayPositionedCharacter)
    // Получить массив рандомных позиций для расстановки персонажей от количества персонажей
    // через new PositionedCharacter(dfg, position) и цикл сформировать массив для redrowPosition()
    // Вызвать redrowPosition
    // const ch = new Undead(1)
    // const dfg  = new Bowman(2)
    // const position = 10
    // const position2 = 8
    // const pc = new PositionedCharacter(dfg, position)
    // const pc2 = new PositionedCharacter(ch, position2)
    // const tu = [pc, pc2]
    // this.gamePlay.redrawPositions()
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  genArrayPositionedCharacter(teamPlayer, teamEnemy, positionsForPlayer, positionsForEnemy) { // Создаем массив персонажей и позиций для this.gamePlay.redrawPositions(tu)
    const arr = [];

    for(let i = 0; i <= positionsForPlayer.length - 1; i += 1) {
      arr.push(new PositionedCharacter(teamPlayer.characters[i], positionsForPlayer[i]));
    }

    for(let i = 0; i <= positionsForEnemy.length - 1; i += 1) {
      arr.push(new PositionedCharacter(teamEnemy.characters[i], positionsForEnemy[i]));
    }

    return arr;
  }

  placementPositionGenerator(places, amountCharacters) { // рандомные позиции для расстановки, в зависимости от количества персонажей
    const positions = new Set();

    for(let i = 0; positions.size <= amountCharacters - 1; i += 1) {
      let rundomNum = Math.floor(Math.random() * places.length);
      
      positions.add(places[rundomNum]);
    }

    return Array.from(positions);
  }

  generatePlaces(team, boardSize) { // Генерация доступных позиций для игрока или врага 
    const acc = [];
    if(team === 'player') {
      for(let i = 0; i <= boardSize * (boardSize - 1); i += boardSize) {
        acc.push(i);
        acc.push(i + 1);
      }
      return acc;
    } 

    for(let i = 0; i <= boardSize * (boardSize - 1); i += boardSize) {
      acc.push(i + (boardSize - 1));
      acc.push(i + (boardSize - 2));
    }

    return acc;
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}







// import Undead from './characters/undead';
// const a = [Bowman, Undead]
// 

// console.log(generateTeam(a, 2, 3))

// console.log(player.next().value)
// console.log(player.next().value)