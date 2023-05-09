import Bowman from '../characters/bowman';

import GameController from '../GameController';

const gameController = new GameController()

import { generateTeam } from "../generators";


test('testing correct show parameters of character', () => {
    const classBowman = [Bowman];
    const character = generateTeam(classBowman, 1, 1);
    const message = gameController.generateMessageForTitle(character.characters[0]);

    expect(message).toBe(`\u{1F396}1 \u{2694}25 \u{1F6E1}25 \u{2764}50`);
})


test('testing steps of character Bowman and Vampire', () => {
    gameController.generateArrayForSteps(16, 2, 8)

    expect([...gameController.cellsForSteps]).toEqual([24, 25, 8, 9, 17, 32, 34, 0, 2, 18])
})

test('testing attack for attack of character Bowman and Vampire', () => {
    gameController.generateArrayForAttack(16, 2, 8)

    expect([...gameController.cellsForAttack]).toEqual([24, 25, 8, 9, 17, 32, 34, 0, 2, 18])
})


test('testing steps of character Daemon and Magician', () => {
    gameController.generateArrayForSteps(16, 1, 8)

    expect([...gameController.cellsForSteps]).toEqual([24, 25, 8, 9, 17])
})

test('testing attack of character Daemon and Magician', () => {
    gameController.generateArrayForAttack(16, 4, 8)

    expect([...gameController.cellsForAttack]).toEqual([24, 25, 8, 9, 17, 32, 34, 0, 2, 18, 40, 43, 19, 48, 52, 20])
})

test('testing steps of character Swordsman and Undead', () => {
    gameController.generateArrayForSteps(16, 4, 8)

    expect([...gameController.cellsForSteps]).toEqual([24, 25, 8, 9, 17, 32, 34, 0, 2, 18, 40, 43, 19, 48, 52, 20])
})

test('testing attack of character Swordsman and Undead', () => {
    gameController.generateArrayForAttack(16, 4, 8)

    expect([...gameController.cellsForAttack]).toEqual([24, 25, 8, 9, 17, 32, 34, 0, 2, 18, 40, 43, 19, 48, 52, 20])
})