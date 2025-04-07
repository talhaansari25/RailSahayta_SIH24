import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const VideoCall = () => {
  const { id: roomHash } = useParams();  // Get roomHash from URL params
  const [localStream, setLocalStream] = useState(null);
  const [userStreams, setUserStreams] = useState({});
  const [drone, setDrone] = useState(null);
  const [pc, setPc] = useState(null);  // Ensure peer connection is correctly set

  useEffect(() => {
    // Initialize ScaleDrone and WebRTC
    const droneClient = new ScaleDrone('yiS12Ts5RdNhebyM');
    setDrone(droneClient);

    const roomName = 'observable-' + roomHash;
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    droneClient.on('open', (error) => {
      if (error) {
        console.error(error);
        return;
      }
      const room = droneClient.subscribe(roomName);
      room.on('open', (error) => {
        if (error) {
          console.error(error);
        }
      });

      room.on('members', (members) => {
        const isOfferer = members.length === 1; // Start WebRTC if there's one member
        startWebRTC(isOfferer, roomName, configuration);
      });
    });

    // Cleanup on component unmount
    return () => {
      if (droneClient) droneClient.close();
    };
  }, [roomHash]);

  const startWebRTC = (isOfferer, roomName, configuration) => {
    const peerConnection = new RTCPeerConnection(configuration);
    setPc(peerConnection);  // Set the peer connection correctly

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage(roomName, { candidate: event.candidate });
      }
    };

    if (isOfferer) {
      peerConnection.onnegotiationneeded = () => {
        peerConnection.createOffer().then(localDescCreated).catch(console.error);
      };
    }

    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];
      setUserStreams((prevStreams) => {
        if (!prevStreams[stream.id]) {
          return { ...prevStreams, [stream.id]: stream };
        }
        return prevStreams;
      });
      addRemoteVideo(stream);
    };

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      .then((stream) => {
        setLocalStream(stream);
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
      })
      .catch((err) => {
        console.error('Error accessing media devices: ', err);
        alert('Please enable camera and microphone permissions');
      });

    // Listen for incoming signaling messages
    drone.on('data', (message, client) => {
      if (client.id === drone.clientId) return;

      if (message.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
          if (peerConnection.remoteDescription.type === 'offer') {
            peerConnection.createAnswer().then(localDescCreated).catch(console.error);
          }
        });
      } else if (message.candidate) {
        peerConnection.addIceCandidate(
          new RTCIceCandidate(message.candidate),
          () => {},
          console.error
        );
      }
    });
  };

  const sendMessage = (roomName, message) => {
    drone.publish({
      room: roomName,
      message,
    });
  };

  const localDescCreated = (desc) => {
    if (pc) {
      pc.setLocalDescription(desc, () => sendMessage(roomHash, { sdp: pc.localDescription }), console.error);
    } else {
      console.error('PeerConnection not initialized');
    }
  };

  const addRemoteVideo = (stream) => {
    const videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.playsinline = true;
    videoElement.srcObject = stream;
    document.getElementById('videoContainer').appendChild(videoElement);
  };

  return (
    <div>
      <div className="copy">
        Send your URL to a friend to start a video call
      </div>
      <div className="video-container" id="videoContainer">
        <video id="localVideo" autoPlay muted playsInline />
        {Object.keys(userStreams).map((streamId) => {
          const stream = userStreams[streamId];
          return (
            <video key={stream.id} srcObject={stream} autoPlay playsInline />
          );
        })}
      </div>
    </div>
  );
};

export default VideoCall;
