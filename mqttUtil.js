const mqtt = require('mqtt');

    class MqttHandler {
      constructor() {
        this.mqttClient = null;
        this.host = 'broker.emqx.io';
        this.username = 'emqx'; 
        this.password = 'public';
      }

      connect() {

        this.mqttClient = mqtt.connect(this.host, {port: 1883});
        // Mqtt error calback
        this.mqttClient.on('error', (err) => {
          console.log(err);
          this.mqttClient.end();
        });

        // Connection callback
        this.mqttClient.on('connect', () => {
          console.log(`mqtt client connected`);
        });


         this.mqttClient.on('close', () => {
           console.log(`mqtt client disconnected`);
         });
      }

    //   // Sends a mqtt message to topic: mytopic
      sendMessage(message, topic) {

            this.mqttClient.publish(topic, JSON.stringify(message));

      }
    }

    module.exports = MqttHandler;