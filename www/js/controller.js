
//GLOBAL VARIABLES
var db;
var uid; //user id

$(document).ready(function(){

    db = firebase.database().ref();
    console.log(db);

    //EVENT HANDLERS
   $( document ).on( "swiperight", "#dashboard", function( e ) {
        if ( $( ".ui-page-active" ).jqmData( "panel" ) !== "open" ) {
            $( "#mainpanel" ).panel( "open" );
        }
    });
    
    //INTERACTIONS
    $("#loginBtn").click(function(){
        $.mobile.loading("show");
        var email=$("#email").val();
        var password = $("#password").val();
        firebase.auth().signOut();
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
            console.log(firebase.auth().currentUser.email);
            $("#currentEmail").html(firebase.auth().currentUser.email);
            $.mobile.navigate("#dashboard");
            uid = firebase.auth().currentUser.uid;
            //loadTasks();
            $.mobile.loading("hide");
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
    });

    $("#logout").click(function(){
        firebase.auth().signOut();
        $.mobile.navigate("#login");
    });

    $("#quit").click(function(){
        navigator.app.exitApp();
    });


});

//USER-DEFINED FUNCTIONS
function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function loadTasks(){
   
}