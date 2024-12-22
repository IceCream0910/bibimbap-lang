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
    try {
        STOP = false;
        outputElem.value = '';
        runElem.disabled = true;
        outputElem.style.borderColor = '';

        const statements = code.trim().split(code.includes('~') ? '~' : '\n')
            .map(line => {
                const commentIndex = line.indexOf('#');
                if (commentIndex !== -1) {
                    line = line.substring(0, commentIndex);
                }
                return line.trim();
            })
            .filter(line => line.length > 0);

        if (statements[0] !== '젓가락이 지휘봉이라고 생각하시고' || !statements.slice(-1)[0].startsWith('탈락했습니다 너무 짜요!')) {
            throw new Error('어? 이게뭐여 어으얽읅어 응? 음? 이거 비빔랭 아니잖아');
        }

        const variables = [];
        let pointer = 0;
        let inputpointer = 0;
        const functions = {};
        const inputs = input.split('\n').map(x => parseInt(x) || 0);

        // 함수 정의를 먼저 수집
        for (let i = 0; i < statements.length; i++) {
            if (statements[i].startsWith('두둥')) {
                let funcName = statements[i].split(' ')[0].substring(2);
                let funcParams = statements[i].split(' ').slice(1);
                let funcBody = [];
                i++;

                while (i < statements.length && statements[i] !== '두둥') {
                    funcBody.push(statements[i]);
                    i++;
                }

                functions[funcName] = { params: funcParams, body: funcBody };
            }
        }

        function execute(statement) {
            if (statement.startsWith('두둥')) {
                while (pointer < statements.length && statements[pointer] !== '두둥') {
                    pointer++;
                }
                pointer++;
                return;
            }

            if (statement.startsWith("탁")) {
                const parts = statement.split(" ");
                const funcName = parts[0].substring(1);
                const args = parts.slice(1).map(evaluate);

                if (functions[funcName]) {
                    const func = functions[funcName];
                    const backupVariables = [...variables];

                    for (let i = 0; i < func.params.length; i++) {
                        const paramIndex = func.params[i].split("뷔").length;
                        variables[paramIndex] = args[i];
                    }

                    let savedPointer = pointer;
                    let funcResult;

                    for (let i = 0; i < func.body.length; i++) {
                        if (func.body[i].startsWith("빕")) {
                            funcResult = evaluate(func.body[i].substring(1));
                            break;
                        } else {
                            const result = execute(func.body[i]);
                            if (result !== undefined) {
                                funcResult = result;
                                break;
                            }
                        }
                    }

                    for (let i = 0; i < backupVariables.length; i++) {
                        variables[i] = backupVariables[i];
                    }

                    pointer = savedPointer;
                    return funcResult;
                } else {
                    throw new Error("정의되지 않은 함수입니다: " + funcName);
                }
            }

            if (statement.includes('그만해유') && statement.includes('?')) {
                const condition = evaluate(statement.substring(2, statement.lastIndexOf('?')));
                if (condition === 0) return execute(statement.substr(statement.lastIndexOf('?') + 1));
                return;
            }

            if (statement.includes('뷤')) {
                const variablePointer = statement.split('뷤')[0].split('뷔').length;
                let setteeValue;
                const rightSide = statement.split('뷤')[1];

                if (rightSide && rightSide.trim().startsWith('탁')) {
                    setteeValue = execute(rightSide.trim());
                } else {
                    setteeValue = evaluate(rightSide);
                }

                if (statement.includes('자!')) {
                    setteeValue = evaluate(statement.split('뷤')[0]);
                }

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
            try {
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
            } catch (error) {
                handleError(error);
            }
        }

        const interval = setInterval(parse, 1);

        function handleError(error) {
            outputElem.value = `Error: ${error.message}`;
            outputElem.style.borderColor = 'red';
            stop();
        }

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
    } catch (error) {
        outputElem.value = `Error: ${error.message}`;
        outputElem.style.borderColor = 'red';
        runElem.disabled = false;
    }
}

function stringify(unicode) {
    const char = String.fromCharCode(unicode);
    return char.match(/[\x00-\x1F]/) ? '' : char;
}
