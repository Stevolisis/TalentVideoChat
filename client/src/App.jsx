import React,{  useEffect, useState, useRef } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.css';

const socket=io.connect(process.env.SOCKET_HOST);

function App() {
  const [me,setMe]=useState('');
  const [stream,setStream]=useState('');
  const [recievingCall,setRecievingCall]=useState(false);
  const [caller,setCaller]=useState('');
  const [callerSignal,setCallerSignal]=useState('');
  const [callAccepted,setCallAccepted]=useState(false);
  const [idToCall,setIdToCall]=useState('');
  const [callEnded,setCallEnded]=useState(false);
  const [name,setName]=useState('');

  const myVideo=useRef();
  const userVideo=useRef();
  const connectionRef=useRef();

  useEffect(()=>{
    navigator.mediaDevices.getUserMedia({video:true, audio:true})
    .then((stream)=>{
      setStream(stream);
      myVideo.current.srcObject=stream;
    });

    socket.on('me',(id)=>{
      setMe(id);
    })

    socket.on('callUser',(data)=>{
      setRecievingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data,signal)
    })
  },[]);




  const callUser=(id)=>{
    const peer=new Peer({
      initiator:true,
      trickle:false,
      stream: stream
    });

    peer.on('signal', (data)=>{
      socket.emit('callUser',{
        userToCall:id,
        signalData:data,
        from:me,
        name:name
      })
    });

    peer.on('stream',(stream)=>{
      userVideo.current.srcObject=stream;
    });

    socket.on('callAccepted',(signal)=>{
      setCallAccepted(true);
      peer.signal(signal)
    });

    connectionRef.current=peer;
  }


  const answerCall=()=>{
    setCallAccepted(true);
    const peer=new Peer({
      initiator:false,
      trickle:false,
      stream: stream
    });
    
    peer.on('signal', (data)=>{
      socket.emit('answerCall',{
        signal:data,
        to:caller,
      })
    });

    peer.on('stream',(stream)=>{
      userVideo.current.srcObject=stream;
    });

    peer.signal(callerSignal);
    connectionRef.current=peer;
  }

  
  const leaveCall=()=>{
    setCallEnded(true);
    connectionRef.current.destroy();
  }

  

  return (
    <>
      <div><p>Talent Video</p></div>
      <div>
        <div>
          {stream&&<video playsInline autoPlay muted ref={myVideo} className='w-[30vw]'/>}
          {callAccepted&& !callEnded ? 
          <video playsInline autoPlay muted ref={myVideo} className='w-[30vw]'/> 
          : null
          }
        </div>
        <div>
          <input type='text' placeholder='Name' onChange={(e)=>setName(e.target.value)}/>
          <CopyToClipboard text={me}>
            <button>Copy Id</button>
          </CopyToClipboard>
          <input type='text' placeholder='Id to call' onChange={(e)=>setIdToCall(e.target.value)}/>

        </div>
        <div>
          {callAccepted&& !callEnded ? 
          <button onClick={leaveCall}>End Call</button>
          : 
          <button onClick={()=>callUser(idToCall)}>Call</button>
          }
        </div>
        <div>
          <p>{idToCall}</p>
        </div>
      </div>
    </>
  )
}


export default App
