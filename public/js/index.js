// setup materialize components
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

document.addEventListener('DOMContentLoaded', function () {

    var postChildKeyList = ["description","dateEvent","goingToNumber","interestedInNumber","title"];
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);

    var storageRef = firebase.storage().ref();
    var uid = "0GXQpbRMo9ZVX426PSGREJWqnbU2";
    var ref = firebase.database().ref("posts");

    var feed = document.getElementById("feed");
    var post_template = document.getElementById("post_template");
    ref.orderByChild("user_coef_list/" + uid).once("child_added", function (dataSnapshot) {
        var post = post_template.content;
        postChildKeyList.forEach(function (key) {
            post.getElementById(postChildKeyToId(key)).textContent = dataSnapshot.child(key).val();
        });
        storageRef.child(dataSnapshot.child("imagePath")).getDownloadURL().then(function (url) {
            post.getElementById("image").src = url;
        });
        feed.appendChild(post);
    });
});