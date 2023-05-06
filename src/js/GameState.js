export default class GameState {
  constructor() {
    this.playerBalls = 0;
    this.enemyBalls = 0;
    this.activeTheme = null;
    this.level = 0;
    this.charactersAndPositions = null;
  }

  static from(object) {
    this.queue = object;
    // TODO: create object
    return null;
  }
}
