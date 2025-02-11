const fs = require('fs');
const readline = require('readline');
const { stdin, stdout } = require('process');

const filePath = 'kafka-dump.txt';
const outputFile = 'output.json';

let lines = [];
let currentIndex = 0;

const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    lines.push(line);
}).on('close', () => {
    console.log(`Loaded ${lines.length} lines from ${filePath}.`);
    showCurrentLine();
});

readline.emitKeypressEvents(stdin);
stdin.setRawMode(true);

function showCurrentLine(flush = true) {
    if (currentIndex < 0 || currentIndex >= lines.length) {
        console.log('Invalid line number.');
        return;
    }
    console.clear();
    console.log(`Line ${currentIndex + 1}:`);
    try {
        const json = JSON.parse(lines[currentIndex]);
        // console.log(JSON.stringify(json, null, 2));
        // console.log(JSON.stringify(json.metadata, null, 2));
        if (flush) {
            flushLine(json)
        }
        return json;
    } catch (error) {
        console.log('Error parsing JSON:', error.message);
    }
}

function flushLine(json) {
    try {
        fs.writeFileSync(outputFile, JSON.stringify(json, null, 2));
    } catch (error) {
        console.log('Error writing to file:', error.message);
    }
}

stdin.on('keypress', (str, key) => {
    if (key.name === 'right') {
        if (currentIndex < lines.length - 1) {
            currentIndex++;
            showCurrentLine();
        }
    } else if (key.name === 'left') {
        if (currentIndex > 0) {
            currentIndex--;
            showCurrentLine();
        }
    } else if (key.name === 'f') {
        let found = false;
        while (currentIndex < lines.length - 1) {
            currentIndex++;
            const json = showCurrentLine(false);
            if (!json.metadata?.trace?.service) {
                found = true;
                flushLine(json);
                break;
            }
        }
        if (!found) {
            console.log('No more messages found.');
        }

    } else if (key.name === 'g') {
        console.log('\nEnter line number:');
        stdin.setRawMode(false);
        const inputRl = readline.createInterface({ input: stdin, output: stdout });
        inputRl.question('', (input) => {
            const lineNum = parseInt(input, 10);
            if (!isNaN(lineNum) && lineNum > 0 && lineNum <= lines.length) {
                currentIndex = lineNum - 1;
                showCurrentLine();
            } else {
                console.log('Invalid line number.');
            }
            inputRl.close();
            stdin.setRawMode(true);
            readline.emitKeypressEvents(stdin); // Restore keypress handling
        });
    } else if (key.name === 'q') {
        console.log('Exiting...');
        process.exit();
    }
});