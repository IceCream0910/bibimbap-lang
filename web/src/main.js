let STOP = false;

const codeElem = document.getElementsByName('code')[0];
const inputElem = document.getElementsByName('input')[0];
const outputElem = document.getElementsByName('output')[0];
const dumpsElem = document.getElementsByName('dumps')[0];

const runElem = document.getElementsByName('run')[0];
const stopElem = document.getElementsByName('stop')[0];
const clearElem = document.getElementsByName('clear')[0];
const resetElem = document.getElementsByName('reset')[0];


runElem.onclick = () => run(codeElem.value, inputElem.value);
stopElem.onclick = () => STOP = true;
clearElem.onclick = () => {
    dumpsElem.value = '';
    outputElem.value = '';
    outputElem.style.borderColor = '';
};
resetElem.onclick = () => {
    codeElem.value = '';
    dumpsElem.value = '';
    inputElem.value = '';
    outputElem.value = '';
    outputElem.style.borderColor = '';
};

function run(code, input) {
    STOP = false;
    outputElem.value = '';
    runElem.disabled = true;
    outputElem.style.borderColor = '';

    const statements = code.trim().split(code.includes('~') ? '~' : '\n').map(line => line.trim());
    const inputs = input.replace(/\n{1,}/g, ' ').replace(/\s{2,}/g, ' ').trim().split(' ').map(n => Number(n));
    if (statements[0] !== '젓가락이 지휘봉이라고 생각하시고' || !statements.slice(-1)[0].startsWith('탈락했습니다 너무 짜요!')) {
        runElem.disabled = false;
        outputElem.style.borderColor = 'red';
        return outputElem.value = '어? 이게뭐여 어으얽읅어 응? 음? 이거 비빔랭 아니잖아';
    }

    const variables = [];
    let pointer = 0;
    let inputpointer = 0;

    function execute(statement) {
        if (statement.includes('그만해유') && statement.includes('?')) { // IF GOTO
            const condition = evaluate(statement.substring(2, statement.lastIndexOf('?')));
            if (condition === 0) return execute(statement.substr(statement.lastIndexOf('?') + 1));
            return;
        }

        if (statement.includes('뷤')) {
            const variablePointer = statement.split('뷤')[0].split('뷔').length;
            let setteeValue = evaluate(statement.split('뷤')[1]);
            if (statement.includes('자!')) setteeValue = evaluate(statement.split('뷤')[0]);
            variables[variablePointer] = setteeValue;
        }

        if (statement.includes('비벼주세요') && statement[statement.length - 1] === '!') {
            printOut(String(evaluate(statement.slice(1, -1))));
        }

        if (statement.includes('세계를') && statement[statement.length - 1] === '!') {
            if (statement === '세계를!') printOut('\n');
            printOut(stringify(evaluate(statement.slice(1, -1))));
        }

        if (statement.includes('계속')) {
            pointer = evaluate(statement.split('계속')[1]) - 1;
        }

        if (statement.indexOf('열정적으로!') === 0) {
            return evaluate(statement.split('열정적으로!')[1]);
        }
    }

    function parse() {
        if (statements[pointer].startsWith('탈락했습니다 너무 짜요!')) stop();
        if (STOP) {
            STOP = false;
            stop();
        }

        const statement = statements[pointer++];
        const evaluated = execute(statement);
        dumpsElem.value =
            'Variables:\n' + variables.reduce((prev, curr, i) => prev + (i + '. ' + curr) + '\n', '') +
            '\n\nStatement: (' + pointer + '/' + statements.length + ')\n' + (statements[pointer] || '') +
            (typeof evaluated !== 'undefined' ? '\n\nReturned: ' + evaluated : '');
        if (typeof evaluated !== 'undefined') stop();
    }

    const interval = setInterval(parse, 1);

    // --- utilities

    function printOut(str) {
        outputElem.value += str;
        outputElem.scrollTo(0, 9999);
    }

    function stop() {
        runElem.disabled = false;
        clearInterval(interval);
    }

    function evaluate(x) {
        let n = 0;
        if (x.includes(' ')) return x.split(' ').map(evaluate).reduce((a, b) => Math.imul(a, b));
        while (x.includes('자!')) {
            const answer = inputs[inputpointer++];
            x = x.replace('자!', '');
            n += answer;
        }
        if (x.includes('뷔')) n += variables[x.split('뷔').length - 1] | 0;
        if (x.includes('비')) n += x.split('비').length - 1;
        if (x.includes('빔')) n -= x.split('빔').length - 1;
        return (n + 2158221066240) % 4294967296 - 2147483648;
    }
}

function stringify(unicode) {
    const char = String.fromCharCode(unicode);
    return char.match(/[\x00-\x1F]/) ? '' : char;
}