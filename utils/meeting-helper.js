const meetingServices = require("../services/meeting.service");
const {meetingPayloadEnum, MeetngPayloadEnum} = require("../utils/meeting-payload.enum");

async function joinMeeting(meetingId, socket, meetingServer, payload) {
    const { userId, name } = payload.data;

    meetingServices.isMeetingPresent(meetingId, async (error, results) => {
        if(error && !results) {
            sendMessage(socket, {
                type: meetingPayloadEnum.NOT_FOUND
            });
        }

        if(results){
            addUser(socket, {meetingId, userId, name})
            .then((result) => {
                if(result){
                    sendMessage(socket, {
                        type: meetingPayloadEnum.JOINED_MEETING, 
                        data: { userId }
                    });

                    //Not
                    broadcastUsers(meetingId, socket, meetingServer, {
                        type: meetingPayloadEnum.USER_JOINED,
                        data: {
                            userId,
                            name,
                            ...payload.data
                        }
                    });
                }
            }, (error) => {
                console.log(error);
            });
        }
    });
}

function forwardConnectionRequest(meetingId, socket, meetingServer, payload){
    const {userId, otherUserId, name} = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: meetingPayloadEnum.CONNECTION_REQUEST,
                data: {
                    userId,
                    name,
                    ...payload.data
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    });
}

function forwardIceCandidate(meetingId, socket, meetingServer, payload){
    const {userId, otherUserId, candidate} = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: meetingPayloadEnum.ICECANDIDATE,
                data: {
                    userId,
                    candidate
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    });
}

function forwardOfferSDP(meetingId, socket, meetingServer, payload){
    const {userId, otherUserId, sdp} = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: meetingPayloadEnum.OFFER_SDP,
                data: {
                    userId,
                    sdp
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    });
}

function forwardAnswerSDP(meetingId, socket, meetingServer, payload){
    const {userId, otherUserId, sdp} = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: meetingPayloadEnum.ANSWER_SDP,
                data: {
                    userId,
                    sdp
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    });
}

function userLeft(meetingId, socket, meetingServer, payload){
    const {userId} = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetngPayloadEnum.USER_LEFT,
        data: {
            userId: userId
        }
    });
}

function endMeeting(meetingId, socket, meetingServer, payload){
    const {userId} = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetngPayloadEnum.MEETING_ENDED,
        data: {
            userId: userId
        }
    });

    meetingServices.getAllMeetingUsers(meetingId, (error, results) => {
        for(let i=0; i < results.length; i++){
            const meetingUser = results[i];
            meetingServer.sockets.connected(meetingUser.socketId).disconnect();
        }
    });
}

function forwardEvent(meetingId, socket, meetingServer, payload){
    const {userId} = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: payload.type,
        data: {
            userId: userId,
            ...payload.data
        }
    });

    meetingServices.getAllMeetingUsers(meetingId, (error, results) => {
        for(let i=0; i < results.length; i++){
            const meetingUser = results[i];
            meetingServer.sockets.connected(meetingUser.socketId).disconnect();
        }
    });
}

function addUser( socket, {meetingId, userId, name}){
    let promise = new Promise(function (resolve, reject) {
        meetingServices.getMeetingUser({meetingId, userId}, (error, results) => {
            if(!results) {
                var model = {
                    socketId: socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name: name,
                    isAlive: true
                };

                meetingServices.joinMeeting(model, (error, results) => {
                    if(results) {
                        resolve(true);
                    }

                    if(error) {
                        reject(error);
                    }
                });
            }
            else {
                meetingServices.updateMeetingUser({
                    userId: userId,
                    socketId: socket.id,
                }, (error, results) => {
                    if(results) {
                        resolve(true);
                    }

                    if(error) {
                        reject(error);
                    }
                });
            }
        });
    });
    return promise;
}

function sendMessage(socket, payload){
    socket.send(JSON.stringify(payload));
}

function broadcastUsers(meetingId, socket, meetingServer, payload) {
    socket.broadcast.emit("message", JSON.stringify(payload));
}

module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardAnswerSDP,
    userLeft,
    endMeeting,
    forwardEvent,
}