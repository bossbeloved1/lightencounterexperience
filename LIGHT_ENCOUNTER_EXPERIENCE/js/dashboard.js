
/* =========================================================
   LIGHT ENCOUNTER EXPERIENCE
   EPHPHATHA ADMIN DASHBOARD
========================================================= */

let rows = [];

const body = document.getElementById('registrationsBody');
const search = document.getElementById('searchInput');

const EXPORT_FIELDS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'email', label: 'Email Address' },
  { key: 'gender', label: 'Gender' },
  { key: 'church', label: 'Fellowship / Church' },
  { key: 'location', label: 'City / Location' },
  { key: 'school', label: 'School' },
  { key: 'department', label: 'Department' },
  { key: 'heard_from', label: 'How You Heard About Us' },
  { key: 'expectations', label: 'Expectations' },
  { key: 'prayer_request', label: 'Prayer Request' },
  { key: 'serve_team', label: 'Serving Team' },
  { key: 'available', label: 'Availability' }
];

const $ = id => document.getElementById(id);

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function fullName(record) {
  return `${record.first_name || ''} ${record.surname || ''}`.trim();
}

function exportValue(record, key) {
  if (key === 'full_name') return fullName(record) || 'Not provided';

  const value = record[key];
  return value === null || value === undefined || value === ''
    ? 'Not provided'
    : String(value);
}

function exportData() {
  return rows.map(record => {
    const item = {};
    EXPORT_FIELDS.forEach(field => {
      item[field.key] = exportValue(record, field.key);
    });
    return item;
  });
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function safeFilename(value) {
  return String(value || 'participant')
    .normalize('NFKD')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'participant';
}

function hasRegistrations() {
  if (!rows.length) {
    alert('There are no registrations available to export.');
    return false;
  }
  return true;
}


/* =========================================================
   AUTHENTICATION AND DATABASE
========================================================= */

async function init() {
  if (!body) return;

  if (!window.leeSupabase) {
    body.innerHTML = `
      <tr><td colspan="7" class="empty-cell">
        Connect Supabase in js/config.js to load registrations.
      </td></tr>`;
    return;
  }

  try {
    const { data: { session }, error } =
      await window.leeSupabase.auth.getSession();

    if (error || !session) {
      location.href = 'login.html';
      return;
    }

    await load();
  } catch (error) {
    console.error(error);
    body.innerHTML = `
      <tr><td colspan="7" class="empty-cell">
        Unable to initialize the dashboard.
      </td></tr>`;
  }
}

async function load() {
  try {
    const { data, error } = await window.leeSupabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    rows = data || [];
    render(rows);

    $('totalCount').textContent = rows.length;
    $('serveCount').textContent =
      rows.filter(r => r.serve_team).length;
    $('availableCount').textContent =
      rows.filter(r => r.available === 'Yes').length;

  } catch (error) {
    console.error('Registration loading error:', error);
    body.innerHTML = `
      <tr><td colspan="7" class="empty-cell">
        Could not load registrations. Check database permissions.
      </td></tr>`;
  }
}


/* =========================================================
   REGISTRATION TABLE
========================================================= */

function render(list) {
  if (!body) return;

  body.innerHTML = list.length
    ? list.map(record => `
      <tr>
        <td>
          <input type="checkbox" class="row-check"
            value="${esc(record.id)}">
        </td>
        <td>${esc(fullName(record))}</td>
        <td>${esc(record.phone)}</td>
        <td>${esc(record.church)}</td>
        <td>${esc(record.location)}</td>
        <td>${record.created_at
          ? new Date(record.created_at).toLocaleDateString()
          : ''}</td>
        <td>
          <button class="view-btn" data-id="${esc(record.id)}">
            VIEW DETAILS ↗
          </button>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="7" class="empty-cell">
        No registrations found.
      </td></tr>`;

  $('resultCount').textContent = `${list.length} record(s)`;

  if ($('selectAll')) {
    $('selectAll').checked = false;
    $('selectAll').indeterminate = false;
  }
}


/* =========================================================
   SEARCH
========================================================= */

search?.addEventListener('input', () => {
  const query = search.value.toLowerCase().trim();

  const filtered = rows.filter(record => {
    const content = [
      fullName(record),
      record.phone,
      record.email,
      record.gender,
      record.church,
      record.location,
      record.school,
      record.department,
      record.heard_from,
      record.expectations,
      record.prayer_request,
      record.serve_team,
      record.available
    ].join(' ').toLowerCase();

    return content.includes(query);
  });

  render(filtered);
});


/* =========================================================
   VIEW REGISTRATION DETAILS
========================================================= */

body?.addEventListener('click', event => {
  const button = event.target.closest('.view-btn');
  if (!button) return;

  const record = rows.find(
    item => String(item.id) === button.dataset.id
  );

  if (!record) return;

  $('detailName').textContent = fullName(record);

  const details = [
    ['Phone Number', record.phone],
    ['Email Address', record.email],
    ['Gender', record.gender],
    ['Fellowship / Church', record.church],
    ['City / Location', record.location],
    ['School', record.school],
    ['Department', record.department],
    ['How You Heard About Us', record.heard_from],
    ['Expectations', record.expectations],
    ['Prayer Request', record.prayer_request],
    ['Serving Team', record.serve_team],
    ['Availability', record.available],
    ['Registration Date', record.created_at
      ? new Date(record.created_at).toLocaleString()
      : 'Not available']
  ];

  $('detailContent').innerHTML = details.map(([label, value]) => `
    <div class="detail-item">
      <small>${esc(label.toUpperCase())}</small>
      <span>${esc(value || 'Not provided')}</span>
    </div>
  `).join('');

  $('detailModal').classList.add('open');
  $('detailModal').setAttribute('aria-hidden', 'false');
});

function closeModal() {
  $('detailModal')?.classList.remove('open');
  $('detailModal')?.setAttribute('aria-hidden', 'true');
}

$('closeModal')?.addEventListener('click', closeModal);

$('detailModal')?.addEventListener('click', event => {
  if (event.target.id === 'detailModal') closeModal();
});


/* =========================================================
   SELECT AND DELETE
========================================================= */

function selected() {
  return [...document.querySelectorAll('.row-check:checked')]
    .map(item => item.value);
}

$('selectAll')?.addEventListener('change', event => {
  document.querySelectorAll('.row-check').forEach(item => {
    item.checked = event.target.checked;
  });
});

$('deleteSelected')?.addEventListener('click', async () => {
  const ids = selected();

  if (!ids.length) {
    alert('Select at least one registration.');
    return;
  }

  if (!confirm(`Permanently delete ${ids.length} selected registration(s)?`)) {
    return;
  }

  try {
    const { error } = await window.leeSupabase
      .from('registrations')
      .delete()
      .in('id', ids);

    if (error) throw error;

    alert('Selected registrations deleted successfully.');
    await load();

  } catch (error) {
    console.error(error);
    alert('Delete failed. Check admin permissions.');
  }
});


/* =========================================================
   CSV EXPORT
========================================================= */

$('exportCsv')?.addEventListener('click', () => {
  if (!hasRegistrations()) return;

  const data = exportData();

  const values = [
    EXPORT_FIELDS.map(field => field.label),
    ...data.map(record =>
      EXPORT_FIELDS.map(field => record[field.key])
    )
  ];

  const csv = values.map(row =>
    row.map(value =>
      `"${String(value ?? '').replace(/"/g, '""')}"`
    ).join(',')
  ).join('\r\n');

  downloadBlob(
    'ephphatha-registrations.csv',
    new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;'
    })
  );
});


/* =========================================================
   EXCEL EXPORT
========================================================= */

$('exportXlsx')?.addEventListener('click', () => {
  if (!hasRegistrations()) return;

  if (!window.XLSX) {
    alert('Excel export library could not load. Refresh and try again.');
    return;
  }

  try {
    const XLSX = window.XLSX;
    const records = exportData();

    const values = [
      EXPORT_FIELDS.map(field => field.label),
      ...records.map(record =>
        EXPORT_FIELDS.map(field => record[field.key])
      )
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(values);

    worksheet['!cols'] = [
      { wch: 25 }, { wch: 18 }, { wch: 30 },
      { wch: 13 }, { wch: 28 }, { wch: 22 },
      { wch: 28 }, { wch: 28 }, { wch: 32 },
      { wch: 45 }, { wch: 45 }, { wch: 25 },
      { wch: 20 }
    ];

    worksheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: values.length - 1, c: EXPORT_FIELDS.length - 1 }
      })
    };

    values.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        const address = XLSX.utils.encode_cell({
          r: rowIndex,
          c: columnIndex
        });

        if (!worksheet[address]) return;

        worksheet[address].s = rowIndex === 0
          ? {
              fill: {
                patternType: 'solid',
                fgColor: { rgb: '25110D' }
              },
              font: {
                name: 'Arial',
                bold: true,
                color: { rgb: 'FFFFFF' },
                sz: 11
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
              }
            }
          : {
              fill: {
                patternType: 'solid',
                fgColor: {
                  rgb: rowIndex % 2 === 0 ? 'FFF4EE' : 'FFFFFF'
                }
              },
              font: {
                name: 'Arial',
                color: { rgb: '292929' },
                sz: 10
              },
              alignment: {
                vertical: 'top',
                wrapText: true
              }
            };
      });
    });

    worksheet['!rows'] = [
      { hpt: 30 },
      ...records.map(() => ({ hpt: 35 }))
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'EPHPHATHA Registrations'
    );

    XLSX.writeFile(workbook, 'ephphatha-registrations.xlsx');

  } catch (error) {
    console.error(error);
    alert('The Excel file could not be generated.');
  }
});


/* =========================================================
   WORD EXPORT
========================================================= */

$('exportDoc')?.addEventListener('click', async () => {
  if (!hasRegistrations()) return;

  if (!window.docx) {
    alert('Word export library could not load. Refresh and try again.');
    return;
  }

  try {
    const {
      Document, Packer, Paragraph, TextRun,
      Table, TableRow, TableCell, WidthType,
      AlignmentType, PageOrientation, BorderStyle,
      ShadingType
    } = window.docx;

    const records = exportData();
    const children = [];

    const border = {
      style: BorderStyle.SINGLE,
      size: 1,
      color: 'D8C5BC'
    };

    const borders = {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border
    };

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'LIGHT ENCOUNTER EXPERIENCE',
          bold: true,
          size: 22,
          color: 'A84320'
        })
      ]
    }));

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'EPHPHATHA — REGISTRATION RECORDS',
          bold: true,
          size: 30,
          color: '24110C'
        })
      ]
    }));

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 350 },
      children: [
        new TextRun({
          text: `TOTAL REGISTRATIONS: ${records.length}`,
          bold: true,
          size: 19,
          color: 'A84320'
        })
      ]
    }));

    records.forEach((record, index) => {
      if (index > 0) {
        children.push(new Paragraph({
          pageBreakBefore: true,
          children: []
        }));
      }

      children.push(new Paragraph({
        spacing: { before: 120, after: 180 },
        children: [
          new TextRun({
            text: `${String(index + 1).padStart(3, '0')}  `,
            bold: true,
            color: 'C85B2D',
            size: 20
          }),
          new TextRun({
            text: record.full_name,
            bold: true,
            size: 24,
            color: '24110C'
          })
        ]
      }));

      const tableRows = [];

      for (let i = 0; i < EXPORT_FIELDS.length; i += 2) {
        const first = EXPORT_FIELDS[i];
        const second = EXPORT_FIELDS[i + 1];

        function makeCell(field, isLabel) {
          const value = field
            ? (isLabel ? field.label : record[field.key])
            : '';

          return new TableCell({
            width: {
              size: isLabel ? 16 : 34,
              type: WidthType.PERCENTAGE
            },
            shading: isLabel
              ? {
                  type: ShadingType.CLEAR,
                  fill: 'F8E9E1'
                }
              : undefined,
            margins: {
              top: 100,
              bottom: 100,
              left: 120,
              right: 120
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(value || ''),
                    bold: isLabel,
                    size: isLabel ? 16 : 17,
                    color: isLabel ? '71351F' : '252525'
                  })
                ]
              })
            ]
          });
        }

        tableRows.push(new TableRow({
          cantSplit: true,
          children: [
            makeCell(first, true),
            makeCell(first, false),
            makeCell(second, true),
            makeCell(second, false)
          ]
        }));
      }

      children.push(new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        columnWidths: [2100, 4500, 2100, 4500],
        borders,
        rows: tableRows
      }));

      children.push(new Paragraph({
        spacing: { before: 180, after: 100 },
        children: [
          new TextRun({
            text: 'LIGHT ENCOUNTER EXPERIENCE  |  EPHPHATHA',
            size: 13,
            color: '9A6A54',
            italics: true
          })
        ]
      }));
    });

    const document = new Document({
      creator: 'LIGHT ENCOUNTER EXPERIENCE',
      title: 'EPHPHATHA Registration Records',
      sections: [{
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 16838,
              height: 11906
            },
            margin: {
              top: 650,
              bottom: 650,
              left: 750,
              right: 750
            }
          }
        },
        children
      }]
    });

    const blob = await Packer.toBlob(document);
    downloadBlob('ephphatha-registrations.docx', blob);

  } catch (error) {
    console.error(error);
    alert('The Word document could not be generated.');
  }
});


/* =========================================================
   CANVAS HELPERS FOR A4 PNG
========================================================= */

function roundedRect(ctx, x, y, width, height, radius, fill) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text || 'Not provided').split(/\s+/);
  const lines = [];
  let line = '';

  words.forEach(word => {
    const test = line ? `${line} ${word}` : word;

    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : ['Not provided'];
}

function createRegistrationCanvas(record, index, total) {
  // A4 portrait at 300 DPI.
  const canvas = document.createElement('canvas');
  canvas.width = 2480;
  canvas.height = 3508;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create image canvas.');

  const bg = ctx.createLinearGradient(0, 0, 2480, 3508);
  bg.addColorStop(0, '#160906');
  bg.addColorStop(0.55, '#32130D');
  bg.addColorStop(1, '#100705');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2480, 3508);

  const glow = ctx.createRadialGradient(1950, 250, 20, 1950, 250, 1200);
  glow.addColorStop(0, 'rgba(238,91,35,0.3)');
  glow.addColorStop(1, 'rgba(238,91,35,0)');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 2480, 3508);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#F28B4B';
  ctx.font = 'bold 42px Arial';
  ctx.fillText('LIGHT ENCOUNTER EXPERIENCE', 1240, 190);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 116px Georgia';
  ctx.fillText('EPHPHATHA', 1240, 355);

  ctx.fillStyle = '#F4B18B';
  ctx.font = '36px Arial';
  ctx.fillText('REGISTRATION RECORD', 1240, 430);

  roundedRect(ctx, 115, 530, 2250, 2800, 38, '#FFF9F4');

  ctx.textAlign = 'left';
  ctx.fillStyle = '#B84E27';
  ctx.font = 'bold 30px Arial';
  ctx.fillText(
    `PARTICIPANT ${String(index + 1).padStart(3, '0')} OF ${String(total).padStart(3, '0')}`,
    210,
    660
  );

  ctx.fillStyle = '#25120D';
  ctx.font = 'bold 76px Arial';

  const nameLines = wrapText(ctx, record.full_name, 2050);
  let nameY = 800;

  nameLines.slice(0, 2).forEach(line => {
    ctx.fillText(line, 210, nameY);
    nameY += 95;
  });

  ctx.fillStyle = '#E9C8B7';
  ctx.fillRect(210, nameY + 20, 2060, 4);

  const fields = EXPORT_FIELDS.filter(f => f.key !== 'full_name');
  const columns = [fields.slice(0, 6), fields.slice(6)];
  const xPositions = [210, 1290];

  function drawField(x, y, field) {
    ctx.fillStyle = '#A34A29';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(field.label.toUpperCase(), x, y);

    ctx.fillStyle = '#29201C';
    ctx.font = '34px Arial';

    const lines = wrapText(ctx, record[field.key], 930);
    let valueY = y + 58;

    lines.forEach(line => {
      ctx.fillText(line, x, valueY);
      valueY += 45;
    });

    const height = 105 + lines.length * 45;

    ctx.fillStyle = '#EADBD2';
    ctx.fillRect(x, y + height - 12, 950, 2);

    return height + 45;
  }

  const startY = nameY + 160;

  columns.forEach((column, columnIndex) => {
    let y = startY;

    column.forEach(field => {
      y += drawField(xPositions[columnIndex], y, field);
    });
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#F4B18B';
  ctx.font = 'bold 27px Arial';
  ctx.fillText(
    'LIGHT ENCOUNTER EXPERIENCE  •  EPHPHATHA',
    1240,
    3435
  );

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('The browser could not create the PNG image.'));
      } else {
        resolve(blob);
      }
    }, 'image/png');
  });
}


/* =========================================================
   INDIVIDUAL PNG EXPORT
========================================================= */

async function exportIndividualPngs() {
  if (!hasRegistrations()) return;

  const button = $('exportDesign');
  const originalText = button.textContent;

  try {
    button.disabled = true;

    for (let i = 0; i < rows.length; i++) {
      button.textContent = `GENERATING ${i + 1} OF ${rows.length}...`;

      const canvas = createRegistrationCanvas(
        exportData()[i],
        i,
        rows.length
      );

      const blob = await canvasToBlob(canvas);

      const filename =
        `ephphatha-${String(i + 1).padStart(3, '0')}-${safeFilename(fullName(rows[i]))}.png`;

      downloadBlob(filename, blob);

      // Give the browser time to process each download.
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    alert(
      `${rows.length} individual A4 PNG design(s) have been generated.\n\n` +
      'Check your Downloads folder.'
    );

  } catch (error) {
    console.error('PNG export error:', error);
    alert('The PNG designs could not be generated. ' + error.message);

  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}


/* =========================================================
   ALL REGISTRATIONS PDF EXPORT
   One A4 page per registrant, all in one PDF file.
========================================================= */

async function exportAllPdf() {
  if (!hasRegistrations()) return;

  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('The PDF library could not load. Check your internet connection and refresh.');
    return;
  }

  const button = $('exportDesign');
  const originalText = button.textContent;

  try {
    button.disabled = true;

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const records = exportData();

    for (let i = 0; i < records.length; i++) {
      button.textContent = `CREATING PDF ${i + 1} OF ${records.length}...`;

      if (i > 0) pdf.addPage('a4', 'portrait');

      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Dark page background.
      pdf.setFillColor(22, 9, 6);
      pdf.rect(0, 0, 210, 297, 'F');

      // Warm header accent.
      pdf.setFillColor(184, 78, 39);
      pdf.rect(0, 0, 210, 5, 'F');

      pdf.setTextColor(242, 139, 75);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('LIGHT ENCOUNTER EXPERIENCE', 105, 20, { align: 'center' });

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('times', 'bold');
      pdf.setFontSize(28);
      pdf.text('EPHPHATHA', 105, 34, { align: 'center' });

      pdf.setTextColor(244, 177, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('REGISTRATION RECORD', 105, 42, { align: 'center' });

      // Main information card.
      pdf.setFillColor(255, 249, 244);
      pdf.roundedRect(10, 52, 190, 231, 3, 3, 'F');

      pdf.setTextColor(184, 78, 39);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text(
        `PARTICIPANT ${String(i + 1).padStart(3, '0')} OF ${String(records.length).padStart(3, '0')}`,
        18,
        64
      );

      pdf.setTextColor(37, 18, 13);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(19);

      const nameLines = pdf.splitTextToSize(records[i].full_name, 174);
      pdf.text(nameLines.slice(0, 2), 18, 76);

      let y = 76 + Math.min(nameLines.length, 2) * 8 + 5;

      pdf.setDrawColor(233, 200, 183);
      pdf.setLineWidth(0.5);
      pdf.line(18, y, 192, y);

      y += 9;

      // Two-column detail layout.
      const detailFields = EXPORT_FIELDS.filter(
        field => field.key !== 'full_name'
      );

      const left = detailFields.slice(0, 6);
      const right = detailFields.slice(6);

      const columnX = [18, 108];
      const columnWidth = 84;

      function drawPdfField(field, x, currentY) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(163, 74, 41);

        const labelLines = pdf.splitTextToSize(
          field.label.toUpperCase(),
          columnWidth
        );

        pdf.text(labelLines, x, currentY);

        const value = records[i][field.key];

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(41, 32, 28);

        const valueLines = pdf.splitTextToSize(value, columnWidth);

        const valueY = currentY + labelLines.length * 3.5 + 3;
        pdf.text(valueLines, x, valueY);

        const blockHeight =
          labelLines.length * 3.5 +
          valueLines.length * 4.1 +
          10;

        pdf.setDrawColor(234, 219, 210);
        pdf.setLineWidth(0.2);
        pdf.line(x, currentY + blockHeight - 3, x + columnWidth, currentY + blockHeight - 3);

        return blockHeight;
      }

      for (let column = 0; column < 2; column++) {
        let currentY = y;
        const fields = column === 0 ? left : right;

        fields.forEach(field => {
          currentY += drawPdfField(
            field,
            columnX[column],
            currentY
          );
        });
      }

      // Footer.
      pdf.setTextColor(244, 177, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(
        'LIGHT ENCOUNTER EXPERIENCE  •  EPHPHATHA',
        105,
        290,
        { align: 'center' }
      );
    }

    pdf.save('ephphatha-all-registrations.pdf');

  } catch (error) {
    console.error('PDF export error:', error);
    alert('The PDF could not be generated. ' + error.message);

  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}


/* =========================================================
   EXPORT DROPDOWN ACTION
========================================================= */

$('exportDesign')?.addEventListener('click', () => {
  const choice = $('designExportType')?.value;

  if (choice === 'individual') {
    exportIndividualPngs();
  } else if (choice === 'all') {
    exportAllPdf();
  } else {
    alert('Please choose an export format first.');
  }
});


/* =========================================================
   LOGOUT
========================================================= */

$('logoutBtn')?.addEventListener('click', async () => {
  try {
    if (window.leeSupabase) {
      await window.leeSupabase.auth.signOut();
    }
  } catch (error) {
    console.error(error);
  }

  location.href = 'login.html';
});


/* =========================================================
   START DASHBOARD
========================================================= */

init();
