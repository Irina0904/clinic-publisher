//Type 'npm start' in the console to run this file
var fetch = require('node-fetch');
//const dotenv = require("dotenv");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
var mqttClient = require('./mqttHandler');
var coordinateHandler = require('./coordinatesHandler');
var clinicHandler = require('./clinicHandler');
//const CircuitBreaker = require("opossum");

const uri = 'mongodb+srv://IriLev0904:Tuborg2002@cluster0.nkjyt.mongodb.net/WebProject?retryWrites=true&w=majority'

const client = new mongoClient(uri);

coordinateHandler.sendCoordinates();
clinicHandler.sendClinicsInfo();

mqttClient.mqttTest();


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
main()
.catch(console.error)

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
                delete allDentists[i].id;
                dentists.insertOne(allDentists[i], function(err, res) {
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
