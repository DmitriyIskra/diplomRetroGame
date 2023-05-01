import Character from '../Character';

export default class Vampire extends Character {
  constructor(level, type) {
    super(level, type);
    this.gamer = 'enemy';
    this.stepAttack = 2;
    this.step = 2;
    this.attack = 25;
    this.defence = 25;
    this.type = 'vampire';
  }
}
