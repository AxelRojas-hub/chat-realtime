import React from 'react'
import './Chat.css'
import { Link, useLocation } from 'react-router-dom'
import { FormEvent, useEffect, useState } from 'react'
import { database } from '../rtdb.js'
const BASE_URL =import.meta.env.VITE_BASE_URL;

type Message = {
    from: string,
    text: string,
}

const Chat: React.FC = () => {
    const location = useLocation();
    const [messages, setMessages] = useState<Message[]>([])
    const [chatroomID, setChatroomID] = useState<string>('')
    const [name, setName] = useState<string>('');
    const [idCopied, setIdCopied] = useState<boolean>(false);
    
    
    // Setea los valores de location
    useEffect(() => {
        setName(location.state.name)        
        if(location.state.chatroomID.length <= 5){
            getChatroomFullID(location.state.chatroomID).then((chatroomID) => {
                setChatroomID(chatroomID)
            });
        }else{
            setChatroomID(location.state.chatroomID)
        }       
    }, [location.state])

    const getChatroomFullID = async (chatroomID: string) => {
        let userID = localStorage.getItem('userId');
        const response = await fetch(BASE_URL+'/api/rooms/'+chatroomID+'?userId='+userID, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data.roomIdRTDB
    };

    // Conecta al chatroom y escucha los mensajes
    useEffect(() => {
        if (chatroomID && name) {            
            const chatroomsRef = database.ref('/rooms/' + chatroomID+'/messages');
            chatroomsRef.on('value', (snapshot: any) => {
                let val = snapshot.val();
                if (val) {        
                    //Si ya hay msgs, checkea si hay nuevos y los agrega
                    if(messages){
                        const incomingMsgs = Object.entries(val).map(([, value]) => value);
                        
                        const newMsgs = incomingMsgs.filter((msg) => !messages.includes(msg as Message)) as Message[];
                        setMessages([...messages, ...newMsgs]); 
                    }  else{
                        //Si no hay msgs, los setea
                        const msgs = Object.entries(val).map(([, value]) => value);
                        setMessages(msgs as Message[]);
                    }
                }else{
                    console.log('No hay mensajes');
                }                
            })
        }
    }, [chatroomID, name])

    const handleSentMsg = (event:FormEvent) => {
        event.preventDefault();
        const input = document.querySelector('.chat-input__field') as HTMLInputElement
        const message = input.value.trim()
        if (message) {
            let firestoreID = chatroomID.slice(0,5);
            //Postea el msg en el chatroom
            fetch(BASE_URL+'/api/rooms/'+firestoreID+'/messages',{
                method: 'POST',
                body: JSON.stringify({from: name, text: message}),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log(data)
            });
            setMessages([...messages, {from: name, text: message}])
            input.value = ''
        }
    }
    const handleIdClick = ()=>{
        navigator.clipboard.writeText(chatroomID.slice(0,5)).then(
            () => {
                setIdCopied(true);
                setTimeout(() => {
                    setIdCopied(false);
                }, 2000);
            }
        );
    }
    return (
    <div className="chat-container">
        <div className="chat-header">
            <div className="chat-header-left">
                <h1 className='chat-title'>Chat</h1>
                <small 
                    className='chat-subtitle' 
                    onClick={handleIdClick}>
                        RoomID: <strong>{chatroomID.slice(0,5)}</strong>  {!idCopied?"(Click para copiar el ID)":"ID en el portapapeles!"}
                        </small>
            </div>
            <Link to={'/'} className='chat-header__link'>
            <span className='chat-header__home'>🏠 Home</span>
            </Link>
        </div>
        <div className="chat-messages">
            {/* A la hora de mapear los msg, hay que considerar de quien es el msg
            Si es del usuario, va a la derecha y a color, si es de otro, a la izquierda y gris */}
            {messages.map((message, index) => (
                <div key={index} className={`${message.from === name ? "user-msg" : "guest-msg"} chat-messages__message`} >
                <span className="chat-messages__message-from">{message.from !== name? message.from :""}</span>
                <span className="chat-messages__message-text">{message.text}</span>
                </div>
            ))}
        </div>
        <form action="submit" onSubmit={handleSentMsg}>
            <div className="chat-input">
                <input className="chat-input__field" type="text" placeholder="Escribe un mensaje..." autoFocus/>
                <button className="chat-input__btn">Enviar</button>
            </div>
        </form>
    </div>
)
}

export default Chat