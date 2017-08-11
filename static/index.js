subjects = ["Math", "Science", "History"];

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

    phonon.navigator().start();
    console.log("init");

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

        

    }


        document.getElementById("profile-tutor-select").onclick = function () {
        loadTutorSubjects();
    }

    document.getElementById("profile-tutee-select").onclick = function () {
        loadTutorSubjects();
    }


}

function loadTutorSubjects() {
    var list = document.getElementById("subject-select-tutor-list");
    list.innerHTML = "";
    subjects.forEach(function (subject) {
        var li = document.createElement("li");
        var label = document.createElement("label");
        label.setAttribute("class", "checkbox");
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.onclick = () => {
            console.log(subject);
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
