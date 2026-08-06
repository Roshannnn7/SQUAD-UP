'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiSquare, FiPlay, FiPause, FiTrash2, FiSend } from 'react-icons/fi';

/**
 * VoiceNote Component
 * Allows users to record and send voice notes in squad chat.
 *
 * Props:
 * - onSend(audioBlob, duration): called when user sends a voice note
 * - maxSeconds: max recording time (default 60)
 */
export function VoiceNoteRecorder({ onSend, maxSeconds = 60 }) {
    const [state, setState] = useState('idle'); // idle | recording | recorded
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [waveform, setWaveform] = useState([]);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const waveIntervalRef = useRef(null);
    const audioRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearInterval(waveIntervalRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Set up analyser for waveform animation
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 32;
            source.connect(analyser);
            analyserRef.current = analyser;

            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            chunksRef.current = [];

            mr.ondataavailable = (e) => chunksRef.current.push(e.data);
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                setState('recorded');
                stream.getTracks().forEach((t) => t.stop());
            };

            mr.start();
            setState('recording');
            setDuration(0);

            // Timer
            timerRef.current = setInterval(() => {
                setDuration((d) => {
                    if (d + 1 >= maxSeconds) {
                        stopRecording();
                        return d + 1;
                    }
                    return d + 1;
                });
            }, 1000);

            // Waveform
            waveIntervalRef.current = setInterval(() => {
                const data = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(data);
                const bars = Array.from(data.slice(0, 20)).map((v) => Math.max(4, (v / 255) * 40));
                setWaveform(bars);
            }, 80);

        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    };

    const stopRecording = () => {
        clearInterval(timerRef.current);
        clearInterval(waveIntervalRef.current);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const discard = () => {
        setAudioUrl(null);
        setAudioBlob(null);
        setDuration(0);
        setWaveform([]);
        setState('idle');
    };

    const handleSend = () => {
        if (audioBlob && onSend) {
            onSend(audioBlob, duration);
        }
        discard();
    };

    const formatTime = (secs) =>
        `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

    return (
        <div className="flex items-center gap-3">
            {state === 'idle' && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    title="Record voice note"
                    className="p-2.5 bg-white/10 hover:bg-violet-500/20 hover:text-violet-400 rounded-xl transition-all"
                >
                    <FiMic className="w-5 h-5" />
                </motion.button>
            )}

            {state === 'recording' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2"
                >
                    {/* Waveform */}
                    <div className="flex items-center gap-0.5 h-10">
                        {waveform.map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: h }}
                                transition={{ duration: 0.08 }}
                                className="w-1 bg-red-400 rounded-full"
                                style={{ minHeight: 4 }}
                            />
                        ))}
                    </div>

                    <span className="text-red-400 font-mono font-bold text-sm">
                        {formatTime(duration)}
                    </span>

                    <motion.div
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                    />

                    <button
                        onClick={stopRecording}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-all"
                    >
                        <FiSquare className="w-4 h-4 fill-current" />
                    </button>
                </motion.div>
            )}

            {state === 'recorded' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2"
                >
                    <audio ref={audioRef} src={audioUrl} />
                    <VoiceNotePlayer audioUrl={audioUrl} duration={duration} compact />

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button
                        onClick={discard}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSend}
                        className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all"
                    >
                        <FiSend className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}

/**
 * VoiceNotePlayer Component
 * Renders a playable voice note bubble in chat.
 *
 * Props:
 * - audioUrl: string URL or base64 data
 * - duration: number (seconds)
 * - senderName: string
 * - compact: boolean
 */
export function VoiceNotePlayer({ audioUrl, duration = 0, senderName, compact = false }) {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play();
            setPlaying(true);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => {
            setCurrentTime(Math.floor(audio.currentTime));
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };
        const onEnded = () => {
            setPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    const formatTime = (secs) =>
        `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <audio ref={audioRef} src={audioUrl} />
                <button onClick={togglePlay} className="text-violet-400 hover:text-violet-300 transition-colors">
                    {playing ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                </button>
                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-gray-400 font-mono">{formatTime(playing ? currentTime : duration)}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl px-4 py-3 max-w-xs">
            <audio ref={audioRef} src={audioUrl} />

            <button
                onClick={togglePlay}
                className="w-9 h-9 flex-shrink-0 bg-violet-600 hover:bg-violet-500 rounded-xl flex items-center justify-center transition-all"
            >
                {playing ? (
                    <FiPause className="w-4 h-4 text-white" />
                ) : (
                    <FiPlay className="w-4 h-4 text-white ml-0.5" />
                )}
            </button>

            <div className="flex-1">
                <div className="flex items-center gap-1 mb-1.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all ${
                                (i / 20) * 100 < progress ? 'bg-violet-400' : 'bg-white/20'
                            }`}
                            style={{
                                width: 3,
                                height: Math.random() * 12 + 4, // Static pseudo-waveform
                            }}
                        />
                    ))}
                </div>
                <p className="text-xs text-gray-400 font-mono">{formatTime(playing ? currentTime : duration)}</p>
            </div>
        </div>
    );
}

export default VoiceNotePlayer;
