import React, { useEffect, useMemo, useState } from "react";
import LeftIcon from "../icons/LeftIcon.jsx";
import InfoIcon from "../icons/InfoIcon.jsx";

const VideoPage = ({
    baseSize,
    isPortrait,
    showPageZIndex,
    setShowPageZIndex,
    video_url,
    videos = [],
    defaultIndex = 0,
}) => {
    const [currentIndex, setCurrentIndex] = useState(() => (videos.length ? Math.min(defaultIndex, videos.length - 1) : 0));
    const [showAuthorInfo, setShowAuthorInfo] = useState(false);

    useEffect(() => {
        setCurrentIndex(videos.length ? Math.min(Math.max(defaultIndex, 0), videos.length - 1) : 0);
        setShowAuthorInfo(false);
    }, [defaultIndex, videos.length]);

    const currentVideo = videos[currentIndex] || null;
    const sourceUrl = currentVideo?.url || video_url || "";
    const currentAuthor = currentVideo?.author;

    const resolvedUrl = useMemo(() => {
        if (!sourceUrl) return "";
        try {
            const url = new URL(sourceUrl);
            const { hostname, pathname, searchParams } = url;
            if (hostname.includes("player.bilibili.com")) {
                return sourceUrl;
            }
            if (pathname.includes("video")) {
                const segments = pathname.split("/");
                const bvid = segments.find((seg) => seg.startsWith("BV"));
                if (bvid) {
                    const page = searchParams.get("p") || "1";
                    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&autoplay=0&preload=auto&quality=1080p&isOutside=true`;
                }
            }
        } catch (err) {
            // ignore invalid url
        }
        return sourceUrl;
    }, [sourceUrl]);

    const videoButtonStyle = {
        color: 'white',
        textShadow: '0 0 2px gray, 0 0 4px gray',
        fontSize: `${baseSize * 6}px`,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: `${baseSize * 1}px ${baseSize * 2}px`,
        borderRadius: `${baseSize * 0.8}px`,
    };

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
                    left: `${baseSize*5}px`,
                    top: `${baseSize * 5}px`
                }}
            >
                <LeftIcon size={baseSize * 24} color="white"/>
            </button>

            {videos.length > 0 && (
                <div
                    className="absolute flex items-center"
                    style={{
                        left: `${baseSize * 32}px`,
                        top: `${baseSize * 5}px`,
                        gap: `${baseSize * 2}px`,
                        zIndex: 120,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-[1vmin] flex-wrap" style={{gap: `${baseSize * 1}px`}}>
                        {videos.map((video, idx) => (
                            <button
                                key={`${video.field || video.label || idx}`}
                                style={{
                                    ...videoButtonStyle,
                                    backgroundColor: idx === currentIndex ? 'rgba(255,255,255,0.4)' : videoButtonStyle.backgroundColor,
                                }}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setShowAuthorInfo(false);
                                }}
                            >
                                {video.label}
                            </button>
                        ))}
                    </div>
                    {currentAuthor && (
                        <div className="relative flex items-center">
                            <button
                                style={{
                                    ...videoButtonStyle,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: `${baseSize * 2}px`,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                }}
                                onClick={() => setShowAuthorInfo((prev) => !prev)}
                            >
                                <InfoIcon size={baseSize * 6} color="white"/>
                            </button>
                            {showAuthorInfo && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: `${baseSize * 12}px`,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        padding: `${baseSize * 1}px ${baseSize * 2}px`,
                                        borderRadius: `${baseSize * 0.8}px`,
                                        whiteSpace: 'nowrap',
                                        fontSize: `${baseSize * 6}px`,
                                        textShadow: '0 0 2px black, 0 0 4px black',
                                    }}
                                >
                                    作者：{currentAuthor}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <iframe
                src={resolvedUrl}
                width="100%"
                height="100%"
                scrolling="no"
                border="0"
                frameBorder="no"
                framespacing="0"
                allowFullScreen="true"
                referrerPolicy="no-referrer"
                style={{ borderRadius: `${baseSize}px`, backgroundColor: "black" }}
            ></iframe>
        </div>
    );
}

export default VideoPage;
