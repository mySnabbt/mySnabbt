// import React from 'react';
// import './ManagementLogin.css'; // You will create this file

// function ManagementLogin({
//   user,
//   setUser,
//   pass,
//   setPass,
//   onLogin,
//   onCancel,
// }) {
//   return (
//     <div className="management-login-overlay">
//       <div className="management-login-window">
//         <h2 className="title">Management Login</h2>
//         <input
//           type="text"
//           placeholder="PIN"
//           value={user}
//           onChange={(e) => setUser(e.target.value)}
//           className="input"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={pass}
//           onChange={(e) => setPass(e.target.value)}
//           className="input"
//         />
//         <div className="button-group">
//           <button onClick={onLogin} className="login-button">
//             Login
//           </button>
//           <button onClick={onCancel} className="cancel-button">
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ManagementLogin;

// import React, { useState, useRef, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
// import { Input } from './components/ui/input';
// import { Label } from './components/ui/label';
// import { Button } from './components/ui/button';

// // Your Keypad component (assuming it's a separate file)
// function Keypad({ onPress, onBackspace }) {
//   const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
//   return (
//     <div className="flex flex-col gap-2">
//       <div className="grid grid-cols-3 gap-2">
//         {keys.slice(0, 9).map(k => (
//           <Button key={k} type="button" variant="secondary" onClick={() => onPress(k)} className="h-12 text-lg">
//             {k}
//           </Button>
//         ))}
//         <Button type="button" variant="secondary" onClick={onBackspace} className="h-12 text-lg">
//           ←
//         </Button>
//         <Button type="button" variant="secondary" onClick={() => onPress("0")} className="h-12 text-lg">
//           0
//         </Button>
//         <Button type="button" onClick={() => {}} className="h-12 text-lg invisible">
//           {/* Invisible button to maintain grid layout */}
//         </Button>
//       </div>
//     </div>
//   );
// }

// function ManagementLogin({
//   user,
//   setUser,
//   pass,
//   setPass,
//   onLogin,
//   onCancel,
// }) {
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [activeInput, setActiveInput] = useState(null); // 'user' or 'pass'
//   const loginRef = useRef(null);
  
//   // Hook to handle clicks outside of the login card
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (loginRef.current && !loginRef.current.contains(event.target)) {
//         setShowKeypad(false);
//         setActiveInput(null);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [loginRef]);

//   const handleKeypadPress = (key) => {
//     if (activeInput === 'user') {
//       setUser(prev => prev + key);
//     } else if (activeInput === 'pass') {
//       setPass(prev => prev + key);
//     }
//   };

//   const handleKeypadBackspace = () => {
//     if (activeInput === 'user') {
//       setUser(prev => prev.slice(0, -1));
//     } else if (activeInput === 'pass') {
//       setPass(prev => prev.slice(0, -1));
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
//       <Card ref={loginRef} className="w-96">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl font-bold">Management Login</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="pin">PIN</Label>
//               <Input
//                 id="pin"
//                 type="text"
//                 value={user}
//                 onChange={(e) => setUser(e.target.value)}
//                 onFocus={() => {
//                   setShowKeypad(true);
//                   setActiveInput('user');
//                 }}
//                 placeholder="Enter PIN"
//                 className="w-full text-center text-lg"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={pass}
//                 onChange={(e) => setPass(e.target.value)}
//                 onFocus={() => {
//                   setShowKeypad(true);
//                   setActiveInput('pass');
//                 }}
//                 placeholder="Enter password"
//                 className="w-full text-center text-lg"
//               />
//             </div>
//           </div>
          
//           {showKeypad && (
//             <Keypad
//               onPress={handleKeypadPress}
//               onBackspace={handleKeypadBackspace}
//             />
//           )}

//           <div className="flex gap-2">
//             <Button onClick={onLogin} className="flex-1 ">
//               Login
//             </Button>
//             <Button onClick={onCancel} variant="secondary" className="flex-1">
//               Cancel
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default ManagementLogin;

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';

// Your Keypad component (assuming it's a separate file)
function Keypad({ onPress, onBackspace }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {keys.slice(0, 9).map(k => (
          <Button key={k} type="button" variant="secondary" onClick={() => onPress(k)} className="h-12 text-lg">
            {k}
          </Button>
        ))}
        <Button type="button" variant="secondary" onClick={onBackspace} className="h-12 text-lg">
          ←
        </Button>
        <Button type="button" variant="secondary" onClick={() => onPress("0")} className="h-12 text-lg">
          0
        </Button>
        <Button type="button" onClick={() => {}} className="h-12 text-lg invisible">
          {/* Invisible button to maintain grid layout */}
        </Button>
      </div>
    </div>
  );
}

function ManagementLogin({
  user,
  setUser,
  pass,
  setPass,
  onLogin,
  onCancel,
}) {
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeInput, setActiveInput] = useState(null); // 'user' or 'pass'
  const loginRef = useRef(null);
  
  // Hook to handle clicks outside of the login card
  useEffect(() => {
    function handleClickOutside(event) {
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setShowKeypad(false);
        setActiveInput(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [loginRef]);

  const handleKeypadPress = (key) => {
    if (activeInput === 'user') {
      setUser(prev => prev + key);
    } else if (activeInput === 'pass') {
      setPass(prev => prev + key);
    }
  };

  const handleKeypadBackspace = () => {
    if (activeInput === 'user') {
      setUser(prev => prev.slice(0, -1));
    } else if (activeInput === 'pass') {
      setPass(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
      <Card ref={loginRef} className="w-96 bg-white">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Management Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onFocus={() => {
                  setShowKeypad(true);
                  setActiveInput('user');
                }}
                placeholder="Enter PIN"
                className="w-full text-center text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onFocus={() => {
                  setShowKeypad(true);
                  setActiveInput('pass');
                }}
                placeholder="Enter password"
                className="w-full text-center text-lg"
              />
            </div>
          </div>
          
          {showKeypad && (
            <Keypad
              onPress={handleKeypadPress}
              onBackspace={handleKeypadBackspace}
            />
          )}

          <div className="flex gap-2">
            <Button
              onClick={onLogin}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              Login
            </Button>
            <Button
              onClick={onCancel}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ManagementLogin;