const {load} = require('../mockLoad');
// const {SaveGame} = require();
// const gameStateService = new GameStateService()
// const saveGame = new SaveGame()
const obj = JSON.stringify({
        playerBalls: 2,
        enemyBalls: 1,
        activeTheme: 'arctic',
        level: 3,
        charactersAndPositions: {bowman: 'bowman', position: '14'},
        gamer: 'player',
    })
  


// jest.mock('../mockLoad');

// beforeEach(() => {
//     jest.resetAllMocks();
// })

test('testing of saving function', () => {
    
    const result = load(obj);
    
    expect(result).toEqual({
        playerBalls: 2,
        enemyBalls: 1,
        activeTheme: 'arctic',
        level: 3,
        charactersAndPositions: {bowman: 'bowman', position: '14'},
        gamer: 'player',
    });
})

test('testing of saving function error', () => {
    expect(() => {
        load({
            playerBalls: 2,
            enemyBalls: 1,
            activeTheme: 'arctic',
            level: 3,
            charactersAndPositions: {bowman: 'bowman', position: '14'},
            gamer: 'player',
        });
    }).toThrow('Invalid state');
})

