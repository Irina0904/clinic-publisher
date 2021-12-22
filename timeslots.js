//Type 'node dentistHandler.js' in the console to run this file
var mqttClient = require('./mqttHandler');
var mongoUtil = require('./mongoUtil');
const client = mqttClient.getMQTTClient();
var moment = require('moment');

async function sendTimeSlots(id) {

    let weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    mongoUtil.connectToServer(function (err) {
        if (err) console.log(err);
        const db = mongoUtil.getDb();
        const dentists = db.collection('dentists');

        return new Promise((resolve, reject) => {

            dentists.findOne({ id: id }).then((result) => {

                let clinicTimeslots = {
                    name: "",
                    openinghours: {
                        monday: {
                            openinghour: "",
                            closinghour: ""
                        },
                        tuesday: {
                            openinghour: "",
                            closinghour: ""
                        },
                        wednesday: {
                            openinghour: "",
                            closinghour: ""
                        },
                        thursday: {
                            openinghour: "",
                            closinghour: ""
                        },
                        friday: {
                            openinghour: "",
                            closinghour: ""
                        }
                    },
                };

                clinicTimeslots.name = result.name;

                for (let j = 0; j < weekdays.length; j++) {
                    let times = result.openinghours[weekdays[j]].split("-")

                    clinicTimeslots.openinghours[weekdays[j]].openinghour = times[0];
                    clinicTimeslots.openinghours[weekdays[j]].closinghour = times[1];

                }
                var timeslots = generateTimeSlots(clinicTimeslots)

                client.publish("clinic-publisher/schedule", JSON.stringify(timeslots), { qos: 0, retain: true }, (error) => {
                    console.log('published')
                    if (error) {
                        console.error(error)
                    }
                })

            })

            resolve(console.log('resolved'))
        });
    });

}

function generateTimeSlots(data) {

    let clinicSchedule = {
        clinic: data.name,
        schedule: []
    }

    for (j = 0; j < 7; j++) {

        let date = new Date(new Date().setDate(new Date().getDate() + j))

        let weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

        let dayNum = moment(date).isoWeekday()

        if (dayNum < 6) {

            var startTime = data.openinghours[weekdays[dayNum - 1]].openinghour;
            var closingTime = data.openinghours[weekdays[dayNum - 1]].closinghour;
            var slots = generateTimeSlotsForDay(date, startTime, closingTime);
            clinicSchedule.schedule.push({
                date: date,
                slots: slots
            })
        }
    } return clinicSchedule
}

function generateTimeSlotsForDay(date, start, end) {
    if (start.length == 4) {
        var startDate = moment(`${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getUTCDate()} 0${start}:00`)
    }
    else {
        var startDate = moment(`${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getUTCDate()} ${start}:00`)
    }

    var endDate = moment(`${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getUTCDate()} ${end}:00`)
    var timeslots = []
    timeslots.push(startDate);

    for (i = 0; i < timeslots.length && (timeslots[i].isBefore(endDate)); i++) {
        var increment = moment(timeslots[i]).add(0.5, 'hours')
        timeslots.push(increment)
    }
    return timeslots.map(timeslot => {
        return {
            date: timeslot.format()
        }
    })
}



module.exports = {
    sendTimeSlots
}
