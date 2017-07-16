//*********************************//
//GLOBAL VARIABLES
//*********************************//
var db;
var uid; //user id
var auth;
var curname;

document.addEventListener("deviceready", function () {

    document.addEventListener("backbutton", function (e) {
        e.preventDefault();
    }, false);

    db = firebase.database();
    auth = firebase.auth();
    console.log(db);

    //*********************************//
    //EVENT HANDLERS
    //*********************************//

    //show dashboard panel
    $(document).on("swiperight", "#dashboard", function (e) {
            if ($(".ui-page-active").jqmData("panel") !== "open") {
        $("#mainpanel").panel("open");
            }
    });

    //Swipe Task Item
    $(document).on("swiperight swipeleft", "#currentTasks li", function (e) {
        var taskid = $(this).find("a").attr("data-key");
        var taskname = $(this).find("a").find("h1").html();
        var taskref;
        if(confirm("Mark this task as FINISHED?")){
            console.log(taskid);
            taskref = db.ref("tasks/" + taskid);
            var timeStamp = new Date();
            var timeString = changeFormat(timeStamp);
            taskref.update({
                finished:timeString,
                status:"FINISHED"
            });
            saveLog("Finished Task (" + taskname + ") by " + curname);
            if (firebase.auth().currentUser.uid == "OTnpSjeTD7ezIVIZ7e9vmXsHBK52") {
                loadAdminTasks();
            }else{
                loadTasks();
            }
        }
    });



    //*********************************//
    //INTERACTIONS
    //*********************************//

    $("#loginBtn").click(function () {
        $.mobile.loading("show");
        var email = $("#email").val();
        var password = $("#password").val();
        var refe = db.ref("users");
        firebase.auth().signOut();
        firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
            console.log(firebase.auth().currentUser.email);
            
            $.mobile.navigate("#dashboard");
            uid = firebase.auth().currentUser.uid;
            loadTaskNames();
            loadTasks();
            if (firebase.auth().currentUser.uid == "OTnpSjeTD7ezIVIZ7e9vmXsHBK52") {
                $(".adminonly").show();
                curname = "Administrator";
            } else {
                $(".adminonly").hide();
                refe.orderByChild("uid").equalTo(uid).on("child_added", function (dat) {
                curname = dat.val().name;
            });
            }
            $.mobile.loading("hide");
            $("#currentEmail").html(curname);
            saveLog("User Login: " + curname)
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
            $.mobile.loading("hide");
        });
    });

    $("#taskpush").click(function () {
        var ref = db.ref("tasknames");
        var task = $("#pushtask").val();
        var desc = $("#pushdesc").val();
        ref.push({
            task: task,
            desc: desc
        }).then(function () {
            console.log("PUSH");
            $("#pushtask").val("");
            $("#pushdesc").val("");
        });
    });

    $("#logout").click(function () {
        firebase.auth().signOut();
        $.mobile.navigate("#login");
        saveLog("User Logout: " + curname);
    });

    $("#quit").click(function () {
        navigator.app.exitApp();
        saveLog("User Logout: " + curname);
    });

    $("#addTaskButton").click(function () {
        $("#tasknames li").addClass("ui-screen-hidden").each(function () {
            $(this).click(function () {
                var value = $(this).find("a").attr("data-desc");
                var ts = $(this).find("a").html();
                console.log($(this));
                $("#taskdesc").val(value);
                $("#taskname").val(ts);
                $("#tasknames li").addClass("ui-screen-hidden");
            });
        });

    });

    $(document).on("pagebeforeshow", "#users", function () {
        loadUsers();
    });

    $(document).on("pagebeforeshow", "#tasks", function () {
        if (firebase.auth().currentUser.uid == "OTnpSjeTD7ezIVIZ7e9vmXsHBK52") {
            loadAdminTasks();
        }else{
            loadTasks();
        }
    });

    $(document).on("pagebeforeshow", "#addtask", function () {
        loadUserList();
    });

    $(document).on("pagebeforeshow", "#records", function () {
        loadHerd();
    });

    $(document).on("pagebeforeshow", "#logs", function () {
        loadLogs();
    });

    $("#refreshlogs").click(function(){
        var xnum = prompt("How many records to show?","50");
        xnum = parseInt(xnum);
        if(Number.isInteger(xnum)){
            var logref = db.ref("logs");
            $("#loglist").html("");
            logref.limitToLast(50).on("child_added", function (data) {
                $("#loglist").prepend("[" + data.val().timestamp + "] - " + data.val().message + "<hr>");
            });
        }else{
            alert("Must provide a valid number");
        }     
    });

    $("#addUserButton").click(function () {
        $("#addusername").val("");
        $("#adduseremail").val("");
        $("#adduserpassword").val("");
        $("#adduserconfirm").val("");
    });

    $("#saveuser").click(function () {
        if ($("#adduserconfirm").val() == $("#adduserpassword").val()) {
            var email = $("#adduseremail").val() + "@myswine.com";
            var password = $("#adduserpassword").val();
            var xname = $("#addusername").val();
            auth.createUserWithEmailAndPassword(email, password).catch(function (e) {
                alert(e.message);
            }).then(function (e) {
                console.log(e.uid);
                db.ref("users").push({
                    name: xname,
                    uid: e.uid,
                    email: email
                }).then(function () {
                    loadUsers();
                    saveLog("Created new user: " + xname);
                    window.history.back();
                });
            });
        }
        else {
            alert("Password mismatch");
        }
    });

    $("#savepig").click(function () {
        var pname = $("#addpigname").val();
        var pgender = $("#addpiggender").val();
        var pbdate = $("#addpigbdate").val();
        db.ref("herd").push({
            name: pname,
            gender: pgender,
            birthdate: pbdate,
            status: "ACTIVE"
        }).then(function () {
            alert("Record saved");
            $.mobile.navigate("#records");
            saveLog("Added new data entry " + pname);
        });
    });

    $("#qrsearch").click(function () {
        cordova.plugins.barcodeScanner.scan(function (result) {
            var code = result.text;
            var pigitem = $("#" + code);
            if(pigitem.length==1){
                //fetch data
                var pigkey = pigitem.attr("data-key");
                var xname = pigitem.find("h4").html();
                var pgender = pigitem.find("p").find("b").html();
                var pbdate = pigitem.find("p").find("i").html();
                $("#editpigkey").val(pigkey);
                $("#editpigname").val(xname);
                var el = $("#editpiggender");
                el.val(pgender).attr("selected",true).siblings("option").removeAttr("selected");
                el.selectmenu();
                el.selectmenu("refresh",true);
                $("#editpigbdate").val(pbdate);
                $("#qrgenerated1").html("");
                var qr = new QRCode("qrgenerated1",{
                    text: "MySwine",
                    width: 200,
                    height: 200,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
                qr.clear();
                qr.makeCode(result.text);
                $.mobile.navigate("#editpig");
            }            
            else{
                alert("Invalid QR Code!");
            }
        });
    });

    $("#deleteuser").click(function () {
        if (confirm("Are you sure?")) {
            var uid = $("#edituserid").val();
            var key;
            var userref = db.ref("users");
            userref.orderByChild("uid").equalTo(uid).on("child_added", function (snap) {
                key = snap.key;
                db.ref("users/" + key).remove().then(function () {
                    alert("Deleting user account must be done on Firebase Authentication Module");
                    $.mobile.navigate("#users");
                    saveLog("Deleted User with ID: " + uid);
                    window.open("https://myswine-90d52.firebaseio.com/")
                });
            });
        }
    });

    $("#savetask").click(function () {
        var taskname = $("#taskname").val();
        var taskdesc = $("#taskdesc").val();
        var taskassigned = $("#taskassigned").val();
        var assigned = $("#taskassigned").find("option:selected").html();
        addFireTask(taskname, taskdesc, taskassigned);
        saveLog("Created task for " + assigned + " to do " + taskname);
    });




}, false);

//USER-DEFINED FUNCTIONS
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function loadTasks() {
    uid = firebase.auth().currentUser.uid;
    var taskRef = db.ref("tasks");
    var cur = 0;
    var fin = 0;
    var finished;
    $("#curCount").html(cur);
    $("#finCount").html(fin);

    $("#currentTasks").html("");
    $("#finishedTasks").html("");
    taskRef.orderByChild("assigned").equalTo(uid).on("child_added", function (data) {
        console.log(data.key);
        if (data.val().status == "CURRENT") {
            $("#currentTasks").prepend("<li><a href='#' data-key='" + data.key + "'><h1>" + data.val().task + "</h1><p>" + data.val().desc + "</p></a></li>").listview("refresh");
            cur++;
            $("#curCount").html(cur);
        } else {
            finished = data.val().finished;
            var timeStamp = new Date();
            var timeString = changeFormat(timeStamp);
            var today = timeString.substring(0, timeString.indexOf(" "));
            var taskday = finished.substring(0,finished.indexOf(" "));
            if(today==taskday){
                $("#finishedTasks").prepend("<li><a href='#' data-key='" + data.key + "'><h1>" + data.val().task + "</h1><p>" + data.val().finished + "</p></a></li>").listview("refresh");
                fin++;
                $("#finCount").html(fin);
            }
        }
    });
}

function loadAdminTasks() {
    db = firebase.database();
    var curid;
    var taskRef = db.ref("tasks");
    var refe = db.ref("users");
    var cur = 0;
    var fin = 0;
    var assigned;
    $("#curCount").html(cur);
    $("#finCount").html(cur);

    $("#currentTasks").html("");
    $("#finishedTasks").html("");
    taskRef.orderByChild("created").on("child_added", function (data) {
        curid = data.val().assigned;
        console.log(curid);
        refe.orderByChild("uid").equalTo(curid).on("child_added", function (dat) {
            assigned = dat.val().name;
            console.log(assigned);
            if (data.val().status == "CURRENT") {
                $("#currentTasks").prepend("<li><a href='#' data-key='" + data.key + "'><h1>" + data.val().task + "</h1><p>[" + data.val().created + "]<br>Assigned to:" + assigned + "</p></a></li>").listview("refresh");
                cur++;
                $("#curCount").html(cur);
            } else {
                finished = data.val().finished;
                var timeStamp = new Date();
                var timeString = changeFormat(timeStamp);
                var today = timeString.substring(0, timeString.indexOf(" "));
                var taskday = finished.substring(0,finished.indexOf(" "));
                if(today==taskday){
                    $("#finishedTasks").prepend("<li><a href='#' data-key='" + data.key + "'><h1>" + data.val().task + "</h1><p>[" + data.val().finished + "]<br>Assigned to:" + assigned + "</p></a></li>").listview("refresh");
                    fin++;
                    $("#finCount").html(fin);
                }
            }
        });
    });
}

function loadTaskNames() {
    var tasknameref = db.ref("tasknames");
    tasknameref.orderByChild("task").on("child_added", function (data) {
        $("#tasknames").append("<li><a href='#' data-desc='" + data.val().desc + "'>" + data.val().task + "</a></li>").listview("refresh");
    });
}

function loadUsers() {
    $("#userlist").html("");
    var userref = db.ref("users");
    userref.orderByChild("name").on("child_added", function (data) {
        $("#userlist").append("<li><a href='#userinfo' data-uid='" + data.val().uid + "'><h4>" + data.val().name + "</h4><p>" + data.val().email + "</p></a></li>").listview("refresh");
        $("#userlist li").each(function () {
            $(this).click(function () {
                var uid = $(this).find("a").attr("data-uid");
                var email = $(this).find("a").find("p").html();
                //email = email.substring(0,email.indexOf("@"));
                var xname = $(this).find("a").find("h4").html();
                $("#edituserid").val(uid);
                $("#editusername").val(xname);
                $("#edituseremail").val(email);
                $("#edituserpassword").val("");
                $("#edituserconfirm").val("");
            });
        });
    });
}

function loadHerd() {
    var herdref = db.ref("herd");
    var key;
    var name;
    var gender;
    var ago;
    var birthdate;
    $("#piglist").html("");
    herdref.orderByChild("name").on("child_added", function (data) {
        key = data.key;
        name = data.val().name;
        gender = data.val().gender;
        birthdate = data.val().birthdate;
        ago = moment(birthdate, "YYYY-MM-DD").fromNow();
        ago = ago.substring(0, ago.indexOf("ago"));
        $("#piglist").append("<li><a href='#editpig' data-key='" + key + "' id='" + key + "'><h4>" + name + "</h4><p>[<b>" + gender + "</b>] " + ago + "[<i>" + birthdate + "</i>]</p></a></li>").listview("refresh");
        //attach handler EACH
        $("#piglist li").each(function () {
            $(this).click(function () {
                var pigkey = $(this).find("a").attr("data-key");
                var xname = $(this).find("a").find("h4").html();
                var pgender = $(this).find("a").find("p").find("b").html();
                var pbdate = $(this).find("a").find("p").find("i").html();
                $("#editpigkey").val(pigkey);
                $("#editpigname").val(xname);
                var el = $("#editpiggender");
                el.val(pgender).attr("selected",true).siblings("option").removeAttr("selected");
                el.selectmenu();
                el.selectmenu("refresh",true);
                $("#editpigbdate").val(pbdate);
                //QR Generate
                $("#qrgenerated1").html("");
                var qr = new QRCode("qrgenerated1",{
                    text: "MySwine",
                    width: 200,
                    height: 200,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
                qr.clear();
                qr.makeCode(pigkey);
            });
        });
    });
}

function loadUserList() {
    $("#taskassigned").html("");
    var userref = db.ref("users");
    userref.orderByChild("name").on("child_added", function (data) {
        $("#taskassigned").append("<option value='" + data.val().uid + "'>" + data.val().name + "</option>").select("refresh");
    })
}

function attachHandlers() {
    $("#userlist li").each(function () {
        $(this).click(function () {
            console.log("click");
            var uid = $(this).find("a").attr("data.uid");
            var email = $(this).find("a").find("p").html();
            email = email.substring(0, email.indexOf("@"));
            var xname = $(this).find("a").find("h4").html();
            $("#editusername").val(uid);
            $("#editusername").val(xname);
            $("#edituseremail").val(email);
            $("#edituserpassword").val("");
            $("#edituserconfirm").val("");
            $.mobile.navigate("#userinfo");
        });
    });
}

function addFireTask(taskName, description, assignedTo) {
    var taskRef = db.ref("tasks");
    var timeStamp = new Date();
    timeString = changeFormat(timeStamp);
    taskRef.push({
        task: taskName,
        desc: description,
        assigned: assignedTo,
        created: timeString,
        finished: "NONE",
        status: "CURRENT"
    }).then(function (e) {
        console.log(e);
        alert("New task created");
        $.mobile.navigate("#tasks");
    });
}

function addNewTaskName(task, desc) {
    var tasknameref = db.ref("tasknames");
    tasknameref.push({
        task: task,
        desc: desc
    });
}

function saveLog(msg){
    var logref = db.ref("logs");
    var timeStamp = new Date();
    timeString = changeFormat(timeStamp);
    logref.push({
        timestamp: timeString,
        message: msg
    });
}

function loadLogs(){
    $("#loglist").html("");
    var logref = db.ref("logs");
    logref.limitToLast(50).on("child_added", function (data) {
        $("#loglist").prepend("[" + data.val().timestamp + "] - " + data.val().message + "<hr>");
    });
}

function changeFormat(datevalue) {
    return (parseInt(datevalue.getFullYear())) + "-" + (parseInt(datevalue.getMonth())+1) + "-" + datevalue.getDate() + " " + datevalue.getHours() + ":" + datevalue.getMinutes() + ":" + datevalue.getSeconds();
}

function whois(userid) {
    var value;
    var refe = db.ref("users");
    refe.orderByChild("uid").equalTo(userid).on("child_added", function (data) {
        console.log(userid + " = " + data.val().name);
        value = data.val().name;
        return value;
    });
}