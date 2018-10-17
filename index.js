//const http = require('http');
//const router = require('express').Router();
const express = require('express');
var bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "arogyaa.cmdmitk4l6j9.us-east-2.rds.amazonaws.com",
    user: "arogya_admin",
    password: "admin_arogyaa",
    database: "arogyaa_db",
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var response_body;
var phone_number;
var user_phone_number;
var phone_number1 = "123";
var food_name;
var food_index;
var sugar_value;
var report_food;
var report_sugar;
var report_date;
var report_response;
var parsed_report;
var index;
var final_report = "";

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();


    //twiml.message(" Registered!");
    phone_number = JSON.stringify(req.body.From, null, 2);
    response_body = JSON.stringify(req.body.Body);
    console.log(response_body.slice(1, 7));
    console.log(phone_number);
    user_phone_number = response_body.slice(5, 15);

    if (response_body.slice(1, 4) == "REG" || response_body.slice(1, 4) == "reg" || response_body.slice(1, 4) == "Reg") {

        console.log("In");

        connection.query('SELECT phone_number FROM arogyaa_db.UserMaster WHERE phone_number = ?',
            [user_phone_number],
            function (err, response, fields) {

                if (err) {
                    connection.destroy();
                    throw err;
                } else {
                    console.log("inside else");
                    console.log(response);
                    if (response.length != 0) {
                        twiml.message('Your phone number is already registered. ');

                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        //console.log(phone_number);
                    
                        res.end(twiml.toString());
                    }else {
                        console.log("insert");
                        connection.query('INSERT INTO arogyaa_db.UserMaster (phone_number, Date) VALUES (?, CONVERT_TZ(NOW(), @@session.time_zone, "-04:00"))', [user_phone_number]);
                        twiml.message('Your phone number is registered. ');

                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        //console.log(phone_number);

                        res.end(twiml.toString());
                    }
                }

            });   

        //connection.query('INSERT INTO arogyaa_db.UserMaster (phone_number, Date) VALUES (?, CONVERT_TZ(NOW(), @@session.time_zone, "-04:00"))', [user_phone_number]);

    }else if(response_body.slice(1, 5) == "Food" || response_body.slice(1, 5) == "FOOD" || response_body.slice(1, 5) == "food"){
        
        console.log("inside food");
        food_index = response_body.indexOf("SUG");
        food_name = response_body.slice(6, food_index-1);
        sugar_value = response_body.slice(food_index + 4, -1);
        console.log(food_index + food_name + sugar_value);

        connection.query('INSERT INTO arogyaa_db.MasterRecords (phone_number, Sugar, Food, Date) VALUES (?, ?, ?, CONVERT_TZ(NOW(), @@session.time_zone, "-04:00"))', [phone_number, sugar_value, food_name]);
        twiml.message('Record Inserted.');

        res.writeHead(200, { 'Content-Type': 'text/xml' });
        //console.log(phone_number);

        res.end(twiml.toString());

    }else if(response_body.slice(1, 7) == "GETREP"){
        console.log("inside getrep");
        connection.query('SELECT * FROM arogyaa_db.MasterRecords WHERE phone_number = ?',
        [phone_number],
        function (err, response, fields) {

            if (err) {
                connection.destroy();
                throw err;
            } else {
                console.log("inside else");
                console.log(response);
                report_response = response;
                parsed_report = JSON.parse(JSON.stringify(report_response));
                report_food = response[0].Food;
                console.log(parsed_report.length);

                for(index = 0; index < parsed_report.length; index ++){

                    //console.log(report_response[index].Date + " - " + report_response[index].Food + " - " + report_response[index].Sugar );

                    final_report = final_report + (report_response[index].Date.toString().slice(0,25) + " - " + report_response[index].Food + " - " + report_response[index].Sugar + "\n");

                }
                console.log(report_response[0].Date);
                console.log(final_report);
                twiml.message(final_report);
                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    //console.log(phone_number);

                    res.end(twiml.toString());




                // if (response.length != 0) {

                //     twiml.message('Your phone number is already registered. ');

                //     res.writeHead(200, { 'Content-Type': 'text/xml' });
                //     //console.log(phone_number);
                
                //     res.end(twiml.toString());
                // }else {
                //     console.log("insert");
                //     connection.query('INSERT INTO arogyaa_db.UserMaster (phone_number, Date) VALUES (?, CONVERT_TZ(NOW(), @@session.time_zone, "-04:00"))', [user_phone_number]);
                // }
            }

        });  


    }

    //connection.query('INSERT INTO arogyaa_db.UserMaster (phone_number, Date) VALUES (?, CONVERT_TZ(NOW(), @@session.time_zone, "-04:00"))', [phone_number]);




});

app.listen(port);



//phone_number = response_body.From;
//res.end(twiml.toString());
// http.createServer(app).listen(1337, () => {
//   console.log('Express server listening on port 1337');
// });



    //request_body = req.body.Body;
    //console.log(req.body.Body);

    // if(req.body.Body.slice(0,2) == "REG" || req.body.Body.slice(0,2) == "reg" || req.body.Body.slice(0,2) == "Reg"){

    //     console.log("In");

    //     phone_number = req.body.Body.slice(4,13);

    // }


    //connection.query('INSERT INTO arogyaa_db.UserMaster VALUES (id = 1234, Date = NULL)')