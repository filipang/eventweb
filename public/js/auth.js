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
        firebase.database().ref().child("Users").child(cred.user.uid).child("email").set(cred.user.email);
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

function removeListeners(element) {
    var new_element = element.cloneNode(true);
    element.parentNode.replaceChild(new_element, element);
    return new_element;
}

function enableInterestedButton(button, uid, pid) {
    button.style.borderStyle = "inset";
    console.log("ENABLED INTERESTED FOR " + pid);
    console.log(button.parentNode);
    button = removeListeners(button);
    button.addEventListener("click", function () {
        firebase.database().ref().child("Users").child(uid).child("interested_posts_id_list").child(pid).remove();
        firebase.database().ref().child("posts").child(pid).child("interested").child(uid).remove();
        firebase.database().ref().child("posts").child(pid).child("interestedInNumber").transaction(function (currentCount) {
            //button.textContent = (currentCount || 0) + 1;
            return (currentCount || 0) - 1;
        }).then(function (success) {
            console.log(success);
            console.log(button);

            button.textContent = "INTERESTED: " + success.snapshot.val();
            disableInterestedButton(button, uid, pid);
        });
    });
}



function disableInterestedButton(button, uid, pid) {
    button.style.borderStyle = "outset";
    console.log("DISABLED INTERESTED" + pid);
    console.log(button.parentNode);
    button = removeListeners(button);
    button.addEventListener("click", function () {
        firebase.database().ref().child("Users").child(uid).child("interested_posts_id_list").child(pid).set(true);
        firebase.database().ref().child("posts").child(pid).child("interested").child(uid).set(true);
        firebase.database().ref().child("posts").child(pid).child("interestedInNumber").transaction(function (currentCount) {
            //button.textContent = (currentCount || 0) + 1;
            return (currentCount || 0) + 1;
        }).then(function (success) {
            console.log(success);
            console.log(button);

            button.textContent = "INTERESTED: " + success.snapshot.val();
            enableInterestedButton(button, uid, pid);
        });
  
    });
}

function enableGoingButton(button, uid, pid) {
    console.log("ENABLED GOING" + pid);
    console.log(button.parentNode);
    button = removeListeners(button);
    button.style.borderStyle = "inset";
    button.addEventListener("click", function () {
        firebase.database().ref().child("Users").child(uid).child("going_posts_id_list").child(pid).remove();
        firebase.database().ref().child("posts").child(pid).child("going").child(uid).remove();
        firebase.database().ref().child("posts").child(pid).child("goingToNumber").transaction(function (currentCount) {
            //button.textContent = (currentCount || 0) + 1;
            return (currentCount || 0) - 1;
        }).then(function (success) {
            console.log(success);
            console.log(button);

            button.textContent = "GOING: " + success.snapshot.val();
            disableGoingButton(button, uid, pid);
        });
    });
}

function disableGoingButton(button, uid, pid) {
    console.log("DISABLED GOING" + pid);
    console.log(button.parentNode);
    button = removeListeners(button);
    button.style.borderStyle = "outset";
    button.addEventListener("click", function () {
        firebase.database().ref().child("Users").child(uid).child("going_posts_id_list").child(pid).set(true);
        firebase.database().ref().child("posts").child(pid).child("going").child(uid).set(true);
        firebase.database().ref().child("posts").child(pid).child("goingToNumber").transaction(function (currentCount) {
            //button.textContent = (currentCount || 0) + 1;
            return (currentCount || 0) + 1;
        }).then(function (success) {
            console.log(success);
            console.log(button);
            button.textContent = "GOING: " + success.snapshot.val();
            enableGoingButton(button, uid, pid);
        });
    });
}

const accountDetails = document.querySelector('.account-details');

document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
    auth.onAuthStateChanged(user => {
        if (user) {

            const html = `
              <div>Logged in as ${user.email}</div>
            `;
            accountDetails.innerHTML = html;

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
            var matchPercentage;
            feed.innerHTML = "";
            const post_template = document.querySelector("#post_template");
            var z = ref.orderByChild("user_coef_list/" + uid).on("child_added", function (dataSnapshot) {
                storageRef.child(dataSnapshot.child("filePath").val()).getDownloadURL().then(function (url) {
                    var cloned = post_template.cloneNode(true);
                    postChildKeyList.forEach(function (key) {
                        if (cloned.content.getElementById(postChildKeyToId(key)) !== null) {
                            if (key == "interestedInNumber") {
                                cloned.content.getElementById(postChildKeyToId(key)).textContent = "INTERESTED: " + dataSnapshot.child(key).val();
                                return;
                            }
                            if(key == "goingToNumber") {
                                cloned.content.getElementById(postChildKeyToId(key)).textContent = "GOING: " + dataSnapshot.child(key).val();
                                return;
                            }
                            cloned.content.getElementById(postChildKeyToId(key)).textContent = dataSnapshot.child(key).val();
                            if (key == "title") {
                                cloned.content.getElementById("revealTitle").childNodes[0].nodeValue = dataSnapshot.child(key).val();
                            }
                        }
                        else console.log("ERROR ON :" + key);
                    });
                    matchPercentage = String(dataSnapshot.child("user_coef_list").child(uid).val());
                    var matchnum;
                    if (matchPercentage.length >= 5) {
                        matchnum = Number(matchPercentage.substring(0, 4)) * 100;
                    }
                    else {
                        matchnum = Number(matchPercentage) * 100;
                    }

                    console.log("FOR USER: " + uid);
                    console.log(dataSnapshot);
                    console.log(matchPercentage);
                    console.log(matchnum);
                    cloned.content.getElementById("matchPercentage").textContent = matchnum + "% match";
                    cloned.content.getElementById("imager").src = url;
                    if (dataSnapshot.child("interested").hasChild(uid)) {
                        enableInterestedButton(cloned.content.getElementById("interestedInNumber"), uid, dataSnapshot.key);
                    }
                    else {
                        disableInterestedButton(cloned.content.getElementById("interestedInNumber"), uid, dataSnapshot.key);
                    }

                    if (dataSnapshot.child("going").hasChild(uid)) {
                        enableGoingButton(cloned.content.getElementById("goingToNumber"), uid, dataSnapshot.key);
                    }
                    else {
                        disableGoingButton(cloned.content.getElementById("goingToNumber"), uid, dataSnapshot.key);

                    }

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


