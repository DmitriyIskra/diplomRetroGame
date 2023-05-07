import GamePlay from './GamePlay';
import GameState from './GameState';

export default class ComputerLogic {
  constructor(gamePlay, toNall, LevelUp) {
    this.boardSize = GamePlay.boardSize;
    this.gamePlay = gamePlay;
    this.arrayCharacters = [];
    this.totalPositionsCherecters = null;
    this.arrayCharacters = null; // Персонажи компьютера
    this.cellsForSteps = new Set();
    this.cellsForAttack = new Set();
    this.attackedСharacter = null;
    this.callbackToNull = toNall;
    this.callbackLevelUp = LevelUp;
  }

  // сформировать массив из персонажей компьютера один раз (метод должен сработать один раз в game controller в init)

  // рандомно выбрать персонажа
  // сформировать ячеки доступные для хода
  // сформировать ячейки доступные для атаки
  // Проверка есть ли в ячейке персонаж player
  // если есть атаковать
  // если нет походить redrowPosition
  // поменять игрока

  init(arrayPositionsAndCharacters) { // Формируем массив с персонажами компьютера
    this.totalPositionsCherecters = arrayPositionsAndCharacters; // массив персонажей на поле
    this.arrayCharacters = arrayPositionsAndCharacters.filter((item) => item.character.gamer === 'enemy'); // Массив персонажей компьютера
  }

  stepCharacter() {
    let randomCharacter = null;
    let target = null;

    const randomIndex = Math.floor(Math.random() * ((this.arrayCharacters.length - 1) + 1));
    if (randomIndex || randomIndex === 0) {
      randomCharacter = this.arrayCharacters[randomIndex]; // выбираем персонаж для хода

      // Формируем доступные ячейки
      this.generateArrayForSteps(randomCharacter.position, randomCharacter.character.step, this.gamePlay.boardSize);
      this.generateArrayForAttack(randomCharacter.position, randomCharacter.character.stepAttack, this.gamePlay.boardSize);
    }

    this.cellsForAttack.forEach( index => { // по которому мы можем проверить персонаж на враждебность  
      if(this.gamePlay.cells[index].children.length > 0) {
        this.totalPositionsCherecters.forEach(item => {
          if(item.position === index && item.character.gamer === 'player') {
            target = item;
            return;
          }
        }) 
      }
    })

    const randomIndexforStep = Math.floor(Math.random() * ((this.cellsForSteps.size - 1) + 1)); // индекс для дальнейшего шага
    if(target) {
      let damage = Math.max(randomCharacter.character.attack - target.character.defence, randomCharacter.character.attack * 0.1);
      (async () => {
        await this.gamePlay.showDamage(target.position, damage); // отправить индекс атакуемого
        target.character.health -= damage;
        if(target.character.health > 0) {
          this.gamePlay.redrawPositions(this.totalPositionsCherecters);
          GameState.from({ gamer: 'player' });
        }
        else if(target.character.health <= 0) {
          this.gamePlay.deselectCell(target.position);
          let indexCharacter = this.totalPositionsCherecters.findIndex( item => item.position === target.position);
          this.totalPositionsCherecters.splice(indexCharacter, 1);
          this.gamePlay.redrawPositions(this.totalPositionsCherecters);
          this.callbackToNull();
          this.callbackLevelUp();
          GameState.from({ gamer: 'player' });
        }
      })()
    }
    else if (!target //  Если враг в допустимых ячейках не найден и ячейка для хода пустая
        && this.gamePlay.cells[Array.from(this.cellsForSteps)[randomIndexforStep]].children.length === 0) { // из допустимых одну ячейку подставляем в cells
          randomCharacter.position = Array.from(this.cellsForSteps)[randomIndexforStep] // меняем position

          this.gamePlay.redrawPositions(this.totalPositionsCherecters); // Перерисовываем

          GameState.from({ gamer: 'player' });
    } else {
      this.stepCharacter(); // Если в ячейке доступной для хода не враг, но она занята своим, то перезапускаем для перерасчета
    }
  }

  generateArrayForSteps(indexCell, steps, borderSize) {
    this.cellsForSteps.clear();

    for (let i = 1; i <= steps; i += 1) {
      let result = indexCell + borderSize * i;
      if (result < 8 ** 2) {
        this.cellsForSteps.add(result); // ячейки вниз

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForSteps.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForSteps.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell - borderSize * i;
      if (result >= 0) {
        this.cellsForSteps.add(result); // ячейки вверх

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForSteps.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForSteps.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell + i;
      if (result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {
        this.cellsForSteps.add(result); // ячейки вправо
      }

      result = indexCell - i;
      if (result >= this.calcFiniteIndexSIde(indexCell, borderSize)[0]) {
        this.cellsForSteps.add(result); // ячейки влево
      }
    }
  }

  generateArrayForAttack(indexCell, steps, borderSize) {
    this.cellsForAttack.clear();

    for (let i = 1; i <= steps; i += 1) {
      let result = indexCell + borderSize * i;
      if (result < 8 ** 2) {
        this.cellsForAttack.add(result); // ячейки вниз

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForAttack.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForAttack.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell - borderSize * i;
      if (result >= 0) {
        this.cellsForAttack.add(result); // ячейки вверх

        if (result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
          this.cellsForAttack.add(result + i); // диагональ вниз и вправо
        }

        if (result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
          this.cellsForAttack.add(result - i); // диагональ вниз и влево
        }
      }

      result = indexCell + i;
      if (result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {
        this.cellsForAttack.add(result); // ячейки вправо
      }

      result = indexCell - i;
      if (result >= this.calcFiniteIndexSIde(indexCell, borderSize)[0]) {
        this.cellsForAttack.add(result); // ячейки влево
      }
    }
  }

  calcFiniteIndexSIde(index, boardSize) {
    let left = index; // самая левая ячейка в ряду
    let right = index; // самая правая ячейка в ряду

    for (let i = 0; i < boardSize; i += 1) {
      if (left % boardSize !== 0) {
        left -= 1;
      }

      if ((right - (boardSize - 1)) % boardSize !== 0) {
        right += 1;
      }
    }

    return [left, right];
  }
}

// debugger;