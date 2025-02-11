export function timeAgoWithMsg(past: number, present: number = Date.now()) {
    let text = timeAgo(past, present);
    if (text !== 'just now')
        text += ' ago';
    return text;
}

export function timeAgo(past: number, present: number = Date.now()) {
    const diff = Math.floor((present - past) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) > 1 ? 's' : ''}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''}`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
    if (diff < 2419200) return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''}`;
    if (diff < 29030400) return `${Math.floor(diff / 2419200)} month${Math.floor(diff / 2419200) > 1 ? 's' : ''}`;
    return `${Math.floor(diff / 29030400)} year${Math.floor(diff / 29030400) > 1 ? 's' : ''}`;
}

export function duration(minutes: number) {
    if (minutes < 60) return `${minutes} mins`;

    let hr = Math.floor(minutes / 60);
    let min = minutes % 60;
    return `${hr}${hr > 1 ? 'hrs' : 'hr'}` + (min > 0 ? ` ${min}${min > 1 ? 'mins' : 'min'}` : '');
}

export function tuitionModeDescribed(object: any) {
    if (object) {
        let tutoringType = '';
        if (object.offlineTutor)
            tutoringType = ', Home Tutor';
        if (object.tuitionCenter)
            tutoringType += ', Tuition Center';
        if (object.onlineTutor)
            tutoringType += ', Online Tutor';
        return tutoringType.slice(2);
    }
    return '';
}

export function feesDescribed(object: any) {
    if (object) {
        return `${object.feeRangeStart} to ${object.feeRangeEnd} per ${object.monthlyFee ? 'month' : 'class'}`
    }
    return '';
}