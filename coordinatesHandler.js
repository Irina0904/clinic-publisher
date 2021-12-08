//Type 'node dentistHandler.js' in the console to run this file
//const mqtt = require("mqtt");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
//var mqttClient = require('./mqttHandler');

//var mongoUtil = require('./mongoUtil');


const uri = 'mongodb+srv://IriLev0904:Tuborg2002@cluster0.nkjyt.mongodb.net/WebProject?retryWrites=true&w=majority'
const MongoClient = new mongoClient(uri);


const mqtt = require('mqtt')

const host = 'broker.emqx.io'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `mqtt://${host}:${port}`

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
})



function handleCoordinates() {
    getCoordinates();
    publishCoordinates('clinic-publisher/coordinates', 'hi')
}

    //mongoUtil.connectToServer( function( err, client ) {
        //if (err) console.log(err);
        //var db = mongoUtil.getDb();
        //var dentists = db.collection('dentists');
        //getCoordinates();
    //});
    //publishCoordinates('clinic-publisher/coordinates', 'hi');

async function getCoordinates() {

    await MongoClient.connect();
    console.log('Connected successfully to server');
    const db = MongoClient.db();
    const dentists = db.collection('dentists');

        return new Promise((resolve, reject) => {
    
        let clinics = [];
            dentists.find({}).toArray().then((result) => {
                clinics = result;

                let coordinates = [];
                for (let i = 0; i < clinics.length; i++) {
                    let coordinate = {
                        longitude: "",
                        latitude: "",
                    };
                    coordinate.longitude = clinics[i].coordinate.longitude;
                    coordinate.latitude = clinics[i].coordinate.latitude;
                    coordinates.push(coordinate);
                }
                console.log(coordinates);
                client.on('connect', () => {
                    console.log('Connected coordinates')
                    client.subscribe([topic], () => {
                      console.log(`Subscribe to topic '${topic}'`)
                    })
                    client.publish('clinic-publisher/coordinates', 'hello', { qos: 0, retain: true }, (error) => {
                      if (error) {
                        console.error(error)
                      }
                    })
                  })
            })
            resolve(console.log('resolved'))
    });
    
    
}



function publishCoordinates(topic, message) {
    //var client = mqttClient.getMQTTClient();

    console.log('publishCoordinates')
    
    client.on('connect', () => {
        console.log('Connected')
        client.subscribe([topic], () => {
          console.log(`Subscribe to topic '${topic}'`)
        })
        client.publish(topic, message, { qos: 0, retain: true }, (error) => {
          if (error) {
            console.error(error)
          }
        })
      })
}

module.exports = {
    getCoordinates
}
