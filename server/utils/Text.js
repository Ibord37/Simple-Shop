function FormatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        //minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(num);
}

function HumanizeTimestamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

function CapitalizeFront(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = {
    FormatNumber, HumanizeTimestamp, CapitalizeFront
}