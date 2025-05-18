import React from "react";
import CloseIcon from "../icons/CloseIcon.jsx";

const CardMeet = ({ card, showMeet, setShowMeet })=>{


    return (
        showMeet && (
            <div
                id="app"
                className="fixed inset-[0] w-full h-full z-[60] flex justify-center items-center"
                style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
            >
                {/*返回按钮*/}
                <button className="absolute z-[70] top-[3vmin] right-[21vmin] w-[12vmin] flex items-center justify-center"
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

                <div className="h-[100vmin] w-[100vmin] object-contain" >

                </div>
            </div>
        )
    );
}

export default CardMeet;