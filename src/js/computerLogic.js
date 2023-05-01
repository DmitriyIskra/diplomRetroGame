import GamePlay from './GamePlay';
import GameState from './GameState';

export default class ComputerLogic {
    constructor(gamePlay) {
        this.boardSize = GamePlay.boardSize
        this.gamePlay = gamePlay
        this.arrayCharacters = [];
        this.totalPositionsCherecters = null;
        this.cellsForSteps = new Set();
        this.cellsForAttack = new Set();
        this.attackedСharacter = null;
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
        this.arrayCharacters = arrayPositionsAndCharacters.filter( item => item.character.gamer === 'enemy');

        this.totalPositionsCherecters = arrayPositionsAndCharacters;
    }

    stepCharacter() {
        let randomCharacter;
        let cellsForAttack = new Set();
        

        let randomIndex = Math.floor(Math.random() * ((this.arrayCharacters.length - 1) + 1));
        if(randomIndex || randomIndex === 0) {
            randomCharacter = this.arrayCharacters[randomIndex]; // выбираем персонаж для хода

            // Формируем доступные ячейки
            this.generateArrayForSteps(randomCharacter.position, randomCharacter.character.step, this.gamePlay.boardSize); 
            this.generateArrayForAttack(randomCharacter.position, randomCharacter.character.attack, this.gamePlay.boardSize)
        }

        this.totalPositionsCherecters.forEach( item => {
          this.cellsForAttack.forEach( index => { // если в каком то персонаже есть совпадение по допустимому индексу ячейки для атаки атаки то атакуем
            if(item.position[index] === index && item.character.gamer === 'player') { // Также атакуемы персонаж должен быть player
              this.attackedСharacter = item; // сохраняем атакуемый персонаж  
              console.log('атакуем')  // дальше переделываем this.totalPositionsCherecters и вызываем redrowPositions
              return;
            }
          });
        })

        let randomIndexforStep = Math.floor(Math.random() * ((this.cellsForSteps.size - 1) + 1));
        
        if(!this.attackedСharacter //  Если враг в допустимых ячейках не найден и ячейка для хода пустая
        && this.gamePlay.cells[Array.from(this.cellsForSteps)[randomIndexforStep]].children.length === 0) {
          for( let i = 0; i < this.totalPositionsCherecters.length; i += 1){ // Перебираем массив с персонажами и их позициями
            if(this.totalPositionsCherecters[i].position === randomCharacter.position) { // находим в нем персонаж который был отобран для хода
              this.totalPositionsCherecters[i].position = Array.from(this.cellsForSteps)[randomIndexforStep] // Меняем в нем position из допустимых ячеек

              this.gamePlay.redrawPositions(this.totalPositionsCherecters); // Перерисовываем            
            }
          }

          // GameState.from({gamer: 'enemy'});
        } 
        else{
          this.stepCharacter()
        }

    }

    generateArrayForSteps(indexCell, steps, borderSize) {
        this.cellsForSteps.clear();
    
        for(let i = 1; i <= steps; i += 1) {
          let result = indexCell + borderSize * i;
          if(result < 8 ** 2) {   
            this.cellsForSteps.add(result); // ячейки вниз
            
            if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
              this.cellsForSteps.add(result + i); // диагональ вниз и вправо
            }
    
            if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
              this.cellsForSteps.add(result - i); // диагональ вниз и влево
            }
          }
          
          result = indexCell - borderSize * i;
          if(result >= 0) {     
            this.cellsForSteps.add(result); // ячейки вверх
    
            if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
              this.cellsForSteps.add(result + i); // диагональ вниз и вправо
            }
    
            if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
              this.cellsForSteps.add(result - i); // диагональ вниз и влево
            }
          }
    
          result = indexCell + i;
          if(result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {   
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
    
        for(let i = 1; i <= steps; i += 1) {
          let result = indexCell + borderSize * i;
          if(result < 8 ** 2) {   
            this.cellsForAttack.add(result); // ячейки вниз
            
            if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
              this.cellsForAttack.add(result + i); // диагональ вниз и вправо
            }
    
            if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
              this.cellsForAttack.add(result - i); // диагональ вниз и влево
            }
          }
          
          result = indexCell - borderSize * i;
          if(result >= 0) {     
            this.cellsForAttack.add(result); // ячейки вверх
    
            if(result + i <= this.calcFiniteIndexSIde(result, borderSize)[1]) {
              this.cellsForAttack.add(result + i); // диагональ вниз и вправо
            }
    
            if(result - i >= this.calcFiniteIndexSIde(result, borderSize)[0]) {
              this.cellsForAttack.add(result - i); // диагональ вниз и влево
            }
          }
    
          result = indexCell + i;
          if(result <= this.calcFiniteIndexSIde(indexCell, borderSize)[1]) {   
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
    
        for(let i = 0; i < boardSize; i += 1) {  
          if(left % boardSize !== 0) {
            left -= 1;
          }
    
          if((right - (boardSize - 1)) % boardSize !== 0) {
            right += 1;
          }
        }
    
        return [left, right]
      }
}