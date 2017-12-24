var localStream, localPeerConnection, remotePeerConnection;

var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

var startButton = document.getElementById("start");
var callButton = document.getElementById("call");
var hangupButton = document.getElementById("hangup");
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;
navigator.getUserMedia = navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia;

function logger(text) {
	console.log(text);
}

function getStream(stream){
	localVideo.src = URL.createObjectURL(stream);
	localStream = stream;
	var audioContext = new AudioContext();
	var mediaStreamSource = audioContext.createMediaStreamSource(stream);
	mediaStreamSource.connect(audioContext.destination);
	callButton.disabled = false;
}

function start() {
	logger("Requesting local stream");
	startButton.disabled = true;
	navigator.getUserMedia({audio:true, video:true}, getStream,
			function(error) {
		logger("Error in getUserMedia function: ", error);
	});
}

function call() {
	callButton.disabled = true;
	hangupButton.disabled = false;

	var servers = null;

	localPeerConnection = new RTCPeerConnection(servers);
	logger("Created local peer connection object..");
	localPeerConnection.onicecandidate = getIceCandidates;

	remotePeerConnection = new RTCPeerConnection(servers);
	logger("Created remote peer connection object..");
	remotePeerConnection.onicecandidate = getIceCandidateRemote;
	remotePeerConnection.onaddstream = getRemoteStream;

	localPeerConnection.addStream(localStream);
	logger("Added localStream to localPeerConnection");
	localPeerConnection.createOffer(getDescription,errorHandler);
}

function getDescription(description){
	localPeerConnection.setLocalDescription(description);
	logger("Offer from localPeerConnection: \n" + description.sdp);
	remotePeerConnection.setRemoteDescription(description);
	remotePeerConnection.createAnswer(getRemoteDescription,errorHandler);
}

function getRemoteDescription(description){
	remotePeerConnection.setLocalDescription(description);
	logger("Answer from remotePeerConnection: \n" + description.sdp);
	localPeerConnection.setRemoteDescription(description);
}

function hangup() {
	logger("Call will be ended now...");
	localPeerConnection.close();
	remotePeerConnection.close();
	localPeerConnection = null;
	remotePeerConnection = null;
	hangupButton.disabled = true;
	callButton.disabled = false;
}

function getRemoteStream(event){
	remoteVideo.src = URL.createObjectURL(event.stream);
	logger("Received remote stream");
}

function getIceCandidates(event){
	if (event.candidate) {
		remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
		logger("Local ICE candidate: \n" + event.candidate.candidate);
	}
}

function getIceCandidateRemote(event){
	if (event.candidate) {
		localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
		logger("Remote ICE candidate: \n " + event.candidate.candidate);
	}
}

function errorHandler(){}
