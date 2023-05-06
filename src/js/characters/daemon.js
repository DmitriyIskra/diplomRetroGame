import Character from '../Character';

export default class Daemon extends Character {
  constructor(level, type) {
    super(level, type);
    this.gamer = 'enemy';
    this.stepAttack = 4;
    this.step = 1;
    this.attack = 10;
    this.defence = 10;
    this.type = 'daemon';
  }
}
