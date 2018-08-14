$(document).ready(function () {
    var config = {
        apiKey: "AIzaSyDggRcSHcSddhlAQ06iyV8-saaORoUvcrc",
        authDomain: "js301-wt.firebaseapp.com",
        databaseURL: "https://js301-wt.firebaseio.com",
        projectId: "js301-wt",
        storageBucket: "js301-wt.appspot.com",
        messagingSenderId: "631988060957"
    };
    firebase.initializeApp(config);
    const db = firebase.firestore();

    db.settings({
        timestampsInSnapshots: true
    });
    
    $("#submit-btn").click(function(){
        var data = {
            title: $("#title-input").val(),
            content: $("#content-input").val(),
            comments: "",
            time: new Date().getTime()
        };
        
        db.collection("forum").add(data)
            .then(function(doc){
            alert("Post has been submitted");
            console.log(doc.id);
        });
        $("#title-input").val("");
        $("#content-input").val("");
                                          
    });
    
    db.collection("forum").orderBy("time", "desc").get()
        .then(function(docs){
            var template = "";
            docs.forEach(function (doc){
                var data = doc.data();
                template += `<a class='list-group-item list-group-item-action thread' thread-id = ${doc.id}> ${data.title} </a>`;
            })
        
            $("#post_list").append(template);
    });
    var threadId;
    $("#post_list").on("click", ".thread", function(){
        threadId = $(this).attr("thread-id");
        db.collection("forum").doc(threadId).get()
            .then(function(doc){
                console.log(doc.data());
                var data = doc.data();
                $("#post-modal-title").html(data.title);
                $("#post-modal-content").html(data.content);
                $("#modal-comments").html(data.comments);
                $("#post-modal-btn").trigger("click");
            });
    });
    
    $("#modal-send-btn").click(function(){
        
        
        var updated_comments = $("#modal-comments").html() + "<br>" + "#{username}" +": " +$("#modal-text").val();
        console.log(updated_comments);
        db.collection("forum").doc(threadId).update({
            comments: updated_comments
        });
    });
    
    
    
    
                                 
                                 
    
    
    
    
    
});