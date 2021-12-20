//Type 'node dentistHandler.js' in the console to run this file
var mqttClient = require('./mqttHandler');
var mongoUtil = require('./mongoUtil');
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

                let clinicsInfo = [];
                for (let i = 0; i < clinics.length; i++) {
                    let clinic = {
                        _id: "",
                        name: "",
                        address: "",
                        city: "",
                    };
                    clinic._id = clinics[i]._id;
                    clinic.name = clinics[i].name;
                    clinic.address = clinics[i].address;
                    clinic.city = clinics[i].city;
                    clinicsInfo.push(clinic);
                }
                console.log(clinicsInfo)
                client.publish('clinic-publisher/clinicsInfo', JSON.stringify(clinicsInfo), { qos: 0, retain: true }, (error) => {
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
