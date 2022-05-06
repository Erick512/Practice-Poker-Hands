let id = ''

class Game {

    constructor(){
        this.start()
    }

    start(){
        fetch(`http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1 `)
        .then(res => res.json())
        .then(data => {

                id = data.deck_id

                fetch(`http://deckofcardsapi.com/api/deck/${id}/draw/?count=4`)
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
            })
        .catch(err => console.log(err))
    }

    startRiver(){

        let cardsInRiver = document.querySelector('.ulRiverCards').children.length
        
        if(cardsInRiver > 4) {
            
            // let riverHand = this.getHandDetails('.ulRiverCards')
            let playerHand = this.getHandDetails('.ulPlayerCards')

            console.log(playerHand)

            // console.log(this.compareHands(riverHand, playerHand))
            return 
        }

        fetch(`http://deckofcardsapi.com/api/deck/${id}/draw/?count=5`)
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

        let htmlCollection = document.querySelector(querySelector).children
        let htmlArr = [...htmlCollection]

        let riverhtmlCollection = document.querySelector('.ulRiverCards').children
        let riverhtmlArr = [...riverhtmlCollection]

        let cards = htmlArr.map(x => x = x.getAttribute('value')).concat(riverhtmlArr.map(x => x = x.getAttribute('value')))
        console.log(cards)

        let rank = this.checkRank(cards)
        
        return rank
    }

    checkRank(cards){

        const order = "23456789TJQKA"
        const faces = cards.map(a => String.fromCharCode([77 - order.indexOf(a[0])])).sort()
        console.log(faces)
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

    compareHands(d1, d2){
        // let d1 = this.getHandDetails(h1)
        // let d2 = this.getHandDetails(h2)
        if (d1.rank === d2.rank) {
        if (d1.value < d2.value) {
            return "WIN"
        } else if (d1.value > d2.value) {
            return "LOSE"
        } else {
            return "DRAW"
        }
        }
        return d1.rank < d2.rank ? "WIN" : "LOSE"
    }

    shuffle() {
        fetch(`http://deckofcardsapi.com/api/deck/${id}/shuffle/`)
        .then(res => res.json())
        .then(data => {
                console.log(data)
            })
        .catch(err => console.log(err))

        let riverCards = document.querySelector('.ulRiverCards')
        let playerCards = document.querySelector('.ulPlayerCards')

        while(riverCards.firstChild){   
            riverCards.removeChild(riverCards.firstChild)
        }
        while(playerCards.firstChild){   
            playerCards.removeChild(playerCards.firstChild)
        }

        this.start()
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

// game.start()

document.querySelector('.start').addEventListener('click', () => {game.startRiver()})
document.querySelector('.retry').addEventListener('click', () => {game.shuffle()})