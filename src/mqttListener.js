const mqtt = require('mqtt');

// MQTT broker URL
const brokerUrl = 'mqtt://192.168.1.5:1888'; // Replace with your broker's IP or domain if it's hosted elsewhere

// MQTT topic to publish the message to
const topic = 'test'; // Replace 'test' with the topic you want to subscribe to

// Connect to the MQTT broker
const client = mqtt.connect(brokerUrl);

// Callback to execute when the client is connected
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to the topic
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Error subscribing to topic:', err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

// Callback to execute when a message is received
client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
});

// Callback to execute when the client is disconnected
client.on('close', () => {
  console.log('Disconnected from MQTT broker');
});
