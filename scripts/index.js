document.addEventListener( 'deviceready', onDeviceReady, false );

function onDeviceReady() {

  console.log("Device ready!");
  
  const $elFmSignUp = $("#fmSignUp"),
      $elFmLogIn = $("#fmLogIn"),
      $elBtnLogOut = $("#btnLogOut");

  let $elBtnDeleteCollection = $("#btnDeleteCollection");

  let myDB = new PouchDB("myComics");

  const $elFmSaveComic = $("#fmSaveComic");

  function fnSignUp(event) {
      event.preventDefault();
      console.log("fnSignUp() is running");

      let $elInEmailSignUp = $("#inEmailSignUp"),
          $elInPasswordSignUp = $("#inPasswordSignUp"),
          $elInPasswordConfirmSignUp = $("#inPasswordSignUpConfirm");

          if ($elInPasswordSignUp.val() !== $elInPasswordConfirmSignUp.val()) {
              console.log("Paswords DO NOT match");
              window.alert("Passwords do not match!");
              $elInPasswordSignUp.val("");
              $elInPasswordConfirmSignUp.val("");                     
          } else {
              console.log("Password DO match!");

              let $tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(),
                  $tmpValInPasswordSignUp = $elInPasswordSignUp.val();

              if (localStorage.getItem($tmpValInEmailSignUp) === null) {
                  console.log("New User detected");
                  localStorage.setItem($tmpValInEmailSignUp, $tmpValInPasswordSignUp);
                  window.alert("Welcome!");  
                  $elFmSignUp[0].reset();
              } else {
                  window.alert("You are already registered!");
                  console.log("Returning User detected");
              } // End If..Else checking if email (User) already exists
          } // END If..Else Passwords match
  } // END fnSignUp()

  function fnLogIn(event) {
      event.preventDefault();
      console.log("fnLogIn() is running");

      let $elInEmailLogIn = $("#inEmailLogIn"),
          $elInPasswordLogIn = $("#inPasswordLogIn"),
          $tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
          $tmpValInPasswordLogIn = $elInPasswordLogIn.val();

      if (localStorage.getItem($tmpValInEmailLogIn) === null) {
          console.log("User does NOT exist!");
          window.alert("Account does not exist!");
      } else {
          console.log("User DOES exist!");
          if ($tmpValInPasswordLogIn === localStorage.getItem($tmpValInEmailLogIn)) {
              console.log("Passwords DO match!");
              myDB = new PouchDB($tmpValInEmailLogIn);
              fnViewComics();
              $(":mobile-pagecontainer").pagecontainer("change", "#pgHome", { "transition": "flip" });
          } else {
              window.alert("Wrong password!");
          } // END If..Else checking if Passwords match
      } // END If..Else checking if User exists
  } // END fnLogIn()

  function fnLogOut() {
      console.log("fnLogOut() is running");
      switch (window.confirm("Are you sure you want to log out?")) {
          case true:
              console.log("User wants to log out");
              $elFmLogIn[0].reset();
              $elFmSignUp[0].reset();

              $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome", { "transition": "fade" });
              break;
          case false:
              console.log("User DOES NOT want to log out");
              break;
          case "Maybe":
              console.log("User is undecided");
              break;
          default:
              console.log("Unknown choice! Contact trashcan@example.com");
              break;
      } // END switch() for confirming Log Out
  } // END fnLogOut()

  function fnPrepComic() {
    console.log("fnPrepComic() is running");

    let $valInTitle = $("#inTitle").val(),
      $valInNumber = $("#inNumber").val(),
      $valInYear = $("#inYear").val(),
      $valInPublisher = $("#inPublisher").val(),
      $valInNotes = $("#inNotes").val();

    console.log($valInTitle, $valInNumber, $valInYear, $valInPublisher, $valInNotes);

    let tmpComic = {
      "_id" : $valInTitle.replace(/\W/g,"") + $valInYear + $valInNumber,
      "title" : $valInTitle,
      "number" : $valInNumber,
      "year" : $valInYear,
      "publisher" : $valInPublisher,
      "notes" : $valInNotes
    }; 

    console.log(tmpComic._id);

    return tmpComic;
  } // END fnPrepComic()

  function fnSaveComic(event) {
    event.preventDefault();
    console.log("fnSaveComic(event) is running");

     let aComic = fnPrepComic();

      myDB.put(aComic, function(failure, success){
        if(failure) {
          console.log("Error: " + failure.message);
          window.alert("Comic already saved!");
        } else {
          console.log("Saved the comic: " + success.ok);
          window.alert("Comic saved!");
          $elFmSaveComic[0].reset();
          fnViewComics();
        } // END Failure/Success
      }); // END .put()
  } // END fnSaveComic (event)

  function fnViewComics() {
    console.log("fnViewcomics() is running");
    myDB.allDocs({"ascending":true, "include_docs":true}, function(failure, success){
      if(failure) {
        console.log("Failure: " + failure);
      } else {
        if(success.rows[0] === undefined) {
          console.log("No comics to display");
          $("#divViewComics").html("No comics saved, yet");
        } else {
          console.log("We have comics: " + success.rows.length);
          let comicData = "<table><tr><th>Name</th><th>#</th><th>Year</th><th>Pub</th><th>Note</th></tr>";
            for(let i = 0; i < success.rows.length; i++) {
              comicData += "<tr class='btnShowComicInfo' id='" + success.rows[i].doc._id + "'><td>" + 
                                          success.rows[i].doc.title + 
                            "</td><td>" + success.rows[i].doc.number + 
                            "</td><td>" + success.rows[i].doc.year + 
                            "</td><td>" + success.rows[i].doc.publisher + 
                            "</td><td>" + success.rows[i].doc.notes + 
                            "</td></tr>";
            } // END For Loop
          comicData += "</table>";

          $("#divViewComics").html(comicData);
        } // END If..Else ROWS empty 
      } // END If..Else .allDocs()  
    }); // END .allDocs()
  } // END fnViewComics()

  fnViewComics();

  function fnDeleteCollection() {
    console.log("fnDeleteCollection() is running");
    if(window.confirm("Are you sure you want to delete the whole collection?")) {
      if(window.confirm("Are you sure? There is NO undo!")) {
        myDB.destroy(function(failure, success){
          if(failure) {
            console.log("Error in deleting database: " + failure.message);
          } else {
            console.log("Database deleted: " + success.ok);
            myDB = new PouchDB("myComics");
            fnViewComics();
          } // END If/Else of .destroy() 
        }); //END .destroy()
      } else {
        console.log("They don't want to delete");
      } // END second If/Else to confirm
    } else {
      console.log("They chose not to delete the collection");
    } // END If/Else confirmation
  } // END fnDeleteCollection()

  let comicWIP = "";
  function fnEditComic(thisComic) {
    console.log("fnEditComic(event) is running: " + thisComic.context.id);

    myDB.get(thisComic.context.id, function(failure, success){
    if(failure) {
      console.log("Error getting the comic: " + failure.message);
    } else {
    console.log("Success getting the comic: " + success.title);
    $("#inTitleEdit").val(success.title);
    $("#inNumberEdit").val(success.number);
    $("#inYearEdit").val(success.year);
    $("#inPublisherEdit").val(success.publisher);
    $("#inNotesEdit").val(success.notes);

    comicWIP = success._id;
    } // END If/Else .get()
  }); // END .get()

  $(":mobile-pagecontainer").pagecontainer("change", "#pgComicViewEdit", {"role":"dialog"});
  } // END fnEditComic(event) 

  function fnEditComicCancel() {
    console.log("fnEditComicCanel() is running");
    $("#pgComicViewEdit").dialog("close");
  } // END fnEditComicCanel()

  function fnEditComicConfirm(event) {
    event.preventDefault();
    console.log("fnEditcomicConfirm() is running with " + comicWIP);

    let $valInTitleEdit = $("#inTitleEdit").val(),
      $valInNumberEdit = $("#inNumberEdit").val(),
      $valInYearEdit = $("#inYearEdit").val(),
      $valInPublisherEdit = $("#inPublisherEdit").val(),
      $valInNotesEdit = $("#inNotesEdit").val();

    myDB.get(comicWIP, function(failure, success){
      if(failure) {
        console.log("Error: " + failure.message);
      } else {
        console.log("About to update " + success._id);
        myDB.put({
          "_id": success._id,
          "_rev": success._rev,
          "title": $valInTitleEdit,
          "number": $valInNumberEdit,
          "year": $valInYearEdit,
          "publisher": $valInPublisherEdit,
          "notes": $valInNotesEdit
        }, function(failure, success){
          if(failure){ 
            console.log("Error: " + failure.message);
          } else {
            console.log("Updated comic: " + success.id);
            fnViewComics();
            $("#pgComicViewEdit").dialog("close");
          } // END If/Else .put()
        }); // END .put()
      } // END If/Else .get()
    }); // END .get()
  } // END fnEditcomicConfirm()

  $elFmSignUp.submit(function (event) { fnSignUp(event); });
  $elFmLogIn.submit(function (event) { fnLogIn(event); });
  $elBtnLogOut.on("click", fnLogOut);
  $elFmSaveComic.submit(function(){fnSaveComic(event);});
  $elBtnDeleteCollection.on("click", fnDeleteCollection);

  $("#divViewComics").on("click", "tr.btnShowComicInfo", function(){fnEditComic($(this));})
  $("#fmEditComicInfo").submit(function(event){fnEditComicConfirm(event);});
  $("#btnEditComicCancel").on("click", fnEditComicCancel);
} // END onDeviceReady()

/*
    Name:       Victor Campos <vcampos@sdccd.edu>
    Project:    CBDB ICOM
    Description:The Comic Book Database (ICOM version)
    Date:       2020-06-01
*/