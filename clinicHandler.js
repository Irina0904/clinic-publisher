//Type 'node dentistHandler.js' in the console to run this file
var mqttClient = require('./mqttHandler');
var mongoUtil = require('./mongoUtil');
const { ObjectId } = require('bson');
const client = mqttClient.getMQTTClient();

async function sendClinicsInfo() {

    mongoUtil.connectToServer( function( err ) {
        if (err) console.log(err);
        const db = mongoUtil.getDb();
        const dentists = db.collection('dentists');

        return new Promise((resolve, reject) => {
        
        let clinics = [];
            dentists.find({}).toArray().then((result) => {
                clinics = result;
                console.log(clinics);

                let clinicsInfo = [];
                for (let i = 0; i < clinics.length; i++) {
                    let clinic = {
                        id: clinics[i].id,
                        name:  clinics[i].name,
                        address: clinics[i].address,
                        city: clinics[i].city,
                    };
                    console.log(clinics[i]._id.toString())
                    clinicsInfo.push(clinic);
                }
                console.log(clinicsInfo)
                client.publish('clinic-publisher/clinicsInfo', JSON.stringify(clinicsInfo), { qos: 0, retain: true }, (error) => {
                    console.log('published')
                    if (error) {
                    console.error(error)
                    }
                });
                resolve(console.log('resolved'))
        });
        });
    });
}
module.exports = {
    sendClinicsInfo
}
