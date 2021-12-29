//Type 'npm start' in the console to run this file
var fetch = require('node-fetch');
//const dotenv = require("dotenv");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
var mqttClient = require('./mqttHandler');
var coordinateHandler = require('./coordinatesHandler');
var timeslotHandler = require('./timeslots')
var clinicHandler = require('./clinicHandler');
//const CircuitBreaker = require("opossum");

const uri = 'mongodb+srv://IriLev0904:Tuborg2002@cluster0.nkjyt.mongodb.net/WebProject?retryWrites=true&w=majority'

const client = new mongoClient(uri);

clinicHandler.sendClinicsInfo();
coordinateHandler.sendCoordinates();
timeslotHandler.sendTimeSlots(4);


async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db();
    const dentists = db.collection('dentists');
  
    // Fetches data from the url every minute
    setInterval(() => fetchData(dentists), 1000 * 60);
    fetchData(dentists)
}
main().catch(console.error)

/*This method fetches data from the url and 
inserts it into the dentists collection.*/
function fetchData(dentists) {
    return new Promise((resolve, reject) => {
        var url = 'https://raw.githubusercontent.com/feldob/dit355_2020/master/dentists.json';
        var allDentists = []

    fetch(url, {
        method: 'GET'
    })
    .then(res => res.json())
        .then(data => {
        dentists.deleteMany({})
            .then(() => {
            for (var i = 0; i < data.dentists.length; i++){
                allDentists.push(data.dentists[i]);

            }
            for (var i = 0; i < allDentists.length; i++){
                dentists.updateOne({ id: allDentists.id },{
                    $set: {
                      id: allDentists[i].id,
                      name: allDentists[i].name,
                      owner: allDentists[i].owner,
                      dentists: allDentists[i].dentists,
                      address: allDentists[i].address,
                      city: allDentists[i].city,
                      coordinate: {
                        longitude: allDentists[i].coordinate.longitude,
                        latitude: allDentists[i].coordinate.latitude,
                      },
                      openinghours: {
                        monday:allDentists[i].openinghours.monday,
                        tuesday:allDentists[i].openinghours.tuesday,
                        wednesday: allDentists[i].openinghours.wednesday,
                        thursday: allDentists[i].openinghours.thursday,
                        friday: allDentists[i].openinghours.friday,
                      },
                    },
                  }, {upsert: true}, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                  });
                }
                console.log("Dentists added successfully")
        })
    })
        .catch(err => {
        console.log(err);
});
    });
};

