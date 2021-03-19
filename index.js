const backwardsStream = require('fs-backwards-stream');

const aStream = backwardsStream("easy-numbers-a.txt", {
    block: 1024 * 1000
})
const bStream = backwardsStream("easy-numbers-b.txt", {
    block: 1024 * 1000
});

const data = {
    a: [],
    b: [],
    aEnded: false,
    bEnded: false,
    carry: 0,
    final: []
};

aStream.on('end', (buf) => {
    data.aEnded = true;
    data.a = [];
    if (data.bEnded) {
        // Calculate final carry over
        if (data.carry > 0) {
            data.final.push([1]);
        }

        // You are done
        console.log({
            aFinal: data.final.reverse().join('')
        })
    }
    attemptMerge();
});
bStream.on('end', (buf) => {
    data.bEnded = true;
    data.b = [];
    if (data.aEnded) {
        // Calculate final carry over
        if (data.carry > 0) {
            data.final.push([1]);
        }

        // You are done
        console.log({
            bFinal: data.final.reverse().join('')
        })
    }
    attemptMerge();
});

aStream.on('data', (buf) => {
    // Create new array of numbers
    const tempArray = buf.toString().split('');
    const tempArray2 = [];
    for (let num of tempArray) {
        tempArray2.push(parseInt(num));
    }
    data.a = tempArray2.reverse();
    aStream.pause();
    attemptMerge();
});

bStream.on('data', (buf) => {
    // Create new array of numbers
    const tempArray = buf.toString().split('');
    const tempArray2 = [];
    for (let num of tempArray) {
        tempArray2.push(parseInt(num));
    }
    data.b = tempArray2.reverse();

    bStream.pause();
    attemptMerge();
});

function attemptMerge() {
    if ((data.a.length > 0 || data.aEnded) && (data.b.length > 0 || data.bEnded)) {

        addGiantNumbers(data.a, data.b);

        // Reset and resume
        if (!data.aEnded) {
            data.a = [];
        }
        if (!data.bEnded) {
            data.b = [];
        }

        setTimeout(() => {
            if (!data.aEnded) {
                aStream.resume();
            }
            if (!data.bEnded) {
                bStream.resume();
            }
        }, 0);
    }
}

function addGiantNumbers(arrayA, arrayB) {
    let biggerArray;
    let smallerArray;
    if (arrayA.length >= arrayB.length) {
        biggerArray = arrayA;
        smallerArray = arrayB;
    } else {
        biggerArray = arrayB;
        smallerArray = arrayA;
    }

    for(let i = 0; i < biggerArray.length; i++) {
        let number1 = 0;
        if (typeof smallerArray[i] === 'number') {
            number1 = smallerArray[i];
        }
        let number2 = biggerArray[i];
        let sum = number1 + number2 + data.carry;

        // Carry over the numbers
        data.carry = (sum > 9) ? 1 : 0;
        let positionalNumber = (sum > 9) ? sum - 10 : sum;

        // Looking up how to set character at point in string
        data.final.push(positionalNumber);
    }
}