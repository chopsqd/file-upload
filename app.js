import {upload} from './upload.js'
import {firebaseConfig} from './keys.js'
import * as firebase from "firebase/app"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const app = firebase.initializeApp(firebaseConfig);
const storage = getStorage(app);

upload('#file', {
    multi: true,
    accept: ['.png', '.jpg', '.jpeg', '.gif'],
    onUpload(files, blocks) {
        files.forEach((file, index) => {
            const storageRef  = ref(storage, `images/${file.name}`)
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', snapshot => {
                const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0) + '%'
                const block = blocks[index].querySelector('.preview__progress') 
                block.textContent = progress
                block.style.width = progress

            }, error => {
                console.log(error);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('Download URL', downloadURL);
                  });
            })
        });
    }
})