
var app_fireBase = {};

(function(){
    var firebaseConfig = {
        apiKey: "AIzaSyChooR4-GjU5fYxJoi7UgWUabY0H4NlXBU",
        authDomain: "js-contacts-book.firebaseapp.com",
        databaseURL: "https://js-contacts-book.firebaseio.com",
        projectId: "js-contacts-book",
        storageBucket: "js-contacts-book.appspot.com",
        messagingSenderId: "339643414732",
        appId: "1:339643414732:web:796a666ad1af7289c76a69",
        measurementId: "G-FHE3HMRBKC"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    app_fireBase = firebase;
})();


//-------------------Authentication-----------------------------

var mainApp = {};

(function(){
  var firebase = app_fireBase;
  var uid = null;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      uid = user.uid;
      getContacts(user.uid);
    }else{
      uid = null;
      window.location.replace("login.html");
    }
  });

  function logOut(){
    firebase.auth().signOut();
  }

  mainApp.logOut = logOut;

})();


//-------------------contacts-----------------------------

document.getElementById("addContactBtn").addEventListener("click",openNewContact);

function openNewContact(e){
  e.preventDefault();
  document.getElementById("contactForm").style.display="block";
}

// document.getElementById("contact_details").addEventListener("click",openUserContact);

// function openUserContact(e){
//   e.preventDefault();
//   document.getElementById("exampleUserModal").style.display="block";
// }

var addContactForm = document.getElementById('contactForm');
addContactForm.addEventListener('submit', submitContactsData);


function submitContactsData(e){

    var userId = firebase.auth().currentUser.uid;

    e.preventDefault();

    var contact_name = document.getElementById('username').value;
    var contact_title = document.getElementById('title').value;
    var contact_comapny = document.getElementById('company').value;
    var contact_mobile = document.getElementById('mobile').value;
    var contact_email = document.getElementById('email').value;

    var contact_image = document.getElementById('contact_image').files[0];

    var image_name = contact_image.name;
    var storageRef = firebase.storage().ref('Contacts/'+image_name);
    var uploadTask = storageRef.put(contact_image);

    uploadTask.on('state_changed',function(snapshot){
      var progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
      console.log("upload is "+progress+" done");
    },function(error){
      console.log(error.message);
    },function(){
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){ 
          var userContact = firebase.database().ref('Contacts/'+userId);
          var newContact = userContact.push();
          newContact.set({
              name:contact_name,
              title:contact_title,
              company:contact_comapny,
              mobile:contact_mobile,
              email:contact_email,
              contact_image:downloadURL
          },function(error){
              if(error){
                  alert("Error While Uploading");
              }else{
                  alert("Successfully Uploaded. Please Refresh the Page After adding a New Contact.");
                  contactForm.reset();
                  $('#exampleModal').modal('hide');
                  //getContacts();
              }
          });
      });
    });
}


async function getContacts(uid){

  var contacts = document.getElementById('contact_results');
  var eachContact = '';
  
  await firebase.database().ref("Contacts/"+uid).orderByChild('name').on('value', function(snapshot){
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();

      eachContact += 
      `
      <a href="" class="list-group-item list-group-item-action" target="_blank" data-toggle="modal" data-placement="top"
        data-target="#${childKey}"
        id="contact_details" 
      >
        <img src="${childData.contact_image}" class="rounded-circle my-auto mr-1" alt="candidate image" width="30px" height="30px">
        ${childData.name}
      </a>

      <div class="modal fade" id="${childKey}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">${childData.name}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body text-center" id="con_details">
            <img src="${childData.contact_image}" class="rounded rounded-circle my-auto mr-1" alt="candidate image" width="100px" height="100px">
            <h6>Name : ${childData.name}</h6>
            <h6>Mobile : <strong>${childData.mobile}</strong></h6>
            <h6>Email : ${childData.email}</h6>
            <h6>Title : ${childData.title}</h6>
            <h6>Company : ${childData.company}</h6>
          </div>
              
          <div class="modal-footer d-flex justify-content-between">
            <button id="${childKey}" onclick="delete_contact(this.id)" type="button" class="btn btn-danger" data-dismiss="modal">Delete</button>

            <button id="${childKey}"
              class="btn btn-success" data-dismiss="modal"
              data-toggle="modal" data-placement="top"
              data-target="#editContactModal"
              onclick="editContact(this.id)" 
            >
              Edit
            </button>
            
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>

          </div>
        </div>
      </div>
      </div>
      `;
      contacts.innerHTML = eachContact;
    });
  });
}


window.onload=function(){
  this.getContacts();
}


//--------------------------------Filtering Contacts--------------------------------

let filterInput = document.getElementById('filterContact');
filterInput.addEventListener('keyup', filterContacts);

function filterContacts(){
  let filterValue = document.getElementById('filterContact').value.toUpperCase();
  console.log(filterValue);

  var con_div = document.getElementById('contact_results');
  var a_div = con_div.querySelectorAll('a.list-group-item');
  
  for(let i=0;i<a_div.length;i++){
    let a_name = a_div[i];
    if(a_name.innerText.toUpperCase().indexOf(filterValue)>-1){
      a_div[i].style.display='';
    }else{
      a_div[i].style.display='none';
    }
  }

}


//--------------------------------Delete Contact--------------------------------

function delete_contact(key){
  
  var userId = firebase.auth().currentUser.uid;
  firebase.database().ref('Contacts/').child(userId).child(key).remove();
  getContacts(userId);
 
}


//--------------------------------Edit Contact--------------------------------


function editContact(id){

  console.log(id);

  var editContactModal = document.getElementById('edit-modal-content');
  var eachEditedmodal = '';

  var userId = firebase.auth().currentUser.uid;
  firebase.database().ref('Contacts/').child(userId).child(id).once('value', function(snapshot){
    var data = snapshot.val();
    console.log(data);
    
    eachEditedmodal += 
    `
    <div class="modal-header">
      <h5 class="modal-title" id="EditContactModalLabel">Edit Contact (${data.name})</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form>
          <div class="form-group" id="image-form">
            <div class="contact-image">
              <image  id="edit_contact_image" type="file" accept="image/*" src="${data.contact_image}" width="100px" height="100px"/>
            </div>
          </div>
          <hr/>
          <div class="form-group">
            <input id="edit_username" class="form-control form-control-sm" type="text" value="${data.name}">
          </div>
                                
          <div class="form-group">
            <input id="edit_title" class="form-control form-control-sm" type="text" value="${data.title}">
          </div>
                                
          <div class="form-group">
            <input id="edit_company" class="form-control form-control-sm" type="text" value="${data.company}">
          </div>
                                
          <div class="form-group">
            <input id="edit_mobile" class="form-control form-control-sm" type="text" value="${data.mobile}">
          </div>
                                
          <div class="form-group">
            <input id="edit_email" class="form-control form-control-sm" type="text" value="${data.email}">
          </div>

      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      <button id="${id}"  type="submit" onclick="saveEditedUser(this.id)" class="btn btn-primary">Save Changes</button>
    </div>
    `;
    editContactModal.innerHTML=eachEditedmodal;
  });

}


function saveEditedUser(id){

  var userId = firebase.auth().currentUser.uid;

  var name = document.getElementById('edit_username').value;
  var title = document.getElementById('edit_title').value;
  var company = document.getElementById('edit_company').value;
  var mobile = document.getElementById('edit_mobile').value;
  var email = document.getElementById('edit_email').value;

  var data = {name,title,company,mobile,email};

  firebase.database().ref('Contacts/').child(userId).child(id).update(data);
}


//--------------------------------Delete User Account--------------------------------

function deleteAccount(){
  var user=firebase.auth().currentUser;
  var userId = user.uid;
  

  user.delete().then(function(){ 
    // User deleted.
    var ref = firebase.database().ref(
       "Contacts/".concat(userId, "/")
    );
    ref.remove();
 });
}

//--------------------------------Print User Contacts--------------------------------

// function printUserData(){

//   var contactList = document.getElementById('contactList');
  
//   var eachContactList = '';

//   var userId=firebase.auth().currentUser.uid;
//   firebase.database().ref("Contacts/"+userId).orderByChild('name').on('value', function(snapshot){
//     snapshot.forEach(function(childSnapshot) {
//       var childKey = childSnapshot.key;
//       var childData = childSnapshot.val();
      
//       eachContactList += 
//       `<li class="list-group-item">hello</li>`;
//     })
//     contactList.innerHTML = eachContactList;
//   })
// }
