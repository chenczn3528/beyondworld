import React, {useState} from "react";
import CloseIcon from "../icons/CloseIcon.jsx";
import StarIcon from "../icons/StarIcon.jsx";

const CardMeet = ({ card, showMeet, setShowMeet, fontsize })=>{

    const [showMeetNumber, setShowMeetNumber] = useState(0);

    const button_style = {
        color: 'white',
        textShadow: '0 0 2px gray, 0 0 4px gray',
        fontSize: `${fontsize}px`,
        background: '#ffffff20',
    }

    const getButtonStyle = (index) => ({
        ...button_style,
        color: showMeetNumber === index ? 'white' : 'gray',
        textShadow: showMeetNumber === index ? button_style.textShadow : null
    });


    const filteredMeets = card["相会事件"].filter(item =>
        item.content_html !== `{{{${item.title_img}}}}` && item.content_html !== "");

    const parsed = filteredMeets[showMeetNumber].content_html
        .split(/<br\s*\/?><br\s*\/?>/i).flatMap((part, index, arr) =>
            index < arr.length - 1
                ? [
                    <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }} />,
                    <div
                        key={`hr-${index}`}
                        className="flex justify-center items-center"
                        style={{
                            marginTop: `${fontsize}px`,
                            marginBottom: `${fontsize}px`
                        }}
                    >
                        <StarIcon size={fontsize / 1.5} color="gray" />
                        <hr
                            className="flex-grow"
                            style={{
                                border: 'none',
                                borderTopWidth: '1.5px',
                                borderTopStyle: 'solid',
                                borderTopColor: 'gray'
                            }}
                        />
                        <StarIcon size={fontsize / 1.5} color="gray" />
                    </div>
                ] : [<span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }}/>]
        );




    return (
        showMeet && (
            <div
                className="absolute w-full h-full z-[60] flex flex-row items-center"
                style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', gap: `${fontsize}px`}}
            >
                {/*返回按钮*/}
                <button className="absolute z-[70] w-auto flex items-center justify-center"
                    onClick={()=>setShowMeet(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 10,
                        top: `${fontsize * 2}px`,
                        right: `${fontsize * 2}px`
                    }}
                >
                    <CloseIcon size={fontsize * 1.3} color="white"/>
                </button>

                <div className="absolute flex flex-row"
                     style={{right: `${fontsize * 5}px`, left: `${fontsize * 5}px`}}>

                    {/*相会事件按钮*/}
                    <div
                        className=" flex flex-col items-center justify-center"
                        style={{gap: `${fontsize}px`, width: '40%'}}
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

                    {/*文字*/}
                    <div className="flex flex-col"
                         style={{width: "80%", height: `${fontsize * 20}px`}}>
                        <label style={{
                            fontSize: `${fontsize * 2}px`,
                            top: '0px',
                            marginBottom: `${fontsize}px`,
                            color: 'white',
                            fontWeight: 800
                        }}>
                            相会事件
                        </label>

                        <div
                            className="overflow-y-auto"
                            style={{marginRight: `${fontsize * 3}px`}}
                        >
                            <div
                                style={{fontSize: `${fontsize}px`, color: 'white'}}
                                className="text-sm leading-relaxed"
                            >
                                <div style={{fontSize: `${fontsize}px`, color: 'white'}}>
                                    {parsed}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>


            </div>
        )
    );
}

export default CardMeet;