//Type 'node dentistHandler.js' in the console to run this file
var mqttClient = require('./mqttHandler');
var mongoUtil = require('./mongoUtil');
const client = mqttClient.getMQTTClient();

async function sendCoordinates() {


    mongoUtil.connectToServer( function( err ) {
        if (err) console.log(err);
        const db = mongoUtil.getDb();
        const dentists = db.collection('dentists');

        return new Promise((resolve, reject) => {
    
        let clinics = [];
            dentists.find({}).toArray().then((result) => {
                clinics = result;

                let coordinates = [];
                for (let i = 0; i < clinics.length; i++) {
                    let coordinate = {
                            type: "Feature",
                            geometry: {
                              type: "Point",
                              coordinates: [],
                            },
                            properties: {
                              title: "",
                              description: "",
                            },
                    };
                    coordinate.geometry.coordinates = [clinics[i].coordinate.longitude, clinics[i].coordinate.latitude];
                    coordinate.properties.title = clinics[i].name;
                    coordinate.properties.description = clinics[i].address;
                    coordinates.push(coordinate);
                }
                console.log(coordinates);
                const message = {
                    type: "FeatureCollection",
                    features: coordinates
                }
              client.publish('clinic-publisher/coordinates', JSON.stringify(message), { qos: 0, retain: true }, (error) => {
                console.log('published');
                    if (error) {
                      console.error(error)
                    }
                  })
            })
            resolve(console.log('resolved'))
    });
});
    
}

module.exports = {
    sendCoordinates
}
