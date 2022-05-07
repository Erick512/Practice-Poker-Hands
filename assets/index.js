let keyID = 'no key'

let streak = 0

if(!localStorage.getItem('streak')){
    localStorage.setItem('streak', streak)
}

// document.querySelector('.hStreak').innerHTML = `Highest Score: ${localStorage.getItem('streak')}`
document.querySelector('.hStreak').innerHTML = `${localStorage.getItem('streak')}`

class Game {

    constructor(){
        this.streak = 0
        this.timer
    }

    getkey(){
        fetch(`http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
        .then(res => res.json())
        .then(data => {
            keyID = data.deck_id
        })
        .catch(err => console.log(err))
    }

    startGame(){
        this.getPlayerCards()
        this.getRiverCards()
        document.querySelector('.start').classList.add('hidden')
        
        this.startTimer()
    }

    startTimer(){

        let timLeft = 5
        this.timer = setInterval( () => {
            if(timLeft <= 0){
                clearInterval(this.timer)
                this.gameOver()
            }
            
            if(timLeft < 4) {
                document.querySelector('.timer').classList.add('runningOut')
            } else {
                document.querySelector('.timer').classList.remove('runningOut')
            }

            document.querySelector('.timer').innerHTML = timLeft
            timLeft -= 1
        } , 1000)
    }

    stopTimer(){
        clearInterval(this.timer)
    }

    resetTimer(){

    }

    getPlayerCards(){

        fetch(`http://deckofcardsapi.com/api/deck/${keyID}/draw/?count=4`)
        .then(res => res.json())
        .then(data => {
            let ul1 = document.querySelector('.ulPlayerCards1')
            let ul2 = document.querySelector('.ulPlayerCards2')
            let firstHalf = data.cards.slice(0, 2)
            let secondHalf = data.cards.slice(2)
            console.log(firstHalf, secondHalf)
            firstHalf.forEach(card => {
                let li = document.createElement('li')
                li.setAttribute('value', isNaN(card.value) ? this.convertCardValue(card.value) + card.suit[0] : card.value + card.suit[0])
                // li.setAttribute('suit', card.suit)
                let img = document.createElement('img')
                img.src = card.image
                li.appendChild(img)
                ul1.appendChild(li)
            })
            secondHalf.forEach(card => {
                let li = document.createElement('li')
                li.setAttribute('value', isNaN(card.value) ? this.convertCardValue(card.value) + card.suit[0] : card.value + card.suit[0])
                // li.setAttribute('suit', card.suit)
                let img = document.createElement('img')
                img.src = card.image
                li.appendChild(img)
                ul2.appendChild(li)
            })
        })
        .catch(err => console.log(err))
    }

    getRiverCards(){

        // let cardsInRiver = document.querySelector('.ulRiverCards').children.length
        
        // if(cardsInRiver > 4) {
            
        //     // let riverHand = this.getHandDetails('.ulRiverCards')
        //     let playerHand = this.getHandDetails('.ulPlayerCards')

        //     console.log(playerHand)

        //     // console.log(this.compareHands(riverHand, playerHand))
        //     return 
        // }

        fetch(`http://deckofcardsapi.com/api/deck/${keyID}/draw/?count=5`)
            .then(res => res.json())
            .then(data => {
                console.log(data.cards)
                let ul = document.querySelector('.ulRiverCards')
                data.cards.forEach(card => {
                    let li = document.createElement('li')
                    li.setAttribute('value', isNaN(card.value) ? this.convertCardValue(card.value) + card.suit[0] : card.value + card.suit[0])
                    // li.setAttribute('suit', card.suit[0])
                    let img = document.createElement('img')
                    img.src = card.image

                    li.appendChild(img)
                    ul.appendChild(li)
                })
            })
            .catch(err => console.log(err))
    }

    getHandDetails(querySelector){

        // get selected cards
        let htmlCollection = document.querySelector(querySelector).children
        let selectedCardsArr = [...htmlCollection]

        // get river cards
        let riverhtmlCollection = document.querySelector('.ulRiverCards').children
        let riverCards = [...riverhtmlCollection]

        // get unselectedCards
        let unselectedCardsArr
        if(querySelector == '.ulPlayerCards1'){
            let htmlCollection = document.querySelector('.ulPlayerCards2').children
            unselectedCardsArr = [...htmlCollection]
        } else {
            let htmlCollection = document.querySelector('.ulPlayerCards1').children
            unselectedCardsArr = [...htmlCollection]
        }

        //combine unselected+river cards
        let againstCards = unselectedCardsArr.map(x => x = x.getAttribute('value')).concat(riverCards.map(x => x = x.getAttribute('value')))
        console.log(againstCards)

        // combine selected+river cards
        let selectedCards = selectedCardsArr.map(x => x = x.getAttribute('value')).concat(riverCards.map(x => x = x.getAttribute('value')))
        console.log(selectedCards)

        let selectedCardsRank = this.checkRank(selectedCards)
        let unselectedCardsRank = this.checkRank(againstCards)

        console.log(`your rank ${selectedCardsRank.rank}, other set rank ${unselectedCardsRank.rank}`)

        let didWin = this.compareHands(selectedCardsRank, unselectedCardsRank)

        if(didWin){
            clearInterval(this.timer)
            this.streak++
            document.querySelector('.streak').innerHTML = `Streak: ${this.streak}`
            this.nextRound()
        } else {
            clearInterval(this.timer)
            document.querySelector(querySelector).classList.add('wrong')
            document.querySelector('.timer').innerHTML = 'Game Over'
            document.querySelector('.streak').innerHTML = `Streak: ${this.streak}`
            this.gameOver()
        }
    }

    checkRank(cards){

        const order = "23456789TJQKA"
        const faces = cards.map(a => String.fromCharCode([77 - order.indexOf(a[0])])).sort()
        const suits = cards.map(a => a[1]).sort()
        const counts = faces.reduce(count, {})
        const duplicates = Object.values(counts).reduce(count, {})
        const flush = suits[0] === suits[4]
        const first = faces[0].charCodeAt(0)
        const straight = faces.every((f, index) => f.charCodeAt(0) - first === index)
        let rank =
            (flush && straight && 1) ||
            (duplicates[4] && 2) ||
            (duplicates[3] && duplicates[2] && 3) ||
            (flush && 4) ||
            (straight && 5) ||
            (duplicates[3] && 6) ||
            (duplicates[2] > 1 && 7) ||
            (duplicates[2] && 8) ||
            9

        return { rank, value: faces.sort(byCountFirst).join("") }

        function byCountFirst(a, b) {
            //Counts are in reverse order - bigger is better
            const countDiff = counts[b] - counts[a]
            if (countDiff) return countDiff // If counts don't match return
            return b > a ? -1 : b === a ? 0 : 1
        }

        function count(c, a) {
            c[a] = (c[a] || 0) + 1
            return c
        }
    }

    // fix compare to get better scoring system!

    compareHands(d1, d2){
        // let d1 = this.getHandDetails(h1)
        // let d2 = this.getHandDetails(h2)
        if (d1.rank === d2.rank) {
        if (d1.value < d2.value) {
            return true
        } else if (d1.value > d2.value) {
            return false
        } else {
            return true
        }
        }
        return d1.rank < d2.rank ? true : false
    }

    nextRound(){
        fetch(`http://deckofcardsapi.com/api/deck/${keyID}/shuffle/`)
        .then(res => res.json())
        .then(data => {
                console.log(data)
            })
        .catch(err => console.log(err))

        let riverCards = document.querySelector('.ulRiverCards')
        let playerCards1 = document.querySelector('.ulPlayerCards1')
        let playerCards2 = document.querySelector('.ulPlayerCards2')

        while(riverCards.firstChild){   
            riverCards.removeChild(riverCards.firstChild)
        }
        while(playerCards1.firstChild){   
            playerCards1.removeChild(playerCards1.firstChild)
        }
        while(playerCards2.firstChild){   
            playerCards2.removeChild(playerCards2.firstChild)
        }

        this.startGame()
    }

    retry() {
        fetch(`http://deckofcardsapi.com/api/deck/${keyID}/shuffle/`)
        .then(res => res.json())
        .then(data => {
                console.log(data)
            })
        .catch(err => console.log(err))

        let riverCards = document.querySelector('.ulRiverCards')
        let playerCards1 = document.querySelector('.ulPlayerCards1')
        let playerCards2 = document.querySelector('.ulPlayerCards2')

        while(riverCards.firstChild){   
            riverCards.removeChild(riverCards.firstChild)
        }
        while(playerCards1.firstChild){   
            playerCards1.removeChild(playerCards1.firstChild)
        }
        while(playerCards2.firstChild){   
            playerCards2.removeChild(playerCards2.firstChild)
        }

        this.streak = 0
        document.querySelector('.streak').innerHTML = `${this.streak}`


        document.querySelector('.newHigh').classList.add('hidden')
        document.querySelector('.currentStreak').classList.remove('hidden')

        document.querySelector('.ulPlayerCards1').classList.remove('wrong')
        document.querySelector('.ulPlayerCards2').classList.remove('wrong')
        document.querySelector('.timer').innerHTML = ''
        document.querySelector('.stats').classList.add('hidden')
        document.querySelector('.table').classList.remove('inactive')
        clearInterval(this.timer)
        this.startGame()
    
    }

    gameOver(){

        if(localStorage.getItem('streak') < this.streak){
            
            console.log(`local ${+localStorage.getItem('streak')}, current ${this.streak}`)
            localStorage.setItem('streak', this.streak)

            document.querySelector('.newHigh').innerHTML = `New High Score!`
            document.querySelector('.hStreak').innerHTML = `${this.streak}`

            document.querySelector('.newHigh').classList.remove('hidden')
            document.querySelector('.currentStreak').classList.add('hidden')
        }

        document.querySelector('.currentStreak').innerHTML = `${this.streak}`
        document.querySelector('.table').classList.add('inactive')
        // document.querySelector('.start').classList.remove('inactive')
        document.querySelector('.stats').classList.remove('hidden')
    }

    convertCardValue(value){
        switch(value){
            case 'JACK':
                return 'J'
            case 'QUEEN':
                return 'Q'
            case 'KING':
                return 'K'
            case 'ACE':
                return 'A'
        }
    }
}

let game = new Game()
game.getkey()

document.querySelector('.showStats').addEventListener('click', () => {showStats()})
document.querySelector('.start').addEventListener('click', () => {game.startGame()})
document.querySelector('.retry').addEventListener('click', () => {game.retry()})
document.querySelector('.ulPlayerCards1').addEventListener('click', () => {game.getHandDetails('.ulPlayerCards1')})
document.querySelector('.ulPlayerCards2').addEventListener('click', () => {game.getHandDetails('.ulPlayerCards2')})
document.querySelector('.statsBtn').addEventListener('click', () => {hideStats()})

function hideStats(){
    document.querySelector('.stats').classList.add('hidden')
}
function showStats(){
    document.querySelector('.stats').classList.remove('hidden')
}