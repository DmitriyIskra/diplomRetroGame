import Swordsman from "../characters/swordsman";

test('test new Swordsman() and checking specifications', () => {
    const swordsman = new Swordsman(1);

    expect(swordsman).toEqual({
        level: 1,
        type: 'swordsman',
        gamer: 'player',
        health: 50,
        stepAttack: 1,
        step: 4,
        attack: 40,
        defence: 10,
        type: 'swordsman',
      } )
})