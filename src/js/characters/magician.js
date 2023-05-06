import Character from '../Character';

export default class Magician extends Character {
  constructor(level, type) {
    super(level, type);
    this.gamer = 'player';
    this.stepAttack = 4;
    this.step = 1;
    this.attack = 10;
    this.defence = 40;
    this.type = 'magician';
  }
}
