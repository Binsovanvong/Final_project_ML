const pptxgen = require('pptxgenjs');
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
  imageSizingContain
} = require('/home/oai/skills/slides/pptxgenjs_helpers');
const path = require('path');
const fs = require('fs');

const root = '/mnt/data/balaji_ml_project';
const fig = path.join(root, 'figures');
const modelRows = fs.readFileSync(path.join(root, 'model_comparison.csv'), 'utf8').trim().split('\n').slice(1).map(line => line.split(','));

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenAI';
pptx.company = 'OpenAI';
pptx.subject = 'Machine Learning Final Project';
pptx.title = 'Balaji Fast Food Sales - Final Project';
pptx.lang = 'en-US';
pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'en-US' };
pptx.defineSlideMaster({
  title: 'MASTER',
  bkgd: 'F8FAFC',
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: '1D3557' }, line: { color: '1D3557' } } },
    { rect: { x: 0.45, y: 7.1, w: 12.43, h: 0.01, fill: { color: 'D6DCE5' }, line: { color: 'D6DCE5' } } },
    { text: { text: 'Balaji Fast Food Sales - ML Final Project', options: { x: 0.55, y: 7.12, w: 5.4, h: 0.18, fontSize: 9, color: '5B6573' } } }
  ],
  slideNumber: { x: 12.5, y: 7.06, w: 0.3, h: 0.2, color: '5B6573', fontSize: 9 }
});

function addTitle(slide, title, subtitle='') {
  slide.addText(title, { x: 0.6, y: 0.35, w: 8.7, h: 0.42, fontFace: 'Aptos Display', fontSize: 25, bold: true, color: '1D3557', margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: 0.62, y: 0.8, w: 9.5, h: 0.28, fontSize: 11.5, color: '5B6573', margin: 0 });
}

function addBulletList(slide, items, opts={}) {
  const runs = [];
  items.forEach(t => runs.push({ text: t, options: { bullet: { indent: 12 } } }));
  slide.addText(runs, {
    x: opts.x || 0.8, y: opts.y || 1.3, w: opts.w || 4.5, h: opts.h || 2.5,
    fontSize: opts.fontSize || 17, color: '243447', breakLine: true,
    valign: 'top', paraSpaceAfterPt: 7, fit: 'shrink'
  });
}

function addMetricCard(slide, x, y, w, h, fill, color, label, value) {
  slide.addText(`${label}\n${value}`, { x, y, w, h, fontSize: 18, bold: true, color, align: 'center', valign: 'mid', fill: { color: fill }, line: { color: fill, pt: 1 }, margin: 0.08 });
}

function addSimpleGrid(slide, x, y, colWs, rowH, rows) {
  // rows: array of arrays of strings; first row header
  const xs = [x];
  for (let i = 0; i < colWs.length - 1; i++) xs.push(xs[i] + colWs[i]);
  rows.forEach((row, r) => {
    let cx = x;
    row.forEach((cell, c) => {
      const isHeader = r === 0;
      slide.addShape(pptx.ShapeType.rect, {
        x: cx, y: y + r * rowH, w: colWs[c], h: rowH,
        fill: { color: isHeader ? '1D3557' : 'FFFFFF' },
        line: { color: 'D9E1EA', pt: 1 }
      });
      slide.addText(String(cell), {
        x: cx + 0.05, y: y + r * rowH + 0.06, w: colWs[c] - 0.1, h: rowH - 0.1,
        fontSize: isHeader ? 12.4 : 12.2, bold: isHeader, color: isHeader ? 'FFFFFF' : '243447',
        align: c === 0 ? 'left' : 'center', valign: 'mid', margin: 0.02, fit: 'shrink'
      });
      cx += colWs[c];
    });
  });
}

// Slide 1
{
  const slide = pptx.addSlide('MASTER');
  slide.addText('Predicting High-Value Orders', { x: 0.7, y: 1.05, w: 7.1, h: 0.7, fontSize: 28, bold: true, color: '1D3557', margin: 0 });
  slide.addText('Balaji Fast Food Sales - Machine Learning Final Project', { x: 0.72, y: 1.8, w: 7.2, h: 0.34, fontSize: 15, color: '5B6573', margin: 0 });
  slide.addText('Chosen framing: classification of high-value vs low-value orders', { x: 0.72, y: 2.18, w: 6.4, h: 0.28, fontSize: 14, color: '5B6573', margin: 0 });
  slide.addText('Dataset: 1,000 orders | 7 menu items | 2022-01-04 to 2023-12-03', { x: 0.72, y: 2.5, w: 6.7, h: 0.28, fontSize: 14, color: '5B6573', margin: 0 });
  addMetricCard(slide, 0.72, 3.15, 3.0, 1.12, 'E8F1FB', '1D3557', 'Best model', 'Decision Tree');
  addMetricCard(slide, 3.95, 3.15, 2.0, 1.12, 'EEF5E7', '274C1F', 'Accuracy', '75.0%');
  addMetricCard(slide, 6.15, 3.15, 2.0, 1.12, 'FFF3E6', '8C4A00', 'F1-score', '0.7396');
  addMetricCard(slide, 8.35, 3.15, 2.0, 1.12, 'F2ECFF', '5B3D9A', 'ROC-AUC', '0.7814');
  slide.addImage({ path: path.join(fig, 'revenue_by_item.png'), ...imageSizingContain(path.join(fig, 'revenue_by_item.png'), 8.8, 0.9, 3.8, 2.0) });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 2
{
  const slide = pptx.addSlide('MASTER');
  addTitle(slide, 'Project definition and dataset', 'Why this problem is stronger than trivial sales regression');
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.65, y: 1.2, w: 5.35, h: 5.1, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  slide.addText('Problem statement', { x: 0.92, y: 1.45, w: 2.8, h: 0.28, fontSize: 18, bold: true, color: '1D3557', margin: 0 });
  addBulletList(slide, [
    'Goal: predict whether an order is high-value or low-value.',
    'Target: high_value_order = 1 when transaction amount is at least 240.',
    'This turns a business question into a balanced binary classification task.',
    'Practical use: flag promising orders early for staffing, promotions, and inventory planning.'
  ], { x: 0.9, y: 1.8, w: 4.65, h: 2.6, fontSize: 16 });
  slide.addText('Why not raw sales regression?', { x: 0.92, y: 4.62, w: 3.1, h: 0.25, fontSize: 18, bold: true, color: '1D3557', margin: 0 });
  addBulletList(slide, [
    'transaction_amount = item_price × quantity, so direct regression would be too easy.',
    'To avoid leakage, the final models exclude both quantity and transaction_amount.'
  ], { x: 0.9, y: 4.95, w: 4.7, h: 1.05, fontSize: 15.5 });

  slide.addShape(pptx.ShapeType.roundRect, { x: 6.3, y: 1.2, w: 6.35, h: 5.1, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  slide.addText('Dataset snapshot', { x: 6.6, y: 1.45, w: 2.7, h: 0.28, fontSize: 18, bold: true, color: '1D3557', margin: 0 });
  const rows = [
    ['Metric', 'Value'],
    ['Rows', '1,000'],
    ['Original columns', '10'],
    ['Menu items', '7'],
    ['Date range', '2022-01-04 to 2023-12-03'],
    ['Missing transaction type', '107 rows'],
    ['Class balance', '51.8% high-value']
  ];
  addSimpleGrid(slide, 6.58, 1.88, [2.7, 2.8], 0.42, rows);
  slide.addText('Features used', { x: 6.6, y: 4.98, w: 2.2, h: 0.25, fontSize: 18, bold: true, color: '1D3557', margin: 0 });
  addBulletList(slide, [
    'item_name, item_type, item_price',
    'transaction_type, received_by, time_of_sale',
    'month, day, dayofweek, weekend, quarter'
  ], { x: 6.58, y: 5.32, w: 5.5, h: 0.65, fontSize: 15.0 });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 3
{
  const slide = pptx.addSlide('MASTER');
  addTitle(slide, 'EDA: menu and time-of-day patterns', 'Two simple views already show strong behavioral differences');
  slide.addImage({ path: path.join(fig, 'revenue_by_item.png'), ...imageSizingContain(path.join(fig, 'revenue_by_item.png'), 0.7, 1.3, 5.9, 3.35) });
  slide.addImage({ path: path.join(fig, 'orders_by_time.png'), ...imageSizingContain(path.join(fig, 'orders_by_time.png'), 6.75, 1.3, 5.85, 3.35) });
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 5.0, w: 11.9, h: 1.1, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  addBulletList(slide, [
    'Sandwich and Frankie generate the most revenue, while beverage items still contribute substantial volume.',
    'Orders are spread fairly evenly across the day, with a slight concentration in Night and Afternoon periods.',
    'These patterns suggest item mix and timing should both matter when predicting high-value orders.'
  ], { x: 0.95, y: 5.22, w: 11.2, h: 0.7, fontSize: 16 });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 4
{
  const slide = pptx.addSlide('MASTER');
  addTitle(slide, 'EDA: seasonality and data quality', 'Trend signals exist, but the dataset also needs careful preprocessing');
  slide.addImage({ path: path.join(fig, 'monthly_revenue.png'), ...imageSizingContain(path.join(fig, 'monthly_revenue.png'), 0.7, 1.3, 7.4, 3.55) });
  slide.addImage({ path: path.join(fig, 'transaction_type_distribution.png'), ...imageSizingContain(path.join(fig, 'transaction_type_distribution.png'), 8.35, 1.45, 4.0, 2.35) });
  slide.addImage({ path: path.join(fig, 'target_balance.png'), ...imageSizingContain(path.join(fig, 'target_balance.png'), 8.35, 4.0, 4.0, 2.1) });
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.78, y: 5.12, w: 7.2, h: 0.9, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  slide.addText('Key preprocessing decisions: mixed date parsing, missing-value imputation for transaction_type, one-hot encoding for categorical variables, and scaling for numeric features.', { x: 1.02, y: 5.36, w: 6.7, h: 0.45, fontSize: 15.5, color: '243447', fit: 'shrink' });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 5
{
  const slide = pptx.addSlide('MASTER');
  addTitle(slide, 'Methodology and workflow', 'The project follows a standard supervised learning pipeline');
  slide.addShape(pptx.ShapeType.chevron, { x: 3.38, y: 2.6, w: 0.26, h: 0.38, fill: { color: 'C9D6E8' }, line: { color: 'C9D6E8' } });
  slide.addShape(pptx.ShapeType.chevron, { x: 6.48, y: 2.6, w: 0.26, h: 0.38, fill: { color: 'C9D6E8' }, line: { color: 'C9D6E8' } });
  slide.addShape(pptx.ShapeType.chevron, { x: 9.58, y: 2.6, w: 0.26, h: 0.38, fill: { color: 'C9D6E8' }, line: { color: 'C9D6E8' } });
  const xs = [0.8, 3.9, 7.0, 10.1];
  const titles = ['1. Prepare', '2. Engineer', '3. Train + tune', '4. Evaluate'];
  const bodies = [
    'Parse mixed date formats\nCheck missing values\nDefine balanced target',
    'Create month, day,\ndayofweek, weekend,\nand quarter features',
    'Compare Logistic Regression,\nDecision Tree, Random Forest,\nand Gradient Boosting',
    'Use Accuracy, Precision, Recall,\nF1-score, ROC-AUC, confusion\nmatrices, and ROC curves'
  ];
  xs.forEach((x, i) => {
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.85, w: 2.4, h: 1.95, rectRadius: 0.04, fill: { color: i % 2 === 0 ? 'FFFFFF' : 'F3F7FB' }, line: { color: 'D9E1EA', pt: 1.2 } });
    slide.addText(titles[i], { x: x + 0.15, y: 2.08, w: 2.05, h: 0.24, fontSize: 18, bold: true, color: '1D3557', align: 'center', margin: 0 });
    slide.addText(bodies[i], { x: x + 0.15, y: 2.48, w: 2.08, h: 1.03, fontSize: 14.2, color: '243447', align: 'center', valign: 'mid', margin: 0.04, fit: 'shrink' });
  });
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 4.55, w: 11.55, h: 1.18, rectRadius: 0.05, fill: { color: 'EAF2FF' }, line: { color: 'D0DDF4', pt: 1 } });
  slide.addText('Hyperparameter tuning was done with GridSearchCV on the training set only. The final slide metrics come from a separate 20% held-out test set.', { x: 1.18, y: 4.9, w: 10.9, h: 0.42, fontSize: 16.2, color: '1D3557', align: 'center', valign: 'mid' });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 6
{
  const slide = pptx.addSlide('MASTER');
  addTitle(slide, 'Comparative analysis', 'All four models are competitive, but the Decision Tree edges out the rest on F1');
  const tableRows = [['Model', 'Acc', 'Prec', 'Rec', 'F1', 'AUC'], ...modelRows.map(r => [r[0], r[2], r[3], r[4], r[5], r[6]])];
  addSimpleGrid(slide, 0.72, 1.45, [2.35, 0.62, 0.7, 0.62, 0.62, 0.72], 0.45, tableRows);
  slide.addImage({ path: path.join(fig, 'roc_curves.png'), ...imageSizingContain(path.join(fig, 'roc_curves.png'), 6.7, 1.35, 5.75, 2.9) });
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.55, w: 11.8, h: 1.22, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  addBulletList(slide, [
    'Decision Tree delivered the strongest test-set F1-score (0.7396) and highest accuracy (75.0%).',
    'Random Forest and Gradient Boosting were close, which increases confidence that the signal is stable.',
    'Logistic Regression remained competitive, showing the task is not purely nonlinear.'
  ], { x: 1.0, y: 4.78, w: 11.0, h: 0.85, fontSize: 15.4 });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 7
{
  const slide = pptx.addSlide('MASTER');
  addTitle(slide, 'Best model diagnostics', 'The Decision Tree balances precision and recall while staying interpretable');
  slide.addImage({ path: path.join(fig, 'confusion_matrices.png'), ...imageSizingContain(path.join(fig, 'confusion_matrices.png'), 0.72, 1.45, 6.05, 4.5) });
  slide.addImage({ path: path.join(fig, 'feature_importance.png'), ...imageSizingContain(path.join(fig, 'feature_importance.png'), 7.05, 1.58, 5.45, 3.25) });
  slide.addShape(pptx.ShapeType.roundRect, { x: 7.12, y: 5.02, w: 5.33, h: 1.0, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  slide.addText('Main drivers: menu item, price level, transaction type, and time-based features. This is helpful because the tree structure is easy to explain during presentation.', { x: 7.35, y: 5.28, w: 4.9, h: 0.44, fontSize: 14.7, color: '243447', fit: 'shrink' });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 8
{
  const slide = pptx.addSlide('MASTER');
  addTitle(slide, 'Conclusion, GitHub checklist, and team split', 'Everything needed for the final submission');
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.75, y: 1.35, w: 5.9, h: 4.75, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  slide.addText('Conclusion', { x: 1.0, y: 1.62, w: 1.7, h: 0.25, fontSize: 18, bold: true, color: '1D3557', margin: 0 });
  addBulletList(slide, [
    'The final project is best framed as a classification problem rather than raw revenue regression.',
    'Decision Tree is the strongest model in this dataset, but all tuned models perform in a narrow band.',
    'The biggest challenge is limited feature depth; richer customer and store variables would likely improve results.'
  ], { x: 1.0, y: 1.95, w: 5.1, h: 1.65, fontSize: 15.6 });
  slide.addText('GitHub repository checklist', { x: 1.0, y: 3.95, w: 2.9, h: 0.25, fontSize: 18, bold: true, color: '1D3557', margin: 0 });
  addBulletList(slide, [
    'Push notebook, script, README, requirements.txt, and figures.',
    'Keep separate commits so individual contributions are visible.',
    'Update README with real team member names and who implemented which model.'
  ], { x: 1.0, y: 4.28, w: 5.1, h: 1.35, fontSize: 15.3 });
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.9, y: 1.35, w: 5.55, h: 4.75, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: 'D9E1EA', pt: 1 } });
  slide.addText('Suggested team contribution split', { x: 7.15, y: 1.62, w: 3.3, h: 0.25, fontSize: 18, bold: true, color: '1D3557', margin: 0 });
  slide.addText('For 2 students', { x: 7.18, y: 2.02, w: 1.8, h: 0.22, fontSize: 16.5, bold: true, color: '243447', margin: 0 });
  addBulletList(slide, [
    'Student A: Logistic Regression + EDA',
    'Student B: Decision Tree + Random Forest + slides'
  ], { x: 7.15, y: 2.28, w: 4.8, h: 0.85, fontSize: 15.2 });
  slide.addText('For 3 students', { x: 7.18, y: 3.38, w: 1.8, h: 0.22, fontSize: 16.5, bold: true, color: '243447', margin: 0 });
  addBulletList(slide, [
    'Student A: Logistic Regression',
    'Student B: Decision Tree',
    'Student C: Random Forest or Gradient Boosting'
  ], { x: 7.15, y: 3.65, w: 4.9, h: 1.1, fontSize: 15.2 });
  slide.addShape(pptx.ShapeType.roundRect, { x: 7.18, y: 5.1, w: 4.95, h: 0.55, rectRadius: 0.04, fill: { color: 'EAF2FF' }, line: { color: 'D0DDF4' } });
  slide.addText('Final submission deadline: 18 April 2026', { x: 7.42, y: 5.28, w: 4.4, h: 0.18, fontSize: 15.6, bold: true, color: '1D3557', align: 'center' });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

pptx.writeFile({ fileName: path.join(root, 'Balaji_Fast_Food_Final_Presentation.pptx') });
