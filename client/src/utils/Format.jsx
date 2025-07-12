export function FormatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        //minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(num);
}

export function HumanizeTimestamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export function CapitalizeFront(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function Cleanup(text) {
    let split_str = text.split('_');
    let actual_str = split_str.map(str => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }).join(' ');

    return actual_str;
}