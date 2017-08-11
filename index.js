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
        var coll = db.collection("users");
        coll.insert(user);
    }

    var findTutorsForSubject = function (db, subject) {
        var coll = db.collection("users");
        var matches = [];
        coll.find({}).toArray(function (err, docs) {
            if (docs == undefined) {
                return;
            }
            docs.forEach(function (user) {
                if (user.subjects.tutor.indexOf(subject) != -1) {
                    matches.push(user);
                }
            });
        });
        return matches;
    }

    var findUser = function (db, email) {
        var user = null;
        var coll = db.collection("users");
        coll.find({ "email": email }).toArray(function (err, docs) {
            if (docs != undefined && docs.length > 0) {
                user = docs[0];
            }
        });
        return user;
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
        }
        if (req.body.find_tutors != undefined) {
            res.set('Content-Type', 'application/json');
            res.set("Access-Control-Allow-Origin", "*");
            res.send({ tutors: findTutorsForSubject(db, req.body.find_tutors) });
        }
        if (req.body.get_user != undefined) {
            res.set('Content-Type', 'application/json');
            res.set("Access-Control-Allow-Origin", "*");
            res.send({ user: findUser(db, req.body.get_user) });
        }
    });

    app.use("/", express.static("static"));

    app.listen(3000, function () {
        console.log('Example app listening on port 3000!')
    });

    db.close();
});

