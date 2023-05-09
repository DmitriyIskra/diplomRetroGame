import Bowman from '../characters/bowman';
import Daemon from '../characters/daemon';
import Magician from '../characters/magician';
import Swordsman from '../characters/swordsman';
import Undead from '../characters/undead';
import Vampire from '../characters/vampire';

import { characterGenerator, generateTeam } from "../generators";

const classes = [Bowman, Swordsman, Magician, Daemon, Undead, Vampire];


test('text characterGenerator', () => {
    const amountCharacters = 20;
    const arrayCharacters = [];

    for( let i = 0; i < amountCharacters; i += 1) {
        arrayCharacters[i] = characterGenerator(classes, 1);
    }

    expect(arrayCharacters.length).toBe(20)
})


test('generateTeam amount characters', () => {
    const characters = generateTeam(classes, 3, 5);

    expect(characters.characters.length).toBe(5);
})


test('generateTeam test levels', () => {
    const characters = generateTeam(classes, 4, 5);

    let maxLevel = [];
    characters.characters.forEach( item => {
        if(item?.level) {
            maxLevel.push(item.level);
        }
    } )

    maxLevel = Math.max(...maxLevel)

    expect(maxLevel).toBeLessThanOrEqual(4);
})