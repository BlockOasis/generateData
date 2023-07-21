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

const maxFileSizeBytes = 5000; // 10 KB (adjust as needed)

let receivedData = ''; // Variable to store received data as a CSV string
let isFirstLine = true; // Flag to indicate if it's the first line of the received data

// Create a write stream to log outputs to stderr.log
const logFilePath = path.join(__dirname, '../logfiles/', 'stderrListener.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

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

    // Log the current state before updating receivedData
    logStream.write(`Current state before update:\n${receivedData}\n`);

    // Check if appending the CSV string would exceed the maximum file size
    const totalSize = receivedData.length + csvString.length;
    if (totalSize >= maxFileSizeBytes) {
      // Save the current receivedData as a chunk file with timestamp in the name
      const timestamp = Date.now();
      const chunkFileName = `chunk-${timestamp}.csv`;
      const chunkFilePath = path.join(__dirname, '../receivedFiles', chunkFileName);

      fs.writeFileSync(chunkFilePath, receivedData, (err) => {
        if (err) {
          logStream.write(`Error saving chunk file: ${err}\n`);
        }
      });

      // Reset isFirstLine flag to true to start writing attribute names in the new file
      isFirstLine = true;

      // Clear receivedData to start receiving new data in the variable
      receivedData = '';
    }

    // Add attribute names as the first line if it's the beginning of the data
    if (isFirstLine) {
      const attributeNames = Object.keys(jsonMessage);
      receivedData += attributeNames.join(',') + '\n';
      isFirstLine = false;
    }

    // Append the CSV string to receivedData
    receivedData += csvString;

    // Log the current state after updating receivedData
    logStream.write(`Current state after update:\n${receivedData}\n`);
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

  // If there's any remaining data in receivedData, save it as the final chunk
  if (receivedData.length > 0) {
    const timestamp = Date.now();
    const chunkFileName = `chunk-${timestamp}.csv`;
    const chunkFilePath = path.join(__dirname, '../receivedFiles', chunkFileName);

    fs.writeFileSync(chunkFilePath, receivedData, (err) => {
      if (err) {
        logStream.write(`Error saving chunk file: ${err}\n`);
      }
    });
  }

  // Close the script gracefully
  receivedStream.end();
  logStream.end();
  process.exit(0);
});
