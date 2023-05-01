import Character from '../Character';

export default class Bowman extends Character {
  constructor(level, type) {
    super(level, type);
    this.gamer = 'player';
    this.stepAttack = 2;
    this.step = 2;
    this.attack = 25;
    this.defence = 25;
    this.type = 'bowman';
  }
}
