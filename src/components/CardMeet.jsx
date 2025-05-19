import React, {useState} from "react";
import CloseIcon from "../icons/CloseIcon.jsx";

const CardMeet = ({ card, showMeet, setShowMeet })=>{

    const [showMeetNumber, setShowMeetNumber] = useState(0);

    return (
        showMeet && (
            <div
                id="app"
                className="fixed inset-[0] w-full h-full z-[60] flex justify-center items-center"
                style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
            >
                {/*返回按钮*/}
                <button className="absolute z-[70] top-[6vmin] right-[9vmin] w-auto flex items-center justify-center"
                    onClick={()=>setShowMeet(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                    }}
                >
                    <CloseIcon size={16} color="white"/>
                </button>

                <div className="absolute top-[6vmin] left-[6vmin] flex flex-row w-full h-full" style={{border: 'red 3px'}}>
                    <label>相会事件</label>
                </div>
            </div>
        )
    );
}

export default CardMeet;