const express = require('express')
const app = express()

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var bodyParser = require('body-parser');

// Connection URL
var url = 'mongodb://localhost:27017/ttbackend';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    var storeUser = function (db, user) {
        console.log("Storing User");
        var coll = db.collection("users");
        console.log("Collection initialized");
        try {
            coll.insertMany([user]);
        } catch (e) {
            console.log(e);
        }
    }

    var findTutorsForSubject = function (db, subject, callback) {
        var coll = db.collection("users");
        var matches = [];
        coll.find({}).toArray(function (err, docs) {
            if (docs == undefined) {
                return;
            }
            docs.forEach(function (user) {
                if (user.subjects === undefined || user.subjects.tutor === undefined) {
                    return;
                }
                if (user.subjects.tutor.indexOf(subject) != -1) {
                    try {
                        matches.push(user);
                    } catch (e) {
                    }
                }
            });
            callback(matches);
        });
    }

    var findUser = function (db, email, callback) {
        var user = null;
        var coll = db.collection("users");
        coll.find({ "email": email }).toArray(function (err, docs) {
            if (docs != undefined && docs.length > 0) {
                callback(docs[0]);
            }
        });
    }

    var selectTutor = function (db, email, tutor) {
        var coll = db.collection("users");
        coll.find({ "email": email }).toArray(function (err, docs) {
            console.log(docs);
            if (docs != undefined && docs.length > 0) {
                if (docs[0].selected_tutors === undefined) {
                    docs[0].selected_tutors = [];
                }
                var sel = docs[0].selected_tutors;
                sel.push(tutor);
                coll.updateOne(docs[0], { $set: { selected_tutors: sel } });
            }
        });
    }

    var getTutoredStudents = function (db, email, callback) {
        var coll = db.collection("users");
        var matches = [];
        coll.find({}).toArray(function (err, docs) {
            if (docs == undefined) {
                return;
            }
            docs.forEach(function (user) {
                if (user.selected_tutors === undefined) {
                    return;
                }
                if (user.selected_tutors.indexOf(email) != -1) {
                    try {
                        matches.push(user);
                    } catch (e) {
                    }
                }
            });
            callback(matches);
        });
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post("/api", function (req, res) {
        console.log(req.body);
        if (req.body.new_user != undefined) {
            storeUser(db, req.body.new_user);
            res.set('Content-Type', 'application/json');
            res.set("Access-Control-Allow-Origin", "*");
            res.send({ success: true });
            return;
        }
        if (req.body.find_tutors != undefined) {
            res.set('Content-Type', 'application/json');
            res.set("Access-Control-Allow-Origin", "*");
            findTutorsForSubject(db, req.body.find_tutors, (d) => res.send({ tutors: d }));
            return;
        }
        if (req.body.get_user != undefined) {
            res.set('Content-Type', 'application/json');
            res.set("Access-Control-Allow-Origin", "*");
            findUser(db, req.body.get_user, (u) => res.send(u));
            return;
        }
        if (req.body.sel_tutor != undefined) {
            res.set('Content-Type', 'application/json');
            res.set("Access-Control-Allow-Origin", "*");
            selectTutor(db, req.body.sel_tutor, req.body.selected_tutor);
            res.send({ success: true });
            return;
        }
        if (req.body.tutored_students != undefined) {
            res.set('Content-Type', 'application/json');
            res.set("Access-Control-Allow-Origin", "*");
            getTutoredStudents(db, req.body.tutored_students, (d) => res.send({ tutors: d }));
            return;
        }
        res.set('Content-Type', 'application/json');
        res.set("Access-Control-Allow-Origin", "*");
        res.send({error: "No Body"})
    });

    app.use("/", express.static("static"));

    app.listen(3000, function () {
        console.log('Example app listening on port 3000!')
    });

});

