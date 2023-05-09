import {calcTileType} from '../utils'

/*```js
* calcTileType(0, 8); // 'top-left'
* calcTileType(1, 8); // 'top'
* calcTileType(63, 8); // 'bottom-right'
* calcTileType(7, 7); // 'left'
* ```
* */

test('test top-left', () => {
    const result = calcTileType(0, 8);

    expect(result).toBe('top-left');
})


test('test top', () => {
    const result = calcTileType(1, 8);

    expect(result).toBe('top');
})

test('test top-right', () => {
    const result = calcTileType(7, 8);

    expect(result).toBe('top-right');
})

test('test left', () => {
    const result = calcTileType(8, 8);

    expect(result).toBe('left');
})

test('test right', () => {
    const result = calcTileType(15, 8);

    expect(result).toBe('right');
})

test('test bottom-left', () => {
    const result = calcTileType(56, 8);

    expect(result).toBe('bottom-left');
})

test('test bottom', () => {
    const result = calcTileType(58, 8);

    expect(result).toBe('bottom');
})

test('test bottom-right', () => {
    const result = calcTileType(63, 8);

    expect(result).toBe('bottom-right');
})

test('test center', () => {
    const result = calcTileType(20, 8);

    expect(result).toBe('center');
})

