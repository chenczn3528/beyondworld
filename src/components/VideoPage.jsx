import React, {useEffect, useState} from "react";
import LeftIcon from "../icons/LeftIcon.jsx";

const VideoPage = ({
    baseSize,
    isPortrait,
    showPageZIndex,
    setShowPageZIndex,
    video_url,
}) => {

    return (
        <div
            className="absolute w-full h-full flex items-center justify-center"
            style={{zIndex: showPageZIndex}}
            onClick={(e) => {
                e.stopPropagation();
                setShowPageZIndex(-1)
            }}
        >
            {/*返回按钮*/}
            <button
                className="absolute z-110"
                onClick={()=>setShowPageZIndex(-1)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    left: `${baseSize}px`,
                    top: `${baseSize * 1.2}px`
                }}
            >
                <LeftIcon size={baseSize * 2.5} color="white"/>
            </button>


            <iframe
                src={video_url}
                width={isPortrait ? window.innerHeight : window.innerWidth}
                height={isPortrait ? window.innerWidth : window.innerHeight}
                scrolling="no" border="0" frameBorder="no" framespacing="0" allowFullScreen="true"></iframe>
        </div>
    );
}

export default VideoPage;