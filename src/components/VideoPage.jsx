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
    const filteredVideos = useMemo(() =>
        (videos || []).filter((video) => video && video.url),
        [videos]
    );
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setCurrentIndex(filteredVideos.length ? Math.min(Math.max(defaultIndex, 0), filteredVideos.length - 1) : 0);
    }, [defaultIndex, filteredVideos]);

    const currentVideo = filteredVideos[currentIndex] || null;
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
                    return `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0&p=${page}&preload=auto&quality=1080p&isOutside=true`;
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
        fontSize: `${baseSize * 8}px`,
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

            {filteredVideos.length > 0 && (
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
                    <div className="flex items-center gap-[1vmin] flex-wrap" style={{gap: `${baseSize * 2}px`}}>
                        {filteredVideos.map((video, idx) => (
                            <button
                                key={`${video.field || video.label || idx}`}
                                style={{
                                    ...videoButtonStyle,
                                    backgroundColor: idx === currentIndex ? 'rgba(255,255,255,0.4)' : videoButtonStyle.backgroundColor,
                                }}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                }}
                            >
                                {video.label || video.field || `视频${idx + 1}`}
                            </button>
                        ))}
                    </div>
                    {currentAuthor && (
                        <div className="flex items-center gap-[1vmin]" style={{gap: `${baseSize * 2}px`}}>
                            <button
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={() => {
                                    if (sourceUrl) window.open(sourceUrl, '_blank');
                                }}
                            >
                                <InfoIcon size={baseSize * 8} color="white"/>
                            </button>
                            <button
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    color: 'white',
                                    fontSize: `${baseSize * 7}px`,
                                    textShadow: '0 0 2px black, 0 0 4px black',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    if (sourceUrl) window.open(sourceUrl, '_blank');
                                }}
                            >
                                作者：{currentAuthor}
                            </button>
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
