import DOMPurify from 'dompurify';

// inner functions

function ParseMD(text) { // Markdown formatting like bold as **text**, etc.
    let parsed = text;
    
    parsed = parsed.replace(/\*\*\*(.+?)\*\*\*/gs, (_, content) => {
        return `<strong><em>${content.trim()}</em></strong>`;
    });
    parsed = parsed.replace(/\_\_\*\*(.+?)\*\*\_\_/gs, (_, content) => {
        return `<strong><u>${content.trim()}</u></strong>`;
    });
    parsed = parsed.replace(/__\*\*\*(.+?)\*\*\*__/gs, (_, content) => {
        return `<strong><em><u>${content.trim()}</u></em></strong>`;
    });
    parsed = parsed.replace(/\*\*(.+?)\*\*/gs, (_, content) => {
        return `<strong>${content.trim()}</strong>`;
    });
    parsed = parsed.replace(/\*(.+?)\*/gs, (_, content) => {
        return `<em>${content.trim()}</em>`;
    });
    parsed = parsed.replace(/__(.+?)__/gs, (_, content) => {
        return `<u>${content.trim()}</u>`;
    });
    parsed = parsed.replace(/\n/g, '<br />');

    return DOMPurify.sanitize(parsed);
}

// exported
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

export function RenderMail({ content }) {
    const html = ParseMD(content);

    return (
        <div
            className="mail-text p-3 text-start"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export function Cleanup(text) {
    let split_str = text.split('_');
    let actual_str = split_str.map(str => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }).join(' ');

    return actual_str;
}