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

const playerClasses = [Bowman, Swordsman, Magician];
const enemyClasses = [Daemon, Undead, Vampire];

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.lastIndex = null;
  }

  init() {
    this.gamePlay.drawUi('prairie');
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
    
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }


  addListeners() { // <- что это за метод и где это нужно сделать решите сами    
        this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
        this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this)); 
        this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this))
  }

  onCellClick(index) {
    const character = this.arrayPositionedCharacter.find((el) => el.position === index);
    
    if(this.lastIndex) {
      this.gamePlay.deselectCell(this.lastIndex)
    }

    if(this.validateCharacter(character.character)) {
      this.gamePlay.selectCell(index);
      this.lastIndex = index;
      return;
    }
   
    GamePlay.showError('Вы не можете управлять персонажем противника')
    // делаем логику и переделать остальные события
    // TODO: react to click
  }

  onCellEnter(index) {
    const character = this.arrayPositionedCharacter.find((el) => el.position === index);

    if(this.gamePlay.cells[index].children.length > 0) {
      const message = this.generateMessageForTitle(character.character);
      this.gamePlay.showCellTooltip(message, index);

      this.gamePlay.setCursor('pointer');
    }
    
    // TODO: react to mouse enter
  }
  
  onCellLeave(index) {
      this.gamePlay.setCursor('auto');

    if(this.gamePlay.cells[index].children.length > 0) {
      this.gamePlay.hideCellTooltip(index);
    }
    // TODO: react to mouse leave
  }

  validateCharacter(character) {
    if(GameState.queue.gamer === 'player') {
      return playerClasses.some( item => new item().type === character.type);
    }

    if(GameState.queue.gamer === 'enemy') {
      return enemyClasses.some( item => item.type === character.type);
    }
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

// import Undead from './characters/undead';
// const a = [Bowman, Undead]
//

// console.log(generateTeam(a, 2, 3))

// console.log(player.next().value)
// console.log(player.next().value)
