const fs = require('fs');
const readline = require('readline');

// Input file path
const filePath = 'kafka-dump.txt'; // Change this to your actual file path

// Data structure to store combinations and their occurrences
const report = new Map();

async function processFile() {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let lineNumber = 0;

    for await (const line of rl) {
        lineNumber++;
        try {
            const json = JSON.parse(line);
            const service = json.metadata?.trace?.service || 'UNKNOWN';
            const eventType = json.metadata?.event?.type || 'UNKNOWN';
            const eventAction = json.metadata?.event?.action || 'UNKNOWN';
            
            const key = `${service}|${eventType}|${eventAction}`;
            
            if (!report.has(key)) {
                report.set(key, { count: 0, lines: [], firstMsg: json });
            }
            
            report.get(key).count++;
            report.get(key).lines.push(lineNumber);
        } catch (err) {
            console.error(`Error parsing JSON at line ${lineNumber}:`, err.message);
        }
    }

    generateReport();
}

// function generateReport() {
//     console.log('Report:');
//     console.log('Service | Event Type | Event Action | Count | Line Numbers');
//     console.log('--------------------------------------------------------');
    
//     for (const [key, value] of report.entries()) {
//         // console.log(`${key.replace(/\|/g, ' | ')} | ${value.count} | ${value.lines.join(', ')}`);
//         console.log(`${key.replace(/\|/g, ' | ')} | ${value.count} | ${value.lines[0] }`);
//     }
// }

function generateReport() {
    console.log('Report:');
    console.log('-----------------------------------------------------------------------------------------------------------------------');
    console.log('| Service                                  | Event Type         | Event Action       | Count | Line Numbers         |');
    console.log('-----------------------------------------------------------------------------------------------------------------------');
    
    for (const [key, value] of report.entries()) {
        const [service, eventType, eventAction] = key.split('|');
        let contentContainsKafkaMessage = 'No';
        let subTopic = ' ';
        let subType = ' ';
        let subAction = ' ';
        if (value.firstMsg.content?.hasOwnProperty('value')) {
            contentContainsKafkaMessage = 'Yes';
            subTopic = value.firstMsg.content.topic || ' ';
            subType = value.firstMsg.content.value.metadata?.event.type;
            subAction = value.firstMsg.content.value.metadata?.event.action;
        } else if (value.firstMsg.content?.hasOwnProperty('content')) {
            contentContainsKafkaMessage = 'Yes but not inside value';
            subTopic = value.firstMsg.content.topic || ' ';
            subType = value.firstMsg.content.metadata?.event.type || ' ';
            subAction = value.firstMsg.content.metadata?.event.action || ' ';
        }
        // console.log(`| ${service.padEnd(18)} | ${eventType.padEnd(18)} | ${eventAction.padEnd(18)} | ${value.count.toString().padEnd(5)} | ${value.lines.join(', ').padEnd(20)} |`);
        console.log(`| ${service.padEnd(40)} | ${eventType.padEnd(18)} | ${eventAction.padEnd(18)} | ${contentContainsKafkaMessage.padEnd(25)} | ${subTopic.padEnd(25)} | ${subType.padEnd(25)} | ${subAction.padEnd(25)} | ${value.count.toString().padEnd(5)} | ${value.lines[0].toString().padEnd(20)} |`);
        // console.log(`${service},${eventType},${eventAction},${contentContainsKafkaMessage},${subTopic},${subType},${subAction},${value.count.toString()},${value.lines[0].toString()}`);
    }
    console.log('----------------------------------------------------------------------------------------------------------------------');
}

processFile().catch(err => console.error('Error processing file:', err));
