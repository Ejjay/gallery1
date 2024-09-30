 // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, push, onChildAdded } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxhPPrjkPo1VOTSPruIgjv_j37Xpx0OHE",
  authDomain: "gallery-a5670.firebaseapp.com",
  projectId: "gallery-a5670",
  storageBucket: "gallery-a5670.appspot.com",
  messagingSenderId: "471229939031",
  appId: "1:471229939031:web:3e0a28df2ccb7dac3b9212",
  databaseURL: "https://gallery-a5670-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submitted');
    const file = document.getElementById('fileInput').files[0];
    if (!file) {
        console.error('No file selected');
        return;
    }
    console.log('File selected:', file.name);
    const storageRef = ref(storage, 'images/event_photos/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
        function(snapshot) {
            // Handle progress
            console.log('Upload progress:', (snapshot.bytesTransferred / snapshot.totalBytes) * 100 + '%');
        }, 
        function(error) {
            // Handle error
            console.error('Upload failed:', error);
        }, 
        function() {
            // Handle successful uploads
            getDownloadURL(uploadTask.snapshot.ref).then(function(downloadURL) {
                console.log('File available at', downloadURL);
                // Store the download URL in the Realtime Database
                push(dbRef(database, 'images/'), {
                    url: downloadURL,
                    name: file.name
                }).then(() => {
                    console.log('File URL saved to database');
                }).catch((error) => {
                    console.error('Error saving URL to database:', error);
                });
            });
        }
    );
});

// Listen for changes in the Realtime Database and update the gallery
onChildAdded(dbRef(database, 'images/'), function(snapshot) {
    const imageUrl = snapshot.val().url;
    console.log('New image added:', imageUrl);
    displayImage(imageUrl);
});

function displayImage(url) {
    const gallery = document.getElementById('gallery');
    const img = document.createElement('img');
    img.src = url;
    img.className = 'gallery-item';
    gallery.appendChild(img);
}
