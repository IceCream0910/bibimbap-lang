import * as fs from 'fs';
import * as readlineSync from 'readline-sync';

let STOP = false;

function run(code: string) {
  STOP = false;

  const statements = code.trim().split(code.includes('~') ? '~' : '\n').map(line => line.trim());

  if (statements[0] !== '젓가락이 지휘봉이라고 생각하시고' || !statements.slice(-1)[0].startsWith('탈락했습니다 너무 짜요!')) {
    console.error('어? 이게뭐여 어으얽읅어 응? 음? 이거 비빔랭 아니잖아');
    return;
  }

  const variables: number[] = [];
  let pointer = 0;

  function execute(statement: string): any {
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
      else printOut(stringify(evaluate(statement.slice(1, -1))));
    }

    if (statement.includes('계속')) {
      pointer = evaluate(statement.split('계속')[1]) - 1;
    }

    if (statement.indexOf('열정적으로!') === 0) {
      return evaluate(statement.split('열정적으로!')[1]);
    }
  }

  function parse() {
    if (pointer >= statements.length) {
      return true;
    }

    if (statements[pointer].startsWith('탈락했습니다 너무 짜요!')) {
      return true;
    }
    if (STOP) {
      STOP = false;
      return true;
    }

    const statement = statements[pointer++];
    const evaluated = execute(statement);

    return typeof evaluated !== 'undefined';
  }

  function printOut(str: string) {
    process.stdout.write(str);
  }

  function evaluate(x: string): number {
    let n = 0;
    if (x.includes(' ')) return x.split(' ').map(evaluate).reduce((a, b) => Math.imul(a, b));
    while (x.includes('자!')) {
      const input = readlineSync.question('Input: ');
      const answer = Number(input);
      if (isNaN(answer)) {
        console.error('정수만 입력할 수 있어요!');
        process.exit(1);
      }
      x = x.replace('자!', '');
      n += answer;
    }
    if (x.includes('뷔')) n += variables[x.split('뷔').length - 1] | 0;
    if (x.includes('비')) n += x.split('비').length - 1;
    if (x.includes('빔')) n -= x.split('빔').length - 1;
    return (n + 2158221066240) % 4294967296 - 2147483648;
  }

  function stringify(unicode: number): string {
    const char = String.fromCharCode(unicode);
    return /[\x00-\x1F]/.test(char) ? '' : char;
  }

  while (pointer < statements.length && !STOP) {
    if (parse()) break;
  }
}

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('실행할 코드 파일이 지정되지 않았어요!');
  process.exit(1);
}

const codeFilename = args[0];

try {
  const code = fs.readFileSync(codeFilename, 'utf-8');
  run(code);
  process.stdout.write('\n');
} catch (error: any) {
  console.error('코드 실행 중 오류 발생:', error.message);
  process.exit(1);
}