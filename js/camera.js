"use strict";

var clickedImage, sourceType, project = null;

function captureImage() {
  navigator.camera.getPicture(onSuccessCamera, onFailCamera, {
    quality:50,
    allowEdit:false, // ignored by Android (testing false, because may solve square imgs @ ios)
    destinationType:Camera.DestinationType.DATA_URL, // base64
    encodingType:Camera.EncodingType.JPEG,
    sourceType:sourceType, // camera or photoroll, depending on user choice
    targetWidth:400, // = double size for retina
    targetHeight:300 // 266
  });
}

function onSuccessCamera(imageData) {
//  showAlert('We slaan een foto op bij project: ' + project);
  doPost(
    getServiceURL("/photo/save"),
    {
      'projectref' : project,
      'content' : imageData
    },
    true,
    function(data) {
      // change the image in the view
      showAlert("De afbeelding is met groot succes opgeslagen op de server!");
      // show the image immediately
//      $(clickedImage).attr('src', "data:image/jpeg;base64," + imageData);
      loadProjectPhotos(project);
    }
  );
}

function onFailCamera(message) {
  if (message == "no camera available") {
    navigator.notification.alert("Er is geen geschikte camera gevonden.", {}, "Probleempje..", "Sluiten");
  }
}

function cameraIconClicked(projectID, theElement) {
//  alert('clicked project: ' + projectID);
  project = projectID;
  clickedImage = theElement;

  if (isMobile()) {
    navigator.notification.confirm(
        'Deel een leuke foto van dit project. TIP: houd je telefoon horizontaal.', // message
        onConfirmNew, // callback to invoke with index of button pressed
        'Foto toevoegen', // title
        'Foto maken,Foto kiezen,Annuleren'  // buttonLabels
    );
  } else {
    alert("Dit kan alleen op mobiel");
  }
}

function onConfirmNew(buttonIndex) {
  if (buttonIndex == 1) {    // index starts at 1
    sourceType = Camera.PictureSourceType.CAMERA;
    captureImage();
  } else if (buttonIndex == 2) {
    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
    captureImage();
  } else {
    // cancelled
  }
}