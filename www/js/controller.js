//*********************************//
//GLOBAL VARIABLES
//*********************************//
var db;
var uid; //user id
var auth;
var curname;
var fuser;

document.addEventListener("deviceready", function () {


    //*********************************//
    //EVENT HANDLERS
    //*********************************//

    

    document.addEventListener("backbutton", function (e) {
        e.preventDefault();
    }, false);

    db = firebase.database();
    auth = firebase.auth();
    console.log(db);

    //keep me logged in
    firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        fuser = user;
        uid = user.uid;
        $.mobile.navigate("#dashboard");
        if (uid == "OTnpSjeTD7ezIVIZ7e9vmXsHBK52") {
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
        $("#curuser").html(curname);
        saveLog("User Login: " + curname)
    }
    });

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

    $(document).on("pagebeforeshow", "#addtask", function () {
        loadUserList();
        loadTaskNames();
        $("#taskname").val("");
        $("#taskdesc").val("");
    });

    $(document).on("pagebeforeshow", "#records", function () {
        loadHerd();
    });

    $(document).on("pagebeforeshow", "#growthrecord", function () {
        loadGrowth();
    });

    $(document).on("pagebeforeshow", "#pighistory", function () {
        loadHistory();
    });

    $(document).on("pagebeforeshow", "#expenses", function () {
        loadExpenses();
    });

    $(document).on("pagebeforeshow", "#tasknames", function () {
        loadTaskNames();
    });

    $(document).on("pagebeforeshow", "#logs", function () {
        loadLogs();
    });

    $(document).on("pagebeforeshow", "#sales", function () {
        loadSales();
    });

    $(document).on("pagebeforeshow", "#editpig", function () {
        if (firebase.auth().currentUser.uid == "OTnpSjeTD7ezIVIZ7e9vmXsHBK52") {
            $("#editpigname").removeAttr("disabled");
            $("#editpiggender").removeAttr("disabled");
            $("#editpigbdate").removeAttr("disabled");
        }else{
            $("#editpigname").attr("disabled","disabled");
            $("#editpiggender").attr("disabled","disabled");
            $("#editpigbdate").attr("disabled","disabled");
        }
    });

    $("#loginBtn").click(function () {
        $.mobile.loading("show");
        var email = $("#email").val();
        var password = $("#password").val();
        var refe = db.ref("users");
        curname="";
        firebase.auth().signOut();
        firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
            console.log(firebase.auth().currentUser.email);
            uid = firebase.auth().currentUser.uid;
            loadTaskNames();
            loadTasks();
            if (firebase.auth().currentUser.uid == "OTnpSjeTD7ezIVIZ7e9vmXsHBK52") {
                $(".adminonly").show();
                curname = "Administrator";
                $("#currentEmail").html(curname);
                $("#curuser").html(curname);
                $.mobile.navigate("#dashboard");
            } else {
                $(".adminonly").hide();
                refe.orderByChild("uid").equalTo(uid).on("child_added", function (dat) {
                curname = dat.val().name;
                if(curname==""){
                    alert("Invalid User");
                }
                else{
                    $("#currentEmail").html(curname);
                    $("#curuser").html(curname);
                }
            });
            }
            $.mobile.loading("hide");
            saveLog("User Login: " + curname)
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
            $.mobile.loading("hide");
        });
    });

    $("#taskedit").click(function(){
        var key = $("#edittasknamekey").val();
        var task = $("#editpushtask").val();
        var desc = $("#editpushdesc").val();
        var ref = db.ref("tasknames/" + key);
        ref.update({
            task: task,
            desc: desc
        }).then(function () {
            console.log("PUSH");
            $("#pushtask").val("");
            $("#pushdesc").val("");
            alert("Record Saved!");
            $.mobile.navigate("#tasknames");
            loadTaskNames();
        });
    });

    $("#taskdelete").click(function(){
        if(confirm("Are you sure?")){
            var key = $("#edittasknamekey").val();
            db.ref("tasknames/" + key).remove().then(function(){
                alert("Task name deleted!");
                $.mobile.navigate("#tasknames");
                loadTaskNames();
            });
        }
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
            alert("Record Saved!");
            $.mobile.navigate("#tasknames");
            loadTaskNames();
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

    $("#qrgenerated1").on("taphold",function(){
        var img = $("#qrgenerated1");
        img.height(225);
        img.append($("#editpigkey").val() + "<br>" + $("#editpigname").val());
        html2canvas(img,{
            onrendered:function(canvas){
                window.canvas2ImagePlugin.saveImageDataToLibrary(
                    function(msg){
                        alert(msg);
                    },
                    function(err){
                        alert(err);
                    },
                    canvas
                );
            }
        });
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

    $("#pigedit").click(function(){
        var pname = $("#editpigname").val();
        var pgender = $("#editpiggender").val();
        var pbdate = $("#editpigbdate").val();
        var pkey = $("#editpigkey").val();
        var herdref = db.ref("herd/" + pkey);
        herdref.update({
            name:pname,
            gender:pgender,
            birthdate:pbdate
        });
        saveLog("Updated data entry " + pname);
        loadHerd();
        $.mobile.navigate("#records");
    });

    $("#sellpig").click(function(){
        var pkey = $("#editpigkey").val();
        var pname = $("#editpigname").val();
        var herdref = db.ref("herd/" + pkey);
        var timeStamp = new Date();
        var timeString = changeFormat(timeStamp);
        var price=0;
        price = prompt("Input selling price");
        if($.isNumeric(price)){
            herdref.update({
            status:"SOLD"
            });
            loadHerd();
            var salesref = db.ref("sales");
            salesref.push({
                transdate: timeString,
                key: pkey,
                name: pname,
                price: price
            }).then(function(){
                var logref = db.ref("logs");
                saveLog("Sold pig " + pname);
                alert("Record Saved!");
                $.mobile.navigate("#records");
            });
        }else{
            alert("Please input a valid value");
        }
        
    });

    $("#deletepig").click(function(){
        var pkey = $("#editpigkey").val();
        var pname = $("#editpigname").val();
        if(confirm("Are you sure?")){
            db.ref("herd/" + pkey).remove().then(function(){
                alert("Record Deleted!");
                $.mobile.navigate("#records");
                saveLog("Deleted data entry " + pname);
            });
        }
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

    $("#growth").click(function(){
        var pigkey = $("#editpigkey").val();
        $("#growthkey").val(pigkey);
        $("#growthname").val($("#editpigname").val());
        $("#addgrowthname").val($("#editpigname").val());
        $.mobile.navigate("#growthrecord");
    });

    $("#addgrowthrecord").click(function(){
        var pigkey = $("#growthkey").val();
        var pigdate = $("#growthdate").val();
        var pigweight = $("#growthweight").val();
        var pigref = db.ref("herd/" + pigkey + "/growth").push({
            date: pigdate,
            weight: pigweight
        }).then(function(){
            alert("Growth record saved!");
            loadGrowth();
            $.mobile.navigate("#growthrecord");
        });
    });

    $("#viewpighistory").click(function(){
        var pigkey = $("#editpigkey").val();
        $("#hiskey").val(pigkey);
        $("#historykey").val(pigkey);
        $("#hisname").val($("#editpigname").val());
        $("#historyname").val($("#editpigname").val());
        $.mobile.navigate("#pighistory");
    });

    $("#addhistoryrecord").click(function(){
        var pigkey = $("#historykey").val();
        var pigdate = $("#historydate").val();
        var pigdesc = $("#historydesc").val();
        var pigref = db.ref("herd/" + pigkey + "/history").push({
            date: pigdate,
            desc: pigdesc
        }).then(function(){
            alert("Information history record saved!");
            loadHistory();
            $.mobile.navigate("#pighistory");
            $("#historydesc").val("");
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
                    alert("User Deleted!");
                    $.mobile.navigate("#users");
                    saveLog("Deleted User with ID: " + uid);
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

    $("#addexpenserecord").click(function(){
        var expdate = $("#expensedate").val();
        var expcat = $("#expensecategory").val();
        var expdesc = $("#expensedesc").val();
        var expamt = $("#expenseamount").val();
        var expense = db.ref("expenses").push({
            date: expdate,
            category: expcat,
            desc: expdesc,
            amount: expamt
        }).then(function(){
            alert("Expenses history record saved!");
            loadExpenses();
            $.mobile.navigate("#expenses");
            $("#expensedesc").val("");
            $("#expenseamount").val("");
        });
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
    $("#tasknames").html("");
    $("#tasklist").html("");
    tasknameref.orderByChild("task").on("child_added", function (data) {
        $("#tasknames").append("<li><a href='#' data-desc='" + data.val().desc + "'>" + data.val().task + "</a></li>");
        $("#tasklist").append("<li><a href='#edittaskname' data-key='" + data.key + "'><h4>" + data.val().task + "</h4><p>" + data.val().desc + "</p></a></li>");
        
        $("#tasklist li").each(function () {
            $(this).click(function () {
                var key = $(this).find("a").attr("data-key");
                var task = $(this).find("a").find("h4").html();
                var desc = $(this).find("a").find("p").html();
                $("#edittasknamekey").val(key);
                $("#editpushtask").val(task);
                $("#editpushdesc").val(desc);
            });
        });

        $("#tasknames li").addClass("ui-screen-hidden").each(function () {
            $(this).click(function () {
                var value = $(this).find("a").attr("data-desc");
                var ts = $(this).find("a").html();
                $("#taskdesc").val(value);
                $("#taskname").val(ts);
                $("#tasknames li").addClass("ui-screen-hidden");
            });
        });

        try {
            $("#tasknames").listview("refresh");
            $("#tasklist").listview("refresh");
        } catch (error) {
            
        }
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
    var status;
    $("#piglist").html("");
    herdref.orderByChild("name").on("child_added", function (data) {
        key = data.key;
        name = data.val().name;
        gender = data.val().gender;
        birthdate = data.val().birthdate;
        ago = moment(birthdate, "YYYY-MM-DD").fromNow();
        ago = ago.substring(0, ago.indexOf("ago"));
        status = data.val().status;
        if(status=="ACTIVE"){
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
        }
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

function loadSales(){
    $("#salestable").find("tbody").html("");
    var totalsales=0;
    var salesref = db.ref("sales");
    salesref.orderByChild("transdate").on("child_added", function (data) {
        $("#salestable").prepend("<tr><td>" + data.val().transdate + "</td><td>" + data.val().name + "</td><td class='num'>" + data.val().price + "</td></tr>");
        totalsales = totalsales + parseFloat(data.val().price);
        $("#totalsales").html("Total Sales: " + totalsales);
    });
}

function loadGrowth(){
    $("#growthtable").find("tbody").html("");
    $(".highcharts-root").parent().remove();
    $('#growthtable').highchartTable();
    var pigkey = $("#growthkey").val();
    var growthref = db.ref("herd/" + pigkey + "/growth");
    growthref.orderByChild("date").on("child_added", function (data) {
        $("#growthtable").append("<tr><td>" + data.val().date + "</td><td class='num'>" + data.val().weight + "</td></tr>");
        $(".highcharts-root").parent().remove();
        $('#growthtable').highchartTable();
    });
}

function loadHistory(){
    $("#historytable").find("tbody").html("");
    var pigkey = $("#historykey").val();
    var historyref = db.ref("herd/" + pigkey + "/history");
    historyref.orderByChild("date").on("child_added", function (data) {
        $("#historytable").append("<tr><td>" + data.val().date + "</td><td>" + data.val().desc + "</td></tr>");
    });
}

function loadExpenses(){
    $("#expensestable").find("tbody").html("");
    $("#expensetable2").find("tbody").html("");
    $(".highcharts-root").parent().remove();
    $('#expensestable').highchartTable();

    var foods=0;
    var meds=0;
    var supplies=0;
    var utils=0;
    var salaries=0;
    var others=0;
    var total=0;

    var growthref = db.ref("expenses");
    growthref.orderByChild("date").on("child_added", function (data) {
        $("#expensetable2").find("tbody").append("<tr><td>" + data.val().date + "</td><td>" + data.val().category + "</td><td>" + data.val().desc + "</td><td class='num'>" + data.val().amount + "</td></tr>");

        switch(data.val().category){
            case "Foods":
            foods = foods + parseFloat(data.val().amount);
            break;

            case "Medicines":
            meds = meds + parseFloat(data.val().amount);
            break;

            case "Supplies":
            supplies = supplies + parseFloat(data.val().amount);
            break;

            case "Utilities":
            utils = utils + parseFloat(data.val().amount);
            break;

            case "Salaries":
            salaries = salaries + parseFloat(data.val().amount);
            break;

            case "Others":
            others = others + parseFloat(data.val().amount);
            break;
        }

        total=total + parseFloat(data.val().amount);

        $("#expensestable").find("tbody").html("<tr><td style='background:#4572a7;'>Foods</td><td data-graph-item-color=''#ccc'>" + foods + "</td></tr><tr><td style='background:#aa4643;'>Medicines/Vaccines</td><td>" + meds + "</td></tr><tr><td style='background:#89a54e;'>Supplies</td><td>" + supplies + "</td></tr><tr><td style='background:#80699b;'>Utilities</td><td>" + utils + "</td></tr><tr><td style='background:#3d96ae;'>Salaries</td><td>" + salaries + "</td></tr><tr><td style='background:#db843d;'>Others</td><td>" + others + "</td></tr>");
        $(".highcharts-root").parent().remove();
        $('#expensestable').highchartTable();
        $("#totalexpenses").html("Total Expenses: " + total);
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