import Character from '../Character';

export default class Bowman extends Character {
  constructor(level, type) {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
    this.type = 'bowman';
  }
}
