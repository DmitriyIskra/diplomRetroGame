import GameStateService from '../GameStateService.js';


test('gameStateService failed to load', () => {
  const mockStorage = {
    getItem: jest.fn(() => { throw new Error() })
  }
  
  const gameStateService = new GameStateService(mockStorage);

  expect(() => {
    gameStateService.load();
  }).toThrow('Invalid state');

  expect(mockStorage.getItem).toHaveBeenCalled();
})




