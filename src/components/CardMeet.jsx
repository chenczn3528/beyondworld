import React, {useState} from "react";
import CloseIcon from "../icons/CloseIcon.jsx";

const CardMeet = ({ card, showMeet, setShowMeet })=>{

    const [showMeetNumber, setShowMeetNumber] = useState(0);

    const button_style = {
        color: 'white',
        textShadow: '0 0 2px gray, 0 0 4px gray',
        fontSize: '4vmin',
        background: '#ffffff20',
    }

    const getButtonStyle = (index) => ({
        ...button_style,
        color: showMeetNumber === index ? 'white' : 'gray',
        textShadow: showMeetNumber === index ? button_style.textShadow : null
    });


    const filteredMeets = card["相会事件"].filter(item => item.content_html !== `{{{${item.title_img}}}}`);



    return (
        showMeet && (
            <div
                id="app"
                className="fixed inset-[0] w-full h-full z-[60] flex flex-row justify-center items-center gap-[5vmin]"
                style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
            >
                {/*返回按钮*/}
                <button className="absolute z-[70] top-[6vmin] right-[9vmin] w-auto flex items-center justify-center"
                    onClick={()=>setShowMeet(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 10,
                    }}
                >
                    <CloseIcon size={16} color="white"/>
                </button>

                <div
                    className="flex flex-col w-[25%] gap-[2vmin] items-center justify-center"
                    style={{border: 'red 3px'}}
                >
                    {filteredMeets.map((item, index) => (
                        <button
                            key={index}
                            style={getButtonStyle(index)}
                            onClick={() => setShowMeetNumber(index)}
                        >
                            {item.title_img}
                        </button>
                    ))}
                </div>


                <div className="flex flex-col w-[55%] h-[65%] gap-[5vmin] justify-center">
                    <label style={{fontSize: '5vmin', color: 'white', fontWeight: 800}}>
                        相会事件
                    </label>

                    <div
                        className="overflow-y-auto ">
                        <div
                            style={{fontSize: '3vmin', color: 'white'}}
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{__html: filteredMeets[showMeetNumber].content_html}}
                        />
                    </div>
                </div>

            </div>
        )
    );
}

export default CardMeet;