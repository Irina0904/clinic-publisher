//Type 'node dentistHandler.js' in the console to run this file
var mqttClient = require('./mqttHandler');
var mongoUtil = require('./mongoUtil');
const client = mqttClient.getMQTTClient();
var moment = require('moment');
const _ = require('lodash')


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

                sendAppointmentInfo().then((result) => {
                    var filteredTimetslots = [];
                    let bookedTimeSlots = result
                    // filteredTimetslots = timeslots.schedule.flatMap(schedule => schedule.slots).map(slot => slot.date).filter(date => !bookedTimeSlots.includes(date));
                    // console.log(filteredTimetslots)
                     for (const schedule of timeslots.schedule) {
                        _.remove(schedule.slots, (slot) => {

                            return bookedTimeSlots.includes(slot.date)
                        })
                        console.log(schedule.slots)
                     }
                    console.log(timeslots)
                    client.publish("clinic-publisher/schedule", JSON.stringify(timeslots), { qos: 0, retain: true }, (error) => {
                        if (error) {
                            console.error(error)
                        }
                    })
    
                })
             
                 }).catch(err => console.log(err));



            resolve(console.log('resolved'))
        });
    });

}

async function sendAppointmentInfo() {
    await mongoUtil.connectToServer(async function (err) {
        if (err) console.log(err);
    });

    const db = mongoUtil.getDb();
    const dentists = db.collection('appointments');


    const slots = await dentists.find({}).toArray().then((result) => {
        let bookedTimeSlots = [];

        for (let i = 0; i < result.length; i++) {

            bookedTimeSlots.push(result[i].appointmentDate);
        }

        return bookedTimeSlots
    });

    return slots
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

    var lunch = moment(`${date.getUTCFullYear()}-${formatDateNumber(date.getMonth() + 1)}-${formatDateNumber(date.getUTCDate())} 12:00:00`)
    var fika = moment(`${date.getUTCFullYear()}-${formatDateNumber(date.getMonth() + 1)}-${formatDateNumber(date.getUTCDate())} 14:00:00`)

    if (start.length == 4) {
        var startDate = moment(`${date.getUTCFullYear()}-${formatDateNumber(date.getMonth() + 1)}-${formatDateNumber(date.getUTCDate())} 0${start}:00`)
    }
    else {
        var startDate = moment(`${date.getUTCFullYear()}-${formatDateNumber(date.getMonth() + 1)}-${formatDateNumber(date.getUTCDate())} ${start}:00`)
    }

    var endDate = moment(`${date.getUTCFullYear()}-${formatDateNumber(date.getMonth() + 1)}-${formatDateNumber(date.getUTCDate())} ${end}:00`)
    var timeslots = []
    timeslots.push(startDate);

    for (i = 0; i < timeslots.length && (timeslots[i].isBefore(endDate)); i++) {

        if (JSON.stringify(lunch) === JSON.stringify(timeslots[i])) {
            var increment = moment(timeslots[i]).add(1.5, 'hours')
        }
        else if (JSON.stringify(fika) === JSON.stringify(timeslots[i])) {
            var increment = moment(timeslots[i]).add(1, 'hours')
        }
        else {
            var increment = moment(timeslots[i]).add(0.5, 'hours')
        }
        timeslots.push(increment)
    }

    return timeslots.map(timeslot => {
        return {
            date: timeslot.format()
        }
    })

}

// function updateTimeSlots(timeslots) {
//     for (j = 0; j < bookedTimeSlots.length; j++) {
//         for (k = 0; k < timeslots.length; k++) {
//         if(JSON.stringify.timeslots[j] === JSON.stringify(bookedTimeSlots[j])){
//                 console.log('there is a match')
//         }
//     }
// }
// }

function formatDateNumber(number) {
    var valAsString = number.toString();
    if (valAsString.length === 1) {
        return '0' + valAsString;
    }

    return valAsString

}

module.exports = {
    sendTimeSlots
}
