const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// Get MQTT broker IP, topic, and port from command-line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node subscriber.js <broker_ip> <port> <topic>');
  process.exit(1);
}

const brokerIp = args[0];
const port = parseInt(args[1]);
const topic = args[2];

// Create a write stream to log outputs to stderr.log
const logFilePath = path.join(__dirname, '../logfiles/', 'stderrListener.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Create a write stream to write received messages directly to received.csv
const receivedFilePath = path.join(__dirname, '../receivedFiles',  '/received.csv');
const receivedStream = fs.createWriteStream(receivedFilePath, { flags: 'a' });

// Function to check if the received.csv file is empty
function isFileEmpty(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size === 0;
  } catch (err) {
    return true; // File doesn't exist or an error occurred while accessing it
  }
}

// Flag to track if the received.csv file is empty
let isFirstLine = isFileEmpty(receivedFilePath);

// Function to convert a JavaScript object to a CSV string
function convertToCsv(dataObject) {
  const dataArray = [];
  for (const key in dataObject) {
    dataArray.push(dataObject[key]);
  }
  return dataArray.join(',') + '\n';
}

// Connect to the MQTT broker
const client = mqtt.connect(`mqtt://${brokerIp}:${port}`);
client.on('connect', () => {
  logStream.write('Connected to MQTT broker\n');
  client.subscribe(topic, (err) => {
    if (err) {
      logStream.write(`Error subscribing to topic: ${err}\n`);
    }
  });
});

// Callback to handle incoming messages
client.on('message', (topic, message) => {
  try {
    const jsonMessage = JSON.parse(message.toString());

    // Add timestampAtAggregator field with the current timestamp in seconds
    jsonMessage.timestampAtAggregator = Math.floor(Date.now() / 1000);

    // Convert the message to a CSV string
    const csvString = convertToCsv(jsonMessage);

    // Check if the received.csv file is empty and add attribute names as the first line
    if (isFirstLine) {
      const attributeNames = Object.keys(jsonMessage);
      receivedStream.write(attributeNames.join(',') + '\n', (err) => {
        if (err) {
          logStream.write(`Error saving attribute names: ${err}\n`);
        }
      });
      isFirstLine = false;
    }

    // Write the CSV string directly to received.csv
    receivedStream.write(csvString, (err) => {
      if (err) {
        logStream.write(`Error saving received CSV: ${err}\n`);
      }
    });
  } catch (err) {
    logStream.write(`Error processing MQTT message: ${err}\n`);
  }
});

// Handle MQTT errors
client.on('error', (err) => {
  logStream.write(`MQTT error: ${err}\n`);
});

// Handle MQTT disconnect
client.on('close', () => {
  logStream.write('Disconnected from MQTT broker\n');
  receivedStream.end(); // Close the received stream when the script is finished
  logStream.end(); // Close the log stream when the script is finished
});
