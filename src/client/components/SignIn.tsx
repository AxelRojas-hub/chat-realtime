import React from 'react';
import { log } from 'console';
import './SignIn.css'
import { useEffect} from 'react'
import { useNavigate } from 'react-router-dom';

const BASE_URL =import.meta.env.VITE_BASE_URL;

const SignIn: React.FC = () => {
    const navigate = useNavigate();

    // Debe buscar si existe un userID en localStorage y si existe, navegar a home con ese userID
    useEffect(() => {
        const userName = localStorage.getItem('name');
        const userId = localStorage.getItem('userId');
        if (userName && userId) {
            navigate('/home', { state: { userId: userId, name: userName } });
        }
    }, []);

    const getUserId= async(username: string, name: string) =>{
        const userData = {username: username, name: name}
        const response = await fetch(BASE_URL+'/api/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data.id
    }

    //Deberia buscar el userId en firestore y si no existe, crear el usuario y devolver el id 
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const user={username:'',name:'',id:''}
        //Si no se ingreso nombre se setea uno por defecto
        const data = event.target as any
        const inputUsername = data.username.value as string;
        const inputName = data.name.value as string;
        getUserId(inputUsername, inputName).then((userId) => {
            user.username = inputUsername;
            user.name = inputName;
            user.id = userId;
            localStorage.setItem('name', inputName);
            localStorage.setItem('userId', userId);
            navigate('/home', { state: { userId: userId, name: inputName } });
        });
    };
    
    return (
    <div className='signin-container'>
        <h1 className='signin-title'>¡Bienvenido!</h1>
        <form className='signin-form' onSubmit={handleSubmit}>
            <label className='signin-form__label' htmlFor="usernameInput">
                Nombre de usuario
                <input 
                required
                autoFocus
                className='signin-form__input' 
                placeholder='Ej: nombre1234'
                type="text"
                name='username'
                />
            </label>
            <label className='signin-form__label' htmlFor="nameInput">
                Nombre visible
                <input 
                required
                placeholder='Ej: Nombre'
                className='signin-form__input' 
                type="text"
                name='name'
                />
            </label>
            <button type='submit' className='signin-form__btn'>Comenzar</button>
        </form>
    </div>
    )
}

export default SignIn;
