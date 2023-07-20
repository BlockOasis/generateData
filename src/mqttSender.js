const mqtt = require('mqtt');

// MQTT broker URL
const brokerUrl = 'mqtt://192.168.1.5:1888'; // Replace 'localhost' with your broker's IP or domain if it's hosted elsewhere

// MQTT topic to publish the message to
const topic = 'test'; // Replace 'myTopic' with the topic you want to use

// Message to publish
const message = 'Hello, MQTT!'; // Replace with your desired message

// Connect to the MQTT broker
const client = mqtt.connect(brokerUrl);

// Callback to execute when the client is connected
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Publish the message to the topic
  client.publish(topic, message, (err) => {
    if (err) {
      console.error('Error publishing message:', err);
    } else {
      console.log(`Message published: ${message}`);
      // Disconnect the client after publishing the message
      client.end();
    }
  });
});

// Callback to execute when the client is disconnected
client.on('close', () => {
  console.log('Disconnected from MQTT broker');
});
