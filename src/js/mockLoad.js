// class SaveGame {
//     constructor() {
//         this.playerBalls = 2;
//         this.enemyBalls = 1;
//         this.activeTheme = 'arctic';
//         this.level = 3;
//         this.charactersAndPositions = {bowman: 'bowman', position: '14'};
//         this.gamer = 'player';
//     }
        
    
// }
    function load(obj) {
      try {
        return JSON.parse(obj);
      } catch (e) {
        throw new Error('Invalid state');
      }
    }

  
  module.exports = {
    load
  }

// module.exports = {
//     SaveGame
// }