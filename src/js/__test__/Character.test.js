import Character from "../Character";

test('test error from Character', () => {
    expect(() => new Character(1, 'Bowman')).toThrow('вызов данного конструктора запрещен')
})