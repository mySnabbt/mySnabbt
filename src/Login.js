import React, {useState} from 'react';
import './Login.css';
import LoginKeypad from './LoginKeypad';

function Login({ user, setUser, pass, setPass }) {
    const [userActive, setUserActive] = useState(false);
    const [passActive, setPassActive] = useState(false);

    const handleUserActive = () => {
        setUserActive(true);
        setPassActive(false);
    }
    
    const handlePassActive = () => {
        setUserActive(false);
        setPassActive(true);
    }

    return (
        <div className="login">
            <h2>Login</h2>
            <label>User Pin: </label>
            <input onClick={handleUserActive}
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
            <label>Pass Key: </label>
            <input onClick={handlePassActive}
                type="text"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
            />
            <LoginKeypad 
                user={user}
                setUser={setUser}
                pass={pass}
                setPass={setPass}
                userActive={userActive}
                passActive={passActive}
            />
            

        </div>
    );
}

export default Login;