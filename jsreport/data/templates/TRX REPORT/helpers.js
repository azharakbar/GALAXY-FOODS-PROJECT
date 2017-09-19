var creditAmount = 0;
var debitAmount = 0;

function incCredit(val) {
    creditAmount += val;
}

function incDebit(val) {
    debitAmount += val;
}

function getCredit() {
    return creditAmount;
}

function getDebit() {
    return debitAmount;
}