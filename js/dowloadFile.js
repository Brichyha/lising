async function downloadFile(tableData, additionalData = {}) {
  try {
    const { firstPaymentDate, term, sum, firstPayment, redemptionPercent, individCheck, leasingCheck } = additionalData;
    
    // Определяем, нужно ли учитывать НДС
    const vatEnabled = (individCheck || leasingCheck);
    
    // Функция для расчета даты окончания лизинга
    function calculateLeasingPeriod(startDate, termMonths) {
      if (!startDate || !termMonths) {
        return `${termMonths || 60} мес.`;
      }
      
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + termMonths);
      
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      };
      
      return `${termMonths} мес. (с ${formatDate(start)} по ${formatDate(end)})`;
    }
    
    // Создаем новую книгу и лист
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("TDSheet");

    // 1. Заголовки документа
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell('A1').font = { bold: true };
    worksheet.getCell('I1').value = 'Приложение № 1';

    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell('I2').value = 'к договору финансового лизинга';

    worksheet.addRow([]);
    worksheet.mergeCells('A4:I4');
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').font = { bold: true };
    worksheet.getCell('A4').value = 'График лизинговых платежей';
    worksheet.addRow([]);
    
    // 2. Информация о договоре
    worksheet.mergeCells('A6:C6');
    worksheet.getCell('A6').value = 'Валюта договора';

    worksheet.mergeCells('D6:I6');
    worksheet.getCell('D6').value = 'Доллар США';

    worksheet.mergeCells('A7:C7');
    worksheet.getCell('A7').value = 'Возмещение стоимости в размере';

    worksheet.mergeCells('D7:I7');
    // Возмещение стоимости всегда 99%
    worksheet.getCell('D7').value = '99 %';

    worksheet.mergeCells('A8:C8');
    worksheet.getCell('A8').value = 'Авансовый платеж';

    worksheet.mergeCells('D8:I8');
    // Авансовый платеж = первоначальный платеж / сумма * 100
    const advancePercent = (sum && firstPayment) ? ((firstPayment / sum) * 100).toFixed(1) : '1';
    worksheet.getCell('D8').value = `${advancePercent}%`;

    worksheet.mergeCells('A9:C9');
    worksheet.getCell('A9').value = 'Процент выкупной стоимости';

    worksheet.mergeCells('D9:I9');
    worksheet.getCell('D9').value = `${redemptionPercent || 1}%`;

    worksheet.mergeCells('A10:C10');
    worksheet.getCell('A10').value = 'Срок лизинга';

    worksheet.mergeCells('D10:I10');
    worksheet.getCell('D10').value = calculateLeasingPeriod(firstPaymentDate, term);

    //Добавляем границы к ячейкам A6 по I10
    for (let rowNum = 6; rowNum <= 10; rowNum++) {
      const row = worksheet.getRow(rowNum);
      for (let col = 1; col <= 9; col++) {
          const cell = row.getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
    }

    worksheet.addRow([]);

    // 3. Стоимость предмета лизинга
    worksheet.mergeCells('A12:I12');
    worksheet.getCell('A12').value = '1. Стоимость предмета лизинга';

    const costHeaders = [
      "Марка",
      "Цена единицы,",
      "Количест- во, шт.",
      "Контрактная стоимость, USD",
      "Ставка НДС, %",
      "Сумма НДС, USD",
      "Контрактная стоимость с НДС, USD"
    ];
    const costHeaderRow = worksheet.addRow(costHeaders);
    costHeaderRow.font = { bold: true };
    worksheet.addRow(["1", "2", "3", "4", "5", "6", "7"]);
    // Рассчитываем данные динамически в зависимости от учёта НДС
    let contractCostWithoutNds;
    let ndsAmount;
    let contractCostWithNds;
    let ndsRate;

    if (vatEnabled) {
      contractCostWithNds = sum || 1075000.0;
      contractCostWithoutNds = sum ? (sum / 1.2) : 895833.33; // Исходя из НДС 20%
      ndsAmount = sum ? (sum - contractCostWithoutNds) : 179166.67;
      ndsRate = "20%";
    } else {
      contractCostWithNds = sum || 1075000.0;
      contractCostWithoutNds = contractCostWithNds; // без НДС стоимость равна полной стоимости
      ndsAmount = 0;
      ndsRate = "БЕЗ НДС";
    }
    
    worksheet.addRow([
      "", // Марка
      contractCostWithoutNds, // Цена единицы
      1, // Количество
      contractCostWithoutNds, // Контрактная стоимость
      ndsRate, // Ставка НДС
      ndsAmount, // Сумма НДС
      contractCostWithNds // Стоимость с НДС
    ]);
    worksheet.addRow([
      "Итого",
      "",
      1, // Количество
      contractCostWithoutNds, // Контрактная стоимость
      "",
      ndsAmount, // Сумма НДС
      contractCostWithNds // Стоимость с НДС
    ]);
    worksheet.addRow([]);


    // Объединяем ячейки G:I для строк 14-17
    for (let rowNum = 13; rowNum <= 16; rowNum++) {
      worksheet.mergeCells(`G${rowNum}:I${rowNum}`);
      
      // Выравниваем текст по центру (опционально)
      const cell = worksheet.getCell(`G${rowNum}`);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }


    //Добавляем границы к ячейкам A15 по I17
    for (let rowNum = 13; rowNum <= 16; rowNum++) {
      const row = worksheet.getRow(rowNum);
      for (let col = 1; col <= 9; col++) {
          const cell = row.getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
    }

    worksheet.addRow([]);

    // 4. График лизинговых платежей
    worksheet.mergeCells('C19:F19');
    worksheet.getCell('C19').font = { bold: true };
    worksheet.getCell('C19').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('C19').value = 'Лизинговые платежи, в том числе:';

    const paymentHeaders = [
      "Дата платежа",
      "Лизинговые платежи с НДС (гр.3+гр.4+гр.5+гр.6)",
      "Возмещение инвестиционных расходов по приобретению Предметов лизинга без НДС",
      "НДС на инвестиционные расходы по приобретению Предметов лизинга по ставке 20%",
      "Вознаграждение Лизингодателя и иные инвестиционные расходы, без НДС",
      "Сумма НДС на Вознаграждение Лизингодателя по ставке 20%",
      "Величина платежа без НДС (гр.3+гр.5)",
      "Всего НДС (гр.4+гр.6)",
      "Остаток стоимости предмета лизинга"
    ];
    const paymentHeaderRow1 = worksheet.addRow(paymentHeaders);
    paymentHeaderRow1.font = { bold: true };
    
    worksheet.addRow(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);

    // Добавляем автоперенос строки
    worksheet.getRow(20).alignment = { wrapText: true }; 

    // Добавление строк платежей
    // Отладочная информация
    console.log("tableData для Excel:", tableData);
    
    // 1) Строки для отображения (включаем ВСЕ платежи, в том числе выкупной)
    const paymentRowsDisplay = tableData.filter(item => 
      item.month !== "итого" && 
      typeof item.month !== 'undefined' &&
      item.monthlyPayment &&
      typeof item.month === 'number'
    );

    // 2) Строки, участвующие в расчёте итогов
    //    Если предусмотрена выкупная стоимость (>0), то строка с balance === 0 является выкупом и её исключаем.
    //    Если выкуп 0%, то последняя строка с balance === 0 — это обычный платёж, его учитывать нужно.
    const excludeBuyout = redemptionPercent && redemptionPercent > 0;
    const paymentRowsTotals = paymentRowsDisplay.filter(item => excludeBuyout ? item.balance !== 0 : true);
    
    console.log("Отфильтрованные данные:", paymentRowsDisplay);
    
    const rows = paymentRowsDisplay.map((item) => {
      // Формируем дату: для авансового платежа - текст, для остальных - реальные даты
      let paymentDateText;
      if (firstPaymentDate) {
        const date = new Date(firstPaymentDate);
        // Для авансового платежа (month === 0) используем выбранную дату без смещения
        if (item.month !== 0) {
          // Для остальных платежей прибавляем количество месяцев, равное номеру месяца
          date.setMonth(date.getMonth() + item.month);
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        paymentDateText = `${day}.${month}.${year}`;
        // Добавляем пометку авансового платежа, если это первый платеж и сумма аванса > 0
        if (item.month === 0 && firstPayment > 0) {
          paymentDateText += " (Авансовый платеж)";
        }
        // Помечаем строку выкупного платежа - выводим только текст без даты
        if (item.balance === 0 && item.month !== 0) {
          paymentDateText = "Выкупной платеж";
        }
      } else {
        // Если дата не указана
        paymentDateText = item.month === 0 ? "Авансовый платеж" : item.month;
      }
      
      return [
        paymentDateText, // Дата платежа
        item.monthlyPayment?.withNds || 0, // Лизинговый платеж с НДС
        item.principalPayment?.value || 0, // Возмещение расходов без НДС
        item.principalPayment?.nds || 0, // НДС на инвестиционные расходы
        item.interestPayment?.value || 0, // Вознаграждение без НДС
        item.interestPayment?.nds || 0, // НДС на вознаграждение
        item.monthlyPayment?.value || 0, // Платеж без НДС
        item.monthlyPayment?.nds || 0, // Всего НДС
        item.balance || 0 // Остаток стоимости
      ];
    });
    rows.forEach((row) => {
      const addedRow = worksheet.addRow(row);
      addedRow.eachCell((cell, colNumber) => {
        if (colNumber > 1) cell.numFmt = '#,##0.00'; // Числовой формат для сумм
      });
    });

    // Выкупная стоимость и итоги
    // Найдем последний платеж (выкупную стоимость) из данных
    const lastPayment = tableData.find(item => item.balance === 0 && (item.paymentDate || item.month));
    let buyoutDate = "";
    if (lastPayment && firstPaymentDate) {
      // Рассчитываем дату выкупа на основе номера месяца и даты первого платежа
      const date = new Date(firstPaymentDate);
      date.setMonth(date.getMonth() + lastPayment.month);
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      buyoutDate = `${day}.${month}.${year}`;
    } else if (lastPayment) {
      buyoutDate = lastPayment.paymentDate || lastPayment.month;
    }
    
    // Рассчитываем итоги динамически
    const totals = paymentRowsTotals.reduce((acc, item) => {
      acc.monthlyPaymentWithNds += item.monthlyPayment?.withNds || 0;
      acc.principalPaymentValue += item.principalPayment?.value || 0;
      acc.principalPaymentNds += item.principalPayment?.nds || 0;
      acc.interestPaymentValue += item.interestPayment?.value || 0;
      acc.interestPaymentNds += item.interestPayment?.nds || 0;
      acc.monthlyPaymentValue += item.monthlyPayment?.value || 0;
      acc.monthlyPaymentNds += item.monthlyPayment?.nds || 0;
      return acc;
    }, {
      monthlyPaymentWithNds: 0,
      principalPaymentValue: 0,
      principalPaymentNds: 0,
      interestPaymentValue: 0,
      interestPaymentNds: 0,
      monthlyPaymentValue: 0,
      monthlyPaymentNds: 0
    });

    // Сохраняем итоговые суммы без выкупной стоимости
    const totalsWithoutBuyout = { ...totals };

    // Итоги, включая выкупную стоимость (для справочных блоков ниже)
    const totalsWithBuyout = { ...totals };
    if (lastPayment) {
      totalsWithBuyout.monthlyPaymentWithNds += lastPayment.monthlyPayment?.withNds || 0;
      totalsWithBuyout.principalPaymentValue += lastPayment.principalPayment?.value || 0;
      totalsWithBuyout.principalPaymentNds += lastPayment.principalPayment?.nds || 0;
      totalsWithBuyout.interestPaymentValue += lastPayment.interestPayment?.value || 0;
      totalsWithBuyout.interestPaymentNds += lastPayment.interestPayment?.nds || 0;
      totalsWithBuyout.monthlyPaymentValue += lastPayment.monthlyPayment?.value || 0;
      totalsWithBuyout.monthlyPaymentNds += lastPayment.monthlyPayment?.nds || 0;
    }

    const totalRow = worksheet.addRow([
      "Всего:",
      totalsWithBuyout.monthlyPaymentWithNds, // Итог с НДС (включая выкупной платеж)
      totalsWithBuyout.principalPaymentValue, // Итог возмещения без НДС
      totalsWithBuyout.principalPaymentNds, // Итог НДС на инвестиционные расходы
      totalsWithBuyout.interestPaymentValue, // Итог вознаграждения без НДС
      totalsWithBuyout.interestPaymentNds, // Итог НДС на вознаграждение
      totalsWithBuyout.monthlyPaymentValue, // Итог платежа без НДС
      totalsWithBuyout.monthlyPaymentNds, // Итог НДС
      0 // Остаток
    ]);
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) cell.numFmt = '#,##0.00';
    });
    totalRow.font = { bold: true };

    // ==============================================
    // ОБВОДКА ВСЕГО БЛОКА (A19:I до строки "Всего")
    // ==============================================

    // 1. Определяем строку "Всего" - это текущая последняя строка с данными
    const totalRowNumber = worksheet.lastRow.number;

    // 2. Устанавливаем черные границы для всего диапазона A19:I{totalRowNumber}
    for (let rowNum = 19; rowNum <= totalRowNumber; rowNum++) {
      const row = worksheet.getRow(rowNum);
      
      // Пропускаем полностью пустые строки (если есть)
      if (!row.hasValues && rowNum > 19) continue;
      
      for (let col = 1; col <= 9; col++) { // Колонки A-I (1-9)
        const cell = row.getCell(col);
        
        // Устанавливаем черные границы для каждой ячейки
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        
        // Для заголовков добавляем жирные нижние границы
        if (rowNum === 19 || rowNum === 20) {
          cell.border.bottom = { style: 'medium', color: { argb: 'FF000000' } };
        }
        
        // Для итоговой строки - жирная верхняя граница
        if (rowNum === totalRowNumber) {
          cell.border.top = { style: 'medium', color: { argb: 'FF000000' } };
        }
      }
    }

    worksheet.addRow([]);

    // 5. Итоговые суммы
const summaryStartRow = worksheet.lastRow.number + 1;

// Добавляем строки с итогами (динамически рассчитанные)
const buyoutAmount = lastPayment?.monthlyPayment?.withNds || 0;
const buyoutDateText = buyoutDate ? `по сроку на ${buyoutDate}` : "";

// Добавляем строку с автопереносом
const buyoutSummaryRow = worksheet.addRow([`Выкупной платеж с НДС составляет`, "", "", "", "", buyoutAmount, "", "", "USD"]);
buyoutSummaryRow.getCell(1).alignment = { wrapText: true, vertical: 'middle' };

worksheet.addRow([]);

// Строка 3. Стоимость договора
const contractSummaryRow = worksheet.addRow(["3. Стоимость договора лизинга с НДС составляет:", "", "", "", "", totalsWithBuyout.monthlyPaymentWithNds, "", "", "USD"]);
contractSummaryRow.getCell(1).alignment = { wrapText: true, vertical: 'middle' };
// Объединяем ячейки A-E и F-H
worksheet.mergeCells(`A${contractSummaryRow.number}:E${contractSummaryRow.number}`);
worksheet.mergeCells(`F${contractSummaryRow.number}:H${contractSummaryRow.number}`);

// Верхняя граница для строки 3 (Стоимость договора)
for (let col = 1; col <= 9; col++) {
  const cell = contractSummaryRow.getCell(col);
  cell.border = {
    top: { style: 'medium' },
    left: cell.border?.left || undefined,
    right: cell.border?.right || undefined,
    bottom: cell.border?.bottom || undefined,
  };
}

const includingRow = worksheet.addRow(["в том числе:"]);
worksheet.mergeCells(`A${includingRow.number}:I${includingRow.number}`);
includingRow.getCell(1).alignment = { wrapText: true, vertical: 'middle' };

// Сумма платежей
const paymentsSum = totalsWithBuyout.monthlyPaymentWithNds;
const paymentsSummaryRow = worksheet.addRow(["4. Сумма платежей составляет:", "", "", "", "", paymentsSum, "", "", "USD"]);
paymentsSummaryRow.getCell(1).alignment = { wrapText: true, vertical: 'middle' };
worksheet.mergeCells(`A${paymentsSummaryRow.number}:E${paymentsSummaryRow.number}`);
worksheet.mergeCells(`F${paymentsSummaryRow.number}:H${paymentsSummaryRow.number}`);

// НДС на платежи
const paymentsNds = totalsWithBuyout.monthlyPaymentNds;
const paymentsNdsRow = worksheet.addRow(["Сумма НДС на платежи составляет:", "", "", "", "", paymentsNds, "", "", "USD"]);
worksheet.mergeCells(`A${paymentsNdsRow.number}:E${paymentsNdsRow.number}`);
worksheet.mergeCells(`F${paymentsNdsRow.number}:H${paymentsNdsRow.number}`);

// Выкупная стоимость
const buyoutValueSummaryRow = worksheet.addRow(["5. Выкупная стоимость предмета лизинга составляет:", "", "", "", "", buyoutAmount, "", "", "USD"]);
buyoutValueSummaryRow.getCell(1).alignment = { wrapText: true, vertical: 'middle' };
worksheet.mergeCells(`A${buyoutValueSummaryRow.number}:E${buyoutValueSummaryRow.number}`);
worksheet.mergeCells(`F${buyoutValueSummaryRow.number}:H${buyoutValueSummaryRow.number}`);

// НДС на выкупную стоимость
const ndsBuyoutRow = worksheet.addRow(["Сумма НДС на выкупную стоимость предмета лизинга составляет:", "", "", "", "", lastPayment?.monthlyPayment?.nds || 0, "", "", "USD"]);
worksheet.mergeCells(`A${ndsBuyoutRow.number}:E${ndsBuyoutRow.number}`);
worksheet.mergeCells(`F${ndsBuyoutRow.number}:H${ndsBuyoutRow.number}`);
worksheet.addRow([]);

// 6. Подписи
const signatureStartRow = worksheet.lastRow.number + 1;
worksheet.addRow(["",  "ЛИЗИНГОДАТЕЛЬ", "", "", "", "", "ЛИЗИНГОПОЛУЧАТЕЛЬ", "", "", ]);
worksheet.addRow([]);
worksheet.addRow(["", "Навицкий О. О.", "", "",  "", "", " ", "", "", ]);
worksheet.addRow([]);
worksheet.addRow(["", "М.П.", "", "",  "", "", "М.П.", "", "", ]);



// Форматирование итоговых сумм
for (let rowNum = summaryStartRow; rowNum <= signatureStartRow - 1; rowNum++) {
  const row = worksheet.getRow(rowNum);
  
  // Пропускаем пустые строки
  if (row.values.filter(v => v).length === 0) continue;
  
  // Устанавливаем числовой формат для сумм (колонка G)
  if (row.getCell(7).value) {
    row.getCell(7).numFmt = '#,##0.00';
  }
  
  // Жирный шрифт для заголовков
  if (row.getCell(1).value && row.getCell(1).value.toString().startsWith('3.') || 
      row.getCell(1).value.toString().startsWith('4.') || 
      row.getCell(1).value.toString().startsWith('5.')) {
    row.font = { bold: true };
  }
}

// Форматирование подписей
const signatureEndRow = worksheet.lastRow.number;
for (let rowNum = signatureStartRow; rowNum <= signatureEndRow; rowNum++) {
  const row = worksheet.getRow(rowNum);
  
  // Выравнивание по центру для подписей
  if (rowNum === signatureStartRow || rowNum === signatureStartRow + 2) {
    ['D', 'I'].forEach(col => {
      const cell = row.getCell(col);
      cell.alignment = { horizontal: 'center' };
      if (rowNum === signatureStartRow) {
        cell.font = { bold: true };
      }
    });
  }
  

}

// Нижнее подчёркивание в соседних столбцах для подписи (рядом с «М.П.»)
const nameRowNum = signatureStartRow + 2; // строка с ФИО
const underlineCols = [3, 8]; // колонки C и H (рядом с B и G где "М.П.")
underlineCols.forEach(col => {
  const cell = worksheet.getRow(nameRowNum).getCell(col);
  cell.border = { bottom: { style: 'thin' } };
});

// Общие границы для итоговых сумм
for (let rowNum = summaryStartRow; rowNum <= signatureStartRow - 1; rowNum++) {
  const row = worksheet.getRow(rowNum);
  
  if (row.values.filter(v => v).length === 0) continue;
  
  // Границы только для колонок A, G и I
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(col => {
    const cell = row.getCell(col);
    cell.border = {
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
    
    // Верхняя граница для первой строки
    if (rowNum === summaryStartRow) {
      cell.border.top = { style: 'thin' };
    }
  });
}

    // Форматирование
    worksheet.columns = costHeaders.map(() => ({ width: 25 })); // Устанавливаем ширину столбцов
    worksheet.views = [{ state: 'frozen', ySplit: 2 }]; // Заморозка первых двух строк (опционально)

    // Генерация и скачивание файла
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const nameFile = document.querySelector("#nameFile-input")?.value.trim() || "без имени отчет";
    a.download = `${nameFile}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при генерации файла:", error);
    throw error; // Можно заменить на alert или другую обработку
  }
}