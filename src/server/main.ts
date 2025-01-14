import express,{json} from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import {randomUUID} from "crypto";
import {firestore, rtdb} from "./db.js";
import ViteExpress from "vite-express";


if (process.env.NODE_ENV !== "production") {
  process.loadEnvFile('.env');
}
const app = express();
const usersCollection= firestore.collection("users");
const roomsCollection= firestore.collection("rooms");
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.VITE_BASE_URL;

const ENV = process.env.VITE_ENVIRONMENT;
// Esto es para que express pueda entender el body de las peticiones
app.use(cors());
app.use(json());
app.use('/api',(req,res,next)=>{
    next();
})

// Rutas 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// ENDPOINTS

app.post("/api/signup",(req,res)=>{
    const username = req.body.username;
    const name = req.body.name;
    // Parametros del where -> campo, operador, valor
    usersCollection
        .where("username","==", username)
        .get()
        .then((searchResponse)=>{
            //Si no hay ningun usuario con ese username, se da de alta en la bd y devuelve un id
            if(searchResponse.empty){
                const newUser = {
                    username: username,
                    name: name,
                }
                usersCollection
                    .add(newUser)
                    .then((newUserRef)=>{
                        res.json({
                            id: newUserRef.id,
                            new:true
                        });
                    })
            }else{
                usersCollection.doc(searchResponse.docs[0].id).get().then((userDoc)=>{
                    //Si el nombre es distinto, actualiza el nombre
                    if(userDoc.data()!.name!= name){
                        userDoc.ref.update({
                            name: name
                        }).then(()=>{
                            res.status(200).json({
                                id: searchResponse.docs[0].id,
                                message: "User updated"
                            })
                        })
                    }else{
                        //searchResponse es un array
                        res.status(200).json({
                            id: searchResponse.docs[0].id,
                            message: "Username already exists"
                        });
                    }
                })
                
            }
        });
})

app.post('/api/auth',(req,res)=>{
    const {username} = req.body;
    usersCollection
        .where("username","==", username)
        .get()
        .then((searchResponse)=>{
            if(searchResponse.empty){
                res.status(404).json({
                    message: "User not found"
                });
            }else{
                res.json({
                    id: searchResponse.docs[0].id,
                    name: searchResponse.docs[0].data().name
                })
            }
        })
})
//Endpoint para crear un room
app.post('/api/rooms',(req,res)=>{
    const {userId} = req.body;
    usersCollection.doc(userId).get().then((userDoc)=>{
        if(userDoc.exists){
            //Si existe el id del usuario crea un room en la rtdb
            const newRoom={
                id: randomUUID(),
                owner: userId,
                messages: [],
            }
            const roomRef=rtdb.ref(`/rooms/${newRoom.id}`); 
            roomRef.set(newRoom).then(()=>{
                const roomFullID = roomRef.key;
                const roomID = roomFullID!.split('-')[0].slice(0,5);
                roomsCollection.doc(roomID).set({
                    owner: userId,
                    roomID: roomFullID,
                    messages: []
                }).then(()=>{
                    res.json({
                        roomID: roomID
                    })
                });
            })
        }else{
            res.status(401).json({
                message: "User not authorized"
            })
        }
    })
})
app.get('/api/rooms/:roomId',(req,res)=>{
    //El userId es un query param, se ve en el url como ?userId=123
    const {userId} = req.query;
    const {roomId} = req.params;
    //Checkea si el usuario existe, y si existe el room solicitado
    usersCollection.doc(userId!.toString()).get().then((userDoc)=>{
        if(userDoc.exists){
            roomsCollection.doc(roomId).get().then((roomDoc)=>{
                    if(roomDoc.exists){
                        //Devuelve el id completo de la realtime database
                        res.json({
                            roomIdRTDB: roomDoc.data()!.roomID,
                        })
                    }else{
                    res.status(404).json({
                        message: "Room not found"
                    })
                }
            })
        }else{
            res.status(401).json({
                message: "User not authorized"
            })
        }
    })  
})
app.post('/api/rooms/:roomID/messages',(req,res)=>{
    const {from, text} = req.body;
    const {roomID} = req.params;
    const newMessage = {
        from: from,
        text: text,
        timestamp: Date.now()
    }
    roomsCollection.doc(roomID).get().then((roomDoc)=>{
        if(roomDoc.exists){            
            const roomRTDB = rtdb.ref(`rooms/${roomDoc.data()!.roomID}`);
            roomRTDB.child("messages").push(newMessage).then(()=>{
                res.json({
                    message: "Message sent"
                })
            })
        }else{
            res.status(404).json({
                message: "Room not found"
            })
        }
    })
})

app.use(express.static('dist'));
app.get('*',(req,res)=>{
    res.sendFile(path.resolve(rootDir, 'dist', 'index.html'));
});
ViteExpress.listen(app, PORT as number, () =>
  console.log(`Server is listening on port ${PORT}...`, BASE_URL)
);
