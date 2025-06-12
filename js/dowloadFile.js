async function downloadFile(tableData) {
  try {
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
    worksheet.getCell('D7').value = '99 %';

    worksheet.mergeCells('A8:C8');
    worksheet.getCell('A8').value = 'Авансовый платеж';

    worksheet.mergeCells('D8:I8');
    worksheet.getCell('D8').value = '1%';

    worksheet.mergeCells('A9:C9');
    worksheet.getCell('A9').value = 'Процент выкупной стоимости';

    worksheet.mergeCells('D9:I9');
    worksheet.getCell('D9').value = '1%';

    worksheet.mergeCells('A10:C10');
    worksheet.getCell('A10').value = 'Срок лизинга';

    worksheet.mergeCells('D10:I10');
    worksheet.getCell('D10').value = '60 мес.';

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
    // Заготовка для данных (замените значения на реальные)
    worksheet.addRow([
      "", // Марка
      895833.33, // Цена единицы
      1, // Количество
      895833.33, // Контрактная стоимость
      "20%", // Ставка НДС
      179166.67, // Сумма НДС
      1075000.00 // Стоимость с НДС
    ]);
    worksheet.addRow([
      "Итого",
      "",
      1, // Количество
      895833.33, // Контрактная стоимость
      "",
      179166.67, // Сумма НДС
      1075000.00 // Стоимость с НДС
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
    const rows = tableData.map((item) => [
      item.month || "", // Дата платежа
      item.monthlyPayment?.withNds || 0, // Лизинговый платеж с НДС
      item.principalPayment?.value || 0, // Возмещение расходов без НДС
      item.principalPayment?.nds || 0, // НДС на инвестиционные расходы
      item.interestPayment?.value || 0, // Вознаграждение без НДС
      item.interestPayment?.nds || 0, // НДС на вознаграждение
      item.monthlyPayment?.value || 0, // Платеж без НДС
      item.monthlyPayment?.nds || 0, // Всего НДС
      item.balance || 0 // Остаток стоимости
    ]);
    rows.forEach((row) => {
      const addedRow = worksheet.addRow(row);
      addedRow.eachCell((cell, colNumber) => {
        if (colNumber > 1) cell.numFmt = '#,##0.00'; // Числовой формат для сумм
      });
    });

    // Выкупная стоимость и итоги
    worksheet.addRow(["Выкупная стоимость:"]);
    const buyoutRow = worksheet.addRow([
      "6/6/30", // Дата выкупа
      10750.00, // Платеж с НДС
      8958.33, // Возмещение без НДС
      1791.67, // НДС на инвестиционные расходы
      0.00, // Вознаграждение без НДС
      0.00, // НДС на вознаграждение
      8958.33, // Платеж без НДС
      1791.67, // Всего НДС
      0.00 // Остаток
    ]);
    buyoutRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) cell.numFmt = '#,##0.00';
    });
    const totalRow = worksheet.addRow([
      "Всего:",
      1818294.52, // Итог с НДС
      895833.33, // Итог возмещения без НДС
      179166.67, // Итог НДС на инвестиционные расходы
      619412.09, // Итог вознаграждения без НДС
      123882.43, // Итог НДС на вознаграждение
      1515245.42, // Итог платежа без НДС
      303049.10, // Итог НДС
      0 // Остаток
    ]);
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) cell.numFmt = '#,##0.00';
    });
    totalRow.font = { bold: true };

    // ==============================================
    // ОБВОДКА ВСЕГО БЛОКА (A19:I до последней строки)
    // ==============================================

    // 1. Определяем последнюю строку с данными
    const lastRow = worksheet.lastRow.number;

    // 2. Устанавливаем границы для всего диапазона A19:I{lastRow}
    for (let rowNum = 19; rowNum <= lastRow; rowNum++) {
      const row = worksheet.getRow(rowNum);
      
      // Пропускаем полностью пустые строки (если есть)
      if (!row.hasValues && rowNum > 19) continue;
      
      for (let col = 1; col <= 9; col++) { // Колонки A-I (1-9)
        const cell = row.getCell(col);
        
        // Устанавливаем границы для каждой ячейки
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Для заголовков добавляем жирные нижние границы
        if (rowNum === 19 || rowNum === 20) {
          cell.border.bottom = { style: 'medium' };
        }
        
        // Для итоговой строки - жирная верхняя граница
        if (rowNum === lastRow) {
          cell.border.top = { style: 'medium' };
        }
      }
    }

    worksheet.addRow([]);

    // 5. Итоговые суммы
const summaryStartRow = worksheet.lastRow.number + 1;

// Добавляем строки с итогами
worksheet.addRow(["Выкупной платеж с НДС по сроку на 06 июня 2030 составляет", "", "", "", "", "", "", 10750.00, "USD"]);
worksheet.addRow([]);
worksheet.addRow(["3. Стоимость договора лизинга с НДС составляет:", "", "", "", "", "", "", 1818294.52, "USD"]);
worksheet.addRow(["в том числе:"]);
worksheet.addRow(["4. Сумма платежей составляет:", "", "", "", "", "", "", 1807544.52, "USD"]);
worksheet.addRow(["Сумма НДС на платежи составляет:", "", "", "", "", "", "", 301257.43, "USD"]);
worksheet.addRow(["5. Выкупная стоимость предмета лизинга составляет:", "", "", "", "", "", "", 10750.00,"USD"]);
worksheet.addRow(["Сумма НДС на выкупную стоимость предмета лизинга составляет:", "", "", "", "", "", "", 1791.67, "USD"]);
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
for (let rowNum = signatureStartRow; rowNum <= lastRow; rowNum++) {
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
  
  // Границы для блока подписей
  if (rowNum >= signatureStartRow && rowNum <= lastRow) {
    for (let col = 1; col <= 9; col++) {
      const cell = row.getCell(col);
      
      // Только нижняя граница для строки с "ЛИЗИНГОДАТЕЛЬ/ЛИЗИНГОПОЛУЧАТЕЛЬ"
      if (rowNum === signatureStartRow) {
        cell.border = { bottom: { style: 'thin' } };
      }
      
      // Границы для М.П.
      if (rowNum === lastRow) {
        cell.border = { top: { style: 'thin' } };
      }
    }
  }
}

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