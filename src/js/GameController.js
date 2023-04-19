import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Magician from './characters/magician';
import Swordsman from './characters/swordsman';
import Undead from './characters/undead';
import Vampire from './characters/vampire';
import {generateTeam} from './generators';

const playerClasses = [Bowman, Swordsman, Magician];
const aenemyClasses = [Daemon, Undead, Vampire];


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }
 
  init() {
    this.gamePlay.drawUi('prairie')

    
    const dfg  = new Bowman(2)
    const position = 10
    const pc = new PositionedCharacter(character, position)
    const tu = [pc]
    this.gamePlay.redrawPositions(tu)
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
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