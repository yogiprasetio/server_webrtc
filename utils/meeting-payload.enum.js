const MeetingPayloadEnum = {
    JOIN_MEETING: 'join-meeting',
    JOINED_MEETING: 'joined-meeting',
    USER_JOINED: 'user-joined',
    CONNECTION_REQUEST: 'connection-request',
    INCOMING_CONNECTION_REQUEST: 'incoming-connection-request',
    OFFER_SDP: 'offer-sdp',
    ANSWER_SDP: 'answer-sdp',
    ICECANDIDATE: 'icecandidate',
    LEAVE_MEETING: 'leave-meeting',
    END_meeting: 'end-meeting',
    USER_LEFT: 'user-left',
    MEETING_ENDED: 'meeting-ended',
    VIDEO_TOGGLE: 'video-toggle',
    AUDIO_TOGGLE: 'audio-toggle',
    NOT_FOUND: 'not-found',
    UNKNOWN: 'unknown'
}

module.exports = {
    MeetingPayloadEnum
}