# MQTT Data Sending and Listening System

This repository contains a system for sending and listening to data using MQTT (Message Queuing Telemetry Transport) protocol. MQTT is a lightweight messaging protocol designed for IoT (Internet of Things) applications. This system consists of two main scripts, `mqttSender.js` for sending data and `mqttListener.js` for receiving data, along with a `package.json` file to manage dependencies.

## Prerequisites

Before using this system, ensure you have the following installed on your machine:

- Node.js: https://nodejs.org/
- Docker (for running the MQTT broker): https://www.docker.com/

## Installation

1. Clone this repository to your local machine.
2. Install the project dependencies by navigating to the root directory of the repository and running the following command:

    ```bash
    npm install
    ```
## Usage
### Starting the MQTT Broker
To use this system, you need to set up an MQTT broker. For this purpose, we recommend using EMQ X Broker, which is an open-source MQTT broker. Follow these steps to start the MQTT broker:

**Step 1:** For the first time, use the following command to run the EMQ X Broker in a Docker container:
```bash
sudo docker run -d --name emqx -p 1888:1883 -p 8083:8083 -p 8084:8084 -p 8883:8883 -p 18083:18083 emqx/emqx
```
**Step 2:** Once the container is created, you can start it using the following command:
```bash
sudo docker start emqx
```

## Sending Data
To send data to the MQTT broker, use the `mqttSender.js` script. It reads data from a CSV file and sends each row as a JSON message to the specified MQTT topic. Follow the steps below to send data:

**Step 1:** Ensure the MQTT broker is running as described in the previous section.

**Step 2:** Open a terminal, navigate to the root directory of this repository, and execute the following command:

```bash
node mqttSender.js <broker_ip> <port> <topic> <csv_file_path>
```

Replace the placeholders with the following:

* `<broker_ip>`: The IP address of the MQTT broker. If running locally on the same machine, use localhost.
* `<port>`: The port number of the MQTT broker. The default MQTT port is 1883.
* `<topic>`: The MQTT topic to which the data will be sent.
* `<csv_file_path>`: The path to the CSV file containing the data to be sent.

**Step 3:** The script will connect to the MQTT broker and start publishing messages. Each row of the CSV file will be sent as a JSON message with attribute names as keys.

## Receiving Data
To listen and receive data from the MQTT broker, use the mqttListener.js script. The received data will be saved to a CSV file named received.csv. Follow the steps below to receive data:

**Step 1:** Ensure the MQTT broker is running as described in the previous section.

**Step 2:** Open a new terminal, navigate to the root directory of this repository, and execute the following command:

```bash
node mqttListener.js <broker_ip> <port> <topic>
```
Replace the placeholders with the following:

* `<broker_ip>`: The IP address of the MQTT broker. If running locally on the same machine, use localhost.
* `<port>`: The port number of the MQTT broker. The default MQTT port is 1883.
* `<topic>`: The MQTT topic from which the data will be received.

**Step 3:** The script will connect to the MQTT broker and start listening to the specified topic. Any received messages will be saved to the received.csv file in CSV format.

## Customization
You can modify the mqttSender.js and mqttListener.js scripts according to your specific use case. For example, you can adjust the interval at which data is sent or received, customize the log paths, or extend the data processing logic.

## Dependencies
This project relies on the mqtt library for Node.js to interact with the MQTT broker. The necessary dependency is listed in the package.json file.


