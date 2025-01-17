import React from 'react'
import './Home.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const BASE_URL =import.meta.env.VITE_BASE_URL;

const Home: React.FC = () => {
    const [name, setName] = useState('');
    const [userID, setUserID] = useState('');
    const [newRoom, setNewRoom] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const name = localStorage.getItem('name');
        const userID = localStorage.getItem('userId');
        if (name && userID) {
            setName(name);
            setUserID(userID);
        }
    }, []);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        if (value === 'new') {
            setNewRoom(true);
        }else{
            setNewRoom(false);
        }
    }
    const createChatroom = async () => {
        const response = await fetch(BASE_URL+'/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId: userID})
        });
        const data = await response.json();
        return data.roomID;
    }

    const connectToChatroom = async (chatroomID: string) => {
        // /rooms/:roomId?userId=userId
        const response = await fetch(BASE_URL+'/api/rooms/'+chatroomID+'?userId='+userID, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data.roomIdRTDB
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Si se selecciono un room nuevo se crea uno, sino se setea el id del room ingresado
        const select =event.currentTarget.roomChoice as HTMLSelectElement;
        if (select.value === 'new') {
            createChatroom().then(newChatroomID => {                
                navigate('/chat', { state: { name: name, chatroomID: newChatroomID } });
            });
        }else{
            const id = event.currentTarget.existingRoom.value;
            connectToChatroom(id).then((roomFullId) => {
                navigate('/chat', { state: { name: name, chatroomID: roomFullId} });
            });
        }
    };

    const handleNewName= () => {
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        navigate('/');
    };

    return (
    <div className='home-container'>
        {name?<h1 className='home-title'>¡Hola, {name}!</h1>:<h1 className='home-title'>¡Bienvenido!</h1>}
        <form className='home-form' onSubmit={handleSubmit}>
            <select name="roomChoice" id='roomChoice' className='home-form__select' onChange={handleSelectChange}>
                <option value="new">Nuevo room</option>
                <option value="existing">Room existente</option>
            </select>
            {/* Si se selecciono un room nuevo no se muestra el input para room existente */}
            {!newRoom&&
                <input 
                type="text" 
                    required 
                    autoFocus
                    className='home-form__input' 
                    name="existingRoom" 
                    placeholder='ID del room'
                    />
                }
            <button type='submit' className='home-form__btn'>Comenzar</button>
        </form>
        {name? <small className='home-changename-text' onClick={handleNewName}>Quiero cambiar mi nombre de usuario</small>:''}
    </div>
    )
}

export default Home
