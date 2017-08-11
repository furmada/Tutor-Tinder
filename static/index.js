subjects = ["Math", "Science", "History"];

var signup_subjects = {
    tutor: [],
    tutee: []
};

app_user = null;

function init() {
    phonon.options({

        navigator: {
            defaultPage: 'login',
            hashPrefix: '!', // default !pagename
            animatePages: true,
            enableBrowserBackButton: true,
            templateRootDirectory: '',
            //defaultTemplateExtension: 'html', // if you use page templates
            useHash: true // true to enable hash routing, false otherwise
        },

        i18n: null
    });

    try {
        phonon.navigator().start();
    } catch (e){}
    console.log("init");

    if (localStorage.getItem("user") != null) {
        $.post("http://39b14a77.ngrok.io/api", { get_user: localStorage.getItem("user") }, function (d) {
            phonon.navigator().changePage("tutee");
            app_user = d;
            loadTuteeSubjectList();
            localStorage.setItem("user", d.email);
        });
    } else {
        phonon.navigator().changePage("login");
    }

    document.getElementById("signout-button").onclick = () => {
        localStorage.removeItem("user");
        init();
    }

    var button = document.querySelector("#login-signup");
    button.onclick = () => {
        phonon.navigator().changePage('profile');
    }

    button = document.querySelector("#login-signin");
    button.onclick = () => {
        phonon.navigator().changePage('username');
    }

    button = document.querySelector("#profile-continue");
    button.onclick = () => {
        if (!$("#profile-default_to_tutor").prop("checked")) {
            phonon.navigator().changePage('tutee');
        } else {
            phonon.navigator().changePage('tutor');
        }
        var user = {
            name: $("#profile-name").val(),
            email: $("#profile-email").val(),
            password: $("#profile-password").val(),
            ed_lvl: $("#profile-edlvl").val(),
            default_tutor: $("#profile-default-tutor").prop("checked"),
            subjects: signup_subjects,
            selected_tutors: []
        }
        $.post("http://39b14a77.ngrok.io/api", { new_user: user }, function (d) {
            phonon.navigator().changePage("tutee");
        });
        app_user = user;
    }
        document.getElementById("profile-tutor-select").onclick = function () {
        loadTutorSubjects();
    }

    document.getElementById("profile-tutee-select").onclick = function () {
        loadTuteeSubjects();
    }

    document.getElementById("signin-btn").onclick = function () {
        $.post("http://39b14a77.ngrok.io/api", { get_user: $("#signin-name").val() }, function (d) {
            if (d.password == $("#signin-password").val()) {
                phonon.navigator().changePage("tutee");
                app_user = d;
                loadTuteeSubjectList();
                localStorage.setItem("user", d.email);
            }
        });
    }

    document.getElementById("to-tutor-btn").onclick = () => {
        loadTutorSubjectList();
        phonon.navigator().changePage("tutor");
    }
    document.getElementById("to-tutee-btn").onclick = () => {
        loadTuteeSubjectList();
        phonon.navigator().changePage("tutee");
    }
}

function loadTuteeSubjectList() {
    console.log("Loading subjects");
    var list = document.getElementById("sidemenu-subjects");
    list.innerHTML = "";
    var first = true;
    app_user.subjects.tutee.forEach(function (subject) {
        console.log(subject);
        if (first) {
            loadTutorsForSubject(subject);
            first = false;
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.setAttribute("class", "padded-list");
        a.innerHTML = subject;
        a.onclick = () => loadTutorsForSubject(subject);
        li.appendChild(a);
        list.appendChild(li);
    });
}

function loadTutorSubjectList() {
    console.log("Loading subjects");
    var list = document.getElementById("sidemenu-subjects");
    list.innerHTML = "";
    var first = true;
    app_user.subjects.tutor.forEach(function (subject) {
        console.log(subject);
        if (first) {
            loadStudentsForSubject(subject);
            first = false;
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.setAttribute("class", "padded-list");
        a.innerHTML = subject;
        a.onclick = () => loadStudentsForSubject(subject);
        li.appendChild(a);
        list.appendChild(li);
    });
}

function loadTutorsForSubject(subject) {
    var list = document.getElementById("tutor-list");
    list.innerHTML = "";
    $.post("http://39b14a77.ngrok.io/api", { find_tutors: subject }, function (d) {
        console.log(d);
        d.tutors.forEach(function (tutor) {
            var div = document.createElement("div");
            div.setAttribute("class", "tutor-card");
            var h1 = document.createElement("h1")
            h1.innerHTML = tutor.name;
            var p = document.createElement("p")
            p.innerHTML = "Education Level: " + tutor.ed_lvl;
            var btn1 = document.createElement("button");
            btn1.setAttribute("class", "btn btn-flat positive");
            if (app_user.selected_tutors === undefined) {
                app_user.selected_tutors = [];
            }
            btn1.innerHTML = app_user.selected_tutors.indexOf(tutor.email) == -1 ? "&#10004;" : "Selected";
            btn1.onclick = () => {
                btn1.innerHTML = "Selected";
                $.post("http://39b14a77.ngrok.io/api", { sel_tutor: app_user.email, selected_tutor: tutor.email }, function (d) { });
                app_user.selected_tutors.push(tutor.email);
            }
            var btn2 = document.createElement("button");
            btn2.setAttribute("class", "btn btn-flat negative");
            btn2.innerHTML = "&#10006;";
            btn2.onclick = () => {
                list.removeChild(div);
            }
            div.appendChild(h1);
            div.appendChild(p);
            div.appendChild(btn1);
            div.appendChild(btn2);
            list.appendChild(div);
        });
    });
}

function loadStudentsForSubject(subject) {
    var list = document.getElementById("student-list");
    list.innerHTML = "";
    $.post("http://39b14a77.ngrok.io/api", { tutored_students: app_user.email }, function (d) {
        console.log(d);
        d.tutors.forEach(function (student) {
            var div = document.createElement("div");
            div.setAttribute("class", "tutor-card");
            var h1 = document.createElement("h1")
            h1.innerHTML = student.name;
            var p = document.createElement("p")
            p.innerHTML = "Education Level: " + tutor.ed_lvl;
            var btn1 = document.createElement("button");
            btn1.setAttribute("class", "btn btn-flat positive");
            btn1.innerHTML = "Accept"
            btn1.onclick = () => {
                btn1.innerHTML = "Tutoring";
            }
            var btn2 = document.createElement("button");
            btn2.setAttribute("class", "btn btn-flat negative");
            btn2.innerHTML = "&#10006;";
            btn2.onclick = () => {
                list.removeChild(div);
            }
            div.appendChild(h1);
            div.appendChild(p);
            div.appendChild(btn1);
            div.appendChild(btn2);
            list.appendChild(div);
        });
    });
}

function loadTutorSubjects() {
    var list = document.getElementById("subject-select-tutor-list");
    list.innerHTML = "";
    signup_subjects.tutor = [];
    subjects.forEach(function (subject) {
        var li = document.createElement("li");
        li.setAttribute("class", "padded-list");
        var label = document.createElement("label");
        label.setAttribute("class", "checkbox");
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.onclick = () => {
            console.log(subject);
            if (signup_subjects.tutor.indexOf(subject) != -1) {
                signup_subjects.tutor.splice(ignup_subjects.tutor.indexOf(subject), 1);
            } else {
                signup_subjects.tutor.push(subject);
            }
        };
        var span1 = document.createElement("span");
        var span2 = document.createElement("span");
        span2.setAttribute("class", "text");
        span2.innerHTML = subject;

        label.appendChild(input);
        label.appendChild(span1);
        label.appendChild(span2);

        li.appendChild(label);

        list.appendChild(li);
    });
    phonon.panel("#subject-select-tutor").open();
}


function loadTuteeSubjects() {
    var list = document.getElementById("subject-select-tutee-list");
    list.innerHTML = "";
    signup_subjects.tutee = [];
    subjects.forEach(function (subject) {
        var li = document.createElement("li");
        li.setAttribute("class", "padded-list");
        var label = document.createElement("label");
        label.setAttribute("class", "checkbox");
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.onclick = () => {
            console.log(subject);
            if (signup_subjects.tutee.indexOf(subject) != -1) {
                signup_subjects.tutee.splice(ignup_subjects.tutor.indexOf(subject), 1);
            } else {
                signup_subjects.tutee.push(subject);
            }
        };
        var span1 = document.createElement("span");
        var span2 = document.createElement("span");
        span2.setAttribute("class", "text");
        span2.innerHTML = subject;

        label.appendChild(input);
        label.appendChild(span1);
        label.appendChild(span2);

        li.appendChild(label);

        list.appendChild(li);
    });
    phonon.panel("#subject-select-tutee").open();
}