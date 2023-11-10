import Participants from "../components/Participants";
import Footer from "../components/Footer";
import Header from "../components/Header";
import JoinRoom from "../components/JoinRoom";
import Chats from "../components/Chats";
import {io} from 'socket.io-client';

let socket=io.connect(import.meta.env.VITE_SOCKET_HOST);

export default function Index(){
    socket.on("connect", () => {
        console.log('ggg',socket.id);
        localStorage.setItem('token',socket.id);
    });
    socket.on('me',(arg)=>{
        console.log(arg)
    });
    
    return(
        <>
            {/* <JoinRoom/> */}
            <Header/>
            <div className="flex bg-bgSecondary h-[86vh]">
                <Participants/>
                <Chats/>
            </div>
            <Footer/>
        </>
    )
}