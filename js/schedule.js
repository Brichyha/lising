// Principal - гашение основного долга
// Interest - наложенный процент долга

function generatePaymentDate(startDate, monthIndex) {
    if (!startDate) {
        return monthIndex;
    }
    
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthIndex);
    
    // Форматируем дату в формате DD.MM.YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
}

function additionHundredth(num1, num2, sign) {
    let returnedData = "";
    switch (sign) {
        case "-":
            returnedData = +(num1 * 100 - num2 * 100).toFixed(0) / 100;
            break;

        case "*":
            returnedData = +(num1 * 100 * (num2 * 100)).toFixed(0) / 100;
            break;

        case "/":
            returnedData = +((num1 * 100) / (num2 * 100)).toFixed(0) / 100;
            break;

        default:
            returnedData = +(num1 * 100 + num2 * 100).toFixed(0) / 100;
            break;
    }
    return returnedData;
}
function getRedemptionValue({
    redemptionPercent: redemptionPercent,
    sum: sum,
}) {
    return (sum / 100) * redemptionPercent;
}

function getPercent({ percent: percent, value: value }) {
    let valueOfPercent;
    let originValue;

    if (percent !== 0) {
        valueOfPercent = +((value * percent) / (100 + percent)).toFixed(2);
        originValue = +(value - valueOfPercent).toFixed(2);
    } else {
        valueOfPercent = 0;
        originValue = value;
    }

    if (+(valueOfPercent + originValue).toFixed(2) !== value) {
        console.log(`getPercent error. Not exactly. ${percent}, ${value}`);
    }
    return {
        withNds: value,
        value: originValue,
        nds: valueOfPercent,
    };
}
function addPercent({ percent: percent, value: value }) {
    let valueOfPercent;
    let originValue;

    if (percent !== 0) {
        valueOfPercent = +((value * percent) / 100).toFixed(2);
        originValue = +(value + valueOfPercent).toFixed(2);
    } else {
        valueOfPercent = 0;
        originValue = value;
    }

    if (+(valueOfPercent + value).toFixed(2) !== originValue) {
        console.log(`getPercent error. Not exactly. ${percent}, ${value}`);
    }
    return {
        withNds: originValue, //originValue
        value: value, //value
        nds: valueOfPercent,
    };
}

function getFirstPayment({
    nds,
    firstPayment,
    balance,
    redemptionValue,
    clientNDSCalc,
}) {
    const monthlyPayment = getPercent({
        percent: clientNDSCalc ? nds : 0,
        value: firstPayment,
    });
    const principalPayment = getPercent({
        percent: clientNDSCalc ? nds : 0,
        value: firstPayment,
    });
    return {
        month: 0,
        monthlyPayment: monthlyPayment,
        interestPayment: { withNds: 0, value: 0, nds: 0 },
        principalPayment: principalPayment,
        balance: +balance.toFixed(0) / 100 + redemptionValue,
    };
}

function getLastPayment({
    nds,
    redemptionValue,
    schedule,
    firstPaymentDate,
    clientNDSCalc = true,
    leasingNDSCalc = true,
}) {
    const monthlyPayment = getPercent({
        percent: clientNDSCalc ? nds : 0,
        value: redemptionValue,
    });
    const principalPayment = getPercent({
        percent: clientNDSCalc ? nds : 0,
        value: redemptionValue,
    });
    return {
        month: schedule.length, // Номер месяца для условий
        paymentDate: generatePaymentDate(firstPaymentDate, schedule.length), // Дата для отображения
        monthlyPayment: monthlyPayment,
        interestPayment: { withNds: 0, value: 0, nds: 0 },
        principalPayment: principalPayment,
        balance: 0,
    };
}
function getFinalResult({ schedule }) {
    const allPayment = {
        month: "итого",
        monthlyPayment: { withNds: 0, value: 0, nds: 0 },
        principalPayment: { withNds: 0, value: 0, nds: 0 },
        interestPayment: { withNds: 0, value: 0, nds: 0 },
    };
    schedule.forEach((month) => {
        allPayment.monthlyPayment.withNds = additionHundredth(
            month.monthlyPayment.withNds,
            allPayment.monthlyPayment.withNds,
            "+"
        );

        allPayment.principalPayment.value = additionHundredth(
            month.principalPayment.value,
            allPayment.principalPayment.value,
            "+"
        );
        allPayment.principalPayment.nds = additionHundredth(
            month.principalPayment.nds,
            allPayment.principalPayment.nds,
            "+"
        );
        allPayment.interestPayment.value = additionHundredth(
            month.interestPayment.value,
            allPayment.interestPayment.value,
            "+"
        );
        allPayment.interestPayment.nds = additionHundredth(
            month.interestPayment.nds,
            allPayment.interestPayment.nds,
            "+"
        );
        allPayment.monthlyPayment.value = additionHundredth(
            month.monthlyPayment.value,
            allPayment.monthlyPayment.value,
            "+"
        );
        allPayment.monthlyPayment.nds = additionHundredth(
            month.monthlyPayment.nds,
            allPayment.monthlyPayment.nds,
            "+"
        );
    });

    return allPayment;
}
function checkFinalAllPaymentAndNds({
    schedule,
    nds,
    sum,
    clientNDSCalc = true,
}) {
    const objectSum = getPercent({
        percent: clientNDSCalc ? nds : 0,
        value: sum,
    });
    console.log("checkFinalAllPaymentAndNds start");

    const difference = additionHundredth(
        schedule[schedule.length - 1].principalPayment.value,
        objectSum.value,
        "-"
    );
    console.log(objectSum);
    console.log(difference);
    console.log("checkFinalAllPaymentAndNds end");
    return schedule.map((item) => {
        if (item.type === "lastMonthly") {
            // if (difference > 0) {
            console.log(item);

            item.principalPayment.value = additionHundredth(
                item.principalPayment.value,
                difference,
                "-"
            );
            item.principalPayment.nds = additionHundredth(
                item.principalPayment.nds,
                difference,
                "+"
            );
            item.monthlyPayment.value = additionHundredth(
                item.monthlyPayment.value,
                difference,
                "-"
            );
            item.monthlyPayment.nds = additionHundredth(
                item.monthlyPayment.nds,
                difference,
                "+"
            );
        }
        return item;
    });
}
class Annuity {
    constructor({
        sum,
        firstPayment,
        percent,
        term,
        firstPaymentDate,
        redemptionPercent,
        nds,
        condition,
        individCheck,
        leasingCheck,
    }) {
        this.sum = sum;
        this.firstPayment = firstPayment;
        this.percent = percent;
        this.term = term;
        this.firstPaymentDate = firstPaymentDate;
        this.redemptionPercent = redemptionPercent;
        this.nds = nds;
        this.condition = condition;
        this.clientNDSCalc = individCheck;
        this.leasingNDSCalc = leasingCheck;

        this.redemptionValue = getRedemptionValue({
            sum: sum,
            redemptionPercent: redemptionPercent,
        }); // Добавочная стоимость

        this.kef = Annuity.getRatePerMonth({ percent: this.percent });
        this.monthlyAnnuity = Annuity.getRateAnnuity({
            kef: this.kef,
            term: this.term,
        });
        console.log(`коэфициент -  ${this.kef}`);
        console.log(`месячный аннуитент -  ${this.monthlyAnnuity}`);

        this.financedAmount =
            this.sum - this.firstPayment - this.redemptionValue;
        this.monthlyPayment =
            +(this.financedAmount * this.monthlyAnnuity).toFixed(2) * 100;
        // console.log(this.financedAmount + this.redemptionValue);

        this.balance = this.financedAmount * 100;
    }
    static getRatePerMonth({ percent }) {
        const kef = percent / 12 / 100;
        return kef;
    }
    static getRateAnnuity({ kef, term }) {
        const rate = (kef * (1 + kef) ** term) / ((1 + kef) ** term - 1);
        return rate;
    }

    static calculateInterestPayment({ balance, kef }) {
        return +((balance / 100) * kef).toFixed(2) * 100;
    }

    generateSchedule() {
        let schedule = [];

        const firstPayment = getFirstPayment({
            nds: this.nds,
            firstPayment: this.firstPayment,
            balance: this.balance,
            redemptionValue: this.redemptionValue,
            clientNDSCalc: this.clientNDSCalc,
        });
        firstPayment.month = 0; // Номер месяца для условий
        firstPayment.paymentDate = generatePaymentDate(this.firstPaymentDate, 0); // Дата для отображения
        schedule.push(firstPayment); // первый платеж

        for (let i = 1; i <= this.term; i++) {
            let interestPayment = Annuity.calculateInterestPayment({
                balance: this.balance + this.redemptionValue,
                kef: this.kef,
            }); // Процентная часть
            let principalPayment = this.monthlyPayment - interestPayment; // Погашение основного долга
            if (!this.condition.find((item) => +item.term === i)) {
                this.balance -= principalPayment; // Остаток долга
            }

            this.condition.forEach((item) => {
                if (+item.term === i) {
                    applyConditions.bind(this)({
                        item: item.conditionData,
                        iteration: i,
                    });
                }
            }); // обработка условий
            function applyConditions({ item, iteration }) {
                const actionPayment = item.find(
                    (item) => item.action === constantsConditionActions.payment
                )?.data;
                const actionPercent = item.find(
                    (item) => item.action === constantsConditionActions.percent
                )?.data;
                const actionTerm = item.find(
                    (item) => item.action === constantsConditionActions.term
                )?.data;
                // изменение платежа и процента и срока
                if (!!actionPayment && !!actionPercent && !!actionTerm) {
                    this.term = +actionTerm.end;
                    this.kef = Annuity.getRatePerMonth({
                        percent: +actionPercent.percent,
                    });
                    this.monthlyAnnuity = Annuity.getRateAnnuity({
                        kef: this.kef,
                        term: this.term - i + 1,
                    });
                    interestPayment =
                        +((this.balance / 100) * this.kef).toFixed(2) * 100; // Процентная часть
                    principalPayment =
                        +actionPayment.sum * 100 - interestPayment; // другой платеж

                    // перерасчет месячного платежа
                    this.balance -= principalPayment; // Остаток долга
                    this.monthlyPayment =
                        +((this.balance / 100) * this.monthlyAnnuity).toFixed(
                            2
                        ) * 100;

                    return;
                }
                // изменение платежа и срока
                if (!!actionPayment && !!actionTerm && !actionPercent) {
                    this.term = +actionTerm.end;

                    principalPayment =
                        actionPayment.sum * 100 - interestPayment;
                    // перерасчет месячного платежа
                    this.balance -= principalPayment; // Остаток долга
                    this.monthlyAnnuity = Annuity.getRateAnnuity({
                        kef: this.kef,
                        term: this.term - iteration,
                    });
                    this.monthlyPayment =
                        +((this.balance / 100) * this.monthlyAnnuity).toFixed(
                            2
                        ) * 100;
                    return;
                }
                // изменение процента и срока
                if (!!actionPercent && !!actionTerm && !actionPayment) {
                    this.term = +actionTerm.end;
                    this.kef = Annuity.getRatePerMonth({
                        percent: actionPercent.percent,
                    });
                    this.monthlyAnnuity = Annuity.getRateAnnuity({
                        kef: this.kef,
                        term: this.term - iteration + 1,
                    });
                    this.monthlyPayment =
                        +((this.balance / 100) * this.monthlyAnnuity).toFixed(
                            2
                        ) * 100;
                    interestPayment =
                        +((this.balance / 100) * this.kef).toFixed(2) * 100; // Процентная част
                    principalPayment = this.monthlyPayment - interestPayment; // Погашение основного долга
                    this.balance -= principalPayment; // Остаток долга
                    return;
                }
                // изменение платежа и процента
                if (!!actionPayment && !!actionPercent && !actionTerm) {
                    this.kef = Annuity.getRatePerMonth({
                        percent: +actionPercent.percent,
                    });
                    this.monthlyAnnuity = Annuity.getRateAnnuity({
                        kef: this.kef,
                        term: this.term - iteration,
                    });
                    interestPayment =
                        +((this.balance / 100) * this.kef).toFixed(2) * 100; // Процентная часть
                    principalPayment =
                        +actionPayment.sum * 100 - interestPayment; // другой платеж

                    // перерасчет месячного платежа
                    console.log(this.balance);

                    this.balance -= principalPayment; // Остаток долга
                    console.log(this.balance);
                    this.monthlyPayment =
                        +((this.balance / 100) * this.monthlyAnnuity).toFixed(
                            2
                        ) * 100;

                    return;
                }
                // изменение платежа(один)
                if (!!actionPayment && !actionPercent && !actionTerm) {
                    principalPayment =
                        actionPayment.sum * 100 - interestPayment;
                    // перерасчет месячного платежа
                    this.balance -= principalPayment; // Остаток долга
                    this.monthlyAnnuity = Annuity.getRateAnnuity({
                        kef: this.kef,
                        term: this.term - iteration,
                    });
                    this.monthlyPayment =
                        +((this.balance / 100) * this.monthlyAnnuity).toFixed(
                            2
                        ) * 100;
                    return;
                }
                // изменение процента
                if (!!actionPercent && !actionPayment && !actionTerm) {
                    this.kef = Annuity.getRatePerMonth({
                        percent: actionPercent.percent,
                    });
                    this.monthlyAnnuity = Annuity.getRateAnnuity({
                        kef: this.kef,
                        term: this.term - iteration + 1,
                    });
                    this.monthlyPayment =
                        +((this.balance / 100) * this.monthlyAnnuity).toFixed(
                            2
                        ) * 100;
                    interestPayment =
                        +((this.balance / 100) * this.kef).toFixed(2) * 100; // Процентная част
                    principalPayment = this.monthlyPayment - interestPayment; // Погашение основного долга
                    this.balance -= principalPayment; // Остаток долга
                    return;
                }
                // изменение сроков
                if (!!actionTerm && !actionPayment && !actionPercent) {
                    this.term = +actionTerm.end;
                    this.monthlyAnnuity = Annuity.getRateAnnuity({
                        kef: this.kef,
                        term: this.term - iteration + 1,
                    });
                    this.monthlyPayment =
                        +((this.balance / 100) * this.monthlyAnnuity).toFixed(
                            2
                        ) * 100;
                    interestPayment =
                        +((this.balance / 100) * this.kef).toFixed(2) * 100; // Процентная част
                    principalPayment = this.monthlyPayment - interestPayment; // Погашение основного долга
                    this.balance -= principalPayment; // Остаток долга
                    return;
                }
            }

            if (i !== this.term) {
                const interestPaymentWithNds = getPercent({
                    percent: this.leasingNDSCalc ? this.nds : 0,
                    value: +interestPayment.toFixed(0) / 100,
                });
                const principalPaymentWithNds = getPercent({
                    percent: this.clientNDSCalc ? this.nds : 0,
                    value: +principalPayment.toFixed(0) / 100,
                });
                const monthlyPaymentWithNds = {
                    withNds: additionHundredth(
                        interestPaymentWithNds.withNds,
                        principalPaymentWithNds.withNds,
                        "+"
                    ),
                    value: additionHundredth(
                        interestPaymentWithNds.value,
                        principalPaymentWithNds.value,
                        "+"
                    ),
                    nds: additionHundredth(
                        interestPaymentWithNds.nds,
                        principalPaymentWithNds.nds,
                        "+"
                    ),
                };
                schedule.push({
                    month: i, // Номер месяца для условий
                    paymentDate: generatePaymentDate(this.firstPaymentDate, i), // Дата для отображения
                    monthlyPayment: monthlyPaymentWithNds,
                    interestPayment: interestPaymentWithNds,
                    principalPayment: principalPaymentWithNds,
                    balance:
                        +this.balance.toFixed(0) / 100 + this.redemptionValue,
                });
            } else {
                // при последнее итерации выравниваем копейки. для ровного выкупного платежа.

                if (this.balance < 0) {
                    principalPayment -= Math.abs(this.balance);
                    interestPayment += Math.abs(this.balance);
                    this.balance += Math.abs(this.balance);
                } else {
                    principalPayment += Math.abs(this.balance);
                    interestPayment -= Math.abs(this.balance);
                    this.balance -= Math.abs(this.balance);
                }
                // высчитываем НДС
                const interestPaymentWithNds = getPercent({
                    percent: this.leasingNDSCalc ? this.nds : 0,
                    value: interestPayment / 100,
                });
                const principalPaymentWithNds = getPercent({
                    percent: this.clientNDSCalc ? this.nds : 0,
                    value: principalPayment / 100,
                });

                const monthlyPaymentWithNds = {
                    withNds: additionHundredth(
                        interestPaymentWithNds.withNds,
                        principalPaymentWithNds.withNds,
                        "+"
                    ),
                    value: additionHundredth(
                        interestPaymentWithNds.value,
                        principalPaymentWithNds.value,
                        "+"
                    ),
                    nds: additionHundredth(
                        interestPaymentWithNds.nds,
                        principalPaymentWithNds.nds,
                        "+"
                    ),
                };

                schedule.push({
                    type: "lastMonthly",
                    month: i, // Номер месяца для условий
                    paymentDate: generatePaymentDate(this.firstPaymentDate, i), // Дата для отображения
                    monthlyPayment: monthlyPaymentWithNds,
                    interestPayment: interestPaymentWithNds,
                    principalPayment: principalPaymentWithNds,
                    balance: this.balance / 100 + this.redemptionValue,
                });
            }
        }
        schedule.push(
            getLastPayment({
                nds: this.nds,
                redemptionValue: this.redemptionValue,
                schedule: schedule,
                firstPaymentDate: this.firstPaymentDate,
                clientNDSCalc: this.clientNDSCalc,
                leasingNDSCalc: this.leasingNDSCalc,
            })
        ); // последний платеж
        schedule.push(getFinalResult({ schedule: schedule })); // итого платежей

        schedule = checkFinalAllPaymentAndNds({
            schedule: schedule,
            nds: this.nds,
            sum: this.sum,
            clientNDSCalc: this.clientNDSCalc,
        });
        schedule.pop();
        schedule.push(getFinalResult({ schedule: schedule }));
        return schedule;
    }
}
class Differentiated {
    constructor({
        sum,
        firstPayment,
        percent,
        term,
        firstPaymentDate,
        redemptionPercent,
        nds,
        condition,
        individCheck,
        leasingCheck,
    }) {
        this.sum = sum;
        this.firstPayment = firstPayment;
        this.percent = percent;
        this.term = term;
        this.firstPaymentDate = firstPaymentDate;
        this.redemptionPercent = redemptionPercent;
        this.nds = nds;
        this.condition = condition;
        this.clientNDSCalc = individCheck;
        this.leasingNDSCalc = leasingCheck;

        this.redemptionValue = getRedemptionValue({
            sum: sum,
            redemptionPercent: redemptionPercent,
        }); // Добавочная стоимость
        this.financedAmount =
            this.sum - this.firstPayment - this.redemptionValue;

        this.balance = this.financedAmount * 100;
        this.principalPayment =
            Differentiated.calculatePrincipalPayment({
                sum: this.financedAmount,
                term: this.term,
            }) * 100;
    }

    static calculatePrincipalPayment({ sum, term }) {
        return +(sum / term).toFixed(2);
    }

    // Расчет процентов за месяц
    static calculateInterestPayment({ balance, percent }) {
        return +((((balance * percent) / 365) * 30) / 100).toFixed(0);
    }
    generateSchedule() {
        let schedule = [];
        const firstPayment = getFirstPayment({
            nds: this.nds,
            firstPayment: this.firstPayment,
            balance: this.balance,
            redemptionValue: this.redemptionValue,
            clientNDSCalc: this.clientNDSCalc,
        });
        firstPayment.month = 0; // Номер месяца для условий
        firstPayment.paymentDate = generatePaymentDate(this.firstPaymentDate, 0); // Дата для отображения
        schedule.push(firstPayment); // первый платеж
        for (let month = 1; month <= this.term; month++) {
            this.condition.forEach((item) => {
                if (+item.term === month) {
                    applyConditions.bind(this)({
                        item: item.conditionData,
                        iteration: month,
                    });
                }
            }); // обработка условий
            function applyConditions({ item, iteration }) {
                const actionPayment = item.find(
                    (item) => item.action === constantsConditionActions.payment
                )?.data;
                const actionPercent = item.find(
                    (item) => item.action === constantsConditionActions.percent
                )?.data;
                const actionTerm = item.find(
                    (item) => item.action === constantsConditionActions.term
                )?.data;
                // изменение процента
                if (!!actionPercent) {
                    this.percent = actionPercent.percent;
                }
                // изменение платежа(один)
                if (!!actionPayment) {
                    const interestPayment =
                        Differentiated.calculateInterestPayment({
                            balance: this.balance,
                            percent: this.percent,
                        }).toFixed(0);
                    this.principalPayment =
                        actionPayment.sum * 100 - interestPayment;
                }

                // изменение сроков
                if (!!actionTerm) {
                    this.term = +actionTerm.end;
                }
            }

            if (month !== this.term) {
                const interestPayment = Differentiated.calculateInterestPayment(
                    {
                        balance: this.balance + this.redemptionValue * 100,
                        percent: this.percent,
                    }
                );
                const interestPaymentWithNds = addPercent({
                    percent: this.leasingNDSCalc ? this.nds : 0,
                    value: +interestPayment.toFixed(0) / 100,
                });
                const principalPaymentWithNds = getPercent({
                    percent: this.clientNDSCalc ? this.nds : 0,
                    value: +this.principalPayment.toFixed(0) / 100,
                });
                const monthlyPaymentWithNds = {
                    withNds: additionHundredth(
                        interestPaymentWithNds.withNds,
                        principalPaymentWithNds.withNds,
                        "+"
                    ),
                    value: additionHundredth(
                        interestPaymentWithNds.value,
                        principalPaymentWithNds.value,
                        "+"
                    ),
                    nds: additionHundredth(
                        interestPaymentWithNds.nds,
                        principalPaymentWithNds.nds,
                        "+"
                    ),
                };

                this.balance = this.balance - this.principalPayment;

                schedule.push({
                    month: month, // Номер месяца для условий
                    paymentDate: generatePaymentDate(this.firstPaymentDate, month), // Дата для отображения
                    monthlyPayment: monthlyPaymentWithNds,
                    interestPayment: interestPaymentWithNds,
                    principalPayment: principalPaymentWithNds,
                    balance:
                        +this.balance.toFixed(0) / 100 + this.redemptionValue,
                });
                // перерасчет гашение долга на след месяц
                this.principalPayment =
                    +Differentiated.calculatePrincipalPayment({
                        sum: this.balance,
                        term: this.term - month,
                    }).toFixed(0);
            } else {
                // при последнее итерации выравниваем копейки. для ровного выкупного платежа.
                let interestPayment = Differentiated.calculateInterestPayment({
                    balance: this.balance,
                    percent: this.percent,
                });
                this.balance = this.balance - this.principalPayment;
                if (this.balance < 0) {
                    this.principalPayment -= Math.abs(this.balance);
                    interestPayment += Math.abs(this.balance);
                    this.balance += Math.abs(this.balance);
                } else {
                    this.principalPayment += Math.abs(this.balance);
                    interestPayment -= Math.abs(this.balance);
                    this.balance -= Math.abs(this.balance);
                }
                // высчитываем НДС
                const interestPaymentWithNds = addPercent({
                    percent: this.leasingNDSCalc ? this.nds : 0,
                    value: interestPayment / 100,
                });
                const principalPaymentWithNds = getPercent({
                    percent: this.clientNDSCalc ? this.nds : 0,
                    value: this.principalPayment / 100,
                });

                const monthlyPaymentWithNds = {
                    withNds: additionHundredth(
                        interestPaymentWithNds.withNds,
                        principalPaymentWithNds.withNds,
                        "+"
                    ),
                    value: additionHundredth(
                        interestPaymentWithNds.value,
                        principalPaymentWithNds.value,
                        "+"
                    ),
                    nds: additionHundredth(
                        interestPaymentWithNds.nds,
                        principalPaymentWithNds.nds,
                        "+"
                    ),
                };

                schedule.push({
                    type: "lastMonthly",
                    month: month, // Номер месяца для условий
                    paymentDate: generatePaymentDate(this.firstPaymentDate, month), // Дата для отображения
                    monthlyPayment: monthlyPaymentWithNds,
                    interestPayment: interestPaymentWithNds,
                    principalPayment: principalPaymentWithNds,
                    balance: this.balance / 100 + this.redemptionValue,
                });
            }
        }

        schedule.push(
            getLastPayment({
                nds: this.nds,
                redemptionValue: this.redemptionValue,
                schedule: schedule,
                firstPaymentDate: this.firstPaymentDate,
                clientNDSCalc: this.clientNDSCalc,
            })
        ); // последний платеж
        schedule.push(getFinalResult({ schedule: schedule })); // итого платежей

        schedule = checkFinalAllPaymentAndNds({
            schedule: schedule,
            nds: this.nds,
            sum: this.sum,
            clientNDSCalc: this.clientNDSCalc,
        });
        schedule.pop();
        schedule.push(getFinalResult({ schedule: schedule }));

        return schedule;
    }
}
