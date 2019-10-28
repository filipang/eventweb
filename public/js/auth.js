// listen for auth status changes

function postChildKeyToId(key) {
    switch (key) {
        case "title": return "title";
        case "dateEvent": return "dateEvent";
        case "goingToNumber": return "goingToNumber";
        case "interestedInNumber": return "interestedInNumber";
        case "description": return "description";
    }
    return null;
}

//create onclik addEventListener
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();


    //Obtin ce vrea   de la user cand vreau
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    //console.log(email, password);

    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        console.log(cred);
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
    });

});

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
    })
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    // log the user in
    auth.signInWithEmailAndPassword(email, password).then((cred) => {
        console.log(cred.user);
        // close the signup modal & reset form
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
    });

});


document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('user logged in: ', user);
            document.querySelectorAll(".logged-in").forEach(function (element) {
                console.log("TRIED STH ON ELEMENT");

                element.style.display = "list-item";
                console.log(element);
            });
            document.querySelectorAll(".logged-out").forEach(function (element) {
                console.log("TRIED STH ON ELEMENT");

                element.style.display = "none";
                console.log(element);
            });


            var postChildKeyList = ["description", "dateEvent", "goingToNumber", "interestedInNumber", "title"];

            const feed = document.getElementById("feed");
            const storageRef = firebase.storage().ref();
            const uid = user.uid;
            const ref = firebase.database().ref("posts");
            feed.innerHTML = "";
            const post_template = document.querySelector("#post_template");
            var z = ref.orderByChild("user_coef_list/" + uid).on("child_added", function (dataSnapshot) {
                storageRef.child(dataSnapshot.child("filePath").val()).getDownloadURL().then(function (url) {
                    var cloned = post_template.cloneNode(true);
                    postChildKeyList.forEach(function (key) {
                        if (cloned.content.getElementById(postChildKeyToId(key)) !== null) {
                            cloned.content.getElementById(postChildKeyToId(key)).textContent = dataSnapshot.child(key).val();
                            if (key == "title") {
                                cloned.content.getElementById("revealTitle").childNodes[0].nodeValue = dataSnapshot.child(key).val();
                            }
                        }
                        else console.log("ERROR ON :" + key);
                    });
                    cloned.content.getElementById("imager").src = url;
                    feed.appendChild(cloned.content);
                });

            });
        } else {
            console.log('user logged out..');
            const feed = document.getElementById("feed");
            feed.innerHTML = "";
            var element = document.createElement("P");
            element.textContent = "Te rog logheaza-te pentru a vedea continutul site-ului";
            feed.appendChild(element);
            document.querySelectorAll(".logged-out").forEach(function (element) {
                console.log("TRIED STH ON ELEMENT");
                element.style.display = "list-item";
                console.log(element);
            });
            document.querySelectorAll(".logged-in").forEach(function (element) {
                console.log("TRIED STH ON ELEMENT");

                element.style.display = "none";
                console.log(element);
            });
        }
    });
});


