import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level, type) {
    super(level, type);
    this.gamer = 'player';
    this.stepAttack = 1;
    this.step = 4;
    this.attack = 40;
    this.defence = 10;
    this.type = 'swordsman'; 
  }
}
