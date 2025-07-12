function FormatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        //minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(num);
}

module.exports = {
    FormatNumber
}